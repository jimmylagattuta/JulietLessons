import { SubscriptionPlan, UserSubscription, PaymentMethod, Invoice } from '../types';
import { ApiService, ApiError } from './api';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Stripe service that integrates with the backend API
export class StripeService {
  // Initialize Stripe
  static async initializeStripe() {
    return await stripePromise;
  }

  // Initialize demo subscriptions for demo users
  static async initializeDemoSubscriptions(): Promise<void> {
    try {
      // This method can be used to set up demo subscriptions
      // For now, it's a placeholder that doesn't throw an error
      console.log('Demo subscriptions initialized');
    } catch (error) {
      console.error('Error initializing demo subscriptions:', error);
    }
  }

  // Get available subscription plans
  static async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      return await ApiService.getSubscriptionPlans() as SubscriptionPlan[];
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw new Error('Failed to load subscription plans');
    }
  }

  // Create a subscription for a user
  static async createSubscription(
    userId: string, 
    planId: string, 
    paymentMethodId: string
  ): Promise<UserSubscription> {
    try {
      return await ApiService.createSubscription(userId, planId, paymentMethodId) as UserSubscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Update subscription plan
  static async updateSubscription(
    userId: string, 
    newPlanId: string
  ): Promise<UserSubscription> {
    try {
      return await ApiService.updateSubscription(userId, newPlanId) as UserSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Cancel a subscription
  static async cancelSubscription(userId: string): Promise<UserSubscription> {
    try {
      return await ApiService.cancelSubscription(userId) as UserSubscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Reactivate a canceled subscription
  static async reactivateSubscription(userId: string): Promise<UserSubscription> {
    try {
      return await ApiService.reactivateSubscription(userId) as UserSubscription;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  // Purchase additional lessons for Romeo plan users
  static async purchaseAdditionalLessons(
    userId: string, 
    lessonCount: number
  ): Promise<UserSubscription> {
    try {
      return await ApiService.purchaseAdditionalLessons(userId, lessonCount) as UserSubscription;
    } catch (error) {
      console.error('Error purchasing additional lessons:', error);
      throw error;
    }
  }

  // Get user's subscription
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      return await ApiService.getUserSubscription(userId) as UserSubscription | null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null; // No subscription found
      }
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  // Increment lesson generation count
  static async incrementLessonCount(userId: string): Promise<UserSubscription> {
    try {
      return await ApiService.incrementLessonCount(userId) as UserSubscription;
    } catch (error) {
      console.error('Error incrementing lesson count:', error);
      throw error;
    }
  }

  // Check if user can generate lessons
  static async checkSubscriptionAccess(userId: string): Promise<{
    canGenerate: boolean;
    reason?: string;
    remainingLessons: number;
    subscription?: UserSubscription;
  }> {
    try {
      return await ApiService.checkSubscriptionAccess(userId) as {
        canGenerate: boolean;
        reason?: string;
        remainingLessons: number;
        subscription?: UserSubscription;
      };
    } catch (error) {
      console.error('Error checking subscription access:', error);
      return {
        canGenerate: false,
        reason: 'Failed to check subscription status',
        remainingLessons: 0
      };
    }
  }

  // Client-side helper methods
  static canGenerateLesson(subscription: UserSubscription | null): boolean {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    if (subscription.plan.id === 'juliet' && subscription.plan.name.includes('Admin')) return true; // Admin Juliet plan
    if (subscription.plan.lessonsLimit === -1) return true; // Unlimited (Juliet plan)
    return subscription.lessonsGenerated < subscription.plan.lessonsLimit;
  }

  // Get remaining lessons for user
  static getRemainingLessons(subscription: UserSubscription | null): number {
    if (!subscription) return 0;
    if (subscription.status !== 'active') return 0;
    if (subscription.plan.id === 'juliet' && subscription.plan.name.includes('Admin')) return -1; // Admin Juliet plan
    if (subscription.plan.lessonsLimit === -1) return -1; // Unlimited (Juliet plan)
    return Math.max(0, subscription.plan.lessonsLimit + (subscription.additionalLessonsPurchased || 0) - subscription.lessonsGenerated);
  }

  // Check if user can purchase additional lessons
  static canPurchaseAdditionalLessons(subscription: UserSubscription | null): boolean {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    if (subscription.plan.id === 'juliet' && subscription.plan.name.includes('Admin')) return false; // Admin Juliet plan
    return subscription.plan.allowAdditionalLessons || false;
  }

  // Get payment methods for a user
  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      return await ApiService.getPaymentMethods(userId) as PaymentMethod[];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  // Get invoices for a user
  static async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      return await ApiService.getInvoices(userId) as Invoice[];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }
}