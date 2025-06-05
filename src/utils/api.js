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

// Response interceptor for handling responses and errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    // Only cache successful GET responses
    if (response.config.method?.toLowerCase() === 'get' && response.status === 200) {
      const cacheKey = `${response.config.url}:${JSON.stringify(response.config.params || {})}`;
      responseCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    
    // Ensure consistent response structure
    if (response.data) {
      return {
        ...response,
        data: {
          success: true,
          ...response.data
        }
      };
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details for debugging
    console.error('[API Error]', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: originalRequest?.url,
        method: originalRequest?.method,
        data: originalRequest?.data
      }
    });

    // Handle network errors
    if (!error.response) {
      const networkError = new Error('Network error. Please check your connection.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Create a consistent error object
    const apiError = new Error(
      error.response.data?.message || 
      error.message || 
      'An error occurred. Please try again.'
    );
    
    // Attach additional error information
    apiError.status = error.response.status;
    apiError.response = error.response;
    apiError.isApiError = true;
    
    // Handle specific error statuses
    if (error.response.status === 401) {
      // Handle unauthorized (e.g., token expired)
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('unauthorized'));
      apiError.message = 'Your session has expired. Please log in again.';
    } else if (error.response.status === 403) {
      apiError.message = 'You do not have permission to perform this action.';
    } else if (error.response.status === 400) {
      // For 400 errors, include the validation errors if they exist
      if (error.response.data?.errors) {
        apiError.errors = error.response.data.errors;
        apiError.message = 'Please fix the following errors:';
      } else if (error.response.data?.message) {
        apiError.message = error.response.data.message;
      } else {
        apiError.message = 'Validation failed. Please check your input.';
      }
    } else if (error.response.status === 404) {
      apiError.message = 'The requested resource was not found.';
    } else if (error.response.status === 429) {
      apiError.message = 'Too many requests. Please try again later.';
    } else if (error.response.status >= 500) {
      apiError.message = 'Server error. Please try again later.';
    }

    // For 5xx errors, check if we have a cached response
    if (error.response.status >= 500 && error.response.status < 600 && originalRequest) {
      const cacheKey = `${originalRequest.url}:${JSON.stringify(originalRequest.params || {})}`;
      const cached = responseCache.get(cacheKey);
      const cacheAge = cached ? Date.now() - cached.timestamp : Infinity;
      
      // If we have a recent cached response, use it
      if (cached && cacheAge < CACHE_DURATION) {
        console.log(`Using cached response (${Math.floor(cacheAge/1000)}s old) due to server error`);
        return Promise.resolve({
          data: {
            success: true,
            ...cached.data,
            _cached: true
          }
        });
      }
    }

    return Promise.reject(apiError);
  }
);

// Helper functions for common CRUD operations
export const get = (url, config = {}) => api.get(url, config);
export const post = (url, data, config = {}) => api.post(url, data, config);
export const put = (url, data, config = {}) => api.put(url, data, config);
export const del = (url, config = {}) => api.delete(url, config);

// Auth API calls
export const authApi = {
  login: (credentials) => post('/auth/login', credentials),
  register: async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      const response = await post('/auth/register', userData);
      console.log('Registration successful, response:', response);
      return response;
    } catch (error) {
      console.error('Registration API error:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error; // Re-throw to allow component to handle it
    }
  },
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
  // Existing event endpoints
  getUpcomingEvents: () => get('/events/upcoming'),
  getPastEvents: () => get('/events/past'),
  getSavedEvents: () => get('/events/saved'),
  searchEvents: (query) => get('/events/search', { params: { q: query } }),
  getEventDetails: (eventId) => get(`/events/${eventId}`),
  saveEvent: (eventId) => post(`/events/${eventId}/save`),
  unsaveEvent: (eventId) => del(`/events/${eventId}/save`),
  
  // Enhanced registration endpoint with comprehensive attendee data
  registerForEvent: (eventId, data) => {
    // Support both simple and comprehensive registration
    const registrationData = data.fullName ? data : {
      fullName: data.name,
      email: data.email,
      phoneNumber: data.phone || null,
      ageRange: data.ageRange || null,
      location: {
        city: data.city || null,
        zipCode: data.zipCode || null,
      },
      interests: data.interests || [],
      ticketType: data.ticketType || 'general',
      sessionPreferences: data.sessionPreferences || [],
      dietaryRestrictions: data.dietaryRestrictions || null,
      accessibilityNeeds: data.accessibilityNeeds || null,
      socialMediaHandles: data.socialMediaHandles || null,
      consent: {
        smsUpdates: data.consent?.smsUpdates || false,
        behavioralTracking: data.consent?.behavioralTracking || false,
        socialMedia: data.consent?.socialMedia || false,
      },
    };
    
    return post(`/events/${eventId}/register`, registrationData);
  },
  
  cancelRegistration: (eventId) => del(`/events/${eventId}/register`),
  
  // Enhanced getEventAttendees with filtering support
  getEventAttendees: (eventId, filters = {}) => {
    const params = {};
    if (filters.ageRange) params.ageRange = filters.ageRange;
    if (filters.location) params.location = JSON.stringify(filters.location);
    if (filters.interests) params.interests = filters.interests.join(',');
    if (filters.ticketType) params.ticketType = filters.ticketType;
    if (filters.sessionId) params.sessionId = filters.sessionId;
    
    return get(`/events/${eventId}/attendees`, { params });
  },
  
  getEventVendors: (eventId) => get(`/events/${eventId}/vendors`),
  getEventSchedule: (eventId) => get(`/events/${eventId}/schedule`),
  
  // New attendee-related endpoints
  checkInToSession: (eventId, sessionId, attendeeId) => 
    post(`/events/${eventId}/sessions/${sessionId}/check-in`, { attendeeId }),
  
  submitFeedback: (eventId, feedbackData) => 
    post(`/events/${eventId}/feedback`, {
      attendeeId: feedbackData.attendeeId,
      ratings: feedbackData.ratings,
      comments: feedbackData.comments || null,
    }),
    
  trackInteraction: (eventId, interactionData) => 
    post(`/events/${eventId}/interactions`, {
      attendeeId: interactionData.attendeeId,
      type: interactionData.type,
      details: interactionData.details || {},
    }),
    
  updateRegistration: (eventId, data) => {
    const updateData = data.fullName ? data : {
      fullName: data.name,
      email: data.email,
      phoneNumber: data.phone || null,
      ageRange: data.ageRange || null,
      location: {
        city: data.city || null,
        zipCode: data.zipCode || null,
      },
      interests: data.interests || [],
      ticketType: data.ticketType || null,
      sessionPreferences: data.sessionPreferences || [],
      dietaryRestrictions: data.dietaryRestrictions || null,
      accessibilityNeeds: data.accessibilityNeeds || null,
      socialMediaHandles: data.socialMediaHandles || null,
      consent: data.consent || {
        smsUpdates: false,
        behavioralTracking: false,
        socialMedia: false,
      },
    };
    
    return put(`/events/${eventId}/register`, updateData);
  },
  
  // Additional attendee management
  getAttendeeProfile: (eventId, attendeeId) => 
    get(`/events/${eventId}/attendees/${attendeeId}`),
    
  getAttendeeSessions: (eventId, attendeeId) => 
    get(`/events/${eventId}/attendees/${attendeeId}/sessions`),
    
  updateAttendeeStatus: (eventId, attendeeId, status) => 
    put(`/events/${eventId}/attendees/${attendeeId}/status`, { status }),
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
