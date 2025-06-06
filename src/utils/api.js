import axios from 'axios';

// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with base URL and credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Flag to prevent multiple token refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Skip token for auth endpoints to prevent loops
    if (config.url?.includes('/auth/refresh') || config.url?.includes('/auth/login')) {
      return config;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
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
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    // Cache successful GET responses
    if (response.config.method?.toLowerCase() === 'get' && response.status === 200) {
      const cacheKey = `${response.config.url}:${JSON.stringify(response.config.params || {})}`;
      responseCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    
    // Ensure consistent response structure
    return {
      ...response,
      data: {
        success: true,
        ...response.data
      }
    };
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await api.post('/auth/refresh', { refreshToken }, {
          skipAuthRefresh: true
        });
        
        const { token: newToken, user } = response.data;
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('unauthorized'));
        processQueue(new Error('Session expired. Please log in again.'), null);
        return Promise.reject(new Error('Your session has expired. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }
    
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

    // Create consistent error object
    const apiError = new Error(
      error.response.data?.message || 
      error.message || 
      'An error occurred. Please try again.'
    );
    
    apiError.status = error.response.status;
    apiError.response = error.response;
    apiError.isApiError = true;
    
    // Handle specific error statuses
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('unauthorized'));
      apiError.message = 'Your session has expired. Please log in again.';
    } else if (error.response.status === 403) {
      apiError.message = 'You do not have permission to perform this action.';
    } else if (error.response.status === 400) {
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

    // Use cached response for 5xx errors
    if (error.response.status >= 500 && error.response.status < 600 && originalRequest) {
      const cacheKey = `${originalRequest.url}:${JSON.stringify(originalRequest.params || {})}`;
      const cached = responseCache.get(cacheKey);
      const cacheAge = cached ? Date.now() - cached.timestamp : Infinity;
      
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

// Helper functions for CRUD operations
export const get = (url, config = {}) => api.get(url, config);
export const post = (url, data, config = {}) => api.post(url, data, config);
export const put = (url, data, config = {}) => api.put(url, data, config);
export const del = (url, config = {}) => api.delete(url, config);

// Auth API calls
export const authApi = {
  login: async (credentials) => {
    try {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
        throw new Error('Valid email is required');
      }
      if (credentials.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      console.log('Logging in with:', credentials.email);
      const response = await post('/auth/login', credentials);
      const { token, refreshToken, user } = response.data || {};

      if (!token || !user) {
        throw new Error('Invalid response format from login API');
      }

      // Store tokens and user in localStorage
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return {
        data: { user, token, refreshToken },
        success: true,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      if (!userData?.email || !userData?.password || !userData?.name) {
        throw new Error('Email, password, and name are required');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        throw new Error('Valid email is required');
      }
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      console.log('Registering user with data:', userData);
      const response = await post('/auth/register', userData);
      const { token, refreshToken, user } = response.data || {};

      if (!token || !user) {
        throw new Error('Invalid response format from register API');
      }

      // Store tokens and user in localStorage
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return {
        data: { user, token, refreshToken },
        success: true,
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Registration error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  getMe: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return {
          data: JSON.parse(storedUser),
          success: true,
          message: 'User data retrieved from cache'
        };
      }

      const response = await get('/auth/me');
      const user = response.data;

      if (!user) {
        throw new Error('Invalid response format from getMe API');
      }

      localStorage.setItem('user', JSON.stringify(user));

      return {
        data: user,
        success: true,
        message: 'User data retrieved'
      };
    } catch (error) {
      console.error('Get current user error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve user data');
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      if (!currentPassword || !newPassword) {
        throw new Error('Current and new passwords are required');
      }
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }

      const response = await post('/auth/change-password', { currentPassword, newPassword });
      return {
        data: response.data,
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Change password error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  forgotPassword: async (email) => {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Valid email is required');
      }

      const response = await post('/auth/forgot-password', { email });
      return {
        data: response.data,
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      console.error('Forgot password error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to send password reset email');
    }
  },

  resetPassword: async (token, password) => {
    try {
      if (!token || !password) {
        throw new Error('Token and password are required');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const response = await post(`/auth/reset-password/${token}`, { password });
      return {
        data: response.data,
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      console.error('Reset password error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },

  validateResetToken: async (token) => {
    try {
      if (!token) {
        throw new Error('Token is required');
      }

      const response = await get(`/auth/validate-reset-token/${token}`);
      return {
        data: response.data,
        success: true,
        message: 'Token validated successfully'
      };
    } catch (error) {
      console.error('Validate reset token error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Invalid or expired token');
    }
  },

  updateProfile: async (userData) => {
    try {
      if (!userData) {
        throw new Error('User data is required');
      }

      console.log('Updating profile with:', userData);
      const isFormData = userData instanceof FormData;
      const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };

      const response = await put('/auth/me', userData, { headers });
      const user = response.data;

      if (!user) {
        throw new Error('Invalid response format from updateProfile API');
      }

      localStorage.setItem('user', JSON.stringify(user));

      return {
        data: user,
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Update profile error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  logout: async () => {
    try {
      // Optionally notify backend to invalidate token
      await post('/auth/logout');
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      return {
        data: null,
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Logout error:', error.message, error.response?.data);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  }
};

// Vendor API calls
export const vendorApi = {
  getAvailability: async () => {
    try {
      const response = await get('/vendors/availability');
      return {
        data: response.data,
        success: true,
        message: 'Availability retrieved successfully'
      };
    } catch (error) {
      console.error('Get availability error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve availability');
    }
  },

  addAvailability: async (data) => {
    try {
      if (!data) {
        throw new Error('Availability data is required');
      }
      const response = await post('/vendors/availability', data);
      return {
        data: response.data,
        success: true,
        message: 'Availability added successfully'
      };
    } catch (error) {
      console.error('Add availability error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to add availability');
    }
  },

  getProfile: async () => {
    try {
      const response = await get('/vendors/profile');
      return {
        data: response.data,
        success: true,
        message: 'Profile retrieved successfully'
      };
    } catch (error) {
      console.error('Get profile error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve profile');
    }
  },

  updateProfile: async (profileData) => {
    try {
      if (!profileData?.businessName || !profileData?.email) {
        throw new Error('Business name and email are required');
      }
      const formattedData = {
        businessName: profileData.businessName,
        contactDetails: {
          email: profileData.email,
          phone: profileData.phone,
        },
        location: {
          city: profileData.city,
          zipCode: profileData.zipCode,
          serviceArea: profileData.serviceArea || [],
        },
        description: profileData.description,
        website: profileData.website,
      };
      const response = await put('/vendors/profile', formattedData);
      return {
        data: response.data,
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Update profile error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  getServices: async () => {
    try {
      const response = await get('/services/my-services');
      return {
        data: response.data,
        success: true,
        message: 'Services retrieved successfully'
      };
    } catch (error) {
      console.error('Get services error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve services');
    }
  },

  getService: async (serviceId) => {
    try {
      if (!serviceId) {
        throw new Error('Service ID is required');
      }
      const response = await get(`/vendors/services/${serviceId}`);
      return {
        data: response.data,
        success: true,
        message: 'Service retrieved successfully'
      };
    } catch (error) {
      console.error('Get service error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve service');
    }
  },

  createService: async (serviceData) => {
    try {
      if (!serviceData?.serviceType || !serviceData?.description || !serviceData?.pricingType || !serviceData?.amount) {
        throw new Error('Service type, description, pricing type, and amount are required');
      }
      const formattedData = {
        serviceType: serviceData.serviceType,
        description: serviceData.description,
        pricingStructure: {
          type: serviceData.pricingType,
          amount: serviceData.amount,
          currency: serviceData.currency || 'USD',
        },
        capacityLimits: {
          minGuests: serviceData.minGuests || null,
          maxGuests: serviceData.maxGuests || null,
        },
      };
      const response = await post('/vendors/services', formattedData);
      return {
        data: response.data,
        success: true,
        message: 'Service created successfully'
      };
    } catch (error) {
      console.error('Create service error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to create service');
    }
  },

  updateService: async (serviceId, data) => {
    try {
      if (!serviceId || !data) {
        throw new Error('Service ID and data are required');
      }
      const response = await put(`/vendors/services/${serviceId}`, data);
      return {
        data: response.data,
        success: true,
        message: 'Service updated successfully'
      };
    } catch (error) {
      console.error('Update service error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update service');
    }
  },

  deleteService: async (serviceId) => {
    try {
      if (!serviceId) {
        throw new Error('Service ID is required');
      }
      const response = await del(`/vendors/services/${serviceId}`);
      return {
        data: response.data,
        success: true,
        message: 'Service deleted successfully'
      };
    } catch (error) {
      console.error('Delete service error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to delete service');
    }
  },

  uploadPortfolioMedia: async (serviceId, mediaData) => {
    try {
      if (!serviceId || !mediaData?.file) {
        throw new Error('Service ID and file are required');
      }
      const formData = new FormData();
      formData.append('file', mediaData.file);
      formData.append('description', mediaData.description || '');
      formData.append('type', mediaData.type || 'photo');
      const response = await post(`/vendors/services/${serviceId}/portfolio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return {
        data: response.data,
        success: true,
        message: 'Portfolio media uploaded successfully'
      };
    } catch (error) {
      console.error('Upload portfolio media error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to upload portfolio media');
    }
  },

  getPortfolio: async (serviceId) => {
    try {
      if (!serviceId) {
        throw new Error('Service ID is required');
      }
      const response = await get(`/vendors/services/${serviceId}/portfolio`);
      return {
        data: response.data,
        success: true,
        message: 'Portfolio retrieved successfully'
      };
    } catch (error) {
      console.error('Get portfolio error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve portfolio');
    }
  },

  deletePortfolioItem: async (serviceId, mediaId) => {
    try {
      if (!serviceId || !mediaId) {
        throw new Error('Service ID and media ID are required');
      }
      const response = await del(`/vendors/services/${serviceId}/portfolio/${mediaId}`);
      return {
        data: response.data,
        success: true,
        message: 'Portfolio item deleted successfully'
      };
    } catch (error) {
      console.error('Delete portfolio item error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to delete portfolio item');
    }
  },

  submitCertification: async (serviceId, certificationData) => {
    try {
      if (!serviceId || !certificationData?.type || !certificationData?.document) {
        throw new Error('Service ID, certification type, and document are required');
      }
      const formData = new FormData();
      formData.append('type', certificationData.type);
      formData.append('document', certificationData.document);
      if (certificationData.issuedDate) formData.append('issuedDate', certificationData.issuedDate);
      if (certificationData.expiryDate) formData.append('expiryDate', certificationData.expiryDate);
      if (certificationData.issuingAuthority) formData.append('issuingAuthority', certificationData.issuingAuthority);
      const response = await post(`/vendors/services/${serviceId}/certifications`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return {
        data: response.data,
        success: true,
        message: 'Certification submitted successfully'
      };
    } catch (error) {
      console.error('Submit certification error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to submit certification');
    }
  },

  getCertifications: async (serviceId) => {
    try {
      if (!serviceId) {
        throw new Error('Service ID is required');
      }
      const response = await get(`/vendors/services/${serviceId}/certifications`);
      return {
        data: response.data,
        success: true,
        message: 'Certifications retrieved successfully'
      };
    } catch (error) {
      console.error('Get certifications error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve certifications');
    }
  },

  deleteCertification: async (serviceId, certificationId) => {
    try {
      if (!serviceId || !certificationId) {
        throw new Error('Service ID and certification ID are required');
      }
      const response = await del(`/vendors/services/${serviceId}/certifications/${certificationId}`);
      return {
        data: response.data,
        success: true,
        message: 'Certification deleted successfully'
      };
    } catch (error) {
      console.error('Delete certification error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to delete certification');
    }
  },

  getEvents: async () => {
    try {
      const response = await get('/vendors/events');
      return {
        data: response.data,
        success: true,
        message: 'Events retrieved successfully'
      };
    } catch (error) {
      console.error('Get events error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve events');
    }
  },

  getEventEngagement: async (eventId, filters = {}) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const params = {};
      if (filters.sessionId) params.sessionId = filters.sessionId;
      if (filters.dateRange) params.dateRange = JSON.stringify(filters.dateRange);
      const response = await get(`/vendors/events/${eventId}/engagement`, { params });
      return {
        data: response.data,
        success: true,
        message: 'Event engagement retrieved successfully'
      };
    } catch (error) {
      console.error('Get event engagement error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve event engagement');
    }
  },

  getLeads: async (eventId, filters = {}) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.dateRange) params.dateRange = JSON.stringify(filters.dateRange);
      const response = await get(`/vendors/events/${eventId}/leads`, { params });
      return {
        data: response.data,
        success: true,
        message: 'Leads retrieved successfully'
      };
    } catch (error) {
      console.error('Get leads error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve leads');
    }
  },

  submitEventFeedback: async (eventId, feedbackData) => {
    try {
      if (!eventId || !feedbackData?.ratings) {
        throw new Error('Event ID and ratings are required');
      }
      const formattedData = {
        ratings: feedbackData.ratings,
        comments: feedbackData.comments || null,
        submittedBy: feedbackData.submittedBy || 'anonymous',
      };
      const response = await post(`/vendors/events/${eventId}/feedback`, formattedData);
      return {
        data: response.data,
        success: true,
        message: 'Feedback submitted successfully'
      };
    } catch (error) {
      console.error('Submit event feedback error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to submit feedback');
    }
  },

  getEventFeedback: async (eventId, filters = {}) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const params = {};
      if (filters.submittedBy) params.submittedBy = filters.submittedBy;
      if (filters.rating) params.rating = filters.rating;
      const response = await get(`/vendors/events/${eventId}/feedback`, { params });
      return {
        data: response.data,
        success: true,
        message: 'Feedback retrieved successfully'
      };
    } catch (error) {
      console.error('Get event feedback error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve feedback');
    }
  },

  updateIntegrationPreferences: async (preferencesData) => {
    try {
      if (!preferencesData) {
        throw new Error('Preferences data is required');
      }
      const formattedData = {
        paymentMethods: preferencesData.paymentMethods || [],
        crmIntegrations: preferencesData.crmIntegrations || [],
      };
      const response = await put('/vendors/integrations', formattedData);
      return {
        data: response.data,
        success: true,
        message: 'Integration preferences updated successfully'
      };
    } catch (error) {
      console.error('Update integration preferences error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update integration preferences');
    }
  },

  getIntegrationPreferences: async () => {
    try {
      const response = await get('/vendors/integrations');
      return {
        data: response.data,
        success: true,
        message: 'Integration preferences retrieved successfully'
      };
    } catch (error) {
      console.error('Get integration preferences error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve integration preferences');
    }
  },

  searchVendors: async (filters = {}) => {
    try {
      const params = {};
      if (filters.serviceType) params.serviceType = filters.serviceType;
      if (filters.location) params.location = JSON.stringify(filters.location);
      if (filters.availability) params.availability = JSON.stringify(filters.availability);
      if (filters.capacity) params.capacity = JSON.stringify(filters.capacity);
      if (filters.rating) params.rating = filters.rating;
      const response = await get('/vendors/search', { params });
      return {
        data: response.data,
        success: true,
        message: 'Vendors retrieved successfully'
      };
    } catch (error) {
      console.error('Search vendors error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to search vendors');
    }
  },
};

// Organizer API calls
export const organizerApi = {
  getEvents: async () => {
    try {
      const response = await get('/organizer/events');
      return {
        data: response.data,
        success: true,
        message: 'Events retrieved successfully'
      };
    } catch (error) {
      console.error('Get events error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve events');
    }
  },

  getEvent: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const response = await get(`/organizer/events/${eventId}`);
      return {
        data: response.data,
        success: true,
        message: 'Event retrieved successfully'
      };
    } catch (error) {
      console.error('Get event error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve event');
    }
  },

  createEvent: async (data) => {
    try {
      if (!data?.eventType || !data?.expectedAttendance || !data?.budgetRange || !data?.preferredDates || !data?.locations) {
        throw new Error('Event type, expected attendance, budget range, preferred dates, and locations are required');
      }
      const eventData = {
        eventType: data.eventType,
        expectedAttendance: data.expectedAttendance,
        budgetRange: data.budgetRange,
        preferredDates: data.preferredDates,
        locations: data.locations,
        vendorPreferences: data.vendorPreferences || [],
        marketingChannels: data.marketingChannels || [],
        integrationNeeds: data.integrationNeeds || [],
        ...data
      };
      const response = await post('/organizer/events', eventData);
      return {
        data: response.data,
        success: true,
        message: 'Event created successfully'
      };
    } catch (error) {
      console.error('Create event error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  },

  updateEvent: async (eventId, data) => {
    try {
      if (!eventId || !data) {
        throw new Error('Event ID and data are required');
      }
      const eventData = {
        eventType: data.eventType,
        expectedAttendance: data.expectedAttendance,
        budgetRange: data.budgetRange,
        preferredDates: data.preferredDates,
        locations: data.locations,
        vendorPreferences: data.vendorPreferences,
        marketingChannels: data.marketingChannels,
        integrationNeeds: data.integrationNeeds,
        ...data
      };
      const response = await put(`/organizer/events/${eventId}`, eventData);
      return {
        data: response.data,
        success: true,
        message: 'Event updated successfully'
      };
    } catch (error) {
      console.error('Update event error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  },

  deleteEvent: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const response = await del(`/organizer/events/${eventId}`);
      return {
        data: response.data,
        success: true,
        message: 'Event deleted successfully'
      };
    } catch (error) {
      console.error('Delete event error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  },

  getAvailableVendors: async (eventId, filters = {}) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const params = {
        serviceType: filters.serviceType,
        location: filters.location ? JSON.stringify(filters.location) : null,
        budget: filters.budget ? JSON.stringify(filters.budget) : null,
        availability: filters.availability ? JSON.stringify(filters.availability) : null,
      };
      const response = await get(`/organizer/events/${eventId}/vendors/available`, { params });
      return {
        data: response.data,
        success: true,
        message: 'Available vendors retrieved successfully'
      };
    } catch (error) {
      console.error('Get available vendors error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve available vendors');
    }
  },

  assignVendor: async (eventId, vendorId, serviceData) => {
    try {
      if (!eventId || !vendorId || !serviceData) {
        throw new Error('Event ID, vendor ID, and service data are required');
      }
      const response = await post(`/organizer/events/${eventId}/vendors/${vendorId}`, { serviceData });
      return {
        data: response.data,
        success: true,
        message: 'Vendor assigned successfully'
      };
    } catch (error) {
      console.error('Assign vendor error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to assign vendor');
    }
  },

  unassignVendor: async (eventId, vendorId) => {
    try {
      if (!eventId || !vendorId) {
        throw new Error('Event ID and vendor ID are required');
      }
      const response = await del(`/organizer/events/${eventId}/vendors/${vendorId}`, {
        skipAuthRefresh: true
      });
      return {
        data: response.data,
        success: true,
        message: 'Vendor unassigned successfully'
      };
    } catch (error) {
      console.error('Unassign vendor error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to unassign vendor');
    }
  },

  getOrganizerProfile: async () => {
    try {
      const response = await get('/organizer/profile');
      return {
        data: response.data,
        success: true,
        message: 'Organizer profile retrieved successfully'
      };
    } catch (error) {
      console.error('Get organizer profile error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve organizer profile');
    }
  },

  updateOrganizerProfile: async (profileData) => {
    try {
      if (!profileData?.fullName || !profileData?.email) {
        throw new Error('Full name and email are required');
      }
      const formattedData = {
        fullName: profileData.fullName || profileData.businessName,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber || null,
        consent: {
          phoneContact: profileData.consent?.phoneContact || false,
          marketingEmails: profileData.consent?.marketingEmails || false,
          dataSharing: profileData.consent?.dataSharing || false,
        },
      };
      const response = await put('/organizer/profile', formattedData);
      return {
        data: response.data,
        success: true,
        message: 'Organizer profile updated successfully'
      };
    } catch (error) {
      console.error('Update organizer profile error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update organizer profile');
    }
  },

  updateBillingInfo: async (billingData) => {
    try {
      if (!billingData?.billingAddress || !billingData?.paymentMethod) {
        throw new Error('Billing address and payment method are required');
      }
      const formattedData = {
        billingAddress: billingData.billingAddress,
        paymentMethod: billingData.paymentMethod,
        billingEmail: billingData.billingEmail || null,
      };
      const response = await put('/organizer/billing', formattedData);
      return {
        data: response.data,
        success: true,
        message: 'Billing info updated successfully'
      };
    } catch (error) {
      console.error('Update billing info error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update billing info');
    }
  },

  getTicketSales: async (eventId, filters = {}) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const params = {
        dateRange: filters.dateRange ? JSON.stringify(filters.dateRange) : null,
        ticketType: filters.ticketType || null,
      };
      const response = await get(`/organizer/events/${eventId}/analytics/ticket-sales`, { params });
      return {
        data: response.data,
        success: true,
        message: 'Ticket sales retrieved successfully'
      };
    } catch (error) {
      console.error('Get ticket sales error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve ticket sales');
    }
  },

  getAttendeeEngagement: async (eventId, filters = {}) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const params = {
        sessionId: filters.sessionId || null,
        dateRange: filters.dateRange ? JSON.stringify(filters.dateRange) : null,
        metric: filters.metric || null,
      };
      const response = await get(`/organizer/events/${eventId}/analytics/engagement`, { params });
      return {
        data: response.data,
        success: true,
        message: 'Attendee engagement retrieved successfully'
      };
    } catch (error) {
      console.error('Get attendee engagement error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve attendee engagement');
    }
  },

  getVendorPerformance: async (eventId, vendorId, filters = {}) => {
    try {
      if (!eventId || !vendorId) {
        throw new Error('Event ID and vendor ID are required');
      }
      const params = {
        dateRange: filters.dateRange ? JSON.stringify(filters.dateRange) : null,
        metric: filters.metric || null,
      };
      const response = await get(`/organizer/events/${eventId}/vendors/${vendorId}/performance`, { params });
      return {
        data: response.data,
        success: true,
        message: 'Vendor performance retrieved successfully'
      };
    } catch (error) {
      console.error('Get vendor performance error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve vendor performance');
    }
  },

  getPostEventFeedback: async (eventId, filters = {}) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const params = {
        source: filters.source || null,
        rating: filters.rating || null,
      };
      const response = await get(`/organizer/events/${eventId}/feedback`, { params });
      return {
        data: response.data,
        success: true,
        message: 'Feedback retrieved successfully'
      };
    } catch (error) {
      console.error('Get post-event feedback error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve feedback');
    }
  },

  submitPostEventFeedback: async (eventId, feedbackData) => {
    try {
      if (!eventId || !feedbackData?.ratings) {
        throw new Error('Event ID and ratings are required');
      }
      const formattedData = {
        ratings: feedbackData.ratings,
        comments: feedbackData.comments || null,
        source: feedbackData.source || 'organizer',
      };
      const response = await post(`/organizer/events/${eventId}/feedback`, formattedData);
      return {
        data: response.data,
        success: true,
        message: 'Feedback submitted successfully'
      };
    } catch (error) {
      console.error('Submit post-event feedback error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to submit feedback');
    }
  },

  updateIntegrationPreferences: async (integrationData) => {
    try {
      if (!integrationData) {
        throw new Error('Integration data is required');
      }
      const formattedData = {
        crmIntegrations: integrationData.crmIntegrations || [],
        paymentGateways: integrationData.paymentGateways || [],
        socialMediaApis: integrationData.socialMediaApis || [],
      };
      const response = await put('/organizer/integrations', formattedData);
      return {
        data: response.data,
        success: true,
        message: 'Integration preferences updated successfully'
      };
    } catch (error) {
      console.error('Update integration preferences error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update integration preferences');
    }
  },

  getIntegrationPreferences: async () => {
    try {
      const response = await get('/organizer/integrations');
      return {
        data: response.data,
        success: true,
        message: 'Integration preferences retrieved successfully'
      };
    } catch (error) {
      console.error('Get integration preferences error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve integration preferences');
    }
  },

  connectCrm: async (crmType, credentials) => {
    try {
      if (!crmType || !credentials) {
        throw new Error('CRM type and credentials are required');
      }
      const response = await post(`/organizer/integrations/crm/${crmType}`, credentials);
      return {
        data: response.data,
        success: true,
        message: 'CRM connected successfully'
      };
    } catch (error) {
      console.error('Connect CRM error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to connect CRM');
    }
  },

  connectPaymentGateway: async (gatewayType, credentials) => {
    try {
      if (!gatewayType || !credentials) {
        throw new Error('Gateway type and credentials are required');
      }
      const response = await post(`/organizer/integrations/payment/${gatewayType}`, credentials);
      return {
        data: response.data,
        success: true,
        message: 'Payment gateway connected successfully'
      };
    } catch (error) {
      console.error('Connect payment gateway error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to connect payment gateway');
    }
  },

  connectSocialMedia: async (platform, credentials) => {
    try {
      if (!platform || !credentials) {
        throw new Error('Platform and credentials are required');
      }
      const response = await post(`/organizer/integrations/social/${platform}`, credentials);
      return {
        data: response.data,
        success: true,
        message: 'Social media connected successfully'
      };
    } catch (error) {
      console.error('Connect social media error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to connect social media');
    }
  },

  updateDataPrivacyPreferences: async (privacyData) => {
    try {
      if (!privacyData) {
        throw new Error('Privacy data is required');
      }
      const formattedData = {
        dataRetention: privacyData.dataRetention || 'standard',
        anonymizeAnalytics: privacyData.anonymizeAnalytics || false,
        optOutMarketing: privacyData.optOutMarketing || false,
      };
      const response = await put('/organizer/privacy', formattedData);
      return {
        data: response.data,
        success: true,
        message: 'Data privacy preferences updated successfully'
      };
    } catch (error) {
      console.error('Update data privacy preferences error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update data privacy preferences');
    }
  },

  getMarketingAnalytics: async (eventId, filters = {}) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const params = {
        channel: filters.channel || null,
        dateRange: filters.dateRange ? JSON.stringify(filters.dateRange) : null,
      };
      const response = await get(`/organizer/events/${eventId}/analytics/marketing`, { params });
      return {
        data: response.data,
        success: true,
        message: 'Marketing analytics retrieved successfully'
      };
    } catch (error) {
      console.error('Get marketing analytics error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve marketing analytics');
    }
  },
};

// Messages API calls
export const messagesApi = {
  getConversations: async () => {
    try {
      const response = await get('/messages/conversations');
      return {
        data: response.data,
        success: true,
        message: 'Conversations retrieved successfully'
      };
    } catch (error) {
      console.error('Get conversations error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve conversations');
    }
  },

  getMessages: async (userId, eventId = null) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await get(`/messages?userId=${userId}${eventId ? `&eventId=${eventId}` : ''}`);
      return {
        data: response.data,
        success: true,
        message: 'Messages retrieved successfully'
      };
    } catch (error) {
      console.error('Get messages error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to retrieve messages');
    }
  },

  sendMessage: async (data) => {
    try {
      if (!data?.recipientId || !data?.content) {
        throw new Error('Recipient ID and message content are required');
      }
      const response = await post('/messages', data);
      return {
        data: response.data,
        success: true,
        message: 'Message sent successfully'
      };
    } catch (error) {
      console.error('Send message error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  },
};

// Import events API
import { eventsApi } from './eventsApi';

export { api, eventsApi };