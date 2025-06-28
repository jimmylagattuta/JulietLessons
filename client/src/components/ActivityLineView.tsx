import React from 'react';
import { Clock, Users, Tag, FileText, Edit, Trash2, Plus, Target } from 'lucide-react';
import { Activity } from '../types';

interface ActivityLineViewProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  onViewPDF?: (pdfUrl: string, fileName: string) => void;
  onActivityClick?: (activity: Activity) => void;
  loading: boolean;
  selectedActivities?: Activity[];
  isLessonPlanning?: boolean;
  targetSection?: 'warmUp' | 'main' | 'coolDown' | null;
  onSelectActivity?: (activity: Activity) => void;
}

export function ActivityLineView({ 
  activities, 
  onEdit, 
  onDelete, 
  onViewPDF, 
  onActivityClick, 
  loading,
  selectedActivities = [],
  isLessonPlanning = false,
  targetSection,
  onSelectActivity
}: ActivityLineViewProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Toe Tipper': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Green Horn': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Semi-Pro': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Seasoned Veteran': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getActivityTypeColor = (type: string) => {
    const colors = {
      'warm-up': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'main': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'cool-down': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'game': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'exercise': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const isSelected = (activity: Activity) => {
    return selectedActivities.some(selected => selected.id === activity.id);
  };

  const isTargetMatch = (activity: Activity) => {
    if (!targetSection) return false;
    
    switch (targetSection) {
      case 'warmUp':
        return activity.activityType === 'warm-up';
      case 'coolDown':
        return activity.activityType === 'cool-down';
      case 'main':
        return activity.activityType === 'main';
      default:
        return false;
    }
  };

  const handleActivityClick = (activity: Activity, event: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((event.target as HTMLElement).closest('.action-buttons')) {
      return;
    }

    // Call the activity click handler if provided
    if (onActivityClick) {
      onActivityClick(activity);
    }
  };

  const handleSelectActivity = (activity: Activity, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onSelectActivity) {
      onSelectActivity(activity);
    }
  };

  const hasResources = (activity: Activity) => {
    return (activity.pdfFiles && activity.pdfFiles.length > 0) || 
           (activity.scriptIds && activity.scriptIds.length > 0);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-dark-700">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-2/3"></div>
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-12 text-center">
        <Tag className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activities found</h3>
        <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters to see more activities.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-dark-700">
        {activities.map((activity) => {
          const activityIsSelected = isSelected(activity);
          const isTargetedActivity = isTargetMatch(activity);
          
          return (
            <div
              key={activity.id}
              className={`p-3 transition-all duration-200 group ${
                activityIsSelected
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 !border-l-blue-500 dark:!border-l-blue-400'
                  : isTargetedActivity && targetSection
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 !border-l-green-500 dark:!border-l-green-400'
                    : hasResources(activity) && onActivityClick
                      ? 'hover:bg-blue-50 sdark:hover:bg-blue-900/20 cursor-pointer'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-700'
              }`}
              onClick={(e) => handleActivityClick(activity, e)}
              title={
                hasResources(activity) && onActivityClick
                  ? 'Click to view attached resources'
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Title and basic info in one line */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-base font-semibold truncate ${
                      activityIsSelected 
                        ? 'text-blue-900 dark:text-blue-300' 
                        : isTargetedActivity && targetSection
                          ? 'text-green-900 dark:text-green-300'
                          : 'text-gray-900 dark:text-white'
                    }`}>
                      {activity.title}
                      {activityIsSelected && (
                        <span className="ml-2 text-xs bg-blue-600 dark:bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          Added
                        </span>
                      )}
                      {isTargetedActivity && targetSection && !activityIsSelected && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-600 dark:bg-green-500 text-white px-2 py-0.5 rounded-full">
                          <Target className="w-3 h-3" />
                          Perfect Match
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{activity.duration}min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{activity.materials.length}</span>
                      </div>
                      {activity.pdfFiles && activity.pdfFiles.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {activity.pdfFiles.length} PDF{activity.pdfFiles.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {activity.scriptIds && activity.scriptIds.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            {activity.scriptIds.length} Script{activity.scriptIds.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {/* {hasResources(activity) && onActivityClick && (
                        <span className="text-blue-600 dark:text-blue-400 text-xs ml-1">
                          (click to view)
                        </span>
                      )} */}
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm mb-2 line-clamp-1 ${
                    activityIsSelected 
                      ? 'text-blue-700 dark:text-blue-400' 
                      : isTargetedActivity && targetSection
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {activity.description}
                  </p>

                  {/* Tags and metadata */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      activityIsSelected
                        ? 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-300'
                        : isTargetedActivity && targetSection
                          ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                    }`}>
                      {activity.ageGroup}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getLevelColor(activity.skillLevel)}`}>
                      {activity.skillLevel}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getActivityTypeColor(activity.activityType)}`}>
                      {activity.activityType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    
                    {/* Show only first 2 tags */}
                    {activity.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md ${
                          activityIsSelected
                            ? 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-300'
                            : isTargetedActivity && targetSection
                              ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                    {activity.tags.length > 2 && (
                      <span className={`px-2 py-0.5 text-xs rounded-md ${
                        activityIsSelected
                          ? 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-300'
                          : isTargetedActivity && targetSection
                            ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        +{activity.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="action-buttons flex items-center gap-1 ml-4">
                  {/* Plus button for lesson planning */}
                  {isLessonPlanning && onSelectActivity && (
                    <button
                      onClick={(e) => handleSelectActivity(activity, e)}
                      className={`p-2 rounded-lg transition-all ${
                        activityIsSelected
                          ? 'bg-blue-600 dark:bg-blue-500 text-white'
                          : isTargetedActivity && targetSection
                            ? 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      title={
                        activityIsSelected 
                          ? 'Already added to lesson' 
                          : isTargetedActivity && targetSection
                            ? `Perfect for ${targetSection === 'warmUp' ? 'Warm-up' : targetSection === 'coolDown' ? 'Cool-down' : 'Main Activities'} - Click to add`
                            : 'Add to lesson'
                      }
                    >
                      {isTargetedActivity && targetSection && !activityIsSelected ? (
                        <Target className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  )}

                {/* Edit/Delete buttons for non-lesson planning mode */}
                {!isLessonPlanning && (
                  // <div className="action-buttons flex items-center gap-1 ml-4 transition-opacity">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(activity);
                      }}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit Activity"
                    >
                      <Edit className="w-4 h-4" />
                    </button> */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(activity.id);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}