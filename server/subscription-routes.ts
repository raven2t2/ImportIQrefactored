import type { Express } from "express";
import Stripe from 'stripe';
import { subscriptionService } from './subscription-service';
import { requireAuth } from './auth-middleware';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export function registerSubscriptionRoutes(app: Express) {
  // Get subscription plans
  app.get('/api/subscription/plans', (req, res) => {
    res.json({ plans: Object.values(SUBSCRIPTION_PLANS) });
  });

  // Get current user subscription
  app.get('/api/subscription/current', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const subscription = await subscriptionService.getUserSubscription(userId);
      
      if (!subscription) {
        return res.json({ subscription: null, hasActiveSubscription: false });
      }

      const plan = SUBSCRIPTION_PLANS[subscription.plan];
      res.json({
        subscription: {
          ...subscription,
          planDetails: plan
        },
        hasActiveSubscription: subscription.status === 'active'
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  // Create subscription
  app.post('/api/subscription/create', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { planId } = req.body;

      if (!planId || !SUBSCRIPTION_PLANS[planId]) {
        return res.status(400).json({ error: 'Invalid plan selected' });
      }

      const result = await subscriptionService.createSubscription(userId, planId);
      res.json(result);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  // Cancel subscription
  app.post('/api/subscription/cancel', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      await subscriptionService.cancelSubscription(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  // Create billing portal session
  app.post('/api/subscription/billing-portal', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const url = await subscriptionService.createBillingPortalSession(userId);
      res.json({ url });
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      res.status(500).json({ error: 'Failed to create billing portal session' });
    }
  });

  // Check feature access
  app.get('/api/subscription/access/:feature', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { feature } = req.params;
      
      const hasAccess = await subscriptionService.canAccessFeature(
        userId, 
        feature as keyof typeof SUBSCRIPTION_PLANS.starter.limits
      );
      
      res.json({ hasAccess });
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({ error: 'Failed to check feature access' });
    }
  });

  // Check free lookup availability
  app.get('/api/subscription/free-lookup', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const canMakeFreeLookup = await subscriptionService.canMakeFreeLookup(userId);
      const hasActiveSubscription = await subscriptionService.hasActiveSubscription(userId);
      
      res.json({ 
        canMakeFreeLookup,
        hasActiveSubscription,
        requiresPayment: !canMakeFreeLookup && !hasActiveSubscription
      });
    } catch (error) {
      console.error('Error checking free lookup:', error);
      res.status(500).json({ error: 'Failed to check free lookup availability' });
    }
  });

  // Stripe webhook handler
  app.post('/api/webhooks/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        console.error('Stripe webhook secret not configured');
        return res.status(400).send('Webhook secret not configured');
      }

      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await subscriptionService.updateSubscriptionFromWebhook(subscription);
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
            await subscriptionService.updateSubscriptionFromWebhook(sub);
          }
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          if (failedInvoice.subscription) {
            const sub = await stripe.subscriptions.retrieve(failedInvoice.subscription as string);
            await subscriptionService.updateSubscriptionFromWebhook(sub);
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });
}