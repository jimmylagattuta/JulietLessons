import React from 'react';
import { Clock, Users, Plus, X, Play, FileText, Save, BookOpen, ChevronLeft, ChevronRight, Target, Layout, Activity as ActivityIcon } from 'lucide-react';
import { LessonPlan, Activity } from '../types';

interface LessonPreviewPanelProps {
  lessonPlan: LessonPlan;
  onAddActivity: (type: 'warmUp' | 'main' | 'coolDown') => void;
  onRemoveActivity: (type: 'warmUp' | 'main' | 'coolDown', index?: number) => void;
  onViewScript: (scriptUrl: string) => void;
  onGenerateLesson: () => void;
  onSaveLesson: () => void;
  onShowSavedLessons: () => void;
  isGenerating: boolean;
  showSavedLessons: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  targetSection?: 'warmUp' | 'main' | 'coolDown' | null;
}

export function LessonPreviewPanel({ 
  lessonPlan, 
  onAddActivity, 
  onRemoveActivity, 
  onViewScript,
  onGenerateLesson,
  onSaveLesson,
  onShowSavedLessons,
  isGenerating,
  showSavedLessons,
  isCollapsed = false,
  onToggleCollapse,
  targetSection
}: LessonPreviewPanelProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const hasActivities = lessonPlan.warmUp || lessonPlan.mainActivities.length > 0 || lessonPlan.coolDown;

  const ActivityCard = ({ 
    activity, 
    type, 
    index, 
    onRemove 
  }: { 
    activity: Activity; 
    type: string; 
    index?: number;
    onRemove: () => void;
  }) => (
    <div className="bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg p-4 hover:shadow-md dark:hover:shadow-xl hover:shadow-gray-200 dark:hover:shadow-black/20 transition-all duration-200 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{activity.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{activity.description}</p>
        </div>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all rounded hover:bg-red-50 dark:hover:bg-red-900/30"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{activity.duration} min</span>
          </div>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
            {activity.skillLevel}
          </span>
          {activity.scriptIds && activity.scriptIds.length > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{activity.scriptIds.length} script{activity.scriptIds.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {activity.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-md">
              {tag}
            </span>
          ))}
          {activity.tags.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-md">
              +{activity.tags.length - 2}
            </span>
          )}
        </div>
        
        {/* {activity.scriptIds && activity.scriptIds.length > 0 && (
          <div className="flex gap-1">
            {activity.scriptIds.slice(0, 2).map((scriptId, i) => (
              <button
                key={scriptId}
                onClick={() => onViewScript(`/scripts/${scriptId}/file`)}
                className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                title={`View Script ${i + 1}`}
              >
                <FileText className="w-4 h-4" />
              </button>
            ))}
            {activity.scriptIds.length > 2 && (
              <span className="px-1 text-xs text-gray-500 dark:text-gray-400">
                +{activity.scriptIds.length - 2}
              </span>
            )}
          </div>
        )} */}
      </div>
    </div>
  );

  const EmptySlot = ({ 
    type, 
    title, 
    description, 
    icon 
  }: { 
    type: 'warmUp' | 'main' | 'coolDown'; 
    title: string; 
    description: string;
    icon: React.ReactNode;
  // }) => (
  //   <button
  //     onClick={() => onAddActivity(type)}
  //     className="w-full border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
  //   >
  //     <div className="flex flex-col items-center text-center">
  //       <div className="w-12 h-12 bg-gray-100 dark:bg-dark-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 transition-colors">
  //         {icon}
  //       </div>
  //       <h4 className="font-medium text-gray-900 dark:text-white mb-1">{title}</h4>
  //       <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
  //       <div className="mt-3 flex items-center gap-1 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
  //         <Plus className="w-4 h-4" />
  //         <span className="text-sm font-medium">Add Activity</span>
  //       </div>
  //     </div>
  //   </button>
  // );
  }) => {
    const isTargeted = targetSection === type;
    
    return (
      <button
        onClick={() => onAddActivity(type)}
        className={`w-full border-2 border-dashed rounded-lg p-6 transition-all duration-200 group ${
          isTargeted
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
            : 'border-gray-300 dark:border-dark-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
            isTargeted
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'bg-gray-100 dark:bg-dark-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
          }`}>
            {isTargeted ? <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" /> : icon}
          </div>
          <h4 className={`font-medium mb-1 ${
            isTargeted 
              ? 'text-blue-900 dark:text-blue-300' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {isTargeted ? `Ready for ${title}` : title}
          </h4>
          <p className={`text-sm ${
            isTargeted 
              ? 'text-blue-700 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {isTargeted ? 'Click an activity to add here' : description}
          </p>
          <div className={`mt-3 flex items-center gap-1 transition-colors ${
            isTargeted
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'
          }`}>
            {isTargeted ? <Target className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isTargeted ? 'Target Active' : 'Add Activity'}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={`bg-gray-50 dark:bg-dark-900 border-r border-gray-200 dark:border-dark-700 flex flex-col h-full transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-96'
    }`}>
      {/* Header */}
      <div className="p-6 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 transition-colors duration-200">
        <div className={isCollapsed ? "flex justify-center" : "flex items-center justify-between mb-4"}>
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lesson Plan</h2>
          )}
          <div className="flex gap-2">
            {/* Collapse/Expand Button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
            )}

            {/* {!isCollapsed && (
            <button
              onClick={onShowSavedLessons}
              className={`p-2 rounded-lg transition-colors ${
                showSavedLessons 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
              title="View Saved Lessons"
            >
              <Layout className="w-5 h-5" />
            </button>
            )} */}
          </div>
        </div>
        
        {!isCollapsed && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{formatDuration(lessonPlan.totalDuration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{lessonPlan.mainActivities.length + (lessonPlan.warmUp ? 1 : 0) + (lessonPlan.coolDown ? 1 : 0)} activities</span>
            </div>
          </div>
          
          {/* {hasActivities && (
            <button
              onClick={onSaveLesson}
              className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )} */}
        </div>
        )}
      </div>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center py-6 space-y-4">
          {/* Quick stats */}
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <div className="font-medium">{lessonPlan.totalDuration}m</div>
            </div>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <div className="font-medium">{lessonPlan.mainActivities.length + (lessonPlan.warmUp ? 1 : 0) + (lessonPlan.coolDown ? 1 : 0)}</div>
            </div>
          </div>

          {/* Activity indicators */}
          <div className="space-y-2">
            {lessonPlan.warmUp && (
              <div className={`w-8 h-2 rounded-full ${
                targetSection === 'warmUp' ? 'bg-blue-500 animate-pulse' : 'bg-orange-500'
              }`} title="Warm-up activity"></div>
            )}
            {lessonPlan.mainActivities.map((_, index) => (
              <div key={index} className={`w-8 h-2 rounded-full ${
                targetSection === 'main' ? 'bg-blue-500 animate-pulse' : 'bg-blue-500'
              }`} title="Main activity"></div>
            ))}
            {lessonPlan.coolDown && (
              <div className={`w-8 h-2 rounded-full ${
                targetSection === 'coolDown' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
              }`} title="Cool-down activity"></div>
            )}
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <button
              onClick={onShowSavedLessons}
              // disabled={isGenerating}
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center"
              title={showSavedLessons ? 'View Activities' : 'View Saved Lessons'}
            >
              {showSavedLessons ? <ActivityIcon className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
            </button>
            {/* <button
              onClick={onGenerateLesson}
              disabled={isGenerating}
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center"
              title="Auto Generate Lesson"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button> */}

            {hasActivities && (
              <button
                onClick={onSaveLesson}
                className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center"
                title="Save Lesson"
              >
                <Save className="w-4 h-4" />
              </button>
            )}

            {/* <button
              onClick={onShowSavedLessons}
              className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${
                showSavedLessons 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="View Saved Lessons"
            >
              <Layout className="w-4 h-4" />
            </button> */}
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {!isCollapsed && (
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Auto Generate Button - Moved to top */}
        <div className="flex justify-center flex-col space-y-4 items-center">
          <button
            onClick={onShowSavedLessons}
            // disabled={isGenerating}
            className="w-[220px] flex justify-center items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-medium"
          >
            {showSavedLessons ? <ActivityIcon className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
            <span>
              {showSavedLessons ? 'View Activities' : 'View Saved Lessons'}
            </span>
          </button>

          {hasActivities && (
          <button
            onClick={onSaveLesson}
            className="w-[220px] flex justify-center items-center gap-2 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors shadow-md hover:shadow-lg font-medium"
          >
            <Save className="w-5 h-5" />
            Save
          </button>)}
        </div>

        {/* Auto Generate Button - Moved to top */}
        {/* <div className="flex justify-center">
          <button
            onClick={onGenerateLesson}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-medium"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>
              {isGenerating ? 'Generating Lesson...' : 'Auto Generate Lesson'}
            </span>
          </button>
        </div> */}

        {/* Warm-up Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-orange-500">🔥</span>
            Warm-up
            {targetSection === 'warmUp' && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full animate-pulse">
                Target Active
              </span>
            )}
          </h3>
          {lessonPlan.warmUp ? (
            <ActivityCard
              activity={lessonPlan.warmUp}
              type="warm-up"
              onRemove={() => onRemoveActivity('warmUp')}
            />
          ) : (
            <EmptySlot
              type="warmUp"
              title="Add Warm-up"
              description="Start with an energizing activity"
              icon={<span className="text-orange-500 text-xl">🔥</span>}
            />
          )}
        </div>

        {/* Main Activities Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-blue-500">🎭</span>
            Main Activities
            {targetSection === 'main' && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full animate-pulse">
                Target Active
              </span>
            )}
          </h3>
          <div className="space-y-3">
            {lessonPlan.mainActivities.map((activity, index) => (
              <ActivityCard
                key={`main-${index}`}
                activity={activity}
                type="main"
                index={index}
                onRemove={() => onRemoveActivity('main', index)}
              />
            ))}
            <EmptySlot
              type="main"
              title="Add Main Activity"
              description="Core learning activities"
              icon={<span className="text-blue-500 text-xl">🎭</span>}
            />
          </div>
        </div>

        {/* Cool-down Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-green-500">🧘</span>
            Cool-down
            {targetSection === 'coolDown' && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full animate-pulse">
                Target Active
              </span>
            )}
          </h3>
          {lessonPlan.coolDown ? (
            <ActivityCard
              activity={lessonPlan.coolDown}
              type="cool-down"
              onRemove={() => onRemoveActivity('coolDown')}
            />
          ) : (
            <EmptySlot
              type="coolDown"
              title="Add Cool-down"
              description="End with a calming activity"
              icon={<span className="text-green-500 text-xl">🧘</span>}
            />
          )}
        </div>
      </div>
      )}
    </div>
  );
}