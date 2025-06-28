import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  Building, 
  Calendar,
  Shield,
  GraduationCap,
  User as UserIcon,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { User, UserFilters, UserRole } from '../types';

interface UserManagementPanelProps {
  users: User[];
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus: (userId: string) => void;
  loading: boolean;
}

const userRoles: { value: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'teacher', label: 'Teacher', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'admin', label: 'Administrator', icon: <Shield className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'student', label: 'Student', icon: <UserIcon className="w-4 h-4" />, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
];

export function UserManagementPanel({
  users,
  filters,
  onFiltersChange,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onToggleUserStatus,
  loading
}: UserManagementPanelProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const updateFilter = (key: keyof UserFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const getRoleInfo = (role: UserRole) => {
    return userRoles.find(r => r.value === role) || userRoles[0];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (date?: Date | string) => {
    if (!date) return 'Never';
    const loginDate = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(loginDate);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(u => u.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6 transition-colors duration-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={onCreateUser}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filters.role || ''}
            onChange={(e) => updateFilter('role', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
          >
            <option value="">All Roles</option>
            {userRoles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
            onChange={(e) => updateFilter('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Organization Filter */}
          <input
            type="text"
            placeholder="Filter by organization..."
            value={filters.organization || ''}
            onChange={(e) => updateFilter('organization', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 dark:text-blue-300 font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={clearSelection}
                className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={selectedUsers.length === users.length ? clearSelection : selectAllUsers}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 bg-white dark:bg-dark-700"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 bg-white dark:bg-dark-700"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                        {roleInfo.icon}
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                        {user.organization ? (
                          <>
                            <Building className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            {user.organization}
                          </>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">No organization</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatLastLogin(user.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        
                        {showDropdown === user.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setShowDropdown(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-700 rounded-lg shadow-lg dark:shadow-xl shadow-gray-200 dark:shadow-black/20 border border-gray-200 dark:border-dark-600 z-20 transition-colors duration-200">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    onEditUser(user);
                                    setShowDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit User
                                </button>
                                <button
                                  onClick={() => {
                                    onToggleUserStatus(user.id);
                                    setShowDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                                >
                                  {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  {user.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => {
                                    onDeleteUser(user.id);
                                    setShowDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete User
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {Object.keys(filters).some(key => filters[key as keyof UserFilters])
                ? 'Try adjusting your filters to see more users.'
                : 'Get started by creating your first user account.'
              }
            </p>
            {!Object.keys(filters).some(key => filters[key as keyof UserFilters]) && (
              <button
                onClick={onCreateUser}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create User
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}