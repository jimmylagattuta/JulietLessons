import React from 'react';
import { Users, UserCheck, Shield, GraduationCap, User as UserIcon, TrendingUp, CreditCard, DollarSign } from 'lucide-react';
import { UserStats } from '../types';

interface UserStatsPanelProps {
  stats: UserStats;
  loading: boolean;
}

export function UserStatsPanel({ stats, loading }: UserStatsPanelProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Teachers',
      value: stats.teacherCount,
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Administrators',
      value: stats.adminCount,
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Students',
      value: stats.studentCount,
      icon: <UserIcon className="w-6 h-6" />,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      textColor: 'text-teal-600 dark:text-teal-400'
    },
    {
      title: 'New This Month',
      value: stats.newUsersThisMonth,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-600 dark:text-pink-400'
    },
    {
      title: 'Subscribed Users',
      value: stats.subscribedUsers,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-dark-800 p-6 rounded-lg border border-gray-200 dark:border-dark-700 hover:shadow-md dark:hover:shadow-xl hover:shadow-gray-200 dark:hover:shadow-black/20 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <div className={stat.textColor}>
                {stat.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}