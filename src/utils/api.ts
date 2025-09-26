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
  signup: (userData: { email: string; password: string; name: string; role: string }) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest('/auth/profile'),
};

// Students API
export const studentsAPI = {
  getAll: () => apiRequest('/students'),
  
  create: (studentData: any) =>
    apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),

  update: (id: string, updates: any) =>
    apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// Payments API
export const paymentsAPI = {
  getAll: (studentId?: string) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return apiRequest(`/payments${query}`);
  },

  create: (paymentData: any) =>
    apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

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
  generate: (paymentId: string) =>
    apiRequest('/receipts/generate', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    }),
};

// Notifications API
export const notificationsAPI = {
  sendReminder: (studentId: string) =>
    apiRequest('/notifications/reminder', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),
};

// Utility API
export const utilityAPI = {
  initSampleData: () =>
    apiRequest('/init-sample-data', {
      method: 'POST',
    }),
};