export interface Activity {
  id: string;
  title: string;
  description: string;
  ageGroup: AgeGroup;
  skillLevel: Level;
  duration: number;
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
  _id: string;
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
  duration: number;
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

export interface LessonPlan {
  warmUp: Activity | null;
  mainActivities: Activity[];
  coolDown: Activity | null;
  totalDuration: number;
  estimatedTime: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  subscription?: UserSubscription;
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
  lessonsLimit: number;
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
  lessonsLimit: number;
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  teacherCount: number;
  adminCount: number;
  studentCount: number;
  newUsersThisMonth: number;
  subscribedUsers: number;
  totalRevenue: number;
}

export type AgeGroup = 'Young' | 'Middle' | 'Older';
export type Level = 'Toe Tipper' | 'Green Horn' | 'Semi-Pro' | 'Seasoned Veteran';
export type Genre = 'comedy' | 'drama' | 'mystery' | 'fantasy' | 'historical' | 'contemporary';
export type ActivityType = 'warm-up' | 'main' | 'cool-down' | 'game' | 'exercise';
export type PlayOrCraft = 'More Playing Than Creating' | 'A Balance of Playing and Creating' | 'Let us Create And Craft';
export type UserRole = 'teacher' | 'admin' | 'student';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';

export interface SearchFilters {
  ageGroup?: AgeGroup;
  skillLevel?: Level;
  skillLevels?: Level[];
  genre?: Genre;
  tags?: string[];
  search?: string;
  activityType?: ActivityType;
  activityTypes?: ActivityType[];
  playOrCraft?: PlayOrCraft;
  playOrCraftTypes?: PlayOrCraft[];
}

export interface LessonFilters {
  ageGroup?: AgeGroup;
  skillLevels: Level[];
  activityTypes: ActivityType[];
  playOrCraftTypes: PlayOrCraft[];
  duration?: number;
  search?: string;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  organization?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
}