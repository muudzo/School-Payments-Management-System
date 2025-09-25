import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-fcce6e64`;

// Get auth token from localStorage or session
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Set auth token in localStorage
export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
}

// Remove auth token from localStorage
export function removeAuthToken() {
  localStorage.removeItem('auth_token');
}

// Make authenticated API request
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
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

  getStats: () => apiRequest('/stats/payments'),
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