import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard, Heart, Crown, Users, Star, AlertCircle, Plus, ShoppingCart } from 'lucide-react';
import { SubscriptionPlan, UserSubscription } from '../types';
import { StripeService } from '../services/stripe';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AuthService } from '../services/auth';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// const API_BASE_URL = 'http://52.15.159.45:3001/api'  // Production
const API_BASE_URL = 'https://5872-35-78-107-144.ngrok-free.app/api'  // Production
// const API_BASE_URL = 'http://localhost:3001/api';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription?: UserSubscription | null;
  onSubscriptionUpdate: (subscription: UserSubscription) => void;
  isAdmin?: boolean;
  userId: string;
}

// Payment Form Component
function PaymentForm({ 
  onSuccess, 
  onError, 
  loading, 
  onBack 
}: { 
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  loading: boolean;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        onError(submitError.message || 'Payment failed');
      } else {
        // Get the payment method ID
        const { paymentMethod } = await stripe.createPaymentMethod({
          elements,
        });
        
        if (paymentMethod) {
          onSuccess(paymentMethod.id);
        } else {
          throw new Error('Failed to create payment method');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
        >
          Back to Plans
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg hover:from-rose-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <CreditCard className="w-5 h-5" />
          )}
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
      </div>
    </form>
  );
}

