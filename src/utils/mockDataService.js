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

// Generate mock feedback
const generateAttendeeFeedback = (eventId, attendeeId) => {
  const ratings = [1, 2, 3, 4, 5];
  const comments = [
    'Great event!',
    'Had a wonderful time!',
    'Could be better organized',
    'Amazing speakers!',
    'Venue was too crowded',
    'Loved the networking session',
    'Food could be improved',
    'Will definitely attend again',
    'Good variety of topics',
    'Technical issues with the app'
  ];
  
  return {
    id: `feedback-${eventId}-${attendeeId}`,
    eventId,
    attendeeId,
    rating: ratings[Math.floor(Math.random() * ratings.length)],
    comment: comments[Math.floor(Math.random() * comments.length)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Generate mock organizers and vendors
const mockOrganizers = [
  {
    id: 'org-1',
    name: 'Tech Events Inc.',
    email: 'events@techevents.com',
    phone: '+1234567890',
    website: 'https://techevents.com',
    bio: 'Leading organizer of technology events and conferences.'
  },
  {
    id: 'org-2',
    name: 'Music Festivals Co.',
    email: 'info@musicfests.com',
    phone: '+1987654321',
    website: 'https://musicfests.com',
    bio: 'Organizing the best music festivals around the world.'
  }
];

const mockVendors = [
  {
    id: 'vendor-1',
    name: 'Catering Delight',
    email: 'contact@cateringdelight.com',
    phone: '+1122334455',
    services: ['Catering', 'Beverages'],
    rating: 4.8
  },
  {
    id: 'vendor-2',
    name: 'Sound Systems Pro',
    email: 'info@soundsystems.pro',
    phone: '+1567890123',
    services: ['Audio Equipment', 'Lighting'],
    rating: 4.9
  }
];

// Generate mock events with organizer and vendor data
const generateMockEvents = (count) => {
  const events = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isPast = i % 3 === 0; // 1/3 of events are in the past
    const startDate = new Date(now);
    const endDate = new Date(now);
    
    if (isPast) {
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30) - 1);
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3) + 1);
    } else {
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) + 1);
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3) + 1);
    }
    
    const organizer = mockOrganizers[Math.floor(Math.random() * mockOrganizers.length)];
    const vendors = [];
    
    // Add 1-3 vendors to each event
    const vendorCount = Math.floor(Math.random() * 3) + 1;
    const availableVendors = [...mockVendors];
    
    for (let j = 0; j < vendorCount && availableVendors.length > 0; j++) {
      const vendorIndex = Math.floor(Math.random() * availableVendors.length);
      vendors.push(availableVendors.splice(vendorIndex, 1)[0]);
    }
    
    events.push({
      id: `event-${i + 1}`,
      title: `Event ${i + 1}`,
      description: `This is a description for Event ${i + 1}. It's going to be amazing!`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location: {
        venue: `Venue ${i + 1}`,
        address: `${i + 100} Main St, City ${i + 1}`,
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA'
      },
      image: sampleImages[i % sampleImages.length],
      category: ['Technology', 'Music', 'Business', 'Food', 'Arts'][i % 5],
      capacity: 100 + (i * 10),
      price: (10 + (i * 5)).toFixed(2),
      organizerId: organizer.id,
      organizer,
      vendors,
      status: isPast ? 'completed' : 'upcoming',
      createdAt: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date(now.getTime() - (i * 12 * 60 * 60 * 1000)).toISOString()
    });
  }
  
  return events;
};

// Initialize mock data
const mockEvents = generateMockEvents(20);
const mockAttendees = generateMockAttendees(50);

