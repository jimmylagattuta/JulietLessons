import React from 'react';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { LessonFilters, AgeGroup, Level, ActivityType, PlayOrCraft } from '../types';

interface FilterSidebarProps {
  filters: LessonFilters;
  onFiltersChange: (filters: LessonFilters) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ageGroups: AgeGroup[] = ['Young', 'Middle', 'Older'];
const levels: Level[] = ['Toe Tipper', 'Green Horn', 'Semi-Pro', 'Seasoned Veteran'];
const activityTypes: ActivityType[] = ['warm-up', 'main', 'cool-down', 'game', 'exercise'];
const playOrCraftOptions: PlayOrCraft[] = ['More Playing Than Creating', 'A Balance of Playing and Creating', 'Let us Create And Craft'];

export function FilterSidebar({ filters, onFiltersChange, isCollapsed, onToggleCollapse }: FilterSidebarProps) {
  const updateFilter = <K extends keyof LessonFilters>(key: K, value: LessonFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleLevel = (level: Level) => {
    const newLevels = filters.skillLevels.includes(level)
      ? filters.skillLevels.filter(s => s !== level)
      : [...filters.skillLevels, level];
    updateFilter('skillLevels', newLevels);
  };

  const toggleActivityType = (type: ActivityType) => {
    const newTypes = filters.activityTypes.includes(type)
      ? filters.activityTypes.filter(t => t !== type)
      : [...filters.activityTypes, type];
    updateFilter('activityTypes', newTypes);
  };

  const togglePlayOrCraft = (option: PlayOrCraft) => {
    const newOptions = filters.playOrCraftTypes.includes(option)
      ? filters.playOrCraftTypes.filter(o => o !== option)
      : [...filters.playOrCraftTypes, option];
    updateFilter('playOrCraftTypes', newOptions);
  };

  const getActivityTypeIcon = (type: ActivityType) => {
    const icons = {
      'warm-up': '🔥',
      'main': '🎭',
      'cool-down': '🧘',
      'game': '🎮',
      'exercise': '💪'
    };
    return icons[type] || '📝';
  };

  const getLevelColor = (level: Level) => {
    const colors = {
      'Toe Tipper': 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800',
      'Green Horn': 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-800',
      'Semi-Pro': 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-800',
      'Seasoned Veteran': 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800'
    };
    return colors[level];
  };

  const getPlayOrCraftIcon = (option: PlayOrCraft) => {
    const icons = {
      'More Playing Than Creating': '🎮',
      'A Balance of Playing and Creating': '⚖️',
      'Let us Create And Craft': '🎨'
    };
    return icons[option] || '🎭';
  };

  const getPlayOrCraftColor = (option: PlayOrCraft) => {
    const colors = {
      'More Playing Than Creating': 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800',
      'A Balance of Playing and Creating': 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800',
      'Let us Create And Craft': 'text-pink-600 bg-pink-50 border-pink-200 dark:text-pink-400 dark:bg-pink-900/30 dark:border-pink-800'
    };
    return colors[option];
  };

  return (
    <div className={`bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    } flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h2>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Activities
            </label>
            <input
              type="text"
              placeholder="Search by title, description, or tags..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
            />
          </div>

          {/* Age Group Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age Group
            </label>
            <select
              value={filters.ageGroup || ''}
              onChange={(e) => updateFilter('ageGroup', e.target.value as AgeGroup || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="">All Ages</option>
              {ageGroups.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>

          {/* Level Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Levels
            </label>
            <div className="space-y-2">
              {levels.map(level => (
                <label key={level} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.skillLevels.includes(level)}
                    onChange={() => toggleLevel(level)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 bg-white dark:bg-dark-700 transition-colors duration-200"
                  />
                  <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium border transition-colors group-hover:shadow-sm ${
                    getLevelColor(level)
                  }`}>
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Activity Type Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Activity Types
            </label>
            <div className="space-y-2">
              {activityTypes.map(type => (
                <label key={type} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.activityTypes.includes(type)}
                    onChange={() => toggleActivityType(type)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 bg-white dark:bg-dark-700 transition-colors duration-200"
                  />
                  <span className="ml-3 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-dark-600 transition-colors">
                    <span className="text-lg">{getActivityTypeIcon(type)}</span>
                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Play or Craft Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Play or Craft
            </label>
            <div className="space-y-2">
              {playOrCraftOptions.map(option => (
                <label key={option} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.playOrCraftTypes.includes(option)}
                    onChange={() => togglePlayOrCraft(option)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 bg-white dark:bg-dark-700 transition-colors duration-200"
                  />
                  <span className={`ml-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors group-hover:shadow-sm ${
                    getPlayOrCraftColor(option)
                  }`}>
                    <span className="text-lg">{getPlayOrCraftIcon(option)}</span>
                    <span className="text-xs">{option}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Duration (minutes)
            </label>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={filters.duration || 60}
              onChange={(e) => updateFilter('duration', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>5 min</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{filters.duration || 60} min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => onFiltersChange({
              skillLevels: [],
              activityTypes: [],
              playOrCraftTypes: [],
              search: ''
            })}
            className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-colors border border-gray-200 dark:border-dark-600"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}