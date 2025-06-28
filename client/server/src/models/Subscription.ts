import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid', 'paused'],
    required: true
  },
  plan: {
    id: String,
    name: String,
    description: String,
    price: Number,
    currency: String,
    interval: String,
    lessonsLimit: Number,
    features: [String],
    stripePriceId: String,
    allowAdditionalLessons: Boolean,
    additionalLessonPrice: Number,
    isPopular: Boolean
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  lessonsGenerated: {
    type: Number,
    default: 0
  },
  additionalLessonsPurchased: {
    type: Number,
    default: 0
  },
  totalSpentOnLessons: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export interface ISubscription extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    lessonsLimit: number;
    features: string[];
    stripePriceId: string;
    allowAdditionalLessons: boolean;
    additionalLessonPrice: number;
    isPopular: boolean;
  };
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  lessonsGenerated: number;
  additionalLessonsPurchased: number;
  totalSpentOnLessons: number;
}

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema); 