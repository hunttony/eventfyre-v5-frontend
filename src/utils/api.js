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
  // Availability Management
  getAvailability: () => get('/vendors/availability'),
  addAvailability: (data) => post('/vendors/availability', data),
  
  // Vendor Profile
  getProfile: () => get('/vendors/profile'),
  updateProfile: (profileData) => {
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
    return put('/vendors/profile', formattedData);
  },

  // Services Management
  getServices: () => get('/services/my-services'),
  getService: (serviceId) => get(`/vendors/services/${serviceId}`),
  createService: (serviceData) => {
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
    return post('/vendors/services', formattedData);
  },
  updateService: (serviceId, data) => put(`/vendors/services/${serviceId}`, data),
  deleteService: (serviceId) => del(`/vendors/services/${serviceId}`),

  // Portfolio Management
  uploadPortfolioMedia: (serviceId, mediaData) => {
    const formData = new FormData();
    formData.append('file', mediaData.file);
    formData.append('description', mediaData.description || '');
    formData.append('type', mediaData.type || 'photo');

    return post(`/vendors/services/${serviceId}/portfolio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPortfolio: (serviceId) => get(`/vendors/services/${serviceId}/portfolio`),
  deletePortfolioItem: (serviceId, mediaId) => 
    del(`/vendors/services/${serviceId}/portfolio/${mediaId}`),

  // Certifications
  submitCertification: (serviceId, certificationData) => {
    const formData = new FormData();
    formData.append('type', certificationData.type);
    formData.append('document', certificationData.document);
    if (certificationData.issuedDate) formData.append('issuedDate', certificationData.issuedDate);
    if (certificationData.expiryDate) formData.append('expiryDate', certificationData.expiryDate);
    if (certificationData.issuingAuthority) formData.append('issuingAuthority', certificationData.issuingAuthority);

    return post(`/vendors/services/${serviceId}/certifications`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getCertifications: (serviceId) => get(`/vendors/services/${serviceId}/certifications`),
  deleteCertification: (serviceId, certificationId) => 
    del(`/vendors/services/${serviceId}/certifications/${certificationId}`),

  // Events and Engagement
  getEvents: () => get('/vendors/events'),
  getEventEngagement: (eventId, filters = {}) => {
    const params = {};
    if (filters.sessionId) params.sessionId = filters.sessionId;
    if (filters.dateRange) params.dateRange = JSON.stringify(filters.dateRange);
    return get(`/vendors/events/${eventId}/engagement`, { params });
  },
  getLeads: (eventId, filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.dateRange) params.dateRange = JSON.stringify(filters.dateRange);
    return get(`/vendors/events/${eventId}/leads`, { params });
  },
  
  // Feedback
  submitEventFeedback: (eventId, feedbackData) => 
    post(`/vendors/events/${eventId}/feedback`, {
      ratings: feedbackData.ratings,
      comments: feedbackData.comments || null,
      submittedBy: feedbackData.submittedBy || 'anonymous',
    }),
  getEventFeedback: (eventId, filters = {}) => {
    const params = {};
    if (filters.submittedBy) params.submittedBy = filters.submittedBy;
    if (filters.rating) params.rating = filters.rating;
    return get(`/vendors/events/${eventId}/feedback`, { params });
  },

  // Integrations
  updateIntegrationPreferences: (preferencesData) => 
    put('/vendors/integrations', {
      paymentMethods: preferencesData.paymentMethods || [],
      crmIntegrations: preferencesData.crmIntegrations || [],
    }),
  getIntegrationPreferences: () => get('/vendors/integrations'),

  // Search (for vendors to find other vendors or for organizers to find vendors)
  searchVendors: (filters = {}) => {
    const params = {};
    if (filters.serviceType) params.serviceType = filters.serviceType;
    if (filters.location) params.location = JSON.stringify(filters.location);
    if (filters.availability) params.availability = JSON.stringify(filters.availability);
    if (filters.capacity) params.capacity = JSON.stringify(filters.capacity);
    if (filters.rating) params.rating = filters.rating;
    return get('/vendors/search', { params });
  },
};

// Organizer API calls
export const organizerApi = {
  // Event Management
  getEvents: () => get('/organizer/events'),
  getEvent: (eventId) => get(`/organizer/events/${eventId}`),
  createEvent: (data) => {
    const eventData = {
      eventType: data.eventType,
      expectedAttendance: data.expectedAttendance,
      budgetRange: data.budgetRange,
      preferredDates: data.preferredDates,
      locations: data.locations,
      vendorPreferences: data.vendorPreferences || [],
      marketingChannels: data.marketingChannels || [],
      integrationNeeds: data.integrationNeeds || [],
      ...data // Include any additional fields
    };
    return post('/organizer/events', eventData);
  },
  updateEvent: (eventId, data) => {
    const eventData = {
      eventType: data.eventType,
      expectedAttendance: data.expectedAttendance,
      budgetRange: data.budgetRange,
      preferredDates: data.preferredDates,
      locations: data.locations,
      vendorPreferences: data.vendorPreferences,
      marketingChannels: data.marketingChannels,
      integrationNeeds: data.integrationNeeds,
      ...data // Include any additional fields
    };
    return put(`/organizer/events/${eventId}`, eventData);
  },
  deleteEvent: (eventId) => del(`/organizer/events/${eventId}`),
  
  // Vendor Management
  getAvailableVendors: (eventId, filters = {}) => {
    const params = {
      serviceType: filters.serviceType,
      location: filters.location ? JSON.stringify(filters.location) : null,
      budget: filters.budget ? JSON.stringify(filters.budget) : null,
      availability: filters.availability ? JSON.stringify(filters.availability) : null,
    };
    return get(`/organizer/events/${eventId}/vendors/available`, { params });
  },
  assignVendor: (eventId, vendorId, serviceData) =>
    post(`/organizer/events/${eventId}/vendors/${vendorId}`, { serviceData }),
  unassignVendor: (eventId, vendorId) => del(`/organizer/events/${eventId}/vendors/${vendorId}`),
  
  // Organizer Profile
  getOrganizerProfile: () => get('/organizer/profile'),
  updateOrganizerProfile: (profileData) => {
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
    return put('/organizer/profile', formattedData);
  },
  
  // Billing & Invoicing
  updateBillingInfo: (billingData) => {
    const formattedData = {
      billingAddress: billingData.billingAddress,
      paymentMethod: billingData.paymentMethod,
      billingEmail: billingData.billingEmail || null,
    };
    return put('/organizer/billing', formattedData);
  },
  
  // Analytics
  getTicketSales: (eventId, filters = {}) => {
    const params = {
      dateRange: filters.dateRange ? JSON.stringify(filters.dateRange) : null,
      ticketType: filters.ticketType || null,
    };
    return get(`/organizer/events/${eventId}/analytics/ticket-sales`, { params });
  },
  
  getAttendeeEngagement: (eventId, filters = {}) => {
    const params = {
      sessionId: filters.sessionId || null,
      dateRange: filters.dateRange ? JSON.stringify(filters.dateRange) : null,
      metric: filters.metric || null,
    };
    return get(`/organizer/events/${eventId}/analytics/engagement`, { params });
  },
  
  getVendorPerformance: (eventId, vendorId, filters = {}) => {
    const params = {
      dateRange: filters.dateRange ? JSON.stringify(filters.dateRange) : null,
      metric: filters.metric || null,
    };
    return get(`/organizer/events/${eventId}/vendors/${vendorId}/performance`, { params });
  },
  
  // Feedback
  getPostEventFeedback: (eventId, filters = {}) => {
    const params = {
      source: filters.source || null,
      rating: filters.rating || null,
    };
    return get(`/organizer/events/${eventId}/feedback`, { params });
  },
  
  submitPostEventFeedback: (eventId, feedbackData) => {
    const formattedData = {
      ratings: feedbackData.ratings,
      comments: feedbackData.comments || null,
      source: feedbackData.source || 'organizer',
    };
    return post(`/organizer/events/${eventId}/feedback`, formattedData);
  },
  
  // Integrations
  updateIntegrationPreferences: (integrationData) => {
    const formattedData = {
      crmIntegrations: integrationData.crmIntegrations || [],
      paymentGateways: integrationData.paymentGateways || [],
      socialMediaApis: integrationData.socialMediaApis || [],
    };
    return put('/organizer/integrations', formattedData);
  },
  
  getIntegrationPreferences: () => get('/organizer/integrations'),
  
  connectCrm: (crmType, credentials) =>
    post(`/organizer/integrations/crm/${crmType}`, credentials),
    
  connectPaymentGateway: (gatewayType, credentials) =>
    post(`/organizer/integrations/payment/${gatewayType}`, credentials),
    
  connectSocialMedia: (platform, credentials) =>
    post(`/organizer/integrations/social/${platform}`, credentials),
    
  // Data Privacy
  updateDataPrivacyPreferences: (privacyData) => {
    const formattedData = {
      dataRetention: privacyData.dataRetention || 'standard',
      anonymizeAnalytics: privacyData.anonymizeAnalytics || false,
      optOutMarketing: privacyData.optOutMarketing || false,
    };
    return put('/organizer/privacy', formattedData);
  },
  
  // Marketing Analytics
  getMarketingAnalytics: (eventId, filters = {}) => {
    const params = {
      channel: filters.channel || null,
      dateRange: filters.dateRange ? JSON.stringify(filters.dateRange) : null,
    };
    return get(`/organizer/events/${eventId}/analytics/marketing`, { params });
  },
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
