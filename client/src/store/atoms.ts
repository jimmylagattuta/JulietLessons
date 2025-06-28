import { atom } from 'jotai';
import { Activity, Script, SearchFilters, LessonFilters, LessonPlan, SavedLesson, AuthState, User, UserFilters, UserStats } from '../types';

// Theme atom
export const themeAtom = atom<'light' | 'dark'>('light');

// Search filters atoms
export const activityFiltersAtom = atom<SearchFilters>({});
export const scriptFiltersAtom = atom<SearchFilters>({});
export const lessonFiltersAtom = atom<LessonFilters>({
  skillLevels: [],
  activityTypes: [],
  playOrCraftTypes: [],
  search: ''
});
export const userFiltersAtom = atom<UserFilters>({});

// Data atoms
export const activitiesAtom = atom<Activity[]>([]);
export const scriptsAtom = atom<Script[]>([]);
export const filteredActivitiesAtom = atom<Activity[]>([]);
export const savedLessonsAtom = atom<SavedLesson[]>([]);
export const usersAtom = atom<User[]>([]);
export const userStatsAtom = atom<UserStats>({
  totalUsers: 0,
  activeUsers: 0,
  teacherCount: 0,
  adminCount: 0,
  studentCount: 0,
  newUsersThisMonth: 0,
  subscribedUsers: 0,
  totalRevenue: 0
});

// Loading states
export const activitiesLoadingAtom = atom(false);
export const scriptsLoadingAtom = atom(false);
export const savedLessonsLoadingAtom = atom(false);
export const usersLoadingAtom = atom(false);

// Selected items
export const selectedActivityAtom = atom<Activity | null>(null);
export const selectedScriptAtom = atom<Script | null>(null);
export const selectedUserAtom = atom<User | null>(null);

// UI state
export const activeTabAtom = atom<'generate' | 'activities' | 'scripts' | 'lessons' | 'users'>('generate');
export const showCreateModalAtom = atom(false);
export const showSaveLessonModalAtom = atom(false);
export const showUserModalAtom = atom(false);
export const sidebarCollapsedAtom = atom(false);

// View options
export const activityViewModeAtom = atom<'card' | 'line'>('card');
export const scriptViewModeAtom = atom<'card' | 'line'>('card');
export const lessonPlanningViewModeAtom = atom<'card' | 'line'>('card');

// Lesson planning atoms
export const currentLessonPlanAtom = atom<LessonPlan>({
  warmUp: null,
  mainActivities: [],
  coolDown: null,
  totalDuration: 0,
  estimatedTime: '0 min'
});

export const lessonGenerationStateAtom = atom<'idle' | 'generating' | 'complete'>('idle');
export const selectedPdfUrlAtom = atom<string | null>(null);
export const pdfViewerOpenAtom = atom(false);

// Authentication atoms
export const authStateAtom = atom<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
});

export const showAuthModalAtom = atom(false);
export const authModeAtom = atom<'signin' | 'signup'>('signin');