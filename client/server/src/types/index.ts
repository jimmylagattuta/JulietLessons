export interface Activity {
  id: string;
  title: string;
  description: string;
  ageGroup: AgeGroup;
  skillLevel: Level;
  duration: number; // in minutes
  materials: string[];
  tags: string[];
  requiresScript: 'required' | 'optional' | 'none';
  scriptIds?: string[];
  activityType: ActivityType;
  playOrCraft: PlayOrCraft;
  pdfFiles?: ActivityPDF[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityPDF {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
  description?: string;
}

export interface Script {
  id: string;
  title: string;
  description: string;
  genre: Genre;
  ageGroup: AgeGroup;
  characterCount: number;
  duration: number; // in minutes
  tags: string[];
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  ageGroup: AgeGroup;
  totalDuration: number;
  activities: Activity[];
  warmUpActivity?: Activity;
  mainActivities: Activity[];
  coolDownActivity?: Activity;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedLesson {
  id: string;
  title: string;
  description: string;
  ageGroup?: AgeGroup;
  warmUpId?: string;
  mainActivityIds: string[];
  coolDownId?: string;
  totalDuration: number;
  tags: string[];
  createdBy: string; // User ID who created the lesson
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  ageGroup: AgeGroup;
  totalDuration: number;
  activities: Activity[];
  warmUpActivity?: Activity;
  mainActivities: Activity[];
  coolDownActivity?: Activity;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  lessonsGenerated: number;
  lessonsLimit: number; // -1 for unlimited
  additionalLessonsPurchased?: number;
  totalSpentOnLessons?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  lessonsLimit: number; // -1 for unlimited
  features: string[];
  stripePriceId: string;
  isPopular?: boolean;
  allowAdditionalLessons?: boolean;
  additionalLessonPrice?: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: Date;
  downloadUrl: string;
  description: string;
}

export type AgeGroup = 'Young' | 'Middle' | 'Older';

export type Level = 'Toe Tipper' | 'Green Horn' | 'Semi-Pro' | 'Seasoned Veteran';

export type Genre = 'comedy' | 'drama' | 'mystery' | 'fantasy' | 'historical' | 'contemporary';

export type ActivityType = 'warm-up' | 'main' | 'cool-down' | 'game' | 'exercise';

export type PlayOrCraft = 'More Playing Than Creating' | 'A Balance of Playing and Creating' | 'Let us Create And Craft';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'paused';

export interface SearchFilters {
  ageGroup?: AgeGroup;
  skillLevel?: Level;
  genre?: Genre;
  tags?: string[];
  search?: string;
  activityType?: ActivityType;
  playOrCraft?: PlayOrCraft;
}

export interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  error?: string;
}