import React from 'react';
import { Clock, Users, Tag, Play, Edit, Trash2, BookOpen, Eye } from 'lucide-react';
import { SavedLesson, Activity } from '../types';

interface SavedLessonsPanelProps {
  savedLessons: SavedLesson[];
  onLoadLesson: (lesson: SavedLesson) => void;
  onDeleteLesson: (id: string) => void;
  onViewLesson?: (lesson: SavedLesson) => void;
  loading: boolean;
}

export function SavedLessonsPanel({ savedLessons, onLoadLesson, onDeleteLesson, onViewLesson, loading }: SavedLessonsPanelProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getActivityCount = (lesson: SavedLesson) => {
    return (lesson.warmUpId ? 1 : 0) + lesson.mainActivityIds.length + (lesson.coolDownId ? 1 : 0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-4 animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (savedLessons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Saved Lessons</h3>
        <p className="text-gray-600 dark:text-gray-400">Create and save lesson plans to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedLessons.map((lesson) => (
        <div
          key={lesson.id}
          className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-xl hover:shadow-gray-200 dark:hover:shadow-black/20 transition-all duration-200 hover:border-green-300 dark:hover:border-green-600 group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{lesson.title}</h4>
              {lesson.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{lesson.description}</p>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onViewLesson && (
                <button
                  onClick={() => onViewLesson(lesson)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="View Lesson Activities"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {/* <button
                onClick={() => onLoadLesson(lesson)}
                className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                title="Load Lesson"
              >
                <Play className="w-4 h-4" />
              </button> */}
              <button
                onClick={() => onDeleteLesson(lesson.id)}
                className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete Lesson"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(lesson.totalDuration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{getActivityCount(lesson)} activities</span>
              </div>
              {lesson.ageGroup && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                  {lesson.ageGroup}
                </span>
              )}
            </div>
          </div>

          {lesson.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lesson.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
              {lesson.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                  +{lesson.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created {new Date(lesson.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}