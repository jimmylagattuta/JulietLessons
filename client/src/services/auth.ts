import { User, LoginCredentials, RegisterData, UserStats, UserFilters } from '../types';
import { StripeService } from './stripe';

// const API_URL = 'http://52.15.159.45:3001/api'  // Production
const API_URL = 'https://5872-35-78-107-144.ngrok-free.app/api'  // Production
// const API_URL = 'http://localhost:3001/api';

 export class AuthService {
  // Get stored auth data
  private static getStoredAuth() {
    try {
      const stored = localStorage.getItem('activityhub_auth');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Store auth data
  private static setStoredAuth(data: any) {
    localStorage.setItem('activityhub_auth', JSON.stringify(data));
  }

  // Clear auth data
  private static clearStoredAuth() {
    localStorage.removeItem('activityhub_auth');
  }

  // Get stored users (for demo purposes)
  private static getStoredUsers(): User[] {
    try {
      const users = localStorage.getItem('activityhub_users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  // Store users (for demo purposes)
  private static setStoredUsers(users: User[]) {
    localStorage.setItem('activityhub_users', JSON.stringify(users));
  }

  // Initialize with demo users
  static initializeDemoUsers() {
    const existingUsers = this.getStoredUsers();
    if (existingUsers.length === 0) {
      const demoUsers: User[] = [
        {
          id: '1',
          email: 'teacher@activityhub.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'teacher',
          organization: 'Riverside Elementary',
          isActive: true,
          lastLoginAt: new Date('2024-01-15'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          email: 'admin@activityhub.com',
          firstName: 'Michael',
          lastName: 'Chen',
          role: 'admin',
          organization: 'ActivityHub',
          isActive: true,
          lastLoginAt: new Date('2024-01-16'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '3',
          email: 'john.doe@school.edu',
          firstName: 'John',
          lastName: 'Doe',
          role: 'teacher',
          organization: 'Westfield High School',
          isActive: true,
          lastLoginAt: new Date('2024-01-14'),
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05')
        },
        {
          id: '4',
          email: 'jane.smith@academy.org',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'student',
          organization: 'Drama Academy',
          isActive: false,
          lastLoginAt: new Date('2024-01-10'),
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-08')
        },
        {
          id: '5',
          email: 'emily.brown@college.edu',
          firstName: 'Emily',
          lastName: 'Brown',
          role: 'teacher',
          organization: 'Community College',
          isActive: true,
          lastLoginAt: new Date('2024-01-13'),
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-12')
        }
      ];
      this.setStoredUsers(demoUsers);
    }

    // Initialize demo subscriptions
    StripeService.initializeDemoSubscriptions();
  }

  // Check if user is authenticated
  static async checkAuth(): Promise<User | null> {
    const stored = this.getStoredAuth();
    if (stored && stored.token) {
      try {
        const response = await fetch(`${API_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${stored.token}`,
            "ngrok-skip-browser-warning": "69420"
          }
        });

        if (response.ok) {
          const user = await response.json();
          return user;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
    return null;
  }

  // Load user with subscription data
  private static async loadUserWithSubscription(user: User): Promise<User> {
    try {
      const subscription = await StripeService.getUserSubscription(user.id);
      return { ...user, subscription: subscription || undefined };
    } catch {
      return user;
    }
  }

  // Sign in
  static async signIn(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "69420"
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign in');
    }

    const data = await response.json();
    this.setStoredAuth(data);
    return data;
  }

  // Sign up
  static async signUp(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "69420"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign up');
    }

    const responseData = await response.json();
    this.setStoredAuth(responseData);
    return responseData;
  }

  // Sign out
  static async signOut(): Promise<void> {
    this.clearStoredAuth();
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "69420"
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    const updatedUser = await response.json();
    return updatedUser;
  }

  // Get current user from storage
  static getCurrentUser(): User | null {
    const stored = this.getStoredAuth();
    return stored?.user || null;
  }

  // Get auth token
  static getAuthToken(): string | null {
    const stored = this.getStoredAuth();
    return stored?.token || null;
  }

  // Admin functions for user management
  static async getAllUsers(filters?: UserFilters): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        "ngrok-skip-browser-warning": "69420"
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get users');
    }

    const users = await response.json();

    if (filters) {
      let filteredUsers = users;
      
      if (filters.role) {
        filteredUsers = filteredUsers.filter((u: User) => u.role === filters.role);
      }
      if (filters.isActive !== undefined) {
        filteredUsers = filteredUsers.filter((u: User) => u.isActive === filters.isActive);
      }
      if (filters.organization) {
        filteredUsers = filteredUsers.filter((u: User) => 
          u.organization?.toLowerCase().includes(filters.organization!.toLowerCase())
        );
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter((u: User) =>
          u.firstName.toLowerCase().includes(searchLower) ||
          u.lastName.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          u.organization?.toLowerCase().includes(searchLower)
        );
      }
      
      return filteredUsers;
    }

    return users;
  }

  static async getUserStats(): Promise<UserStats> {
    const response = await fetch(`${API_URL}/users/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        "ngrok-skip-browser-warning": "69420"
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user stats');
    }

    const stats = await response.json();
    return stats;
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "69420"
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    const newUser = await response.json();
    return newUser;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
        "ngrok-skip-browser-warning": "69420"
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }

    const updatedUser = await response.json();
    return updatedUser;
  }

  static async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        "ngrok-skip-browser-warning": "69420"
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
  }

  static async toggleUserStatus(userId: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}/toggle`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        "ngrok-skip-browser-warning": "69420"
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle user status');
    }

    const updatedUser = await response.json();
    return updatedUser;
  }
}