export function SubscriptionModal({ 
  isOpen, 
  onClose, 
  currentSubscription, 
  onSubscriptionUpdate,
  isAdmin,
  userId
}: SubscriptionModalProps) {
  // If user is admin, don't show the subscription modal
  if (isAdmin) {
    return null;
  }

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'plans' | 'payment' | 'processing' | 'additional-lessons'>('plans');
  const [additionalLessons, setAdditionalLessons] = useState<number>(5);
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      const availablePlans = await StripeService.getPlans();
      setPlans(availablePlans);
    } catch (err) {
      setError('Failed to load subscription plans');
    }
  };

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);
    try {
      // Get client secret from server
      const response = await fetch(`${API_BASE_URL}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getAuthToken()}`
        },
        body: JSON.stringify({
          planId,
        }),
      });
      
      const { clientSecret: secret } = await response.json();
      setClientSecret(secret);
      setStep('payment');
    } catch (err) {
      setError('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyLessons = () => {
    setStep('additional-lessons');
  };

  const handlePurchaseAdditionalLessons = async () => {
    if (!currentSubscription) return;

    setLoading(true);
    setError('');

    try {
      const updatedSubscription = await StripeService.purchaseAdditionalLessons(userId, additionalLessons);
      onSubscriptionUpdate(updatedSubscription);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (paymentMethodId: string) => {
    if (!selectedPlan) return;

    setStep('processing');
    setLoading(true);
    setError('');

    try {
      let subscription: UserSubscription;
      
      if (currentSubscription) {
        // Update existing subscription
        subscription = await StripeService.updateSubscription(userId, selectedPlan);
      } else {
        // Create new subscription
        subscription = await StripeService.createSubscription(userId, selectedPlan, paymentMethodId);
      }

      // Wait for the subscription to be fully processed
      let retries = 0;
      let updatedSubscription: UserSubscription | null = null;
      
      while (retries < 5) {
        try {
          updatedSubscription = await StripeService.getUserSubscription(userId);
          if (updatedSubscription && updatedSubscription.status === 'active') {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries++;
        } catch (err) {
          console.error('Error fetching updated subscription:', err);
          break;
        }
      }

      if (updatedSubscription) {
        // Update the subscription in the parent component
        onSubscriptionUpdate(updatedSubscription);
      } else {
        // If we couldn't get the updated subscription, use the one from create/update
        onSubscriptionUpdate(subscription);
      }
      
      // Close the modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'romeo': return <Heart className="w-6 h-6" />;
      case 'juliet': return <Crown className="w-6 h-6" />;
      default: return <CreditCard className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'romeo': return 'from-rose-500 to-pink-600';
      case 'juliet': return 'from-purple-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan.id === planId;
  };

  const canPurchaseAdditionalLessons = () => {
    return currentSubscription && 
           StripeService.canPurchaseAdditionalLessons(currentSubscription) &&
           currentSubscription.plan.id === 'romeo';
  };

  const handleClose = () => {
    setStep('plans');
    setSelectedPlan('');
    setError('');
    setAdditionalLessons(5);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-dark-700 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {step === 'plans' ? 'Choose Your Plan' : 
                 step === 'payment' ? 'Payment Details' : 
                 step === 'additional-lessons' ? 'Buy Additional Lessons' :
                 'Processing Payment'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step === 'plans' ? 'Romeo & Juliet themed lesson planning' : 
                 step === 'payment' ? 'Complete your subscription' : 
                 step === 'additional-lessons' ? 'Add more lessons to your Romeo plan' :
                 'Please wait while we process your payment'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'plans' && (
            <div className="space-y-6">
              {/* Current Subscription Status */}
              {currentSubscription && (
                <div className="bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {getPlanIcon(currentSubscription.plan.id)}
                      </div>
                      <div>
                        <h3 className="font-medium text-rose-900 dark:text-rose-300">
                          Current Plan: {currentSubscription.plan.name}
                        </h3>
                        <p className="text-sm text-rose-700 dark:text-rose-400">
                          {StripeService.getRemainingLessons(currentSubscription) === -1 
                            ? 'Unlimited lessons remaining'
                            : `${StripeService.getRemainingLessons(currentSubscription)} lessons remaining this month`
                          }
                        </p>
                      </div>
                    </div>
                    {canPurchaseAdditionalLessons() && (
                      <button
                        onClick={handleBuyLessons}
                        className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Buy More Lessons
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white dark:bg-dark-700 border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl hover:shadow-gray-200 dark:hover:shadow-black/20 ${
                      plan.isPopular 
                        ? 'border-purple-500 dark:border-purple-400 shadow-lg dark:shadow-xl' 
                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                    } ${
                      isCurrentPlan(plan.id) 
                        ? 'ring-2 ring-rose-500 dark:ring-rose-400' 
                        : ''
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${getPlanColor(plan.id)} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                        <div className="text-white">
                          {getPlanIcon(plan.id)}
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {plan.description}
                      </p>

                      <div className="mb-6">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">/{plan.interval}</span>
                        {plan.allowAdditionalLessons && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            + ${plan.additionalLessonPrice} per extra lesson
                          </p>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6 text-left">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {isCurrentPlan(plan.id) ? (
                        <button
                          disabled
                          className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-medium cursor-not-allowed"
                        >
                          Current Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePlanSelect(plan.id)}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                            plan.isPopular
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
                              : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg'
                          }`}
                        >
                          {currentSubscription ? 'Switch to This Plan' : 'Get Started'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Romeo & Juliet Theme Explanation */}
              <div className="bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Why Romeo & Juliet?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Romeo Plan</h4>
                      <p className="text-gray-700 dark:text-gray-300">Perfect for teachers starting their drama education journey. Like Romeo's passionate but measured approach to love, this plan gives you a solid foundation with the flexibility to grow.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Juliet Plan</h4>
                      <p className="text-gray-700 dark:text-gray-300">For educators who want it all. Like Juliet's bold and unlimited devotion, this plan provides complete access to every resource and feature we offer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'additional-lessons' && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Buy Additional Lessons
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Add more lessons to your Romeo plan for just ${currentSubscription?.plan.additionalLessonPrice || 3} each
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-rose-900 dark:text-rose-300">Current Lessons</span>
                  <span className="text-sm text-rose-700 dark:text-rose-400">
                    {currentSubscription ? StripeService.getRemainingLessons(currentSubscription) : 0} remaining
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-rose-900 dark:text-rose-300">Additional Purchased</span>
                  <span className="text-sm text-rose-700 dark:text-rose-400">
                    {currentSubscription?.additionalLessonsPurchased || 0} lessons
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Additional Lessons
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdditionalLessons(Math.max(1, additionalLessons - 1))}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={additionalLessons}
                    onChange={(e) => setAdditionalLessons(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-center"
                  />
                  <button
                    onClick={() => setAdditionalLessons(Math.min(50, additionalLessons + 1))}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {additionalLessons} lesson{additionalLessons > 1 ? 's' : ''} × ${currentSubscription?.plan.additionalLessonPrice || 3}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${((currentSubscription?.plan.additionalLessonPrice || 3) * additionalLessons).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-dark-600 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${((currentSubscription?.plan.additionalLessonPrice || 3) * additionalLessons).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('plans')}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePurchaseAdditionalLessons}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                  {loading ? 'Processing...' : 'Purchase Lessons'}
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && clientSecret && (
            <div className="space-y-6">
              {/* Selected Plan Summary */}
              {selectedPlan && (
                <div className="bg-gradient-to-r from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                  <h3 className="font-medium text-rose-900 dark:text-rose-300 mb-2">
                    Selected Plan: {plans.find(p => p.id === selectedPlan)?.name}
                  </h3>
                  <p className="text-sm text-rose-700 dark:text-rose-400">
                    ${plans.find(p => p.id === selectedPlan)?.price}/{plans.find(p => p.id === selectedPlan)?.interval}
                  </p>
                </div>
              )}

              {/* Payment Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Information</h3>
                
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    onSuccess={handleSubscribe}
                    onError={setError}
                    loading={loading}
                    onBack={() => setStep('plans')}
                  />
                </Elements>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Processing Your Subscription
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we set up your account...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}