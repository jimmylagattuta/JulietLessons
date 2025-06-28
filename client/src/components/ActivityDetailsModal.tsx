import React from 'react';
import { X, FileText, Download, Eye, Play, Clock, Users, Plus } from 'lucide-react';
import { Activity, Script } from '../types';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  scripts: Script[];
  onViewPDF?: (pdfUrl: string, fileName: string) => void;
  onViewScript?: (scriptUrl: string) => void;
  onSelectActivity?: (activity: Activity) => void;
  showSelectButton?: boolean;
  isSelected?: boolean;
}

export function ActivityDetailsModal({ 
  isOpen, 
  onClose, 
  activity, 
  scripts,
  onViewPDF,
  onViewScript,
  onSelectActivity,
  showSelectButton = false,
  isSelected = false
}: ActivityDetailsModalProps) {
  if (!isOpen || !activity) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const connectedScripts = activity.scriptIds 
    ? scripts.filter(script => activity.scriptIds!.includes(script.id))
    : [];

  const getGenreColor = (genre: string) => {
    const colors = {
      comedy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      drama: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      mystery: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      fantasy: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      historical: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      contemporary: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
    };
    return colors[genre as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const handleSelectActivity = () => {
    if (onSelectActivity && activity) {
      onSelectActivity(activity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-dark-700 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activity.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activity Resources</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* {showSelectButton && onSelectActivity && (
              <button
                onClick={handleSelectActivity}
                disabled={isSelected}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 shadow-md hover:shadow-lg'
                }`}
              >
                <Plus className="w-4 h-4" />
                {isSelected ? 'Added to Lesson' : 'Add to Lesson'}
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

        {/* Activity Info */}
        <div className="p-6 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-700">
          <p className="text-gray-700 dark:text-gray-300 mb-4">{activity.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{activity.duration} minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{activity.materials.length} materials</span>
            </div>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
              {activity.ageGroup}
            </span>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs font-medium rounded-full">
              {activity.activityType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attached PDFs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                Attached PDFs ({activity.pdfFiles?.length || 0})
              </h3>
              
              {activity.pdfFiles && activity.pdfFiles.length > 0 ? (
                <div className="space-y-3">
                  {activity.pdfFiles.map((pdf) => (
                    <div key={pdf._id} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-gray-200 dark:border-dark-600">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">{pdf.fileName}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{formatFileSize(pdf.fileSize)}</span>
                            <span>•</span>
                            <span>{new Date(pdf.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          {pdf.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{pdf.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-3">
                          {/* {onViewPDF && (
                            <button
                              onClick={() => onViewPDF(pdf.fileUrl, pdf.fileName)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )} */}
                          <a
                            href={pdf.fileUrl}
                            download={pdf.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-dark-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-600">
                  <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No PDFs attached to this activity</p>
                </div>
              )}
            </div>

            {/* Connected Scripts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Connected Scripts ({connectedScripts.length})
              </h3>
              
              {connectedScripts.length > 0 ? (
                <div className="space-y-3">
                  {connectedScripts.map((script) => (
                    <div key={script.id} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-gray-200 dark:border-dark-600">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white">{script.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{script.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGenreColor(script.genre)}`}>
                              {script.genre}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                              {script.characterCount} characters
                            </span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                              {script.duration} min
                            </span>
                          </div>
                        </div>
                        {script.fileUrl && onViewScript && (
                          <a
                            href={script.fileUrl}
                            download={script.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors ml-3"
                            title="View Script"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          // <button
                          //   onClick={() => onViewScript(script.fileUrl!)}
                          //   className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors ml-3"
                          //   title="View Script"
                          // >
                          //   <Eye className="w-4 h-4" />
                          // </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-dark-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-600">
                  <Play className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {activity.requiresScript === 'none' 
                      ? 'This activity does not require scripts'
                      : 'No scripts connected to this activity'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Materials Section */}
          {activity.materials.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Required Materials</h3>
              <div className="flex flex-wrap gap-2">
                {activity.materials.map((material, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm rounded-full"
                  >
                    {material}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {activity.tags.length > 0 && (
            <div className="mt-6 pt-6 border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-dark-700 border-t border-gray-200 dark:border-dark-600 rounded-b-xl">
          <div className="flex justify-end items-center">
            {showSelectButton && onSelectActivity ? (
              <button
                onClick={handleSelectActivity}
                disabled={isSelected}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 shadow-md hover:shadow-lg'
                }`}
              >
                <Plus className="w-5 h-5" />
                {isSelected ? 'Already Added to Lesson' : 'Add to Lesson Plan'}
              </button>
            )
              :
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-auto"
              >
                Close
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}