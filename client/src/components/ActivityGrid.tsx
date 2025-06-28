import React, { useState } from 'react';
import { Clock, Users, Tag, Plus, FileText, Play, LayoutGrid, List, Trash2, Target } from 'lucide-react';
import { Activity, Script } from '../types';
import { ActivityLineView } from './ActivityLineView';
import { ActivityDetailsModal } from './ActivityDetailsModal';

interface ActivityGridProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  selectedActivities: Activity[];
  loading: boolean;
  scripts?: Script[];
  onViewPDF?: (pdfUrl: string, fileName: string) => void;
  onViewScript?: (scriptUrl: string) => void;
  viewMode?: 'card' | 'line';
  onViewModeChange?: (mode: 'card' | 'line') => void;
  showViewToggle?: boolean;
  isLessonPlanning?: boolean;
  targetSection?: 'warmUp' | 'main' | 'coolDown' | null;
  onDelete?: (id: string) => void;
}

export function ActivityGrid({ 
  activities, 
  onSelectActivity, 
  selectedActivities, 
  loading,
  scripts = [],
  onViewPDF,
  onViewScript,
  viewMode = 'card',
  onViewModeChange,
  showViewToggle = false,
  isLessonPlanning = false,
  targetSection,
  onDelete
}: ActivityGridProps) {
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<Activity | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getActivityTypeColor = (type: string) => {
    const colors = {
      'warm-up': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
      'main': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      'cool-down': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      'game': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
      'exercise': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'Toe Tipper': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Green Horn': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Semi-Pro': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'Seasoned Veteran': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getPlayOrCraftColor = (playOrCraft: string) => {
    const colors = {
      'More Playing Than Creating': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'A Balance of Playing and Creating': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Let\'s Create and Craft': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    };
    return colors[playOrCraft as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const isSelected = (activity: Activity) => {
    return selectedActivities.some(selected => selected.id === activity.id);
  };

  const getConnectedScripts = (activity: Activity) => {
    return activity.scriptIds 
      ? scripts.filter(script => activity.scriptIds!.includes(script.id))
      : [];
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivityForDetails(activity);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedActivityForDetails(null);
  };

  const handleSelectActivityFromModal = (activity: Activity) => {
    onSelectActivity(activity);
  };

  // Handle card click - in lesson planning mode, show details modal; in activities tab, do nothing special
  const handleCardClick = (activity: Activity, event: React.MouseEvent) => {
    // Don't trigger if clicking on the plus button
    if ((event.target as HTMLElement).closest('.add-button')) {
      return;
    }

    // Always show details modal when clicking the card
    handleActivityClick(activity);
  };

  // Handle plus button click - directly add to lesson
  const handlePlusButtonClick = (activity: Activity, event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectActivity(activity);
  };

  // Check if activity matches target section
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

  if (loading) {
    return (
      <div>
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
              <div className="flex bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange('card')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'card'
                      ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Cards
                </button>
                <button
                  onClick={() => onViewModeChange('line')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'line'
                      ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'line' ? (
          <ActivityLineView
            activities={[]}
            onEdit={() => {}}
            onDelete={onDelete || (() => {})}
            onViewPDF={onViewPDF}
            onActivityClick={handleActivityClick}
            loading={true}
            selectedActivities={selectedActivities}
            isLessonPlanning={isLessonPlanning}
            targetSection={targetSection}
            onSelectActivity={onSelectActivity}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div>
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
              <div className="flex bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange('card')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'card'
                      ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Cards
                </button>
                <button
                  onClick={() => onViewModeChange('line')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'line'
                      ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activities found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters to see more activities.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showViewToggle && onViewModeChange && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
            <div className="flex bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('card')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Cards
              </button>
              <button
                onClick={() => onViewModeChange('line')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'line'
                    ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'line' ? (
        <ActivityLineView
          activities={activities}
          onEdit={() => {}} // Not used in lesson planning
          onDelete={onDelete || (() => {})}
          onViewPDF={onViewPDF}
          onActivityClick={handleActivityClick}
          loading={false}
          selectedActivities={selectedActivities}
          isLessonPlanning={isLessonPlanning}
          targetSection={targetSection}
          onSelectActivity={onSelectActivity}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => {
            const connectedScripts = getConnectedScripts(activity);
            const activityIsSelected = isSelected(activity);
            const isTargetedActivity = isTargetMatch(activity);
            
            return (
              <div
                key={activity.id}
                className={`bg-white dark:bg-dark-800 rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl hover:shadow-gray-200 dark:hover:shadow-black/20 group ${
                  // isSelected(activity)
                  activityIsSelected
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md dark:shadow-xl'
                    : isTargetedActivity && targetSection
                      ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 shadow-md dark:shadow-xl'
                      : 'border-gray-200 dark:border-dark-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
                onClick={(e) => handleCardClick(activity, e)}
                title="Click to view activity details and resources"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 pr-2">
                    {activity.title}
                    {isTargetedActivity && targetSection && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                        <Target className="w-3 h-3" />
                        Perfect Match
                      </span>
                    )}
                  </h3>
                  {isLessonPlanning ? (
                    <button
                      className={`add-button p-2 rounded-full transition-all ${
                        // isSelected(activity)
                        activityIsSelected
                          ? 'bg-blue-600 dark:bg-blue-500 text-white'
                          : isTargetedActivity && targetSection
                            ? 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      onClick={(e) => handlePlusButtonClick(activity, e)}
                      // title={isSelected(activity) ? 'Already added to lesson' : 'Add to lesson'}
                      title={
                        activityIsSelected 
                          ? 'Already added to lesson' 
                          : isTargetedActivity && targetSection
                            ? `Perfect for ${targetSection === 'warmUp' ? 'Warm-up' : targetSection === 'coolDown' ? 'Cool-down' : 'Main Activities'} - Click to add`
                            : 'Add to lesson'
                      }
                    >
                      {/* <Plus className="w-4 h-4" /> */}
                      {isTargetedActivity && targetSection ? (
                        <Target className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete button clicked for activity:', activity.id, activity.title);
                        if (onDelete) {
                          onDelete(activity.id);
                        } else {
                          console.log('onDelete function not provided');
                        }
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Activity"
                    >
                      {/* <Trash2 className="w-4 h-4" /> */}
                      Delete
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                  {activity.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                    {activity.ageGroup}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(activity.skillLevel)}`}>
                    {activity.skillLevel}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getActivityTypeColor(activity.activityType)}`}>
                    {activity.activityType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlayOrCraftColor(activity.playOrCraft)}`}>
                    {activity.playOrCraft}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center flex-wrap gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{activity.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{activity.materials.length} materials</span>
                    </div>
                    {activity.pdfFiles && activity.pdfFiles.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400">{activity.pdfFiles.length} PDF{activity.pdfFiles.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {connectedScripts.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Play className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-purple-600 dark:text-purple-400">{connectedScripts.length} Script{connectedScripts.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {activity.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                  {activity.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                      +{activity.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Resource hint */}
                {/* {((activity.pdfFiles && activity.pdfFiles.length > 0) || connectedScripts.length > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-700">
                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                      Click card to view attached resources
                    </p>
                  </div>
                )} */}
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        activity={selectedActivityForDetails}
        scripts={scripts}
        onViewPDF={onViewPDF}
        onViewScript={onViewScript}
        onSelectActivity={isLessonPlanning ? handleSelectActivityFromModal : undefined}
        showSelectButton={isLessonPlanning}
        isSelected={selectedActivityForDetails ? isSelected(selectedActivityForDetails) : false}
      />
    </div>
  );
}