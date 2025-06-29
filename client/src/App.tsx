import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import {
  Activity,
  BookOpen,
  Plus,
  AlertCircle,
  Layout,
  User,
  Users,
  BookMarked,
  Crown,
} from "lucide-react";

// Components
import { ActivityGrid } from './components/ActivityGrid';
import { ScriptGrid } from './components/ScriptGrid';
import { SearchFilters } from './components/SearchFilters';
import { CreateActivityModal } from './components/CreateActivityModal';
import { CreateScriptModal } from './components/CreateScriptModal';
import { LessonPreviewPanel } from './components/LessonPreviewPanel';
import { SaveLessonModal } from './components/SaveLessonModal';
import { SavedLessonsPanel } from './components/SavedLessonsPanel';
import { SavedLessonActivitiesModal } from './components/SavedLessonActivitiesModal';
import { PDFViewer } from './components/PDFViewer';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { EditProfileModal } from './components/EditProfileModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SubscriptionBanner } from './components/SubscriptionBanner';
import { UserManagementPanel } from './components/UserManagementPanel';
import { UserStatsPanel } from './components/UserStatsPanel';
import { CreateUserModal } from './components/CreateUserModal';
import { FilterSidebar } from './components/FilterSidebar';
import LandingPageWrapper from './components/LandingPageWrapper';
import { ActivityCard } from './components/ActivityCard';
import { ScriptCard } from './components/ScriptCard';

// Store
import { 
  activeTabAtom, 
  activitiesAtom, 
  scriptsAtom,
  activityFiltersAtom,
  scriptFiltersAtom,
  lessonFiltersAtom,
  userFiltersAtom,
  activitiesLoadingAtom,
  scriptsLoadingAtom,
  savedLessonsLoadingAtom,
  usersLoadingAtom,
  showCreateModalAtom, 
  showSaveLessonModalAtom,
  showUserModalAtom,
  selectedActivityAtom,
  selectedScriptAtom,
  selectedUserAtom,
  currentLessonPlanAtom,
  lessonGenerationStateAtom,
  savedLessonsAtom,
  usersAtom,
  userStatsAtom,
  sidebarCollapsedAtom,
  activityViewModeAtom,
  scriptViewModeAtom,
  filteredActivitiesAtom,
  lessonPlanningViewModeAtom,
  selectedPdfUrlAtom,
  pdfViewerOpenAtom,
  authStateAtom,
  showAuthModalAtom,
  authModeAtom,
} from './store/atoms';

// Services
import { ApiService } from './services/api';
import { AuthService } from './services/auth';
import { StripeService } from './services/stripe';
import GenerateLesson from './components/GenerateLesson';
import NewLesson from './components/NewLesson';

// Types
import {
  Activity as ActivityType,
  Script,
  SearchFilters as SearchFiltersType, 
  LessonFilters,
  SavedLesson,
  LoginCredentials,
  RegisterData,
  User as UserType,
} from "./types";

// Hooks
import { useTheme } from './hooks/useTheme';

