import Stripe from 'stripe';
import { db } from './db';
import { users, userSubscriptions, type User, type UserSubscription } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceId: string;
  price: number;
  features: string[];
  limits: {
    lookups: number | 'unlimited';
    countries: string[];
    csvImport: boolean;
    bulkVin: boolean;
    apiAccess: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    price: 29,
    features: [
      'Unlimited vehicle lookups',
      'AU/US/UK/CA market access',
      'Saved import reports',
      'Email support'
    ],
    limits: {
      lookups: 'unlimited',
      countries: ['australia', 'usa', 'uk', 'canada'],
      csvImport: false,
      bulkVin: false,
      apiAccess: false
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    price: 99,
    features: [
      'Everything in Starter',
      'CSV import functionality',
      'Bulk VIN lookups',
      'Compliance API access',
      'Priority support'
    ],
    limits: {
      lookups: 'unlimited',
      countries: ['australia', 'usa', 'uk', 'canada', 'japan', 'germany', 'eu'],
      csvImport: true,
      bulkVin: true,
      apiAccess: true
    }
  }
};

export class SubscriptionService {
  async createCustomer(user: User): Promise<string> {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.fullName,
      metadata: {
        userId: user.id.toString()
      }
    });

    // Update user with Stripe customer ID
    await db.update(users)
      .set({ stripeCustomerId: customer.id })
      .where(eq(users.id, user.id));

    return customer.id;
  }

  async createSubscription(userId: number, planId: string): Promise<{ clientSecret: string; subscriptionId: string }> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      throw new Error('User not found');
    }

    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    let customerId = user[0].stripeCustomerId;
    if (!customerId) {
      customerId = await this.createCustomer(user[0]);
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId.toString(),
        plan: planId
      }
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    // Store subscription in database
    await db.insert(userSubscriptions).values({
      userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      plan: planId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      subscriptionId: subscription.id
    };
  }

  async getUserSubscription(userId: number): Promise<UserSubscription | null> {
    const subscriptions = await db.select()
      .from(userSubscriptions)
      .where(and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, 'active')
      ))
      .limit(1);

    return subscriptions.length > 0 ? subscriptions[0] : null;
  }

  async updateSubscriptionFromWebhook(subscription: Stripe.Subscription): Promise<void> {
    const userId = parseInt(subscription.metadata.userId);
    if (!userId) return;

    await db.update(userSubscriptions)
      .set({
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
  }

  async cancelSubscription(userId: number): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await db.update(userSubscriptions)
      .set({ 
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, subscription.id));
  }

  async createBillingPortalSession(userId: number): Promise<string> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length || !user[0].stripeCustomerId) {
      throw new Error('User or customer not found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user[0].stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard`
    });

    return session.url;
  }

  async hasActiveSubscription(userId: number): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return subscription !== null && subscription.status === 'active';
  }

  async canAccessFeature(userId: number, feature: keyof SubscriptionPlan['limits']): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan];
    if (!plan) return false;

    switch (feature) {
      case 'csvImport':
        return plan.limits.csvImport;
      case 'bulkVin':
        return plan.limits.bulkVin;
      case 'apiAccess':
        return plan.limits.apiAccess;
      default:
        return false;
    }
  }

  async canAccessCountry(userId: number, country: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan];
    if (!plan) return false;

    return plan.limits.countries.includes(country.toLowerCase());
  }

  async markFreeLookupUsed(userId: number): Promise<void> {
    await db.update(users)
      .set({ freeLookupUsed: true })
      .where(eq(users.id, userId));
  }

  async canMakeFreeLookup(userId: number): Promise<boolean> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) return false;
    
    return !user[0].freeLookupUsed;
  }
}

export const subscriptionService = new SubscriptionService();