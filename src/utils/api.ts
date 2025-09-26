import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-fcce6e64`;

// Get auth token from localStorage or session
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Set auth token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Improved error handling for API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  };
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Response wasn't JSON, use default message
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error: any) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw new Error(
      error.message || 'Network error: Please check your connection'
    );
  }
}

// Auth API
export const authAPI = {
  signup: async (userData: { email: string; password: string; name: string; role: string }) => {
    try {
      return await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error: any) {
      return { error: error.message };
    }
  },
  getProfile: async () => {
    try {
      return await apiRequest('/auth/profile');
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

// Students API
export const studentsAPI = {
  getAll: async () => {
    try {
      return await apiRequest('/students');
    } catch (error: any) {
      return { error: error.message };
    }
  },
  create: async (studentData: any) => {
    try {
      return await apiRequest('/students', {
        method: 'POST',
        body: JSON.stringify(studentData),
      });
    } catch (error: any) {
      return { error: error.message };
    }
  },
  update: async (id: string, updates: any) => {
    try {
      return await apiRequest(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async (studentId?: string) => {
    try {
      const query = studentId ? `?studentId=${studentId}` : '';
      return await apiRequest(`/payments${query}`);
    } catch (error: any) {
      return { error: error.message };
    }
  },
  create: async (paymentData: any) => {
    try {
      return await apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error: any) {
      return { error: error.message };
    }
  },
  getStats: async () => {
    try {
      return await apiRequest('/stats/payments');
    } catch (error: any) {
      // Log for debugging
      console.error('Failed to fetch payment stats:', error);
      // Return default data structure to prevent crashes
      return {
        totalPayments: 0,
        pendingPayments: 0,
        completedPayments: 0,
        totalAmount: 0,
        error: error.message
      };
    }
  },
};

// Receipts API
export const receiptsAPI = {
  generate: async (paymentId: string) => {
    try {
      return await apiRequest('/receipts/generate', {
        method: 'POST',
        body: JSON.stringify({ paymentId }),
      });
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

// Notifications API
export const notificationsAPI = {
  sendReminder: async (studentId: string) => {
    try {
      return await apiRequest('/notifications/reminder', {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

// Utility API
export const utilityAPI = {
  initSampleData: async () => {
    try {
      return await apiRequest('/init-sample-data', {
        method: 'POST',
      });
    } catch (error: any) {
      return { error: error.message };
    }
  },
};