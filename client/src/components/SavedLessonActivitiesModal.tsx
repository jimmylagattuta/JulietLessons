import React from 'react';
import { X, Clock, Users, Tag, FileText, Play, BookOpen } from 'lucide-react';
import { SavedLesson, Activity, Script } from '../types';

interface SavedLessonActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: SavedLesson | null;
  activities: Activity[];
  scripts: Script[];
  onViewPDF?: (pdfUrl: string, fileName: string) => void;
  onViewScript?: (scriptUrl: string) => void;
  onLoadLesson?: (lesson: SavedLesson) => void;
}

export function SavedLessonActivitiesModal({
  isOpen,
  onClose,
  lesson,
  activities,
  scripts,
  onViewPDF,
  onViewScript,
  onLoadLesson
}: SavedLessonActivitiesModalProps) {
  if (!isOpen || !lesson) return null;

  // Get the actual activities for this lesson
  const warmUpActivity = lesson.warmUpId ? activities.find(a => a.id === lesson.warmUpId) : null;
  const mainActivities = lesson.mainActivityIds.map(id => activities.find(a => a.id === id)).filter(Boolean) as Activity[];
  const coolDownActivity = lesson.coolDownId ? activities.find(a => a.id === lesson.coolDownId) : null;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getConnectedScripts = (activity: Activity) => {
    return activity.scriptIds 
      ? scripts.filter(script => activity.scriptIds!.includes(script.id))
      : [];
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

  const ActivityCard = ({ activity, sectionTitle }: { activity: Activity; sectionTitle: string }) => {
    const connectedScripts = getConnectedScripts(activity);
    
    return (
      <div className="bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {sectionTitle}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityTypeColor(activity.activityType)}`}>
                {activity.activityType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{activity.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{activity.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{activity.duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{activity.materials.length} materials</span>
          </div>
          {activity.pdfFiles && activity.pdfFiles.length > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400">{activity.pdfFiles.length} PDF{activity.pdfFiles.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {connectedScripts.length > 0 && (
            <div className="flex items-center gap-1">
              <Play className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-600 dark:text-purple-400">{connectedScripts.length} Script{connectedScripts.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="space-y-3">
          {/* PDFs */}
          {activity.pdfFiles && activity.pdfFiles.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <h5 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Attached PDFs ({activity.pdfFiles.length})
              </h5>
              <div className="space-y-2">
                {activity.pdfFiles.slice(0, 2).map((pdf) => (
                  <div key={pdf._id} className="flex items-center justify-between text-sm">
                    <span className="text-green-700 dark:text-green-400 truncate">{pdf.fileName}</span>
                    {onViewPDF && (
                      <a
                        href={pdf.fileUrl}
                        download={pdf.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="View PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                      // <button
                      //   onClick={() => onViewPDF(pdf.fileUrl, pdf.fileName)}
                      //   className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 ml-2"
                      //   title="View PDF"
                      // >
                      //   <FileText className="w-4 h-4" />
                      // </button>
                    )}
                  </div>
                ))}
                {activity.pdfFiles.length > 2 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{activity.pdfFiles.length - 2} more PDF{activity.pdfFiles.length - 2 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Scripts */}
          {connectedScripts.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <h5 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-1">
                <Play className="w-4 h-4" />
                Connected Scripts ({connectedScripts.length})
              </h5>
              <div className="space-y-2">
                {connectedScripts.slice(0, 2).map((script) => (
                  <div key={script.id} className="flex items-center justify-between text-sm">
                    <span className="text-purple-700 dark:text-purple-400 truncate">{script.title}</span>
                    {script.fileUrl && onViewScript && (
                      <a
                        href={script.fileUrl}
                        download={script.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 ml-2"
                        title="View Script"
                      >
                        <Play className="w-4 h-4" />
                      </a>
                      // <button
                      //   onClick={() => onViewScript(script.fileUrl!)}
                      //   className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 ml-2"
                      //   title="View Script"
                      // >
                      //   <Play className="w-4 h-4" />
                      // </button>
                    )}
                  </div>
                ))}
                {connectedScripts.length > 2 && (
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    +{connectedScripts.length - 2} more script{connectedScripts.length - 2 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {activity.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-md"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          {activity.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-md">
              +{activity.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    );
  };

  const allActivities = [
    ...(warmUpActivity ? [warmUpActivity] : []),
    ...mainActivities,
    ...(coolDownActivity ? [coolDownActivity] : [])
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-dark-700 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lesson.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {allActivities.length} activities • {formatDuration(lesson.totalDuration)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* {onLoadLesson && (
              <button
                onClick={() => {
                  onLoadLesson(lesson);
                  onClose();
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Play className="w-4 h-4" />
                Load Lesson
              </button>
            )} */}
            <button 
              onClick={onClose} 
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Lesson Description */}
        {lesson.description && (
          <div className="p-6 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-700">
            <p className="text-gray-700 dark:text-gray-300">{lesson.description}</p>
            {lesson.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {lesson.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activities */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Warm-up */}
            {warmUpActivity && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-orange-500">🔥</span>
                  Warm-up Activity
                </h3>
                <ActivityCard activity={warmUpActivity} sectionTitle="Warm-up" />
              </div>
            )}

            {/* Main Activities */}
            {mainActivities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-blue-500">🎭</span>
                  Main Activities ({mainActivities.length})
                </h3>
                <div className="space-y-4">
                  {mainActivities.map((activity, index) => (
                    <ActivityCard 
                      key={activity.id} 
                      activity={activity} 
                      sectionTitle={`Main Activity ${index + 1}`} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cool-down */}
            {coolDownActivity && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-green-500">🧘</span>
                  Cool-down Activity
                </h3>
                <ActivityCard activity={coolDownActivity} sectionTitle="Cool-down" />
              </div>
            )}

            {/* No Activities Found */}
            {allActivities.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Activities Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The activities for this lesson may have been deleted or are no longer available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-dark-700 border-t border-gray-200 dark:border-dark-600 rounded-b-xl">
          <div className="flex justify-end items-center">
            {/* {onLoadLesson ? (
              <button
                onClick={() => {
                  onLoadLesson(lesson);
                  onClose();
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Play className="w-5 h-5" />
                Load This Lesson Plan
              </button>
            )
              : */}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-auto"
              >
                Close
              </button>
            {/* } */}
          </div>
        </div>
      </div>
    </div>
  );
}