import React, { useState } from 'react';
import { LayoutGrid, List, Tag } from 'lucide-react';
import { Script } from '../types';
import { ScriptCard } from './ScriptCard';
import { ScriptLineView } from './ScriptLineView';

interface ScriptGridProps {
  scripts: Script[];
  onEdit?: (script: Script) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string, file: File) => void;
  loading: boolean;
  viewMode?: 'card' | 'line';
  onViewModeChange?: (mode: 'card' | 'line') => void;
  showViewToggle?: boolean;
}

export function ScriptGrid({ 
  scripts, 
  onEdit, 
  onDelete, 
  onUpload,
  loading,
  viewMode = 'card',
  onViewModeChange,
  showViewToggle = false
}: ScriptGridProps) {
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
          <ScriptLineView
            scripts={[]}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpload={onUpload}
            loading={true}
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

  if (scripts.length === 0) {
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scripts found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters to see more scripts.</p>
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
        <ScriptLineView
          scripts={scripts}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpload={onUpload}
          loading={false}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpload={onUpload}
            />
          ))}
        </div>
      )}
    </div>
  );
}