import React from 'react';
import { Clock, Users, Tag, FileText, Download, Eye } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  onViewPDF?: (pdfUrl: string, fileName: string) => void;
}

export function ActivityCard({ activity, onEdit, onDelete, onViewPDF }: ActivityCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Toe Tipper': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Green Horn': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Semi-Pro': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Seasoned Veteran': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getScriptRequirementColor = (requirement: string) => {
    switch (requirement) {
      case 'required': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'optional': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'none': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPlayOrCraftColor = (playOrCraft: string) => {
    switch (playOrCraft) {
      case 'More Playing Than Creating': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'A Balance of Playing and Creating': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Let us Create And Craft': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-6 hover:shadow-md dark:hover:shadow-xl hover:shadow-gray-200 dark:hover:shadow-black/20 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{activity.title}</h3>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* <button
            onClick={() => onEdit(activity)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            Edit
          </button> */}
          <button
            onClick={() => onDelete(activity.id)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{activity.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
          {activity.ageGroup}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(activity.skillLevel)}`}>
          {activity.skillLevel}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScriptRequirementColor(activity.requiresScript)}`}>
          Script: {activity.requiresScript}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlayOrCraftColor(activity.playOrCraft)}`}>
          {activity.playOrCraft}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{activity.duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{activity.materials.length} materials</span>
          </div>
          {activity.scriptIds && activity.scriptIds.length > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{activity.scriptIds.length} script{activity.scriptIds.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {activity.pdfFiles && activity.pdfFiles.length > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400">{activity.pdfFiles.length} PDF{activity.pdfFiles.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* PDF Files Section */}
      {activity.pdfFiles && activity.pdfFiles.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
            Attached PDFs ({activity.pdfFiles.length})
          </h4>
          <div className="space-y-2">
            {activity.pdfFiles.slice(0, 2).map((pdf) => (
              <div key={pdf._id} className="flex items-center justify-between p-2 bg-white dark:bg-dark-800 rounded border border-gray-200 dark:border-dark-600">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{pdf.fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatFileSize(pdf.fileSize)}</span>
                    <span>•</span>
                    <span>{new Date(pdf.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  {pdf.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{pdf.description}</p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  {/* {onViewPDF && (
                    <button
                      onClick={() => onViewPDF(pdf.fileUrl, pdf.fileName)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
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
                    className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
            {activity.pdfFiles.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                +{activity.pdfFiles.length - 2} more PDF{activity.pdfFiles.length - 2 > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}
      
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
    </div>
  );
}