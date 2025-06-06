import { get, post, put, del } from './api';
import { mockApi } from './mockApi';

// Check if we should use mock API
const USE_MOCK = true;

// Helper function to handle mock API responses
const handleMockResponse = async (mockFn) => {
  if (!USE_MOCK || !mockFn) return null;
  
  try {
    // Ensure mockFn is a function before calling it
    if (typeof mockFn !== 'function') {
      console.warn('mockFn is not a function:', mockFn);
      return null;
    }
    
    const response = await mockFn();
    // If the response already has a data property, return it as is
    if (response && typeof response === 'object' && 'data' in response) {
      return response;
    }
    // Otherwise wrap the response in a data property
    return { data: response };
  } catch (error) {
    console.warn('Mock API error, falling back to default data:', error);
    return null; // Return null to trigger fallback behavior
  }
};

export const eventsApi = {
  // Get upcoming events
  getUpcomingEvents: async () => {
    try {
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = user?.role || 'attendee';
      
      // Get appropriate mock function based on user role
      let mockResponse;
      try {
        if (userRole === 'organizer') {
          // Use getUpcomingEvents for organizer as fallback if getOrganizerEvents doesn't exist
          mockResponse = await handleMockResponse(mockApi.getOrganizerEvents || mockApi.getUpcomingEvents);
        } else if (userRole === 'vendor') {
          // Use getUpcomingEvents for vendor as fallback if getVendorEvents doesn't exist
          mockResponse = await handleMockResponse(mockApi.getVendorEvents || mockApi.getUpcomingEvents);
        } else {
          // Default to getUpcomingEvents for all other roles
          mockResponse = await handleMockResponse(mockApi.getUpcomingEvents);
        }
        if (mockResponse) return mockResponse;
      } catch (error) {
        console.warn('Error in mock API call, falling back to default events:', error);
        // Fall through to return default empty response
      }
      
      // Fallback to real API if mock is disabled
      return get('/events/upcoming');
    } catch (error) {
      console.error('Error in getUpcomingEvents:', error);
      return { data: { events: [], total: 0, page: 1, limit: 10 } };
    }
  },

  // Get past events
  getPastEvents: async () => {
    try {
      const mockResponse = await handleMockResponse(mockApi.getPastEvents);
      if (mockResponse) return mockResponse;
      return get('/events/past');
    } catch (error) {
      console.error('Error in getPastEvents:', error);
      return { data: { events: [], total: 0, page: 1, limit: 10 } };
    }
  },

  // Get saved events
  getSavedEvents: async () => {
    try {
      const mockResponse = await handleMockResponse(mockApi.getSavedEvents);
      if (mockResponse) return mockResponse;
      return get('/events/saved');
    } catch (error) {
      console.error('Error in getSavedEvents:', error);
      return { data: { events: [], total: 0, page: 1, limit: 10 } };
    }
  },

  // Search events
  searchEvents: async (query) => {
    if (USE_MOCK) {
      const response = await mockApi.getUpcomingEvents();
      const events = response.data?.events || [];
      const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
      );
      return { events: filteredEvents, total: filteredEvents.length };
    }
    return get('/events/search', { params: { query } });
  },

  // Get event details
  getEventDetails: async (eventId) => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user?.role || 'attendee';
    
    // Get mock response with user role context
    const mockResponse = await handleMockResponse(() => 
      mockApi.getEventDetails(eventId, userRole)
    );
    
    if (mockResponse !== null) return mockResponse;
    return get(`/events/${eventId}`);
  },

  // Save/unsave event
  saveEvent: async (eventId) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Saving event ${eventId}`);
      return { success: true };
    }
    return post(`/events/${eventId}/save`);
  },

  unsaveEvent: async (eventId) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Unsaving event ${eventId}`);
      return { success: true };
    }
    return del(`/events/${eventId}/save`);
  },

  // Event registration
  registerForEvent: async (eventId, data) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Registering for event ${eventId}`, data);
      return { 
        success: true, 
        data: { 
          registrationId: `reg-${Date.now()}`,
          eventId,
          attendeeId: `attendee-${Date.now()}`,
          ticketType: data.ticketType || 'general',
          registrationDate: new Date().toISOString()
        } 
      };
    }
    return post(`/events/${eventId}/register`, data);
  },

  cancelRegistration: async (eventId) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Canceling registration for event ${eventId}`);
      return { success: true };
    }
    return del(`/events/${eventId}/register`);
  },

  // Event attendees
  getEventAttendees: async (eventId, filters = {}) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Getting attendees for event ${eventId}`, filters);
      const response = await mockApi.getEventDetails(eventId);
      const attendees = response.data?.attendees || [];
      return { attendees, total: attendees.length };
    }
    return get(`/events/${eventId}/attendees`, { params: filters });
  },

  // Event vendors
  getEventVendors: async (eventId) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Getting vendors for event ${eventId}`);
      return { vendors: [], total: 0 };
    }
    return get(`/events/${eventId}/vendors`);
  },

  // Event schedule
  getEventSchedule: async (eventId) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Getting schedule for event ${eventId}`);
      return { sessions: [] };
    }
    return get(`/events/${eventId}/schedule`);
  },

  // Session check-in
  checkInToSession: async (eventId, sessionId, attendeeId) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Checking in attendee ${attendeeId} to session ${sessionId}`);
      return { success: true };
    }
    return post(`/events/${eventId}/sessions/${sessionId}/check-in`, { attendeeId });
  },

  // Feedback
  submitFeedback: async (eventId, feedbackData) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Submitting feedback for event ${eventId}`, feedbackData);
      return { success: true };
    }
    return post(`/events/${eventId}/feedback`, {
      attendeeId: feedbackData.attendeeId,
      ratings: feedbackData.ratings,
      comments: feedbackData.comments || null,
    });
  },

  // Track interaction
  trackInteraction: async (eventId, interactionData) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Tracking interaction for event ${eventId}`, interactionData);
      return { success: true };
    }
    return post(`/events/${eventId}/interactions`, {
      attendeeId: interactionData.attendeeId,
      type: interactionData.type,
      details: interactionData.details || {},
    });
  },

  // Update registration
  updateRegistration: async (eventId, data) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Updating registration for event ${eventId}`, data);
      return { success: true };
    }
    return put(`/events/${eventId}/register`, data);
  },

  // Get attendee profile
  getAttendeeProfile: async (eventId, attendeeId) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Getting profile for attendee ${attendeeId}`);
      return { 
        id: attendeeId, 
        name: 'Mock Attendee', 
        email: 'mock@example.com',
        ticketType: 'general',
        registrationDate: new Date().toISOString()
      };
    }
    return get(`/events/${eventId}/attendees/${attendeeId}`);
  },

  // Get attendee sessions
  getAttendeeSessions: async (eventId, attendeeId) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Getting sessions for attendee ${attendeeId}`);
      return { sessions: [] };
    }
    return get(`/events/${eventId}/attendees/${attendeeId}/sessions`);
  },

  // Update attendee status
  updateAttendeeStatus: async (eventId, attendeeId, status) => {
    if (USE_MOCK) {
      console.log(`[Mock API] Updating status for attendee ${attendeeId} to ${status}`);
      return { success: true };
    }
    return put(`/events/${eventId}/attendees/${attendeeId}/status`, { status });
  }
};

export default eventsApi;
