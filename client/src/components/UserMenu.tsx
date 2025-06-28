import React, { useState } from 'react';
import { User, Settings, LogOut, ChevronDown, Building, Mail, Calendar } from 'lucide-react';
import { User as UserType } from '../types';

interface UserMenuProps {
  user: UserType;
  onSignOut: () => void;
  onEditProfile: () => void;
}

export function UserMenu({ user, onSignOut, onEditProfile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getRoleColor = (role: string) => {
    const colors = {
      teacher: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      student: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      teacher: '👩‍🏫',
      admin: '👑',
      student: '🎓'
    };
    return icons[role as keyof typeof icons] || '👤';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </span>
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-dark-800 rounded-lg shadow-lg dark:shadow-xl shadow-gray-200 dark:shadow-black/20 border border-gray-200 dark:border-dark-700 z-20 transition-colors duration-200">
            {/* User Info */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{getRoleIcon(user.role)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {user.organization && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>{user.organization}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  onEditProfile();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors duration-200"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}