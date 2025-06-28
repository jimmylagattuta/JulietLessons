import express, { Router } from 'express';
import { stripe, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_IDS } from '../config/stripe.js';
import { SubscriptionPlan, UserSubscription } from '../types/index.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Extend Express Request type to include user
interface AuthRequest extends express.Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Authentication middleware
const authenticateToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/stripe/plans - Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans: SubscriptionPlan[] = [
      {
        id: 'romeo',
        name: 'Romeo Plan',
        description: 'Perfect for individual teachers getting started',
        price: 10.00,
        currency: 'USD',
        interval: 'month',
        lessonsLimit: 5,
        features: [
          '5 lesson generations included',
          'Buy additional lessons ($3 each)',
          'Access to all activities',
          'PDF attachments',
          'Basic support'
        ],
        stripePriceId: STRIPE_PRICE_IDS.ROMEO_MONTHLY,
        allowAdditionalLessons: true,
        additionalLessonPrice: 3.00,
        isPopular: false
      },
      {
        id: 'juliet',
        name: 'Juliet Plan',
        description: 'Complete access for dedicated educators',
        price: 50.00,
        currency: 'USD',
        interval: 'month',
        lessonsLimit: -1, // Unlimited
        features: [
          'Unlimited lesson generations',
          'Full script library access',
          'Premium activity resources',
          'PDF attachments & management',
          'Advanced lesson planning tools',
          'Priority support',
          'Early access to new features'
        ],
        stripePriceId: STRIPE_PRICE_IDS.JULIET_MONTHLY,
        isPopular: true,
        allowAdditionalLessons: false,
        additionalLessonPrice: 0
      }
    ];

    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Helper function to create admin subscription
const createAdminSubscription = async (userId: string) => {
  const adminPlan: SubscriptionPlan = {
    id: 'juliet',
    name: 'Juliet Plan (Admin)',
    description: 'Complete access for administrators',
    price: 0,
    currency: 'USD',
    interval: 'month',
    lessonsLimit: -1, // Unlimited
    features: [
      'Unlimited lesson generations',
      'Full script library access',
      'Premium activity resources',
      'PDF attachments & management',
      'Advanced lesson planning tools',
      'Priority support',
      'Early access to new features',
      'Admin privileges'
    ],
    stripePriceId: STRIPE_PRICE_IDS.JULIET_MONTHLY,
    isPopular: true,
    allowAdditionalLessons: false,
    additionalLessonPrice: 0
  };

  // Create subscription in database
  const subscription = new Subscription({
    userId,
    stripeCustomerId: userId,
    stripeSubscriptionId: 'admin_subscription',
    status: 'active',
    plan: adminPlan,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date('2099-12-31'), // Far future date
    cancelAtPeriodEnd: false,
    lessonsGenerated: 0,
    additionalLessonsPurchased: 0,
    totalSpentOnLessons: 0
  });

  await subscription.save();
  return subscription;
};

