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

// Generate mock attendees
const generateMockAttendees = (count = 10) => {
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'James', 'Jennifer'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
  const interestsList = ['Technology', 'Music', 'Art', 'Business', 'Networking', 'Food', 'Travel', 'Fitness', 'Education', 'Entertainment'];
  
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const numInterests = Math.floor(Math.random() * 4) + 1;
    const shuffledInterests = [...interestsList].sort(() => 0.5 - Math.random());
    
    return {
      id: `attendee-${i + 1}`,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phoneNumber: `+1${Math.floor(2000000000 + Math.random() * 8000000000)}`,
      ageRange: `${Math.floor(Math.random() * 5) * 10 + 18}-${Math.floor(Math.random() * 5) * 10 + 28}`,
      location: {
        city,
        zipCode: String(10000 + Math.floor(Math.random() * 90000))
      },
      interests: shuffledInterests.slice(0, numInterests),
      ticketType: ['general', 'vip', 'premium', 'student'][Math.floor(Math.random() * 4)],
      sessionPreferences: [],
      dietaryRestrictions: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Nut allergy'][Math.floor(Math.random() * 5)],
      accessibilityNeeds: Math.random() > 0.8 ? 'Wheelchair access required' : 'None',
      socialMediaHandles: {
        twitter: `@${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        linkedin: `linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`
      },
      consent: {
        smsUpdates: Math.random() > 0.5,
        behavioralTracking: Math.random() > 0.5,
        socialMedia: Math.random() > 0.5
      },
      registeredAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date().toISOString(),
      status: ['registered', 'checked-in', 'attended', 'no-show'][Math.floor(Math.random() * 4)]
    };
  });
};

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

// Generate mock feedback
const generateMockFeedback = (eventId, attendeeId) => {
  const ratings = {
    overall: Math.floor(Math.random() * 5) + 1,
    content: Math.floor(Math.random() * 5) + 1,
    speakers: Math.floor(Math.random() * 5) + 1,
    venue: Math.floor(Math.random() * 5) + 1,
    organization: Math.floor(Math.random() * 5) + 1
  };
  
  const comments = [
    'Great event! Learned a lot.',
    'The speakers were very knowledgeable.',
    'Venue was excellent.',
    'Could improve on time management.',
    'Looking forward to the next one!',
    'The food could be better.',
    'Very well organized event.',
    'The sessions were too short.'
  ];
  
  return {
    id: `feedback-${eventId}-${attendeeId}`,
    eventId,
    attendeeId,
    ratings,
    comments: comments[Math.floor(Math.random() * comments.length)],
    submittedAt: new Date().toISOString()
  };
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
  
  getEventDetails: (eventId) => {
    const event = generateMockEvents(1)[0];
    return {
      status: 200,
      data: {
        ...event,
        id: eventId,
        description: 'Extended description with more details about the event. This would include the full agenda, speaker information, and other relevant details that attendees might need to know before registering for the event.',
        agenda: [
          { id: 'session-1', time: '09:00 AM', title: 'Registration & Breakfast' },
          { id: 'session-2', time: '10:00 AM', title: 'Opening Keynote' },
          { id: 'session-3', time: '11:30 AM', title: 'Breakout Sessions' },
          { id: 'session-4', time: '12:30 PM', title: 'Lunch & Networking' },
          { id: 'session-5', time: '02:00 PM', title: 'Workshops' },
          { id: 'session-6', time: '04:00 PM', title: 'Closing Remarks' },
        ],
        speakers: [
          { 
            id: 'speaker-1',
            name: 'Jane Doe', 
            title: 'CTO at TechCorp', 
            image: 'https://i.pravatar.cc/150?img=1',
            bio: 'Jane has over 10 years of experience in technology leadership roles.'
          },
          { 
            id: 'speaker-2',
            name: 'John Smith', 
            title: 'Senior Developer at DevHouse', 
            image: 'https://i.pravatar.cc/150?img=2',
            bio: 'John specializes in modern web development and architecture.'
          },
        ],
        faqs: [
          { question: 'What should I bring?', answer: 'Just yourself and a valid ID for registration.' },
          { question: 'Is there parking available?', answer: 'Yes, we have complimentary parking for all attendees.' },
        ],
        totalAttendees: Math.floor(Math.random() * 500) + 50,
        maxAttendees: 1000,
        registrationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isRegistered: Math.random() > 0.5,
      },
    };
  },
  
  // Attendee-related endpoints
  registerForEvent: (eventId, data) => {
    console.log(`[Mock API] Registering for event ${eventId} with data:`, data);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Registration successful',
        registrationId: `reg-${Date.now()}`,
        eventId,
        attendee: {
          id: `attendee-${Date.now()}`,
          ...data,
          status: 'registered',
          registeredAt: new Date().toISOString(),
        }
      }
    };
  },
  
  getEventAttendees: (eventId, filters = {}) => {
    console.log(`[Mock API] Getting attendees for event ${eventId} with filters:`, filters);
    let attendees = generateMockAttendees(15 + Math.floor(Math.random() * 15));
    
    // Apply filters
    if (filters.ticketType) {
      attendees = attendees.filter(a => a.ticketType === filters.ticketType);
    }
    if (filters.ageRange) {
      attendees = attendees.filter(a => a.ageRange === filters.ageRange);
    }
    if (filters.interests) {
      const interestFilters = Array.isArray(filters.interests) ? filters.interests : [filters.interests];
      attendees = attendees.filter(a => 
        a.interests.some(interest => interestFilters.includes(interest))
      );
    }
    
    return {
      status: 200,
      data: {
        success: true,
        count: attendees.length,
        attendees,
        filtersApplied: Object.keys(filters).length > 0 ? filters : null
      }
    };
  },
  
  checkInToSession: (eventId, sessionId, data) => {
    console.log(`[Mock API] Checking in to session ${sessionId} in event ${eventId} for attendee:`, data.attendeeId);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Check-in successful',
        checkInTime: new Date().toISOString(),
        sessionId,
        attendeeId: data.attendeeId,
        eventId
      }
    };
  },
  
  submitFeedback: (eventId, data) => {
    console.log(`[Mock API] Submitting feedback for event ${eventId} from attendee:`, data.attendeeId);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Feedback submitted successfully',
        feedback: generateMockFeedback(eventId, data.attendeeId)
      }
    };
  },
  
  trackInteraction: (eventId, data) => {
    console.log(`[Mock API] Tracking interaction for event ${eventId}:`, data.type, data.details);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Interaction tracked',
        timestamp: new Date().toISOString()
      }
    };
  },
  
  updateRegistration: (eventId, data) => {
    console.log(`[Mock API] Updating registration for event ${eventId}:`, data);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Registration updated successfully',
        registration: {
          id: `reg-${Date.now()}`,
          eventId,
          ...data,
          updatedAt: new Date().toISOString()
        }
      }
    };
  },
  
  getAttendeeProfile: (eventId, attendeeId) => {
    console.log(`[Mock API] Getting profile for attendee ${attendeeId} in event ${eventId}`);
    const attendee = {
      ...generateMockAttendees(1)[0],
      id: attendeeId,
      eventId,
      sessionsAttended: Math.floor(Math.random() * 5),
      feedbackSubmitted: Math.random() > 0.5,
      lastActive: new Date().toISOString()
    };
    
    return {
      status: 200,
      data: {
        success: true,
        attendee
      }
    };
  },
  
  getAttendeeSessions: (eventId, attendeeId) => {
    console.log(`[Mock API] Getting sessions for attendee ${attendeeId} in event ${eventId}`);
    const event = {
      ...generateMockEvents(1)[0],
      id: eventId,
      agenda: [
        { id: 'session-1', time: '09:00 AM', title: 'Registration & Breakfast', attended: true },
        { id: 'session-2', time: '10:00 AM', title: 'Opening Keynote', attended: Math.random() > 0.3 },
        { id: 'session-3', time: '11:30 AM', title: 'Breakout Sessions', attended: Math.random() > 0.3 },
        { id: 'session-4', time: '12:30 PM', title: 'Lunch & Networking', attended: Math.random() > 0.3 },
        { id: 'session-5', time: '02:00 PM', title: 'Workshops', attended: Math.random() > 0.3 },
        { id: 'session-6', time: '04:00 PM', title: 'Closing Remarks', attended: Math.random() > 0.3 },
      ]
    };
    
    return {
      status: 200,
      data: {
        success: true,
        sessions: event.agenda,
        totalSessions: event.agenda.length,
        attendedSessions: event.agenda.filter(s => s.attended).length
      }
    };
  },
  
  updateAttendeeStatus: (eventId, attendeeId, data) => {
    console.log(`[Mock API] Updating status for attendee ${attendeeId} in event ${eventId}:`, data.status);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Attendee status updated successfully',
        attendeeId,
        eventId,
        status: data.status,
        updatedAt: new Date().toISOString()
      }
    };
  },
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
