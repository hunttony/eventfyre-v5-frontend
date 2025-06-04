import { mockApiCall } from './mockDataService';

// Always use mock data for now to ensure it works
const USE_MOCK = true;

console.log('[Mock API] Initializing mock API client');

// Mock implementation of eventsApi that falls back to mock data
const mockEventsApi = {
  getUpcomingEvents: async () => {
    console.log('[Mock API] getUpcomingEvents called');
    try {
      const result = await mockApiCall('getUpcomingEvents');
      console.log('[Mock API] getUpcomingEvents result:', result);
      return result;
    } catch (error) {
      console.error('[Mock API] Error in getUpcomingEvents:', error);
      // Return some default data if there's an error
      return {
        status: 200,
        data: [
          { id: 'up-1', title: 'Upcoming Event 1' },
          { id: 'up-2', title: 'Upcoming Event 2' },
        ]
      };
    }
  },
  
  getPastEvents: async () => {
    console.log('[Mock API] getPastEvents called');
    try {
      const result = await mockApiCall('getPastEvents');
      console.log('[Mock API] getPastEvents result:', result);
      return result;
    } catch (error) {
      console.error('[Mock API] Error in getPastEvents:', error);
      return {
        status: 200,
        data: [
          { id: 'past-1', title: 'Past Event 1' },
        ]
      };
    }
  },
  
  getSavedEvents: async () => {
    console.log('[Mock API] getSavedEvents called');
    try {
      const result = await mockApiCall('getSavedEvents');
      console.log('[Mock API] getSavedEvents result:', result);
      return result;
    } catch (error) {
      console.error('[Mock API] Error in getSavedEvents:', error);
      return {
        status: 200,
        data: [
          { id: 'saved-1', title: 'Saved Event 1' },
          { id: 'saved-2', title: 'Saved Event 2' },
          { id: 'saved-3', title: 'Saved Event 3' },
        ]
      };
    }
  },
  
  getEventDetails: async (eventId) => {
    if (USE_MOCK) {
      return mockApiCall('getEventDetails', { eventId });
    }
    throw new Error('Real API not implemented');
  },
  
  // Add other event-related API methods as needed
};

export default mockEventsApi;