// GET /api/stripe/subscription/:userId - Get user's subscription
router.get('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user to check if admin
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is admin, create or return admin subscription
    if (user.role === 'admin') {
      let subscription = await Subscription.findOne({ userId });
      if (!subscription) {
        subscription = await createAdminSubscription(userId);
      }
      return res.json(subscription);
    }
    
    // For non-admin users, get normal subscription
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST /api/stripe/create-subscription - Create new subscription
router.post('/create-subscription', async (req, res) => {
  try {
    const { userId, planId, paymentMethodId } = req.body;
    
    if (!userId || !planId || !paymentMethodId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is admin, create admin subscription
    if (user.role === 'admin') {
      const subscription = await createAdminSubscription(userId);
      return res.json(subscription);
    }

    // Create or retrieve Stripe customer
    let stripeCustomer;
    if (user.stripeCustomerId) {
      stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      });
      // Update user with Stripe customer ID
      user.stripeCustomerId = stripeCustomer.id;
      await user.save();
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomer.id,
    });

    // Set as default payment method
    await stripe.customers.update(stripeCustomer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Get plan details
    const plan = await stripe.plans.retrieve(planId);

    // Create subscription in database
    const subscription = new Subscription({
      userId,
      stripeCustomerId: stripeCustomer.id,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      plan: {
        id: plan.id,
        name: plan.nickname || 'Unknown Plan',
        description: plan.metadata?.description || '',
        price: (plan.amount ?? 0) / 100,
        currency: plan.currency,
        interval: plan.interval as 'month' | 'year',
        lessonsLimit: parseInt(plan.metadata?.lessonsLimit || '5'),
        features: plan.metadata?.features ? JSON.parse(plan.metadata.features) : [],
        stripePriceId: plan.id,
        allowAdditionalLessons: plan.metadata?.allowAdditionalLessons === 'true',
        additionalLessonPrice: parseFloat(plan.metadata?.additionalLessonPrice || '3'),
        isPopular: plan.metadata?.isPopular === 'true'
      },
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      lessonsGenerated: 0,
      additionalLessonsPurchased: 0,
      totalSpentOnLessons: 0
    });

    await subscription.save();

    res.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// PUT /api/stripe/update-subscription - Update subscription plan
router.put('/update-subscription', async (req, res) => {
  try {
    const { userId, planId } = req.body;
    
    if (!userId || !planId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user to check if admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is admin, ensure they have admin subscription
    if (user.role === 'admin') {
      let subscription = await Subscription.findOne({ userId });
      if (!subscription) {
        subscription = await createAdminSubscription(userId);
      }
      return res.json(subscription);
    }

    // For non-admin users, proceed with normal subscription update
    // Get subscription from database
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Update subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{
        id: subscription.stripeSubscriptionId,
        price: planId,
      }],
      proration_behavior: 'always_invoice',
    });

    // Get plan details
    const plan = await stripe.plans.retrieve(planId);

    // Update subscription in database
    subscription.plan = {
      id: plan.id,
      name: plan.nickname || 'Unknown Plan',
      description: plan.metadata?.description || '',
      price: (plan.amount ?? 0) / 100,
      currency: plan.currency,
      interval: plan.interval as 'month' | 'year',
      lessonsLimit: parseInt(plan.metadata?.lessonsLimit || '5'),
      features: plan.metadata?.features ? JSON.parse(plan.metadata.features) : [],
      stripePriceId: plan.id,
      allowAdditionalLessons: plan.metadata?.allowAdditionalLessons === 'true',
      additionalLessonPrice: parseFloat(plan.metadata?.additionalLessonPrice || '3'),
      isPopular: plan.metadata?.isPopular === 'true'
    };
    subscription.status = stripeSubscription.status;
    subscription.currentPeriodStart = new Date((stripeSubscription as any).current_period_start * 1000);
    subscription.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);

    await subscription.save();

    res.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// POST /api/stripe/cancel-subscription - Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get subscription from database
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Cancel subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update subscription in database
    subscription.status = stripeSubscription.status;
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.json(subscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// POST /api/stripe/reactivate-subscription - Reactivate canceled subscription
router.post('/reactivate-subscription', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get subscription from database
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Reactivate subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update subscription in database
    subscription.status = stripeSubscription.status;
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();

    res.json(subscription);
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// POST /api/stripe/purchase-lessons - Purchase additional lessons
router.post('/purchase-lessons', async (req, res) => {
  try {
    const { userId, lessonCount } = req.body;
    
    if (!userId || !lessonCount || lessonCount < 1) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    // Get user and subscription from database
    const user = await User.findOne({id: userId});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    if (!subscription.plan.allowAdditionalLessons) {
      return res.status(400).json({ error: 'Additional lessons not available for this plan' });
    }

    // Ensure user has a Stripe customer ID
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      // Create a new Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id.toString()
        }
      });
      stripeCustomerId = stripeCustomer.id;
      
      // Update user with Stripe customer ID
      user.stripeCustomerId = stripeCustomerId;
      await user.save();

      // Update subscription with Stripe customer ID
      subscription.stripeCustomerId = stripeCustomerId;
      await subscription.save();
    }

    // Create invoice item for additional lessons
    const totalAmount = lessonCount * subscription.plan.additionalLessonPrice;

    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: subscription.plan.currency,
      description: `Additional Lessons (${lessonCount} × $${subscription.plan.additionalLessonPrice})`,
    });

    // Create and finalize invoice
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      auto_advance: true,
    });

    if (!invoice.id) {
      throw new Error('Invoice ID is missing');
    }

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id as string);
    
    // Only attempt to pay if the invoice is not already paid
    if (finalizedInvoice.status !== 'paid') {
      await stripe.invoices.pay(finalizedInvoice.id as string);
    }

    // Update subscription in database
    subscription.additionalLessonsPurchased += lessonCount;
    subscription.totalSpentOnLessons += totalAmount;
    await subscription.save();

    res.json(subscription);
  } catch (error) {
    console.error('Error purchasing lessons:', error);
    res.status(500).json({ error: 'Failed to purchase additional lessons' });
  }
});

