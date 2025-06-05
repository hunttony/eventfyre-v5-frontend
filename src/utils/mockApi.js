import { mockApiCall } from './mockDataService';

// Always use mock data for now to ensure it works
const USE_MOCK = true;

console.log('[Mock API] Initializing mock API client');

// Helper function to handle mock API calls with error handling
const handleMockCall = async (endpoint, params = {}) => {
  if (!USE_MOCK) {
    throw new Error('Real API not implemented');
  }
  
  try {
    console.log(`[Mock API] ${endpoint} called with params:`, params);
    const result = await mockApiCall(endpoint, params);
    console.log(`[Mock API] ${endpoint} result:`, result);
    return result;
  } catch (error) {
    console.error(`[Mock API] Error in ${endpoint}:`, error);
    throw error; // Re-throw to allow component to handle it
  }
};

// Import the mock data service
import mockDataService from './mockDataService';

// Mock implementation of the API that falls back to mock data
const mockApi = {
  // Authentication endpoints
  register: async (userData) => {
    console.log('[mockApi] Registering user:', userData);
    try {
      const result = await mockDataService.register(userData);
      console.log('[mockApi] Registration result:', result);
      return result;
    } catch (error) {
      console.error('[mockApi] Registration error:', error);
      throw error;
    }
  },
  
  login: async (credentials) => {
    console.log('[mockApi] Logging in user:', credentials.email);
    try {
      const result = await mockDataService.login(credentials);
      console.log('[mockApi] Login result:', result);
      return result;
    } catch (error) {
      console.error('[mockApi] Login error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    console.log('[mockApi] Getting current user');
    try {
      const result = await mockDataService.getCurrentUser();
      console.log('[mockApi] Current user:', result);
      return result;
    } catch (error) {
      console.error('[mockApi] Get current user error:', error);
      throw error;
    }
  },
  
  // Event listing endpoints
  getUpcomingEvents: async () => {
    console.log('[mockApi] Getting upcoming events');
    const result = await handleMockCall('getUpcomingEvents');
    console.log('[mockApi] Upcoming events result:', result);
    return result;
  },
  getPastEvents: async () => {
    console.log('[mockApi] Getting past events');
    const result = await handleMockCall('getPastEvents');
    console.log('[mockApi] Past events result:', result);
    return result;
  },
  getSavedEvents: async () => {
    console.log('[mockApi] Getting saved events');
    try {
      const result = await handleMockCall('getSavedEvents');
      console.log('[mockApi] Saved events result:', result);
      return result;
    } catch (error) {
      console.error('[mockApi] Error getting saved events:', error);
      return { data: [] }; // Return empty array on error
    }
  },
  searchEvents: async (query) => handleMockCall('searchEvents', { query }),
  
  // Event details
  getEventDetails: async (eventId) => handleMockCall('getEventDetails', { eventId }),
  saveEvent: async (eventId) => handleMockCall('saveEvent', { eventId }),
  unsaveEvent: async (eventId) => handleMockCall('unsaveEvent', { eventId }),
  
  // Registration and attendance
  registerForEvent: async (eventId, data) => 
    handleMockCall('registerForEvent', { eventId, ...data }),
    
  cancelRegistration: async (eventId) => 
    handleMockCall('cancelRegistration', { eventId }),
    
  // Attendee management
  getEventAttendees: async (eventId, filters = {}) => 
    handleMockCall('getEventAttendees', { eventId, ...filters }),
    
  checkInToSession: async (eventId, sessionId, attendeeId) => 
    handleMockCall('checkInToSession', { eventId, sessionId, attendeeId }),
    
  submitFeedback: async (eventId, feedbackData) => 
    handleMockCall('submitFeedback', { eventId, ...feedbackData }),
    
  trackInteraction: async (eventId, interactionData) => 
    handleMockCall('trackInteraction', { eventId, ...interactionData }),
    
  updateRegistration: async (eventId, data) => 
    handleMockCall('updateRegistration', { eventId, ...data }),
    
  // Attendee profiles and sessions
  getAttendeeProfile: async (eventId, attendeeId) => 
    handleMockCall('getAttendeeProfile', { eventId, attendeeId }),
    
  getAttendeeSessions: async (eventId, attendeeId) => 
    handleMockCall('getAttendeeSessions', { eventId, attendeeId }),
    
  updateAttendeeStatus: async (eventId, attendeeId, status) => 
    handleMockCall('updateAttendeeStatus', { eventId, attendeeId, status }),
    
  // Vendor and schedule
  getEventVendors: async (eventId) => 
    handleMockCall('getEventVendors', { eventId }),
    
  getEventSchedule: async (eventId) => 
    handleMockCall('getEventSchedule', { eventId }),
    
  // Vendor API endpoints
  // Vendor Profile
  getVendorProfile: async () => 
    handleMockCall('getVendorProfile'),
    
  updateVendorProfile: async (data) => 
    handleMockCall('updateVendorProfile', data),
    
  // Vendor Services
  getVendorServices: async () => 
    handleMockCall('getVendorServices'),
    
  createVendorService: async (data) => 
    handleMockCall('createVendorService', data),
    
  updateVendorService: async (serviceId, data) => 
    handleMockCall('updateVendorService', { serviceId, ...data }),
    
  deleteVendorService: async (serviceId) => 
    handleMockCall('deleteVendorService', { serviceId }),
    
  // Portfolio Management
  getServicePortfolio: async (serviceId) => 
    handleMockCall('getServicePortfolio', { serviceId }),
    
  uploadPortfolioItem: async (serviceId, data) => 
    handleMockCall('uploadPortfolioItem', { serviceId, ...data }),
    
  deletePortfolioItem: async (itemId) => 
    handleMockCall('deletePortfolioItem', { itemId }),
    
  // Certifications
  getServiceCertifications: async (serviceId) => 
    handleMockCall('getServiceCertifications', { serviceId }),
    
  uploadCertification: async (serviceId, data) => 
    handleMockCall('uploadCertification', { serviceId, ...data }),
    
  deleteCertification: async (certId) => 
    handleMockCall('deleteCertification', { certId }),
    
  // Bookings & Availability
  getVendorBookings: async (filters = {}) => 
    handleMockCall('getVendorBookings', filters),
    
  updateVendorAvailability: async (data) => 
    handleMockCall('updateVendorAvailability', data),
    
  // Reviews
  getVendorReviews: async (vendorId) => 
    handleMockCall('getVendorReviews', { vendorId }),
    
  // Search
  searchVendors: async (filters = {}) => 
    handleMockCall('searchVendors', filters)
};

// Export both named and default for compatibility
export const mockEventsApi = mockApi;
export { mockApi };
export default mockApi;
