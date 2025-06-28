import React from 'react';
import { Search, Filter } from 'lucide-react';
import { AgeGroup, Level, Genre, PlayOrCraft, SearchFilters as SearchFiltersType } from '../types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  showGenre?: boolean;
  showLevel?: boolean;
  showPlayOrCraft?: boolean;
}

const ageGroups: AgeGroup[] = ['Young', 'Middle', 'Older'];
const levels: Level[] = ['Toe Tipper', 'Green Horn', 'Semi-Pro', 'Seasoned Veteran'];
const genres: Genre[] = ['comedy', 'drama', 'mystery', 'fantasy', 'historical', 'contemporary'];
const playOrCraftOptions: PlayOrCraft[] = ['More Playing Than Creating', 'A Balance of Playing and Creating', 'Let us Create And Craft'];

export function SearchFilters({ 
  filters, 
  onFiltersChange, 
  showGenre = false, 
  showLevel = false,
  showPlayOrCraft = false 
}: SearchFiltersProps) {
  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 mb-6 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
          />
        </div>

        {/* Age Group */}
        <select
          value={filters.ageGroup || ''}
          onChange={(e) => updateFilter('ageGroup', e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
        >
          <option value="">All Age Groups</option>
          {ageGroups.map(age => (
            <option key={age} value={age}>{age}</option>
          ))}
        </select>

        {/* Level */}
        {showLevel && (
          <select
            value={filters.skillLevel || ''}
            onChange={(e) => updateFilter('skillLevel', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        )}

        {/* Genre */}
        {showGenre && (
          <select
            value={filters.genre || ''}
            onChange={(e) => updateFilter('genre', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </option>
            ))}
          </select>
        )}

        {/* Play or Craft */}
        {showPlayOrCraft && (
          <select
            value={filters.playOrCraft || ''}
            onChange={(e) => updateFilter('playOrCraft', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white transition-colors duration-200"
          >
            <option value="">All Play or Craft Types</option>
            {playOrCraftOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}