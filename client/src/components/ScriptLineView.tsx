import React from 'react';
import { Clock, Users, Tag, FileText, Edit, Trash2, Upload, Download } from 'lucide-react';
import { Script } from '../types';

interface ScriptLineViewProps {
  scripts: Script[];
  onEdit?: (script: Script) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string, file: File) => void;
  loading: boolean;
}

export function ScriptLineView({ 
  scripts, 
  onEdit, 
  onDelete, 
  onUpload,
  loading
}: ScriptLineViewProps) {
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

  const handleFileUpload = (scriptId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(scriptId, file);
    }
    // Reset the input
    event.target.value = '';
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

  if (scripts.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-12 text-center">
        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scripts found</h3>
        <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters to see more scripts.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-dark-700">
        {scripts.map((script) => (
          <div
            key={script.id}
            className="p-3 transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-dark-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {/* Title and basic info in one line */}
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {script.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{script.duration}min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{script.characterCount} chars</span>
                    </div>
                    {script.fileUrl && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400 font-medium">PDF</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                  {script.description}
                </p>

                {/* Tags and metadata */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400">
                    {script.ageGroup}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getGenreColor(script.genre)}`}>
                    {script.genre}
                  </span>
                  
                  {/* Show only first 2 tags */}
                  {script.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                  {script.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                      +{script.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* File status and actions */}
              <div className="flex items-center gap-2 ml-4">
                {/* File status */}
                <div className="text-right">
                  {script.fileUrl ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {script.fileName}
                      </span>
                      <a
                        href={script.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                        title="View PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">No file</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Upload button */}
                  <label className="p-2 text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(script.id, e)}
                      className="hidden"
                    />
                  </label>

                  {/* <button
                    onClick={() => onEdit(script)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Edit Script"
                  >
                    <Edit className="w-4 h-4" />
                  </button> */}
                  <button
                    onClick={() => onDelete(script.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete Script"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}