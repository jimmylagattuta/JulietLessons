import React, { useState } from 'react';
import { X, User, Mail, Building, UserCheck, Shield, GraduationCap } from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userData: Omit<UserType, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>) => void;
  editUser?: UserType;
  loading: boolean;
}

const userRoles: { value: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: 'teacher', 
    label: 'Teacher', 
    description: 'Create and manage activities and lessons',
    icon: <GraduationCap className="w-4 h-4" />
  },
  { 
    value: 'admin', 
    label: 'Administrator', 
    description: 'Full access to all features and user management',
    icon: <Shield className="w-4 h-4" />
  },
  { 
    value: 'student', 
    label: 'Student', 
    description: 'View and participate in activities',
    icon: <User className="w-4 h-4" />
  }
];

export function CreateUserModal({ isOpen, onClose, onCreate, editUser, loading }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: editUser?.firstName || '',
    lastName: editUser?.lastName || '',
    email: editUser?.email || '',
    role: editUser?.role || 'teacher' as UserRole,
    organization: editUser?.organization || '',
    isActive: editUser?.isActive ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'teacher',
      organization: '',
      isActive: true
    });
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
                {editUser ? 'Edit User' : 'Create New User'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {editUser ? 'Update user information' : 'Add a new user to the system'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                placeholder="john.doe@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-dark-600 rounded mt-1 focus:ring-blue-500 bg-white dark:bg-dark-700"
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {role.icon}
                      </div>
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
                placeholder="School or organization name"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 bg-white dark:bg-dark-700"
              />
              <div className="ml-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Active Account</span>
              </div>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
              Inactive users cannot sign in to the system
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span>{editUser ? 'Update User' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}