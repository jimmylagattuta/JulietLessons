import { Activity, Script } from '../types';
import { AuthService } from './auth';

// const API_BASE_URL = 'http://52.15.159.45:3001/api'  // Production
const API_BASE_URL = 'https://5872-35-78-107-144.ngrok-free.app/api'  // Production
// const API_BASE_URL = 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}


export class ApiService {
  private static getHeaders(isFormData: boolean = false) {
    const token = AuthService.getAuthToken();
    return {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      "ngrok-skip-browser-warning": "69420",
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    
    const response = await fetch(url, {
      headers: {
        ...this.getHeaders(isFormData),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.error || `HTTP ${response.status}`,
        response.status,
        error
      );
    }

    // Don't try to parse JSON for 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Activities API
  static async getActivities(filters?: any) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/activities?${queryParams}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }

    return response.json();
  }

  static async getActivity(id: string) {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activity');
    }

    return response.json();
  }

  static async createActivity(activityData: Partial<Activity>) {
    const formData = new FormData();
    
    // Add activity data as JSON string
    formData.append('data', JSON.stringify(activityData));
    
    // Add files if they exist
    if (activityData.pdfFiles && activityData.pdfFiles.length > 0) {
      for (const pdf of activityData.pdfFiles) {
        try {
          // Convert blob URL to File object
          const response = await fetch(pdf.fileUrl);
          const blob = await response.blob();
          const file = new File([blob], pdf.fileName, { type: 'application/pdf' });
          formData.append('files', file);
        } catch (error) {
          console.error('Error converting PDF to file:', error);
        }
      }
    }

    return this.request('/activities', {
      method: 'POST',
      body: formData
    });
  }

  static async updateActivity(id: string, activityData: Partial<Activity>) {
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(activityData)
    });

    if (!response.ok) {
      throw new Error('Failed to update activity');
    }

    return response.json();
  }

  static async deleteActivity(id: string) {
    console.log('ApiService.deleteActivity called with id:', id);
    const response = await fetch(`${API_BASE_URL}/activities/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    console.log('Delete response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete failed with status:', response.status, 'Error:', errorText);
      throw new Error('Failed to delete activity');
    }
    console.log('Activity deleted successfully via API');
  }

  // Scripts API
  static async getScripts(filters?: any) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/scripts?${queryParams}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch scripts');
    }

    return response.json();
  }

  static async getScript(id: string) {
    const response = await fetch(`${API_BASE_URL}/scripts/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch script');
    }

    return response.json();
  }

  static async createScript(scriptData: Partial<Script>, file?: File) {
    const formData = new FormData();
    Object.entries(scriptData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    if (file) {
      formData.append('file', file);
    }

    return this.request('/scripts', {
      method: 'POST',
      body: formData
    });
  }

  static async updateScript(id: string, scriptData: Partial<Script>, file?: File) {
    const formData = new FormData();
    Object.entries(scriptData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    if (file) {
      formData.append('file', file);
    }

    return this.request(`/scripts/${id}`, {
      method: 'PUT',
      body: formData
    });
  }

  static async deleteScript(id: string) {
    const response = await fetch(`${API_BASE_URL}/scripts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete script');
    }
  }

  static async uploadScriptFile(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(`/scripts/${id}/upload`, {
      method: 'POST',
      body: formData
    });
  }

   // Lessons API
  static async getSavedLessons(filters?: Record<string, any>) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    const query = params.toString();
    return this.request(`/lessons${query ? `?${query}` : ''}`);
  }

  static async getSavedLesson(id: string) {
    return this.request(`/lessons/${id}`);
  }

  static async saveLesson(lessonData: any) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
      headers: this.getHeaders()
    });
  }

  static async updateLesson(id: string, lessonData: any) {
    return this.request(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData),
      headers: this.getHeaders()
    });
  }

  static async deleteLesson(id: string) {
    const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete lesson');
    }

    // For 204 responses, return void
    if (response.status === 204) {
      return;
    }

    return response.json();
  }

  static async duplicateLesson(id: string, title: string) {
    return this.request(`/lessons/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ title }),
      headers: this.getHeaders()
    });
  }

  static async getLessonWithActivities(id: string) {
    return this.request(`/lessons/${id}/activities`);
  }

  // Stripe API
  static async getSubscriptionPlans() {
    return this.request('/stripe/plans', {
      method: 'GET',
      headers: {
        ...this.getHeaders(),
        "ngrok-skip-browser-warning": "69420"
      }
    });
  }

  static async getUserSubscription(userId: string) {
    return this.request(`/stripe/subscription/${userId}`, {
      headers: this.getHeaders()
    });
  }

  static async createSubscription(userId: string, planId: string, paymentMethodId: string) {
    return this.request('/stripe/create-subscription', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, planId, paymentMethodId })
    });
  }

  static async updateSubscription(userId: string, planId: string) {
    return this.request('/stripe/update-subscription', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, planId })
    });
  }

  static async cancelSubscription(userId: string) {
    return this.request('/stripe/cancel-subscription', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId })
    });
  }

  static async reactivateSubscription(userId: string) {
    return this.request('/stripe/reactivate-subscription', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId })
    });
  }

  static async purchaseAdditionalLessons(userId: string, lessonCount: number) {
    return this.request('/stripe/purchase-lessons', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, lessonCount })
    });
  }

  static async incrementLessonCount(userId: string) {
    return this.request('/stripe/increment-lesson', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId })
    });
  }

  static async checkSubscriptionAccess(userId: string) {
    return this.request(`/stripe/check-access/${userId}`, {
      headers: this.getHeaders()
    });
  }

  static async getPaymentMethods(userId: string) {
    return this.request(`/stripe/payment-methods/${userId}`, {
      headers: this.getHeaders()
    });
  }

  static async getInvoices(userId: string) {
    return this.request(`/stripe/invoices/${userId}`, {
      headers: this.getHeaders()
    });
  }

  // Add create-payment-intent endpoint
  static async createPaymentIntent(planId: string) {
    return this.request('/stripe/create-payment-intent', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ planId })
    });
  }
}