function App() {0
  // Theme
  useTheme();

  // Atoms
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const [activities, setActivities] = useAtom(activitiesAtom);
  const [scripts, setScripts] = useAtom(scriptsAtom);
  const [activityFilters, setActivityFilters] = useAtom(activityFiltersAtom);
  const [scriptFilters, setScriptFilters] = useAtom(scriptFiltersAtom);
  const [lessonFilters, setLessonFilters] = useAtom(lessonFiltersAtom);
  const [userFilters, setUserFilters] = useAtom(userFiltersAtom);
  const [activitiesLoading, setActivitiesLoading] = useAtom(activitiesLoadingAtom);
  const [scriptsLoading, setScriptsLoading] = useAtom(scriptsLoadingAtom);
  const [savedLessonsLoading, setSavedLessonsLoading] = useAtom(savedLessonsLoadingAtom);
  const [usersLoading, setUsersLoading] = useAtom(usersLoadingAtom);
  const [showCreateModal, setShowCreateModal] = useAtom(showCreateModalAtom);
  const [showSaveLessonModal, setShowSaveLessonModal] = useAtom(showSaveLessonModalAtom);
  const [showUserModal, setShowUserModal] = useAtom(showUserModalAtom);
  const [selectedActivity, setSelectedActivity] = useAtom(selectedActivityAtom);
  const [selectedScript, setSelectedScript] = useAtom(selectedScriptAtom);
  const [selectedUser, setSelectedUser] = useAtom(selectedUserAtom);
  const [currentLessonPlan, setCurrentLessonPlan] = useAtom(currentLessonPlanAtom);
  const [lessonGenerationState, setLessonGenerationState] = useAtom(lessonGenerationStateAtom);
  const [savedLessons, setSavedLessons] = useAtom(savedLessonsAtom);
  const [users, setUsers] = useAtom(usersAtom);
  const [userStats, setUserStats] = useAtom(userStatsAtom);
  const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
  const [activityViewMode, setActivityViewMode] = useAtom(activityViewModeAtom);
  const [filteredActivities, setFilteredActivities] = useAtom(filteredActivitiesAtom);
  const [scriptViewMode, setScriptViewMode] = useAtom(scriptViewModeAtom);
  const [lessonPlanningViewMode, setLessonPlanningViewMode] = useAtom(lessonPlanningViewModeAtom);
  const [selectedPdfUrl, setSelectedPdfUrl] = useAtom(selectedPdfUrlAtom);
  const [pdfViewerOpen, setPdfViewerOpen] = useAtom(pdfViewerOpenAtom);
  const [authState, setAuthState] = useAtom(authStateAtom);
  const [showAuthModal, setShowAuthModal] = useAtom(showAuthModalAtom);
  const [authMode, setAuthMode] = useAtom(authModeAtom);
  
  const [editingActivity, setEditingActivity] = useState<ActivityType | undefined>();
  const [editingScript, setEditingScript] = useState<Script | undefined>();
  const [editingUser, setEditingUser] = useState<UserType | undefined>();
  const [error, setError] = useState<string>('');
  const [showSavedLessons, setShowSavedLessons] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [pdfViewerTitle, setPdfViewerTitle] = useState<string>('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedLessonForView, setSelectedLessonForView] = useState<SavedLesson | null>(null);
  const [showLessonActivitiesModal, setShowLessonActivitiesModal] = useState(false);
  const [lessonPlanCollapsed, setLessonPlanCollapsed] = useState(false);
  const [targetSection, setTargetSection] = useState<'warmUp' | 'main' | 'coolDown' | null>(null);

  // Initialize auth and demo users
  useEffect(() => {
    AuthService.initializeDemoUsers();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await AuthService.checkAuth();
      if (user) {
        // Load subscription data
        try {
          const subscription = await StripeService.getUserSubscription(user.id);
          setAuthState({
            user: { ...user, subscription: subscription || undefined },
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (err) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    } catch (err) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to check authentication status'
      });
    }
  };

  // Enhanced sample data with activity types and play or craft
  const enhancedActivities: ActivityType[] = [
    // {
    //   id: '1',
    //   title: 'Improvisation Games',
    //   description: 'Fun improv exercises to build confidence and creativity',
    //   ageGroup: 'Middle',
    //   skillLevel: 'Toe Tipper',
    //   duration: 30,
    //   materials: ['None required'],
    //   tags: ['improv', 'creativity', 'teamwork'],
    //   requiresScript: 'none',
    //   activityType: 'warm-up',
    //   playOrCraft: 'More Playing Than Creating',
    //   pdfFiles: [
    //     {
    //       id: 'pdf1',
    //       fileName: 'Improv_Exercises_Guide.pdf',
    //       fileUrl: 'https://example.com/improv-guide.pdf',
    //       fileSize: 2048576,
    //       uploadedAt: new Date('2024-01-01'),
    //       description: 'Complete guide to improvisation exercises'
    //     }
    //   ],
    //   createdAt: new Date('2024-01-01'),
    //   updatedAt: new Date('2024-01-01')
    // },
    // {
    //   id: '2',
    //   title: 'Scene Study Workshop',
    //   description: 'In-depth scene analysis and performance practice',
    //   ageGroup: 'Older',
    //   skillLevel: 'Semi-Pro',
    //   duration: 60,
    //   materials: ['Scripts', 'Chairs', 'Props'],
    //   tags: ['scene-study', 'analysis', 'performance'],
    //   requiresScript: 'required',
    //   scriptIds: ['1', '2'],
    //   activityType: 'main',
    //   playOrCraft: 'A Balance of Playing and Creating',
    //   pdfFiles: [
    //     {
    //       id: 'pdf2',
    //       fileName: 'Scene_Analysis_Worksheet.pdf',
    //       fileUrl: 'https://example.com/scene-analysis.pdf',
    //       fileSize: 1536000,
    //       uploadedAt: new Date('2024-01-02'),
    //       description: 'Worksheet for analyzing dramatic scenes'
    //     },
    //     {
    //       id: 'pdf3',
    //       fileName: 'Character_Development_Guide.pdf',
    //       fileUrl: 'https://example.com/character-dev.pdf',
    //       fileSize: 3072000,
    //       uploadedAt: new Date('2024-01-02'),
    //       description: 'Guide for developing complex characters'
    //     }
    //   ],
    //   createdAt: new Date('2024-01-02'),
    //   updatedAt: new Date('2024-01-02')
    // },
    // {
    //   id: '3',
    //   title: 'Breathing & Relaxation',
    //   description: 'Calming exercises to end the session peacefully',
    //   ageGroup: 'Young',
    //   skillLevel: 'Toe Tipper',
    //   duration: 15,
    //   materials: ['Yoga mats', 'Soft music'],
    //   tags: ['relaxation', 'mindfulness', 'breathing'],
    //   requiresScript: 'none',
    //   activityType: 'cool-down',
    //   playOrCraft: 'More Playing Than Creating',
    //   createdAt: new Date('2024-01-03'),
    //   updatedAt: new Date('2024-01-03')
    // },
    // {
    //   id: '4',
    //   title: 'Character Building Exercise',
    //   description: 'Develop unique characters through guided exercises',
    //   ageGroup: 'Middle',
    //   skillLevel: 'Green Horn',
    //   duration: 45,
    //   materials: ['Character sheets', 'Props box'],
    //   tags: ['character', 'development', 'creativity'],
    //   requiresScript: 'optional',
    //   scriptIds: ['1'],
    //   activityType: 'main',
    //   playOrCraft: 'Let us Create And Craft',
    //   createdAt: new Date('2024-01-04'),
    //   updatedAt: new Date('2024-01-04')
    // },
    // {
    //   id: '5',
    //   title: 'Energy Circle',
    //   description: 'High-energy warm-up to get everyone moving and engaged',
    //   ageGroup: 'Young',
    //   skillLevel: 'Toe Tipper',
    //   duration: 20,
    //   materials: ['Open space'],
    //   tags: ['energy', 'movement', 'group'],
    //   requiresScript: 'none',
    //   activityType: 'warm-up',
    //   playOrCraft: 'More Playing Than Creating',
    //   createdAt: new Date('2024-01-05'),
    //   updatedAt: new Date('2024-01-05')
    // },
    // {
    //   id: '6',
    //   title: 'Theatre Games Collection',
    //   description: 'Various fun games to build ensemble and trust',
    //   ageGroup: 'Young',
    //   skillLevel: 'Toe Tipper',
    //   duration: 35,
    //   materials: ['Props', 'Music player'],
    //   tags: ['games', 'ensemble', 'trust'],
    //   requiresScript: 'none',
    //   activityType: 'game',
    //   playOrCraft: 'A Balance of Playing and Creating',
    //   createdAt: new Date('2024-01-06'),
    //   updatedAt: new Date('2024-01-06')
    // }
  ];

  // Filter activities based on lesson filters
  const filterActivitiesForLesson = (activities: ActivityType[], filters: LessonFilters) => {
    return activities.filter(activity => {
      // Age group filter
      if (filters.ageGroup && activity.ageGroup !== filters.ageGroup) {
        return false;
      }

      // Skill levels filter
      if (filters.skillLevels.length > 0 && !filters.skillLevels.includes(activity.skillLevel)) {
        return false;
      }

      // Activity types filter
      if (filters.activityTypes.length > 0 && !filters.activityTypes.includes(activity.activityType)) {
        return false;
      }

      // Play or craft filter
      if (filters.playOrCraftTypes.length > 0 && !filters.playOrCraftTypes.includes(activity.playOrCraft)) {
        return false;
      }

      // Duration filter
      if (filters.duration && activity.duration > filters.duration) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          activity.title.toLowerCase().includes(searchLower) ||
          activity.description.toLowerCase().includes(searchLower) ||
          activity.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  };

  // Load activities
  const loadActivities = async () => {
    try {
      setActivitiesLoading(true);
      setError('');
      // For demo purposes, use enhanced sample data
      // setActivities(enhancedActivities);
      const data = await ApiService.getActivities(activityFilters);
      setActivities(data);
    } catch (err) {
      setError('Failed to load activities. Make sure the server is running.');
      console.error('Error loading activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Load scripts
  const loadScripts = async () => {
    try {
      setScriptsLoading(true);
      setError('');
      const data = await ApiService.getScripts(scriptFilters);
      setScripts(data);
    } catch (err) {
      setError('Failed to load scripts. Make sure the server is running.');
      console.error('Error loading scripts:', err);
    } finally {
      setScriptsLoading(false);
    }
  };

  const loadSavedLessons = async () => {
    try {
      setSavedLessonsLoading(true);
      const userId = authState.user?.id;
      const filters = userId ? { userId } : {};
      const data = (await ApiService.getSavedLessons(filters)) as any;
      setSavedLessons(data);
    } catch (err) {
      console.error('Error loading saved lessons:', err);
      setError('Failed to load saved lessons. Make sure the server is running.');
    } finally {
      setSavedLessonsLoading(false);
    }
  };

  // Load users (admin only)
  const loadUsers = async () => {
    if (authState.user?.role !== 'admin') return;
    
    try {
      setUsersLoading(true);
      const data = await AuthService.getAllUsers(userFilters);
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load user stats (admin only)
  const loadUserStats = async () => {
    if (authState.user?.role !== 'admin') return;
    
    try {
      const stats = await AuthService.getUserStats();
      setUserStats(stats);
    } catch (err) {
      console.error('Error loading user stats:', err);
    }
  };

  // Load data on mount and filter changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      loadActivities();
    }
  }, [activityFilters, authState.isAuthenticated]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadScripts();
    }
  }, [scriptFilters, authState.isAuthenticated]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadSavedLessons();
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.role === 'admin') {
      loadUsers();
      loadUserStats();
    }
  }, [userFilters, authState.isAuthenticated, authState.user?.role]);

  // Filter activities for lesson planning
  useEffect(() => {
    const filtered = filterActivitiesForLesson(activities, lessonFilters);
    setFilteredActivities(filtered);
  }, [activities, lessonFilters]);

  // Authentication handlers
  const handleSignIn = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user } = await AuthService.signIn(credentials);
      
      // Load subscription data
      try {
        const subscription = await StripeService.getUserSubscription(user.id);
        setAuthState({
          user: { ...user, subscription: subscription || undefined },
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (err) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }
      
      setShowAuthModal(false);
    } catch (err) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Sign in failed'
      }));
    }
  };

  const handleSignUp = async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user } = await AuthService.signUp(data);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      setShowAuthModal(false);
    } catch (err) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Sign up failed'
      }));
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      // Reset app state
      setActivities([]);
      setScripts([]);
      setSavedLessons([]);
      setUsers([]);
      setCurrentLessonPlan({
        warmUp: null,
        mainActivities: [],
        coolDown: null,
        totalDuration: 0,
        estimatedTime: '0 min'
      });
      setActiveTab('lessons');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserType>) => {
    if (!authState.user) return;
    
    try {
      const updatedUser = await AuthService.updateProfile(authState.user.id, updates);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    } catch (err) {
      setError('Failed to update profile');
      console.error('Profile update error:', err);
    }
  };

  // Subscription handlers
  const handleSubscriptionUpdate = async (subscription: any) => {
    if (!authState.user) return;
    
    try {
      // Get the latest subscription data from the server
      const updatedSubscription = await StripeService.getUserSubscription(authState.user.id);
      
      // Update the auth state with the latest subscription data
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user!, subscription: updatedSubscription || undefined }
      }));
    } catch (err) {
      console.error('Subscription update error:', err);
    }
  };

  // Convert lesson filters to search filters format for SearchFilters component
  const lessonSearchFilters: SearchFiltersType = {
    ageGroup: lessonFilters.ageGroup,
    search: lessonFilters.search,
    skillLevel: lessonFilters.skillLevels[0], // Take first skill level for compatibility
    activityType: lessonFilters.activityTypes[0], // Take first activity type for compatibility
    playOrCraft: lessonFilters.playOrCraftTypes[0] // Take first play/craft type for compatibility
  };

  const handleLessonFiltersChange = (filters: SearchFiltersType) => {
    setLessonFilters({
      ageGroup: filters.ageGroup,
      search: filters.search || '',
      skillLevels: filters.skillLevel ? [filters.skillLevel] : [],
      activityTypes: filters.activityType ? [filters.activityType] : [],
      playOrCraftTypes: filters.playOrCraft ? [filters.playOrCraft] : [],
      duration: lessonFilters.duration
    });
  };

  // Activity handlers
  const handleCreateActivity = async (activityData: Omit<ActivityType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingActivity) {
        await ApiService.updateActivity(editingActivity.id, activityData);
      } else {
        await ApiService.createActivity(activityData);
      }
      loadActivities();
      setEditingActivity(undefined);
    } catch (err) {
      setError('Failed to save activity');
      console.error('Error saving activity:', err);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    console.log('handleDeleteActivity called with id:', id);
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        console.log('Calling ApiService.deleteActivity...');
        await ApiService.deleteActivity(id);
        console.log('Activity deleted successfully, reloading activities...');
        loadActivities();
      } catch (err) {
        console.error('Error in handleDeleteActivity:', err);
        setError('Failed to delete activity');
        console.error('Error deleting activity:', err);
      }
    } else {
      console.log('Delete cancelled by user');
    }
  };

  // Script handlers
  const handleCreateScript = async (scriptData: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingScript) {
        await ApiService.updateScript(editingScript.id, scriptData);
      } else {
        await ApiService.createScript(scriptData);
      }
      loadScripts();
      setEditingScript(undefined);
    } catch (err) {
      setError('Failed to save script');
      console.error('Error saving script:', err);
    }
  };

  const handleDeleteScript = async (id: string) => {
    if (confirm('Are you sure you want to delete this script?')) {
      try {
        await ApiService.deleteScript(id);
        loadScripts();
      } catch (err) {
        setError('Failed to delete script');
        console.error('Error deleting script:', err);
      }
    }
  };

  const handleUploadScript = async (id: string, file: File) => {
    try {
      await ApiService.uploadScriptFile(id, file);
      loadScripts();
    } catch (err) {
      setError('Failed to upload file');
      console.error('Error uploading file:', err);
    }
  };

  // User management handlers (admin only)
  const handleCreateUser = async (userData: Omit<UserType, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>) => {
    try {
      if (editingUser) {
        await AuthService.updateUser(editingUser.id, userData);
      } else {
        await AuthService.createUser(userData);
      }
      loadUsers();
      loadUserStats();
      setEditingUser(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
      console.error('Error saving user:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await AuthService.deleteUser(userId);
        loadUsers();
        loadUserStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await AuthService.toggleUserStatus(userId);
      loadUsers();
      loadUserStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
      console.error('Error toggling user status:', err);
    }
  };

  // Lesson planning handlers
  const handleSelectActivity = (activity: ActivityType) => {
    // const { activityType } = activity;
    
    // setCurrentLessonPlan(prev => {
    //   let newPlan = { ...prev };
      
    //   if (activityType === 'warm-up') {
    //     newPlan.warmUp = activity;
    //   } else if (activityType === 'cool-down') {
    //     newPlan.coolDown = activity;
    //   } else {
    //     // Add to main activities if not already present
    //     if (!newPlan.mainActivities.find(a => a.id === activity.id)) {
    //       newPlan.mainActivities = [...newPlan.mainActivities, activity];
    //     }
    //   }
      
    //   // Recalculate total duration
    //   const warmUpDuration = newPlan.warmUp?.duration || 0;
    //   const mainDuration = newPlan.mainActivities.reduce((sum, a) => sum + a.duration, 0);
    //   const coolDownDuration = newPlan.coolDown?.duration || 0;
    //   newPlan.totalDuration = warmUpDuration + mainDuration + coolDownDuration;
      
    //   return newPlan;
    // });
    setCurrentLessonPlan(prev => {
      const newPlan = { ...prev };
      
      // Check if activity is already selected
      const isAlreadySelected = 
        newPlan.warmUp?.id === activity.id ||
        newPlan.mainActivities.some(a => a.id === activity.id) ||
        newPlan.coolDown?.id === activity.id;
      
      if (isAlreadySelected) {
        return prev; // Don't add if already selected
      }
      
      // If a target section is set, add to that specific section
      if (targetSection) {
        if (targetSection === 'warmUp') {
          newPlan.warmUp = activity;
        } else if (targetSection === 'coolDown') {
          newPlan.coolDown = activity;
        } else if (targetSection === 'main') {
          newPlan.mainActivities = [...newPlan.mainActivities, activity];
        }
        
        // Clear the target section after adding
        setTargetSection(null);
      } else {
        // For manual selection without target, add to main activities by default
        newPlan.mainActivities = [...newPlan.mainActivities, activity];
      }
      
      // Update total duration
      newPlan.totalDuration = 
        (newPlan.warmUp?.duration || 0) +
        newPlan.mainActivities.reduce((sum, a) => sum + a.duration, 0) +
        (newPlan.coolDown?.duration || 0);
      
      newPlan.estimatedTime = `${newPlan.totalDuration} min`;
      
      return newPlan;
    });
  };

  const handleAddActivity = (type: 'warmUp' | 'main' | 'coolDown') => {
    // Set the target section for the next activity selection
    setTargetSection(type);
    
    // Show visual feedback that we're in selection mode
    console.log(`Ready to add activity to ${type} section. Click an activity to add it.`);
  };

  const handleRemoveActivity = (type: 'warmUp' | 'main' | 'coolDown', index?: number) => {
    setCurrentLessonPlan(prev => {
      const newPlan = { ...prev };
      
      if (type === 'warmUp') {
        newPlan.warmUp = null;
      } else if (type === 'coolDown') {
        newPlan.coolDown = null;
      } else if (type === 'main' && index !== undefined) {
        newPlan.mainActivities = newPlan.mainActivities.filter((_, i) => i !== index);
      }
      
      // Update total duration
      newPlan.totalDuration = 
        (newPlan.warmUp?.duration || 0) +
        newPlan.mainActivities.reduce((sum, a) => sum + a.duration, 0) +
        (newPlan.coolDown?.duration || 0);
      
      newPlan.estimatedTime = `${newPlan.totalDuration} min`;
      
      return newPlan;
    });
  };

  const handleAddActivityToLesson = (type: 'warmUp' | 'main' | 'coolDown') => {
    // Set the target section for the next activity selection
    setTargetSection(type);
    // This would typically open a modal or sidebar to select activities
    // For now, we'll just show a message
    console.log(`Add ${type} activity`);
  };

  const handleRemoveActivityFromLesson = (type: 'warmUp' | 'main' | 'coolDown', index?: number) => {
    setCurrentLessonPlan(prev => {
      let newPlan = { ...prev };
      
      if (type === 'warmUp') {
        newPlan.warmUp = null;
      } else if (type === 'coolDown') {
        newPlan.coolDown = null;
      } else if (type === 'main' && typeof index === 'number') {
        newPlan.mainActivities = newPlan.mainActivities.filter((_, i) => i !== index);
      }
      
      // Recalculate total duration
      const warmUpDuration = newPlan.warmUp?.duration || 0;
      const mainDuration = newPlan.mainActivities.reduce((sum, a) => sum + a.duration, 0);
      const coolDownDuration = newPlan.coolDown?.duration || 0;
      newPlan.totalDuration = warmUpDuration + mainDuration + coolDownDuration;
      
      return newPlan;
    });
  };

  const handleGenerateLesson = async () => {
    if (!authState.user) {
      setShowAuthModal(true);
      return;
    }

    // Check subscription access
    try {
      const accessCheck = await StripeService.checkSubscriptionAccess(authState.user.id);

      console.log("aaaaa", accessCheck);
      
      if (!accessCheck.canGenerate) {
        if (!authState.user.subscription) {
          setShowSubscriptionModal(true);
          return;
        }
        
        if (accessCheck.reason === 'Lesson limit reached') {
          setShowSubscriptionModal(true);
          return;
        }
        
        setError(accessCheck.reason || 'Cannot generate lesson at this time');
        return;
      }
    } catch (err) {
      setError('Failed to check subscription status');
      return;
    }

    setLessonGenerationState('generating');
    
    try {
      // Increment lesson count
      await StripeService.incrementLessonCount(authState.user.id);
      
      // Update user subscription in state
      const updatedSubscription = await StripeService.getUserSubscription(authState.user.id);
      if (updatedSubscription) {
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, subscription: updatedSubscription || undefined } : null
        }));
      }

      // Simulate lesson generation
      setTimeout(() => {
        const availableActivities = filteredActivities;
        const warmUps = availableActivities.filter(a => a.activityType === 'warm-up');
        const mains = availableActivities.filter(a => a.activityType === 'main' || a.activityType === 'game');
        const coolDowns = availableActivities.filter(a => a.activityType === 'cool-down');
        
        const selectedWarmUp = warmUps[Math.floor(Math.random() * warmUps.length)];
        const selectedMain = mains.slice(0, 2); // Select 2 main activities
        const selectedCoolDown = coolDowns[Math.floor(Math.random() * coolDowns.length)];
        
        const totalDuration = (selectedWarmUp?.duration || 0) + 
                             selectedMain.reduce((sum, a) => sum + a.duration, 0) + 
                             (selectedCoolDown?.duration || 0);
        
        setCurrentLessonPlan({
          warmUp: selectedWarmUp || null,
          mainActivities: selectedMain,
          coolDown: selectedCoolDown || null,
          totalDuration,
          estimatedTime: `${totalDuration} min`
        });
        
        setLessonGenerationState('complete');
      }, 2000);
    } catch (err) {
      console.error('Error generating lesson:', err);
      setError('Failed to generate lesson. Please try again.');
      setLessonGenerationState('idle');
    }
  };

  const handleSaveLesson = async (lessonData: Omit<SavedLesson, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!authState.user) {
        setError('You must be logged in to save lessons');
        return;
      }

      const lessonWithUser = {
        ...lessonData,
        createdBy: authState.user.id
      };

      // Check subscription access
      try {
        const accessCheck = await StripeService.checkSubscriptionAccess(authState.user.id);
        
        if (!accessCheck.canGenerate) {
          if (!authState.user.subscription) {
            setShowSubscriptionModal(true);
            return;
          }
          
          if (accessCheck.reason === 'Lesson limit reached') {
            setShowSubscriptionModal(true);
            return;
          }
          
          setError(accessCheck.reason || 'Cannot generate lesson at this time');
          return;
        }
      } catch (err) {
        setError('Failed to check subscription status');
        return;
      }

      try {
        // Increment lesson count
        await StripeService.incrementLessonCount(authState.user.id);
        
        // Update user subscription in state
        const updatedSubscription = await StripeService.getUserSubscription(authState.user.id);
        if (updatedSubscription) {
          setAuthState(prev => ({
            ...prev,
            user: prev.user ? { ...prev.user, subscription: updatedSubscription || undefined } : null
          }));
        }

        await ApiService.saveLesson(lessonWithUser);
        loadSavedLessons();
        setShowSaveLessonModal(false);
        setError(''); // Clear any previous errors
        setShowSavedLessons(true);
      } catch (err) {
        console.error('Error generating lesson:', err);
        setError('Failed to generate lesson. Please try again.');
      }
    } catch (err) {
      setError('Failed to save lesson');
      console.error('Error saving lesson:', err);
    }
  };

  const handleLoadLesson = (lesson: SavedLesson) => {
    // Find activities by IDs
    const warmUp = lesson.warmUpId ? activities.find(a => a.id === lesson.warmUpId) || null : null;
    const mainActivities = lesson.mainActivityIds.map(id => activities.find(a => a.id === id)).filter(Boolean) as ActivityType[];
    const coolDown = lesson.coolDownId ? activities.find(a => a.id === lesson.coolDownId) || null : null;

    setCurrentLessonPlan({
      warmUp,
      mainActivities,
      coolDown,
      totalDuration: lesson.totalDuration,
      estimatedTime: `${lesson.totalDuration} min`
    });

    setShowSavedLessons(false);
  };

  const handleDeleteLesson = async (id: string) => {
    if (confirm('Are you sure you want to delete this saved lesson?')) {
      try {
        // const userId = authState.user?.id;
        // await ApiService.deleteLesson(id, userId);
        await ApiService.deleteLesson(id);
        loadSavedLessons();
      } catch (err) {
        setError('Failed to delete lesson');
        console.error('Error deleting lesson:', err);
      }
    }
  };

  const handleViewLesson = (lesson: SavedLesson) => {
    setSelectedLessonForView(lesson);
    setShowLessonActivitiesModal(true);
  };

  const handleViewScript = (scriptUrl: string) => {
    setSelectedPdfUrl(scriptUrl);
    setPdfViewerTitle('Script Preview');
    setPdfViewerOpen(true);
  };

  const handleViewPDF = (pdfUrl: string, fileName: string) => {
    setSelectedPdfUrl(pdfUrl);
    setPdfViewerTitle(fileName);
    setPdfViewerOpen(true);
  };

  const getCurrentActivities = () => {
    const allSelected = [];
    if (currentLessonPlan.warmUp) allSelected.push(currentLessonPlan.warmUp);
    allSelected.push(...currentLessonPlan.mainActivities);
    if (currentLessonPlan.coolDown) allSelected.push(currentLessonPlan.coolDown);
    return allSelected;
  };

  // Show loading screen while checking auth
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">JulietLessons</h2>
          <p className="text-gray-600 dark:text-gray-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!authState.isAuthenticated) {
    return <LandingPageWrapper />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700 flex-shrink-0 transition-colors duration-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">JulietLessons EDITED BY JAMES</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lesson planning and activity management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">              
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setEditingActivity(undefined);
                  setEditingScript(undefined);
                  setEditingUser(undefined);
                }}
                className={`flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg ${
                  activeTab === 'activities' || activeTab === 'scripts' || activeTab === 'users' ? '' : 'hidden'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span>Add {
                  activeTab === 'activities' ? 'Activity' : 
                  activeTab === 'scripts' ? 'Script' : 
                  activeTab === 'users' ? 'User' : 
                  'Activity'
                }</span>
              </button>
              
              <ThemeToggle />

              <UserMenu
                user={authState.user!}
                onSignOut={handleSignOut}
                onEditProfile={() => setShowEditProfile(true)}
              />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200 dark:border-dark-700">


            <button
              onClick={() => setActiveTab('generate')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'generate'
                  ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>Generate Lesson</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('newLesson')}
              className={activeTab === 'newLesson'
                ? 'pb-4 px-1 border-b-2 border-blue-500 text-blue-600'
                : 'pb-4 px-1 border-b-2 border-transparent text-gray-500 hover:border-gray-300'}
            >
              <Plus className="w-4 h-4" /> 
              <span>New Lesson</span>
            </button>

            <button
              onClick={() => setActiveTab('lessons')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'lessons'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Layout className="w-4 h-4" />
                <span>Lesson Planning</span>
              </div>
            </button>
            {authState.user?.role === 'admin' && (<button
              onClick={() => setActiveTab('activities')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Activities ({activities.length})</span>
              </div>
            </button>)}
            {authState.user?.role === 'admin' && (<button
              onClick={() => setActiveTab('scripts')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'scripts'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Scripts ({scripts.length})</span>
              </div>
            </button>)}
            {authState.user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Users ({users.length})</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Target Section Indicator */}
      {targetSection && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-blue-800 dark:text-blue-300 font-medium">
                Ready to add activity to {targetSection === 'warmUp' ? 'Warm-up' : targetSection === 'coolDown' ? 'Cool-down' : 'Main Activities'} section
              </span>
              <span className="text-blue-600 dark:text-blue-400 text-sm">
                Click an activity below to add it to this section
              </span>
            </div>
            <button
              onClick={() => setTargetSection(null)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'generate' && (
          <GenerateLesson
            onGenerate={handleGenerateLesson}
            lessonGenerationState={lessonGenerationState}
            onSwitch={setActiveTab}
          />
        )}

        {activeTab === 'newLesson' && (
          <div className="flex-1 overflow-y-auto p-6">
            <NewLesson
              onSwitch={setActiveTab}
            />
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="flex-1 flex">
              {/* Lesson Plan Sidebar */}
              <LessonPreviewPanel
                lessonPlan={currentLessonPlan}
                onAddActivity={handleAddActivityToLesson}
                onRemoveActivity={handleRemoveActivityFromLesson}
                onViewScript={handleViewScript}
                onGenerateLesson={handleGenerateLesson}
                onSaveLesson={() => setShowSaveLessonModal(true)}
                onShowSavedLessons={() => setShowSavedLessons(!showSavedLessons)}
                isGenerating={lessonGenerationState === 'generating'}
                showSavedLessons={showSavedLessons}
                isCollapsed={lessonPlanCollapsed}
                onToggleCollapse={() => setLessonPlanCollapsed(!lessonPlanCollapsed)}
                targetSection={targetSection}
              />
              
              <main className="flex-1 overflow-y-auto p-6">
                {/* Subscription Banner */}
                <SubscriptionBanner
                  subscription={authState.user?.subscription || null}
                  onUpgrade={() => setShowSubscriptionModal(true)}
                />

                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                      <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {showSavedLessons ? (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Saved Lessons</h2>
                      <p className="text-gray-600 dark:text-gray-400">Load a previously saved lesson plan</p>
                    </div>
                    <SavedLessonsPanel
                      savedLessons={savedLessons}
                      onLoadLesson={handleLoadLesson}
                      onDeleteLesson={handleDeleteLesson}
                      onViewLesson={handleViewLesson}
                      loading={savedLessonsLoading}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Available Activities</h2>
                      <p className="text-gray-600 dark:text-gray-400">Select activities to build your lesson plan</p>
                    </div>

                    {/* Filters */}
                    <SearchFilters
                      filters={lessonSearchFilters}
                      onFiltersChange={handleLessonFiltersChange}
                      showLevel={true}
                      showPlayOrCraft={true}
                    />

                    <ActivityGrid
                      activities={filteredActivities}
                      onSelectActivity={handleSelectActivity}
                      selectedActivities={getCurrentActivities()}
                      loading={activitiesLoading}
                      scripts={scripts}
                      onViewPDF={handleViewPDF}
                      onViewScript={handleViewScript}
                      viewMode={lessonPlanningViewMode}
                      onViewModeChange={setLessonPlanningViewMode}
                      showViewToggle={true}
                      isLessonPlanning={true}
                      onDelete={handleDeleteActivity}
                      targetSection={targetSection}
                    />
                  </div>
                )}
              </main>

              {/* <LessonPreviewPanel
                lessonPlan={currentLessonPlan}
                onAddActivity={handleAddActivityToLesson}
                onRemoveActivity={handleRemoveActivityFromLesson}
                onViewScript={handleViewScript}
                onGenerateLesson={handleGenerateLesson}
                onSaveLesson={() => setShowSaveLessonModal(true)}
                onShowSavedLessons={() => setShowSavedLessons(!showSavedLessons)}
                isGenerating={lessonGenerationState === 'generating'}
                showSavedLessons={showSavedLessons}
              /> */}
            {/* </> */}
          </div>
        )}

        {activeTab === 'activities' && authState.user?.role === 'admin' && (
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            <SearchFilters
              filters={activityFilters}
              onFiltersChange={setActivityFilters}
              showLevel={true}
              showPlayOrCraft={true}
            />
            
            {activitiesLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading activities...</p>
              </div>
            ) : (
              <ActivityGrid
                activities={activities}
                onSelectActivity={() => {}} // Not used in activities tab
                selectedActivities={[]}
                loading={activitiesLoading}
                scripts={scripts}
                onViewPDF={handleViewPDF}
                onViewScript={handleViewScript}
                viewMode={activityViewMode}
                onViewModeChange={setActivityViewMode}
                showViewToggle={true}
                isLessonPlanning={false}
                onDelete={handleDeleteActivity}
              />
            )}

            {!activitiesLoading && activities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activities found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first activity.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Activity
                </button>
              </div>
            )}
          </main>
        )}

        {activeTab === 'scripts' && authState.user?.role === 'admin' && (
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
            <SearchFilters
              filters={scriptFilters}
              onFiltersChange={setScriptFilters}
              showGenre={true}
            />

            <ScriptGrid
              scripts={scripts}
              // onEdit={({}:Script)=>{}}
              onDelete={handleDeleteScript}
              onUpload={handleUploadScript}
              loading={scriptsLoading}
              viewMode={scriptViewMode}
              onViewModeChange={setScriptViewMode}
              showViewToggle={true}
            />
            
            {/* {scriptsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading scripts...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scripts.map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    onEdit={(script) => {
                      setEditingScript(script);
                      setShowCreateModal(true);
                    }}
                    onDelete={handleDeleteScript}
                    onUpload={handleUploadScript}
                  />
                ))}
              </div>
            )}

            {!scriptsLoading && scripts.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scripts found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first script.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Create Script
                </button>
              </div>
            )} */}
          </main>
        )}

        {activeTab === 'users' && authState.user?.role === 'admin' && (
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            <UserStatsPanel stats={userStats} loading={usersLoading} />
            
            <UserManagementPanel
              users={users}
              filters={userFilters}
              onFiltersChange={setUserFilters}
              onCreateUser={() => {
                setEditingUser(undefined);
                setShowUserModal(true);
              }}
              onEditUser={(user) => {
                setEditingUser(user);
                setShowUserModal(true);
              }}
              onDeleteUser={handleDeleteUser}
              onToggleUserStatus={handleToggleUserStatus}
              loading={usersLoading}
            />
          </main>
        )}
      </div>

      {/* Modals */}
      {activeTab === 'activities' && (
        <CreateActivityModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingActivity(undefined);
          }}
          onCreate={handleCreateActivity}
          editActivity={editingActivity}
          onViewPDF={handleViewPDF}
        />
      )}

      {activeTab === 'scripts' && (
        <CreateScriptModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingScript(undefined);
          }}
          onCreate={handleCreateScript}
          editScript={editingScript}
        />
      )}

      {activeTab === 'users' && authState.user?.role === 'admin' && (
        <CreateUserModal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(undefined);
          }}
          onCreate={handleCreateUser}
          editUser={editingUser}
          loading={false}
        />
      )}

      <SaveLessonModal
        isOpen={showSaveLessonModal}
        onClose={() => setShowSaveLessonModal(false)}
        onSave={handleSaveLesson}
        lessonPlan={currentLessonPlan}
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={authState.user!}
        onSave={handleUpdateProfile}
        loading={false}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        currentSubscription={authState.user?.subscription}
        onSubscriptionUpdate={handleSubscriptionUpdate}
        userId={authState.user?.id || ''}
      />

      {/* Saved Lesson Activities Modal */}
      <SavedLessonActivitiesModal
        isOpen={showLessonActivitiesModal}
        onClose={() => {
          setShowLessonActivitiesModal(false);
          setSelectedLessonForView(null);
        }}
        lesson={selectedLessonForView}
        activities={activities}
        scripts={scripts}
        onViewPDF={handleViewPDF}
        onViewScript={handleViewScript}
        onLoadLesson={handleLoadLesson}
      />

      {/* PDF Viewer */}
      <PDFViewer
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        pdfUrl={selectedPdfUrl}
        title={pdfViewerTitle}
      />
    </div>
  );
}

export default App;