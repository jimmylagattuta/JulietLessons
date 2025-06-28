import React from 'react';
import { Clock, Users, Tag, FileText, Download, Upload } from 'lucide-react';
import { Script } from '../types';

interface ScriptCardProps {
  script: Script;
  onEdit?: (script: Script) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string, file: File) => void;
}

export function ScriptCard({ script, onEdit, onDelete, onUpload }: ScriptCardProps) {
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(script.id, file);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6 hover:shadow-md dark:hover:shadow-xl hover:shadow-gray-200 dark:hover:shadow-black/20 transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600 group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{script.title}</h3>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* <button
            onClick={() => onEdit(script)}
            className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 text-sm font-medium px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
          >
            Edit
          </button> */}
          <button
            onClick={() => onDelete(script.id)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{script.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400 text-xs font-medium rounded-full">
          {script.ageGroup}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGenreColor(script.genre)}`}>
          {script.genre}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{script.duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{script.characterCount} characters</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {script.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        ))}
        {script.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
            +{script.tags.length - 3} more
          </span>
        )}
      </div>

      {/* File management */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-dark-700">
        {script.fileUrl ? (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">{script.fileName}</span>
            <a
              href={script.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">No file uploaded</span>
        )}
        
        <label className="flex items-center gap-1 px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-md cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors">
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">Upload PDF</span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}