// POST /api/stripe/increment-lesson - Increment lesson generation count
router.post('/increment-lesson', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get subscription from database
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    if (subscription.status !== 'active') {
      return res.status(403).json({ error: 'Subscription is not active' });
    }

    // Check if user has remaining lessons (unless unlimited)
    if (subscription.plan.lessonsLimit !== -1 && 
        subscription.lessonsGenerated >= subscription.plan.lessonsLimit + subscription.additionalLessonsPurchased) {
      return res.status(403).json({ error: 'Lesson limit reached' });
    }

    // Update subscription in database
    subscription.lessonsGenerated += 1;
    await subscription.save();

    res.json(subscription);
  } catch (error) {
    console.error('Error incrementing lesson count:', error);
    res.status(500).json({ error: 'Failed to increment lesson count' });
  }
});

// GET /api/stripe/check-access/:userId - Check if user can generate lessons
router.get('/check-access/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get subscription from database
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.json({ 
        canGenerate: false, 
        reason: 'No subscription found',
        remainingLessons: 0
      });
    }

    if (subscription.status !== 'active') {
      return res.json({ 
        canGenerate: false, 
        reason: 'Subscription is not active',
        remainingLessons: 0
      });
    }

    const isUnlimited = subscription.plan.lessonsLimit === -1;
    const remainingLessons = isUnlimited ? -1 : Math.max(0, subscription.plan.lessonsLimit + subscription.additionalLessonsPurchased - subscription.lessonsGenerated);
    const canGenerate = isUnlimited || remainingLessons > 0;

    res.json({
      canGenerate,
      reason: canGenerate ? null : 'Lesson limit reached',
      remainingLessons,
      subscription
    });
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
});

