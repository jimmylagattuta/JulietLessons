import React from 'react';
import LandingPage from './LandingPage';
import { useAtom } from 'jotai';
import { showAuthModalAtom, authModeAtom, authStateAtom } from '../store/atoms';
import { AuthModal } from './AuthModal';
import { AuthService } from '../services/auth';
import { StripeService } from '../services/stripe';
import { LoginCredentials, RegisterData } from '../types';

const LandingPageWrapper = () => {
  const [showAuthModal, setShowAuthModal] = useAtom(showAuthModalAtom);
  const [authMode, setAuthMode] = useAtom(authModeAtom);
  const [authState, setAuthState] = useAtom(authStateAtom);

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleShowLessons = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleAuthSignIn = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user } = await AuthService.signIn(credentials);
      
      // Load subscription data
      try {
        const subscription = await StripeService.getUserSubscription(user.id);
        setAuthState({
          user: { ...user, subscription: subscription || undefined },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (err) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }
      
      setShowAuthModal(false);
    } catch (err) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Sign in failed'
      }));
    }
  };

  const handleAuthSignUp = async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user } = await AuthService.signUp(data);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      setShowAuthModal(false);
    } catch (err) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Sign up failed'
      }));
    }
  };

  return (
    <>
      <LandingPage
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onShowLessons={handleShowLessons}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onSignIn={handleAuthSignIn}
        onSignUp={handleAuthSignUp}
        loading={authState.isLoading}
        error={authState.error}
      />
    </>
  );
};

export default LandingPageWrapper; 