// Mock organizer data
const mockOrganizer = {
  id: 'org-1',
  name: 'EventPro Organizers',
  email: 'contact@eventpro.com',
  phone: '+1234567890',
  website: 'https://eventpro.com',
  description: 'Professional event organizers with over 10 years of experience in creating memorable events.',
  logo: getRandomImage(200, 200, 'eventpro-logo'),
  bannerImage: getRandomImage(1200, 400, 'eventpro-banner'),
  socialMedia: {
    facebook: 'facebook.com/eventpro',
    twitter: 'twitter.com/eventpro',
    instagram: 'instagram.com/eventpro',
    linkedin: 'linkedin.com/company/eventpro'
  },
  address: {
    street: '123 Event St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  taxId: '12-3456789',
  businessRegistrationNumber: 'BUS-12345678',
  createdAt: new Date('2020-01-01').toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock API call handler
export const mockApiCall = (data, error = null, delay = 300) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) {
        const errorObj = new Error(error.message || 'An error occurred');
        errorObj.response = { data: error };
        reject(errorObj);
      } else {
        // For successful responses, ensure we return an object with data property
        const response = typeof data === 'object' ? data : { data };
        resolve(response);
      }
    }, delay);
  });
};

// Mock user data by type
const mockUsers = {
  organizer: {
    id: 'org-1',
    name: 'Organizer User',
    email: 'organizer@example.com',
    role: 'organizer',
    // Add other organizer-specific fields
  },
  vendor: {
    id: 'vendor-1',
    name: 'Vendor User',
    email: 'vendor@example.com',
    role: 'vendor',
    // Add other vendor-specific fields
  },
  attendee: {
    id: 'attendee-1',
    name: 'Attendee User',
    email: 'attendee@example.com',
    role: 'attendee',
    // Add other attendee-specific fields
  }
};