// POST /api/stripe/create-payment-intent - Create a PaymentIntent
router.post('/create-payment-intent', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user?.userId;
    
    if (!planId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get plan details from our predefined plans
    const plans = [
      {
        id: 'romeo',
        name: 'Romeo Plan',
        description: 'Perfect for individual teachers getting started',
        price: 10.00,
        currency: 'USD',
        interval: 'month',
        lessonsLimit: 5,
        features: [
          '5 lesson generations included',
          'Buy additional lessons ($3 each)',
          'Access to all activities',
          'PDF attachments',
          'Basic support'
        ],
        stripePriceId: STRIPE_PRICE_IDS.ROMEO_MONTHLY,
        allowAdditionalLessons: true,
        additionalLessonPrice: 3.00,
        isPopular: false
      },
      {
        id: 'juliet',
        name: 'Juliet Plan',
        description: 'Complete access for dedicated educators',
        price: 50.00,
        currency: 'USD',
        interval: 'month',
        lessonsLimit: -1, // Unlimited
        features: [
          'Unlimited lesson generations',
          'Full script library access',
          'Premium activity resources',
          'PDF attachments & management',
          'Advanced lesson planning tools',
          'Priority support',
          'Early access to new features'
        ],
        stripePriceId: STRIPE_PRICE_IDS.JULIET_MONTHLY,
        isPopular: true,
        allowAdditionalLessons: false,
        additionalLessonPrice: 0
      }
    ];

    const selectedPlan = plans.find(plan => plan.id === planId);
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Create PaymentIntent with the plan's price
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(selectedPlan.price * 100), // Convert to cents
      currency: selectedPlan.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        planId,
        priceId: selectedPlan.stripePriceId
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('No Stripe signature found');
  }

  let event:any;

  try {
    // Convert the raw Buffer to a string
    const payload = req.body;
    event = payload;
    // event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err instanceof Error ? err.message : 'Unknown error');
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object;
        const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSubscription.id });
        
        if (subscription) {
          subscription.status = stripeSubscription.status;
          subscription.currentPeriodStart = new Date((stripeSubscription as any).current_period_start * 1000);
          subscription.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
          subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
          await subscription.save();
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const stripeSubscription = event.data.object;
        const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSubscription.id });
        
        if (subscription) {
          // TODO: Send notification to user about trial ending
          console.log('Trial ending soon for subscription:', subscription.stripeSubscriptionId);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        if ((invoice as any).subscription) {
          const subscription = await Subscription.findOne({ stripeSubscriptionId: (invoice as any).subscription });
          if (subscription) {
            subscription.status = 'active';
            await subscription.save();
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if ((invoice as any).subscription) {
          const subscription = await Subscription.findOne({ stripeSubscriptionId: (invoice as any).subscription });
          if (subscription) {
            subscription.status = 'past_due';
            await subscription.save();
            // TODO: Send notification to user about failed payment
          }
        }
        break;
      }

      case 'invoice.payment_action_required': {
        const invoice = event.data.object;
        if ((invoice as any).subscription) {
          const subscription = await Subscription.findOne({ stripeSubscriptionId: (invoice as any).subscription });
          if (subscription) {
            // TODO: Send notification to user about required action
            console.log('Payment action required for subscription:', subscription.stripeSubscriptionId);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { userId, planId } = paymentIntent.metadata;
        
        if (userId && planId) {
          // Get user to check if admin
          const user = await User.findOne({_id: userId});
          if (!user) {
            console.error('User not found:', userId);
            return;
          }

          // If user is admin, create admin subscription
          if (user.role === 'admin') {
            let subscription = await Subscription.findOne({ userId: user.id });
            if (!subscription) {
              subscription = await createAdminSubscription(user.id.toString());
            }
            return;
          }

          // For non-admin users, proceed with normal subscription
          const plans = [
            {
              id: 'romeo',
              name: 'Romeo Plan',
              description: 'Perfect for individual teachers getting started',
              price: 10.00,
              currency: 'USD',
              interval: 'month',
              lessonsLimit: 5,
              features: [
                '5 lesson generations included',
                'Buy additional lessons ($3 each)',
                'Access to all activities',
                'PDF attachments',
                'Basic support'
              ],
              stripePriceId: STRIPE_PRICE_IDS.ROMEO_MONTHLY,
              allowAdditionalLessons: true,
              additionalLessonPrice: 3.00,
              isPopular: false
            },
            {
              id: 'juliet',
              name: 'Juliet Plan',
              description: 'Complete access for dedicated educators',
              price: 50.00,
              currency: 'USD',
              interval: 'month',
              lessonsLimit: -1, // Unlimited
              features: [
                'Unlimited lesson generations',
                'Full script library access',
                'Premium activity resources',
                'PDF attachments & management',
                'Advanced lesson planning tools',
                'Priority support',
                'Early access to new features'
              ],
              stripePriceId: STRIPE_PRICE_IDS.JULIET_MONTHLY,
              isPopular: true,
              allowAdditionalLessons: false,
              additionalLessonPrice: 0
            }
          ];

          const selectedPlan = plans.find(plan => plan.id === planId);
          if (!selectedPlan) {
            console.error('Invalid plan selected:', planId);
            return;
          }
          
          // Create or update subscription in databases
          let subscription = await Subscription.findOne({ userId: user.id });
          
          if (!subscription) {
            subscription = new Subscription({
              userId: user.id,
              stripeCustomerId: userId,
              stripeSubscriptionId: `${paymentIntent.id}`,
              status: 'active',
              plan: selectedPlan,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              cancelAtPeriodEnd: false,
              lessonsGenerated: 0,
              additionalLessonsPurchased: 0,
              totalSpentOnLessons: 0
            });
          } else {
            subscription.status = 'active';
            subscription.plan = selectedPlan;
            subscription.currentPeriodStart = new Date();
            subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
          }
          
          await subscription.save();
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;