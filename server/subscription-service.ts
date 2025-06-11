import Stripe from "stripe";
import { db } from "./db";
import { users, userSubscriptions, savedReports } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export class SubscriptionService {
  // Create subscription for checkout
  async createSubscription(plan: string, userEmail?: string) {
    try {
      let priceId: string;
      
      // Map plan names to Stripe price IDs
      switch (plan) {
        case 'starter':
          priceId = process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_monthly';
          break;
        case 'pro':
          priceId = process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly';
          break;
        default:
          throw new Error(`Invalid plan: ${plan}`);
      }

      // Create customer if email provided
      let customer;
      if (userEmail) {
        customer = await stripe.customers.create({
          email: userEmail,
        });
      }

      // Create subscription with trial period
      const subscription = await stripe.subscriptions.create({
        customer: customer?.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        trial_period_days: 7,
        expand: ['latest_invoice.payment_intent'],
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      return {
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
        customerId: customer?.id,
      };
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const [userSub] = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      if (!userSub) return false;

      // Check if subscription is active and not expired
      const now = new Date();
      return userSub.status === 'active' && 
             userSub.currentPeriodEnd && 
             new Date(userSub.currentPeriodEnd) > now;
    } catch (error) {
      console.error('Subscription check error:', error);
      return false;
    }
  }

  // Get subscription status for user
  async getSubscriptionStatus(userId: string) {
    try {
      const [userSub] = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      if (!userSub) {
        return {
          hasSubscription: false,
          plan: 'free',
          status: 'inactive',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        };
      }

      return {
        hasSubscription: true,
        plan: userSub.plan,
        status: userSub.status,
        currentPeriodEnd: userSub.currentPeriodEnd,
        cancelAtPeriodEnd: userSub.cancelAtPeriodEnd || false,
      };
    } catch (error) {
      console.error('Get subscription status error:', error);
      return {
        hasSubscription: false,
        plan: 'free',
        status: 'error',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
  }

  // Handle successful subscription webhook
  async handleSubscriptionSuccess(subscriptionId: string, customerId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Find user by customer ID or create new user record
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      
      if (!customer.email) {
        throw new Error('Customer email not found');
      }

      // Find or create user
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, customer.email))
        .limit(1);

      if (!user) {
        [user] = await db
          .insert(users)
          .values({
            id: `stripe_${customerId}`,
            email: customer.email,
            firstName: customer.name?.split(' ')[0] || '',
            lastName: customer.name?.split(' ').slice(1).join(' ') || '',
          })
          .returning();
      }

      // Update or create subscription record
      const subscriptionData = {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        plan: subscription.items.data[0].price.nickname || 'starter',
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };

      // Check if subscription already exists
      const [existingSub] = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, user.id))
        .limit(1);

      if (existingSub) {
        await db
          .update(userSubscriptions)
          .set(subscriptionData)
          .where(eq(userSubscriptions.userId, user.id));
      } else {
        await db.insert(userSubscriptions).values(subscriptionData);
      }

      return user;
    } catch (error) {
      console.error('Subscription success handler error:', error);
      throw error;
    }
  }

  // Get recent user lookups for dashboard
  async getRecentLookups(userId: string, limit: number = 5) {
    try {
      // Get from saved reports instead of lookup cache since cache doesn't have user association
      const reports = await db
        .select()
        .from(savedReports)
        .where(eq(savedReports.userId, userId))
        .orderBy(desc(savedReports.createdAt))
        .limit(limit);

      return reports.map(report => ({
        id: report.id,
        searchQuery: report.searchQuery,
        destination: report.destination,
        vehicleData: report.vehicleData,
        createdAt: report.createdAt?.toISOString() || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Get recent lookups error:', error);
      return [];
    }
  }

  // Mark free lookup as used (for rate limiting)
  async markFreeLookupUsed(userId: string) {
    try {
      // This could be implemented with a separate table for tracking free usage
      // For now, we'll just log it
      console.log(`Free lookup used by user: ${userId}`);
    } catch (error) {
      console.error('Mark free lookup error:', error);
    }
  }

  // Check if user can perform lookup (subscription or free limit)
  async canPerformLookup(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const hasSubscription = await this.hasActiveSubscription(userId);
      
      if (hasSubscription) {
        return { allowed: true };
      }

      // For free users, allow 1 lookup (simplified implementation)
      // In production, you'd track this in a separate table
      return { allowed: true, reason: "Free lookup available" };
    } catch (error) {
      console.error('Lookup permission check error:', error);
      return { allowed: false, reason: "Error checking permissions" };
    }
  }
}

export const subscriptionService = new SubscriptionService();