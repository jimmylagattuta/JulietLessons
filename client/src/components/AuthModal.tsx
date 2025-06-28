import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, Building, UserCheck } from 'lucide-react';
import { LoginCredentials, RegisterData, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  onSignIn: (credentials: LoginCredentials) => Promise<void>;
  onSignUp: (data: RegisterData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const userRoles: { value: UserRole; label: string; description: string }[] = [
  { value: 'teacher', label: 'Teacher', description: 'Create and manage activities and lessons' },
  // { value: 'admin', label: 'Administrator', description: 'Full access to all features and user management' },
  { value: 'student', label: 'Student', description: 'View and participate in activities' }
];

export function AuthModal({ 
  isOpen, 
  onClose, 
  mode, 
  onModeChange, 
  onSignIn, 
  onSignUp, 
  loading, 
  error 
}: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'teacher' as UserRole,
    organization: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signin') {
      await onSignIn({
        email: formData.email,
        password: formData.password
      });
    } else {
      await onSignUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        organization: formData.organization || undefined
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'teacher',
      organization: ''
    });
    setShowPassword(false);
  };

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    resetForm();
    onModeChange(newMode);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-dark-700 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === 'signin' ? 'Welcome Back' : 'Join JulietLessons'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === 'signin' 
                  ? 'Sign in to your account' 
                  : 'Create your account to get started'
                }
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

        {/* Demo Credentials Notice */}
        {/* {mode === 'signin' && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Demo Credentials</h4>
            <div className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <p><strong>Teacher:</strong> teacher@activityhub.com / password</p>
              <p><strong>Admin:</strong> admin@activityhub.com / password</p>
            </div>
          </div>
        )} */}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {userRoles.map(role => (
                    <label key={role.value} className="flex items-start cursor-pointer group">
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-dark-600 rounded mt-1 focus:ring-blue-500 bg-white dark:bg-dark-700 transition-colors duration-200"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{role.label}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{role.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                    placeholder="Your school or organization"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password (min 6 characters)'}
                minLength={mode === 'signup' ? 6 : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="font-medium">
              {loading 
                ? (mode === 'signin' ? 'Signing In...' : 'Creating Account...') 
                : (mode === 'signin' ? 'Sign In' : 'Create Account')
              }
            </span>
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-dark-700 border-t border-gray-200 dark:border-dark-600 rounded-b-xl transition-colors duration-200">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => handleModeChange(mode === 'signin' ? 'signup' : 'signin')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}