// Mock API implementation
const mockApi = {
  // Event-related endpoints
  getUpcomingEvents: () => {
    try {
      const now = new Date();
      const upcomingEvents = mockEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate > now;
      });
      
      return mockApiCall({
        data: {
          events: upcomingEvents,
          total: upcomingEvents.length,
          page: 1,
          limit: 10
        }
      });
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return mockApiCall({ data: { events: [], total: 0, page: 1, limit: 10 } });
    }
  },
  
  getPastEvents: () => {
    try {
      const now = new Date();
      const pastEvents = mockEvents.filter(event => {
        const eventDate = new Date(event.endDate || event.startDate);
        return eventDate < now;
      });
      
      return mockApiCall({
        data: {
          events: pastEvents,
          total: pastEvents.length,
          page: 1,
          limit: 10
        }
      });
    } catch (error) {
      console.error('Error getting past events:', error);
      return mockApiCall({ data: { events: [], total: 0, page: 1, limit: 10 } });
    }
  },
  getSavedEvents() {
    // Return a subset of upcoming events as saved events
    const upcoming = mockEvents.filter(event => new Date(event.endDate) > new Date());
    const savedEvents = upcoming.slice(0, Math.min(3, upcoming.length));
    return mockApiCall({
      success: true,
      data: {
        events: savedEvents,
        total: savedEvents.length,
        page: 1,
        limit: 10
      }
    });
  },

  getEventDetails: (eventId) => {
    const event = mockEvents.find(e => e.id === eventId) || mockEvents[0];
    return {
      status: 200,
      data: {
        ...event,
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
            bio: 'John specializes in frontend development and user experience design.'
          }
        ]
      }
    };
  },

  // User registration and authentication
  register: async (userData) => {
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      registeredAt: new Date().toISOString(),
      status: 'active'
    };
    
    return mockApiCall({
      success: true,
      message: 'Registration successful',
      user: newUser
    });
  },

  // Login function
  login: async (credentials) => {
    // Mock validation - in a real app, this would validate against a database
    if (!credentials.email || !credentials.password) {
      return mockApiCall(null, { message: 'Email and password are required' }, 400);
    }

    // Special case for tonyj@gmail.com - treat as organizer
    if (credentials.email === 'tonyj@gmail.com') {
      const organizerUser = {
        ...mockUsers.organizer,
        email: 'tonyj@gmail.com',
        token: 'mock-jwt-token-organizer',
        refreshToken: 'mock-refresh-token-organizer'
      };
      
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(organizerUser));
      
      return mockApiCall({
        success: true,
        message: 'Login successful',
        user: organizerUser,
        token: 'mock-jwt-token-organizer'
      });
    }

    // Determine user type based on email prefix or other criteria
    let userType = 'attendee';
    if (credentials.email.includes('organizer')) {
      userType = 'organizer';
    } else if (credentials.email.includes('vendor')) {
      userType = 'vendor';
    }

    // Get the mock user data
    const user = {
      ...mockUsers[userType],
      email: credentials.email,
      token: `mock-jwt-token-${userType}`,
      refreshToken: `mock-refresh-token-${userType}`
    };

    // Store user in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(user));
    
    return mockApiCall({
      success: true,
      message: 'Login successful',
      user,
      token: `mock-jwt-token-${userType}`
    });
  },
  
  // Get current user
  getCurrentUser: () => {
    try {
      const userJson = localStorage.getItem('user');
      if (!userJson) {
        return mockApiCall({ error: 'No user found' }, null, 401);
      }
      const user = JSON.parse(userJson);
      return mockApiCall({ data: user });
    } catch (error) {
      console.error('Error getting current user:', error);
      return mockApiCall(null, { message: 'Failed to get current user' }, 500);
    }
  },
  
  updateProfile: async (formData) => {
    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!currentUser || !currentUser.id) {
        return mockApiCall(null, { message: 'User not authenticated' }, 401);
      }

      // Convert FormData to plain object if it's a FormData instance
      let updateData = formData;
      if (formData instanceof FormData) {
        updateData = {};
        for (let [key, value] of formData.entries()) {
          updateData[key] = value;
        }
      }
      
      // Update user data
      const updatedUser = {
        ...currentUser,
        ...updateData,
        // Preserve important fields that shouldn't be overwritten
        id: currentUser.id,
        role: currentUser.role,
        token: currentUser.token
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Return updated user data
      return mockApiCall({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
        userData: updatedUser // Keep for backward compatibility
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return mockApiCall(null, { message: 'Failed to update profile' }, 500);
    }
  },
  
  // Get organizer events (for organizers)
  getOrganizerEvents: () => {
    try {
      // Filter events where the current user is the organizer
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const organizerEvents = mockEvents.filter(event => 
        event.organizerId === user.id || event.organizerId === 'org-1'
      );
      
      return mockApiCall({
        data: {
          events: organizerEvents,
          total: organizerEvents.length,
          page: 1,
          limit: 10
        }
      });
    } catch (error) {
      console.error('Error getting organizer events:', error);
      return mockApiCall({ data: { events: [], total: 0, page: 1, limit: 10 } });
    }
  },
  
  // Get vendor events (for vendors)
  getVendorEvents: () => {
    try {
      // Filter events where the current vendor is participating
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const vendorEvents = mockEvents.filter(event => 
        event.vendors?.some(v => v.id === user.id) || 
        event.vendors?.some(v => v.id === 'vendor-1')
      );
      
      return mockApiCall({
        data: {
          events: vendorEvents,
          total: vendorEvents.length,
          page: 1,
          limit: 10
        }
      });
    } catch (error) {
      console.error('Error getting vendor events:', error);
      return mockApiCall({ data: { events: [], total: 0, page: 1, limit: 10 } });
    }
  },
  
  // Attendee-related endpoints
  registerForEvent: (eventId, data) => {
    const newAttendee = {
      id: `attendee-${mockAttendees.length + 1}`,
      ...data,
      registeredAt: new Date().toISOString(),
      status: 'registered'
    };
    mockAttendees.push(newAttendee);
    
    return {
      status: 201,
      data: newAttendee
    };
  },

  getEventAttendees: (eventId, filters = {}) => {
    let attendees = [...mockAttendees];
    
    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      attendees = attendees.filter(attendee => 
        attendee.fullName.toLowerCase().includes(searchTerm) ||
        attendee.email.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.ticketType) {
      attendees = attendees.filter(attendee => attendee.ticketType === filters.ticketType);
    }
    
    if (filters.status) {
      attendees = attendees.filter(attendee => attendee.status === filters.status);
    }
    
    return {
      status: 200,
      data: attendees
    };
  },

  // Organizer endpoints
  getOrganizerProfile: () => ({
    status: 200,
    data: mockOrganizer
  }),

  updateOrganizerProfile: (data) => {
    Object.assign(mockOrganizer, data, { updatedAt: new Date().toISOString() });
    return {
      status: 200,
      data: mockOrganizer,
      message: 'Organizer profile updated successfully'
    };
  },

  updateBillingInfo: (data) => ({
    status: 200,
    data: {
      ...data,
      updatedAt: new Date().toISOString(),
      message: 'Billing information updated successfully'
    }
  }),

  updatePrivacyPreferences: (data) => ({
    status: 200,
    data: {
      ...data,
      updatedAt: new Date().toISOString(),
      message: 'Privacy preferences updated successfully'
    }
  }),

  getEventAnalytics: (eventId, type = 'ticket-sales', filters = {}) => {
    // Generate mock analytics data based on type
    let data = [];
    const now = new Date();
    
    if (type === 'ticket-sales') {
      data = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ticketsSold: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 1000
      }));
    } else if (type === 'attendance') {
      data = {
        totalRegistered: Math.floor(Math.random() * 500) + 100,
        checkedIn: Math.floor(Math.random() * 400) + 50,
        attendanceRate: Math.floor(Math.random() * 30) + 60 // 60-90%
      };
    }
    
    return {
      status: 200,
      data
    };
  },

  getEventFeedback: (eventId, filters = {}) => {
    const feedback = [];
    
    // Generate feedback for a subset of attendees
    const attendeesForFeedback = mockAttendees.filter(() => Math.random() > 0.7);
    
    attendeesForFeedback.forEach(attendee => {
      feedback.push(generateAttendeeFeedback(eventId, attendee.id));
    });
    
    // Calculate average rating
    const averageRating = feedback.length > 0 
      ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)
      : 0;
    
    return {
      status: 200,
      data: {
        feedback,
        summary: {
          totalResponses: feedback.length,
          averageRating: parseFloat(averageRating),
          ratingDistribution: [1, 2, 3, 4, 5].map(rating => ({
            rating,
            count: feedback.filter(f => f.rating === rating).length
          }))
        }
      }
    };
  },

  addIntegration: (type, credentials) => {
    const integration = {
      id: `int-${Math.random().toString(36).substr(2, 9)}`,
      type,
      isActive: true,
      connectedAt: new Date().toISOString(),
      ...credentials
    };
    
    if (!mockOrganizer.integrations) {
      mockOrganizer.integrations = [];
    }
    
    mockOrganizer.integrations.push(integration);
    
    return {
      status: 201,
      data: integration,
      message: 'Integration added successfully'
    };
  },

  removeIntegration: (type, integrationId) => {
    if (!mockOrganizer.integrations) {
      return {
        status: 404,
        error: 'No integrations found',
        message: 'No integrations are currently configured'
      };
    }
    
    const initialLength = mockOrganizer.integrations.length;
    mockOrganizer.integrations = mockOrganizer.integrations.filter(
      i => !(i.type === type && i.id === integrationId)
    );
    
    if (mockOrganizer.integrations.length === initialLength) {
      return {
        status: 404,
        error: 'Integration not found',
        message: `No ${type} integration with ID ${integrationId} was found`
      };
    }
    
    return {
      status: 200,
      message: 'Integration removed successfully'
    };
  },

  updateConsent: (consentData) => {
    Object.assign(mockOrganizer.consent || {}, consentData, { updatedAt: new Date().toISOString() });
    return {
      status: 200,
      data: mockOrganizer.consent,
      message: 'Consent preferences updated successfully'
    };
  },

  // Utility endpoints
  getAttendeeProfile: (eventId, attendeeId) => {
    const attendee = mockAttendees.find(a => a.id === attendeeId);
    
    if (!attendee) {
      return {
        status: 404,
        error: 'Attendee not found',
        message: `No attendee found with ID ${attendeeId}`
      };
    }
    
    // Generate some mock check-in data
    const checkIns = [];
    const event = mockEvents.find(e => e.id === eventId);
    
    if (event) {
      const checkInTime = new Date(event.startDate);
      checkInTime.setHours(9, Math.floor(Math.random() * 60), 0, 0);
      
      checkIns.push({
        id: `checkin-${attendeeId}-${eventId}`,
        eventId,
        checkInTime: checkInTime.toISOString(),
        checkedInBy: 'system',
        location: 'Main Entrance',
        notes: 'Checked in via mobile app'
      });
    }
    
    return {
      status: 200,
      data: {
        ...attendee,
        checkIns,
        feedback: [generateAttendeeFeedback(eventId, attendeeId)]
      }
    };
  }
};

export default mockApi;
