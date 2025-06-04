/**
 * Mock Data Service for development and testing
 * Provides mock data when API endpoints are not available
 */

// Sample event images using Picsum Photos with consistent but varied images
const getRandomImage = (width = 800, height = 500, seed = null) => {
  const imageId = seed || Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/event-${imageId}/${width}/${height}`;
};

// Generate sample images with different seeds
const sampleImages = [
  getRandomImage(800, 500, 'conference'),
  getRandomImage(800, 500, 'concert'),
  getRandomImage(800, 500, 'workshop'),
  getRandomImage(800, 500, 'exhibition'),
  getRandomImage(800, 500, 'meeting')
];

// Generate mock events
const generateMockEvents = (count = 10) => {
  const eventTemplates = [
    {
      title: 'Tech Conference 2023',
      description: 'Annual technology conference featuring the latest in software development and innovation.',
      category: 'Technology',
      type: 'Conference',
    },
    {
      title: 'Music Festival',
      description: 'Weekend music festival with top artists from around the world.',
      category: 'Music',
      type: 'Festival',
    },
    {
      title: 'Startup Pitch Competition',
      description: 'Watch as entrepreneurs pitch their startup ideas to a panel of investors.',
      category: 'Business',
      type: 'Competition',
    },
    {
      title: 'Art Exhibition',
      description: 'Local artists showcase their latest works in this exclusive exhibition.',
      category: 'Art',
      type: 'Exhibition',
    },
    {
      title: 'Charity Gala',
      description: 'An elegant evening of dining and entertainment to support a good cause.',
      category: 'Charity',
      type: 'Gala',
    },
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = eventTemplates[i % eventTemplates.length];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + i);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 4);

    return {
      id: `event-${i + 1}`,
      ...template,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location: `${['New York', 'San Francisco', 'Chicago', 'Austin', 'Seattle'][i % 5]}, USA`,
      imageUrl: sampleImages[i % sampleImages.length],
      price: [0, 10, 25, 50, 100][i % 5],
      capacity: [50, 100, 200, 500, 1000][i % 5],
      availableTickets: Math.floor(Math.random() * 100) + 10,
      organizer: `Org-${String.fromCharCode(65 + (i % 5))} Inc.`,
      tags: ['tech', 'conference', 'networking'].slice(0, (i % 3) + 1),
      isSaved: Math.random() > 0.5,
      isRegistered: Math.random() > 0.7,
    };
  });
};

// Mock API responses
const mockApi = {
  getUpcomingEvents: () => ({
    status: 200,
    data: generateMockEvents(5).filter((_, i) => i % 2 === 0),
  }),
  
  getPastEvents: () => ({
    status: 200,
    data: generateMockEvents(3).map(event => ({
      ...event,
      startDate: new Date(Date.now() - 86400000 * (Math.floor(Math.random() * 30) + 1)).toISOString(),
      endDate: new Date(Date.now() - 86400000 * (Math.floor(Math.random() * 30))).toISOString(),
    })),
  }),
  
  getSavedEvents: () => ({
    status: 200,
    data: generateMockEvents(4).filter((_, i) => i % 2 === 1),
  }),
  
  getEventDetails: (eventId) => ({
    status: 200,
    data: {
      ...generateMockEvents(1)[0],
      id: eventId,
      description: 'Extended description with more details about the event. This would include the full agenda, speaker information, and other relevant details that attendees might need to know before registering for the event.',
      agenda: [
        { time: '09:00 AM', title: 'Registration & Breakfast' },
        { time: '10:00 AM', title: 'Opening Keynote' },
        { time: '11:30 AM', title: 'Breakout Sessions' },
        { time: '12:30 PM', title: 'Lunch & Networking' },
        { time: '02:00 PM', title: 'Workshops' },
        { time: '04:00 PM', title: 'Closing Remarks' },
      ],
      speakers: [
        { name: 'Jane Doe', title: 'CTO at TechCorp', image: 'https://i.pravatar.cc/150?img=1' },
        { name: 'John Smith', title: 'Senior Developer at DevHouse', image: 'https://i.pravatar.cc/150?img=2' },
      ],
      faqs: [
        { question: 'What should I bring?', answer: 'Just yourself and a valid ID for registration.' },
        { question: 'Is there parking available?', answer: 'Yes, we have complimentary parking for all attendees.' },
      ],
    },
  }),
};

// Mock API calls with delay to simulate network request
export const mockApiCall = (endpoint, params = {}) => {
  return new Promise((resolve) => {
    console.log(`[Mock Data] Starting ${endpoint} call with params:`, params);
    
    // Simulate network delay with a random time between 300-800ms
    const delay = 300 + Math.random() * 500;
    
    setTimeout(() => {
      console.log(`[Mock Data] Processing ${endpoint} after ${Math.round(delay)}ms`);
      
      try {
        // Get the mock handler function
        const handler = mockApi[endpoint];
        console.log(`[Mock Data] Found handler for ${endpoint}:`, !!handler);
        
        if (typeof handler === 'function') {
          console.log(`[Mock Data] Calling handler for ${endpoint}`);
          const mockResponse = handler(params);
          
          // Ensure we have a valid response
          if (mockResponse && typeof mockResponse === 'object') {
            console.log(`[Mock Data] ${endpoint} success, data length:`, 
              Array.isArray(mockResponse.data) ? mockResponse.data.length : 'N/A');
            resolve(mockResponse);
            return;
          } else {
            console.warn(`[Mock Data] Invalid response from ${endpoint}:`, mockResponse);
          }
        } else {
          console.warn(`[Mock Data] No handler found for endpoint: ${endpoint}`);
        }
        
        // Fallback response if something goes wrong
        console.warn(`[Mock Data] Using fallback response for ${endpoint}`);
        resolve({
          status: 200,
          data: [
            { id: 'fallback-1', title: `Fallback ${endpoint} Item 1` },
            { id: 'fallback-2', title: `Fallback ${endpoint} Item 2` },
          ]
        });
        
      } catch (error) {
        console.error(`[Mock Data] Error in ${endpoint}:`, error);
        resolve({
          status: 500,
          error: 'Internal server error in mock data',
          details: error.message,
          stack: error.stack
        });
      }
    }, delay);
  });
};

export default mockApi;
