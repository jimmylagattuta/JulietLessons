import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { AgeGroup, LessonPlan, SavedLesson } from '../types';

interface SaveLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lessonData: Omit<SavedLesson, 'id' | 'createdAt' | 'updatedAt'>) => void;
  lessonPlan: LessonPlan;
}

const ageGroups: AgeGroup[] = ['Young', 'Middle', 'Older'];

export function SaveLessonModal({ isOpen, onClose, onSave, lessonPlan }: SaveLessonModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ageGroup: 'Middle' as AgeGroup,
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lessonData = {
      title: formData.title,
      description: formData.description,
      ageGroup: formData.ageGroup,
      warmUpId: lessonPlan.warmUp?.id,
      mainActivityIds: lessonPlan.mainActivities.map(a => a.id),
      coolDownId: lessonPlan.coolDown?.id,
      totalDuration: lessonPlan.totalDuration,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    onSave(lessonData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      ageGroup: 'Middle',
      tags: ''
    });
    
    onClose();
  };

  const hasActivities = lessonPlan.warmUp || lessonPlan.mainActivities.length > 0 || lessonPlan.coolDown;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-dark-700 transition-colors duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Save Lesson Plan</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!hasActivities ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Activities to Save</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add some activities to your lesson plan before saving.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Lesson Summary */}
            <div className="p-6 bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Lesson Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Duration:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{lessonPlan.totalDuration} minutes</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Activities:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {(lessonPlan.warmUp ? 1 : 0) + lessonPlan.mainActivities.length + (lessonPlan.coolDown ? 1 : 0)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {lessonPlan.warmUp && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-gray-600 dark:text-gray-400">Warm-up:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{lessonPlan.warmUp.title}</span>
                  </div>
                )}
                {lessonPlan.mainActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-600 dark:text-gray-400">Main {index + 1}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{activity.title}</span>
                  </div>
                ))}
                {lessonPlan.coolDown && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600 dark:text-gray-400">Cool-down:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{lessonPlan.coolDown.title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a descriptive title for your lesson"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the lesson objectives and what students will learn"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Age Group</label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as AgeGroup })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
                >
                  {ageGroups.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="drama, teamwork, creativity, performance..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  Save Lesson
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}