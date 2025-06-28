import React from 'react';
import { Heart, Crown, AlertTriangle, Plus } from 'lucide-react';
import { UserSubscription } from '../types';
import { StripeService } from '../services/stripe';

interface SubscriptionBannerProps {
  subscription: UserSubscription | null;
  onUpgrade: () => void;
  isAdmin?: boolean;
}

export function SubscriptionBanner({ subscription, onUpgrade, isAdmin }: SubscriptionBannerProps) {
  // If user is admin, show admin subscription banner
  if (isAdmin) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-lg mb-6">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Admin Subscription - Unlimited Access</h3>
            <p className="text-sm opacity-90">You have full access to all features with your admin privileges</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Start Your Drama Education Journey</h3>
              <p className="text-sm opacity-90">Choose Romeo or Juliet plan to begin creating amazing lesson plans</p>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="bg-white text-rose-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  const remainingLessons = StripeService.getRemainingLessons(subscription);
  const isUnlimited = remainingLessons === -1;
  const isLowOnLessons = !isUnlimited && remainingLessons <= 2;
  const isOutOfLessons = !isUnlimited && remainingLessons === 0;
  const canBuyMore = StripeService.canPurchaseAdditionalLessons(subscription);

  if (subscription.status !== 'active') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Subscription Issue</h3>
              <p className="text-sm">Your subscription is {subscription.status}. Please update your payment method.</p>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Fix Now
          </button>
        </div>
      </div>
    );
  }

  if (isOutOfLessons) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Lesson Limit Reached</h3>
              <p className="text-sm">
                You've used all your lessons this month. 
                {canBuyMore ? ' Buy more lessons or upgrade to Juliet plan!' : ' Upgrade to Juliet plan for unlimited access!'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {canBuyMore && (
              <button
                onClick={onUpgrade}
                className="flex items-center gap-1 bg-rose-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Buy Lessons
              </button>
            )}
            <button
              onClick={onUpgrade}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors text-sm"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLowOnLessons) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Running Low on Lessons</h3>
              <p className="text-sm">
                Only {remainingLessons} lesson{remainingLessons === 1 ? '' : 's'} remaining this month
                {canBuyMore && ' - buy more for just $3 each!'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {canBuyMore && (
              <button
                onClick={onUpgrade}
                className="flex items-center gap-1 bg-rose-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Buy More
              </button>
            )}
            <button
              onClick={onUpgrade}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors text-sm"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isUnlimited) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-lg mb-6">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">{subscription.plan.name} - Unlimited Access</h3>
            <p className="text-sm opacity-90">Generate unlimited lessons with your premium subscription</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">{subscription.plan.name} Active</h3>
            <p className="text-sm">
              {remainingLessons} lesson{remainingLessons === 1 ? '' : 's'} remaining this month
              {/* {subscription.additionalLessonsPurchased && subscription.additionalLessonsPurchased > 0 && (
                <span className="ml-1">({subscription.additionalLessonsPurchased} purchased)</span>
              )} */}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canBuyMore && (
            <button
              onClick={onUpgrade}
              className="flex items-center gap-1 bg-rose-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Buy More
            </button>
          )}
          <button
            onClick={onUpgrade}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors text-sm"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
}