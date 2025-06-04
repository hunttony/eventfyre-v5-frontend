import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withXSRFToken: true,
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details for debugging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Cache for storing responses
const responseCache = new Map();
const CACHE_DURATION = 300000; // 5 minute cache
const pendingRequests = new Map();

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, { timestamp }] of responseCache.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      responseCache.delete(key);
    }
  }
}, 60000); // Run cleanup every minute

// Response interceptor for handling errors and caching
api.interceptors.response.use(
  (response) => {
    // Only cache successful GET responses
    if (response.config.method?.toLowerCase() === 'get' && response.status === 200) {
      const cacheKey = `${response.config.url}:${JSON.stringify(response.config.params || {})}`;
      responseCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details for debugging
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: originalRequest.url,
        method: originalRequest.method,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn('Authentication required - redirecting to login');
        // Clear any invalid tokens
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/login';
      }
      
      // Handle CORS errors
      if (error.response.status === 0) {
        console.error('CORS Error - Check if the backend is running and CORS is properly configured');
        return Promise.reject(new Error('Unable to connect to the server. Please check your connection and try again.'));
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error - No response received:', {
        url: originalRequest.url,
        method: originalRequest.method,
        timeout: error.code === 'ECONNABORTED' ? 'Request Timeout' : 'Unknown Error'
      });
    } else {
      // Something happened in setting up the request
      console.error('API Setup Error:', error.message);
    }
    
    // If the error is 429 (Too Many Requests) or 5xx server error
    if (error.response?.status === 429 || (error.response?.status >= 500 && error.response?.status < 600)) {
      const cacheKey = `${originalRequest.url}:${JSON.stringify(originalRequest.params || {})}`;
      
      // Check if we have a cached response we can use
      const cached = responseCache.get(cacheKey);
      const cacheAge = cached ? Date.now() - cached.timestamp : Infinity;
      
      // If we have a recent cached response, use it
      if (cached && cacheAge < CACHE_DURATION) {
        console.log(`Using cached response (${Math.floor(cacheAge/1000)}s old) due to ${error.response.status} error`);
        return Promise.resolve(cached.data);
      }
      
      // If there's already a pending request for this resource, wait for it
      if (pendingRequests.has(cacheKey)) {
        console.log('Request already in progress, waiting for response...');
        return new Promise((resolve) => {
          pendingRequests.get(cacheKey).queue.push(resolve);
        });
      }
      
      // TEMP: Disable retry count for testing
      // Always immediately reject to avoid retry delays during login testing
      return Promise.reject(error);
  }
});

// Helper functions for common CRUD operations
export const get = (url, config = {}) => api.get(url, config);
export const post = (url, data, config = {}) => api.post(url, data, config);
export const put = (url, data, config = {}) => api.put(url, data, config);
export const del = (url, config = {}) => api.delete(url, config);

// Auth API calls
export const authApi = {
  login: (credentials) => post('/auth/login', credentials),
  register: (userData) => post('/auth/register', userData),
  getMe: () => get('/auth/me'),
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => 
    post(`/auth/reset-password/${token}`, { password }),
  validateResetToken: (token) => 
    get(`/auth/validate-reset-token/${token}`),
  updateProfile: async (userData) => {
    console.log('Sending update profile request with data:', JSON.stringify(userData, null, 2));
    try {
      const response = await put('/auth/me', userData);
      console.log('Update profile successful, response:', response);
      return response;
    } catch (error) {
      console.error('Update profile error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },
  changePassword: (currentPassword, newPassword) => 
    post('/auth/change-password', { currentPassword, newPassword }),
};

// Vendor API calls
export const vendorApi = {
  getAvailability: () => get('/vendors/availability'),
  addAvailability: (data) => post('/vendors/availability', data),
  getServices: () => get('/services/my-services'),
  updateService: (serviceId, data) => put(`/vendors/services/${serviceId}`, data),
  getEvents: () => get('/vendors/events'),
};

// Organizer API calls
export const organizerApi = {
  getEvents: () => get('/organizer/events'),
  getEvent: (eventId) => get(`/organizer/events/${eventId}`),
  createEvent: (data) => post('/organizer/events', data),
  updateEvent: (eventId, data) => put(`/organizer/events/${eventId}`, data),
  deleteEvent: (eventId) => del(`/organizer/events/${eventId}`),
  getAvailableVendors: (eventId) => get(`/organizer/events/${eventId}/vendors/available`),
  assignVendor: (eventId, vendorId) => post(`/organizer/events/${eventId}/vendors/${vendorId}`),
  unassignVendor: (eventId, vendorId) => del(`/organizer/events/${eventId}/vendors/${vendorId}`),
};

// Events API calls
export const eventsApi = {
  getUpcomingEvents: () => get('/events/upcoming'),
  getPastEvents: () => get('/events/past'),
  getSavedEvents: () => get('/events/saved'),
  searchEvents: (query) => get('/events/search', { params: { query } }),
  getEventDetails: (eventId) => get(`/events/${eventId}`),
  saveEvent: (eventId) => post(`/events/${eventId}/save`),
  unsaveEvent: (eventId) => del(`/events/${eventId}/save`),
  registerForEvent: (eventId, data) => post(`/events/${eventId}/register`, data),
  cancelRegistration: (eventId) => del(`/events/${eventId}/register`),
  getEventAttendees: (eventId) => get(`/events/${eventId}/attendees`),
  getEventVendors: (eventId) => get(`/events/${eventId}/vendors`),
  getEventSchedule: (eventId) => get(`/events/${eventId}/schedule`)
};

// Messages API calls
export const messagesApi = {
  getConversations: () => get('/messages/conversations'),
  getMessages: (userId, eventId = null) => 
    get(`/messages?userId=${userId}${eventId ? `&eventId=${eventId}` : ''}`),
  sendMessage: (data) => post('/messages', data),
};

// Export the configured axios instance as default
export default api;
