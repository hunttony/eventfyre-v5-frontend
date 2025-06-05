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

// Mock implementation of eventsApi that falls back to mock data
const mockEventsApi = {
  // Event listing endpoints
  getUpcomingEvents: async () => handleMockCall('getUpcomingEvents'),
  getPastEvents: async () => handleMockCall('getPastEvents'),
  getSavedEvents: async () => handleMockCall('getSavedEvents'),
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
    handleMockCall('getEventSchedule', { eventId })
};

export default mockEventsApi;
