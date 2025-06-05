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

// Generate mock vendors
const generateMockVendors = (count = 10) => {
  const businessTypes = ['Catering', 'Photography', 'Entertainment', 'Venue', 'Decor', 'AV Equipment', 'Security', 'Transportation'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
  const serviceAreas = [
    ['10001', '10002', '10003'],
    ['90001', '90002', '90003'],
    ['60601', '60602', '60603'],
    ['77001', '77002', '77003'],
    ['85001', '85002', '85003'],
    ['19101', '19102', '19103'],
    ['78201', '78202', '78203'],
    ['92101', '92102', '92103']
  ];

  return Array.from({ length: count }, (_, i) => {
    const cityIndex = i % cities.length;
    const businessType = businessTypes[i % businessTypes.length];
    const businessName = `${businessType} ${['Pro', 'Elite', 'Premier', 'Global', 'Elite'][i % 5]} ${businessType} ${['Services', 'Solutions', 'Group', 'Co.', 'Inc.'][i % 5]}`;
    
    return {
      id: `vendor-${i + 1}`,
      businessName,
      description: `Professional ${businessType.toLowerCase()} services with ${['5', '10', '15', '20+'][i % 4]} years of experience in the industry.`,
      contactDetails: {
        email: `contact@${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `+1${Math.floor(2000000000 + Math.random() * 8000000000)}`,
        website: `https://${businessName.toLowerCase().replace(/\s+/g, '')}.com`
      },
      location: {
        address: `${Math.floor(100 + Math.random() * 9000)} ${['Main', 'Oak', 'Pine', 'Maple', 'Cedar'][i % 5]} St`,
        city: cities[cityIndex],
        state: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA'][cityIndex],
        zipCode: serviceAreas[cityIndex][0],
        serviceArea: serviceAreas[cityIndex],
        coordinates: {
          lat: 40.7128 - (i * 0.1) + (Math.random() * 0.2),
          lng: -74.0060 + (i * 0.1) - (Math.random() * 0.2)
        }
      },
      serviceTypes: [businessType],
      rating: (4 + Math.random()).toFixed(1),
      reviewCount: Math.floor(Math.random() * 100) + 5,
      isVerified: Math.random() > 0.3,
      yearsInBusiness: Math.floor(Math.random() * 20) + 1,
      minBudget: [500, 1000, 2000, 5000][i % 4],
      maxBudget: [5000, 10000, 20000, 50000][i % 4],
      languages: ['English', 'Spanish', 'French', 'Mandarin'].slice(0, Math.floor(Math.random() * 3) + 1),
      availability: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '10:00', close: '15:00' },
        sunday: 'closed'
      },
      socialMedia: {
        facebook: `https://facebook.com/${businessName.toLowerCase().replace(/\s+/g, '')}`,
        instagram: `https://instagram.com/${businessName.toLowerCase().replace(/\s+/g, '')}`,
        twitter: `https://twitter.com/${businessName.toLowerCase().replace(/\s+/g, '')}`
      },
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
};

// Generate mock vendor services
const generateMockVendorServices = (vendorId, count = 1) => {
  const serviceTypes = [
    { type: 'Catering', description: 'Full-service catering for events of all sizes' },
    { type: 'Photography', description: 'Professional event photography services' },
    { type: 'Videography', description: 'High-quality event videography' },
    { type: 'DJ', description: 'Professional DJ services for any occasion' },
    { type: 'Floral', description: 'Custom floral arrangements and decor' },
    { type: 'Lighting', description: 'Event lighting design and installation' },
    { type: 'Rentals', description: 'Event equipment and furniture rentals' },
    { type: 'Staffing', description: 'Professional event staff and servers' }
  ];

  return Array.from({ length: count }, (_, i) => {
    const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const pricingType = ['hourly', 'daily', 'flat', 'perPerson'][Math.floor(Math.random() * 4)];
    const price = [50, 75, 100, 150, 200, 300, 500][Math.floor(Math.random() * 7)];
    
    return {
      id: `service-${vendorId}-${i + 1}`,
      vendorId,
      serviceType: serviceType.type,
      description: serviceType.description,
      pricingStructure: {
        type: pricingType,
        amount: price,
        currency: 'USD',
        notes: pricingType === 'perPerson' ? 'Minimum 25 guests' : '4-hour minimum',
        packages: [
          { name: 'Basic', price: price, description: 'Basic service package' },
          { name: 'Premium', price: Math.round(price * 1.5), description: 'Premium service package with additional features' }
        ]
      },
      capacityLimits: {
        minGuests: 10,
        maxGuests: [50, 100, 200, 500][Math.floor(Math.random() * 4)]
      },
      isActive: true,
      requiresSetup: Math.random() > 0.5,
      setupTime: [15, 30, 60, 120][Math.floor(Math.random() * 4)],
      teardownTime: [15, 30, 60][Math.floor(Math.random() * 3)],
      cancellationPolicy: '50% refund if cancelled at least 14 days in advance',
      depositRequired: true,
      depositAmount: Math.round(price * 0.25),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
};

// Generate mock portfolio items
const generateMockPortfolioItems = (serviceId, count = 3) => {
  const types = ['image', 'image', 'image', 'video'];
  const captions = [
    'Wedding Reception', 'Corporate Event', 'Birthday Party', 'Conference',
    'Product Launch', 'Charity Gala', 'Music Festival', 'Trade Show'
  ];

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const isVideo = type === 'video';
    const caption = captions[Math.floor(Math.random() * captions.length)];
    
    return {
      id: `portfolio-${serviceId}-${i + 1}`,
      serviceId,
      type,
      url: isVideo 
        ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' 
        : `https://picsum.photos/seed/${serviceId}-${i + 1}/800/600`,
      thumbnailUrl: `https://picsum.photos/seed/thumb-${serviceId}-${i + 1}/300/200`,
      caption: `${caption} - ${isVideo ? 'Video' : 'Photo'}`,
      featured: i === 0,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString()
    };
  });
};

// Generate mock certifications
const generateMockCertifications = (serviceId, count = 2) => {
  const types = [
    'Food Safety Certification',
    'Business License',
    'Liquor License',
    'Insurance Certificate',
    'Health Department Permit'
  ];

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const issuedDate = new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000);
    
    return {
      id: `cert-${serviceId}-${i + 1}`,
      serviceId,
      type,
      documentUrl: 'https://example.com/certificate.pdf',
      issuedDate: issuedDate.toISOString(),
      expiryDate: new Date(issuedDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      issuingAuthority: `${type.split(' ')[0]} Board`,
      isVerified: Math.random() > 0.3,
      verifiedAt: new Date(issuedDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
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

// Initialize mock data
const mockVendors = generateMockVendors(15);
const mockVendorServices = [];
const mockPortfolioItems = [];
const mockCertifications = [];

// Generate services, portfolio items, and certifications for each vendor
mockVendors.forEach(vendor => {
  const services = generateMockVendorServices(vendor.id, Math.floor(Math.random() * 3) + 1);
  mockVendorServices.push(...services);
  
  services.forEach(service => {
    const portfolioItems = generateMockPortfolioItems(service.id, Math.floor(Math.random() * 5) + 1);
    const certifications = generateMockCertifications(service.id, Math.floor(Math.random() * 3) + 1);
    
    mockPortfolioItems.push(...portfolioItems);
    mockCertifications.push(...certifications);
  });
});

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
  
  updateAttendeeStatus: async (eventId, attendeeId, data) => {
    console.log(`[Mock API] updateAttendeeStatus called with eventId: ${eventId}, attendeeId: ${attendeeId}`, data);
    // In a real implementation, this would update the attendee's status in the database
    return {
      status: 200,
      data: {
        success: true,
        message: 'Attendee status updated successfully',
        attendee: {
          id: attendeeId,
          status: data.status,
          updatedAt: new Date().toISOString()
        }
      }
    };
  },

  // Vendor API endpoints
  getVendorProfile: async () => {
    // In a real app, this would get the logged-in vendor's profile
    const vendor = mockVendors[0]; // Simulate logged-in vendor
    return {
      status: 200,
      data: vendor
    };
  },

  updateVendorProfile: async (data) => {
    // In a real app, this would update the vendor's profile in the database
    const updatedVendor = { ...mockVendors[0], ...data, updatedAt: new Date().toISOString() };
    return {
      status: 200,
      data: {
        success: true,
        message: 'Vendor profile updated successfully',
        vendor: updatedVendor
      }
    };
  },

  getVendorServices: async () => {
    // In a real app, this would get the logged-in vendor's services
    const vendorServices = mockVendorServices.filter(s => s.vendorId === mockVendors[0].id);
    return {
      status: 200,
      data: vendorServices
    };
  },

  createVendorService: async (data) => {
    // In a real app, this would create a new service for the vendor
    const newService = {
      id: `service-${mockVendorServices.length + 1}`,
      vendorId: mockVendors[0].id,
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockVendorServices.push(newService);
    
    return {
      status: 201,
      data: {
        success: true,
        message: 'Service created successfully',
        service: newService
      }
    };
  },

  updateVendorService: async (serviceId, data) => {
    // In a real app, this would update the service in the database
    const serviceIndex = mockVendorServices.findIndex(s => s.id === serviceId);
    if (serviceIndex === -1) {
      return {
        status: 404,
        data: {
          success: false,
          message: 'Service not found'
        }
      };
    }
    
    const updatedService = {
      ...mockVendorServices[serviceIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    mockVendorServices[serviceIndex] = updatedService;
    
    return {
      status: 200,
      data: {
        success: true,
        message: 'Service updated successfully',
        service: updatedService
      }
    };
  },

  deleteVendorService: async (serviceId) => {
    // In a real app, this would delete the service from the database
    const serviceIndex = mockVendorServices.findIndex(s => s.id === serviceId);
    if (serviceIndex === -1) {
      return {
        status: 404,
        data: {
          success: false,
          message: 'Service not found'
        }
      };
    }
    
    mockVendorServices.splice(serviceIndex, 1);
    
    return {
      status: 200,
      data: {
        success: true,
        message: 'Service deleted successfully'
      }
    };
  },

  getServicePortfolio: async (serviceId) => {
    // In a real app, this would get the portfolio items for a service
    const portfolio = mockPortfolioItems.filter(item => item.serviceId === serviceId);
    return {
      status: 200,
      data: portfolio
    };
  },

  uploadPortfolioItem: async (serviceId, data) => {
    // In a real app, this would upload the portfolio item to storage
    const newItem = {
      id: `portfolio-${mockPortfolioItems.length + 1}`,
      serviceId,
      ...data,
      createdAt: new Date().toISOString()
    };
    
    mockPortfolioItems.push(newItem);
    
    return {
      status: 201,
      data: {
        success: true,
        message: 'Portfolio item uploaded successfully',
        item: newItem
      }
    };
  },

  deletePortfolioItem: async (itemId) => {
    // In a real app, this would delete the portfolio item from storage
    const itemIndex = mockPortfolioItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return {
        status: 404,
        data: {
          success: false,
          message: 'Portfolio item not found'
        }
      };
    }
    
    mockPortfolioItems.splice(itemIndex, 1);
    
    return {
      status: 200,
      data: {
        success: true,
        message: 'Portfolio item deleted successfully'
      }
    };
  },

  getServiceCertifications: async (serviceId) => {
    // In a real app, this would get the certifications for a service
    const certs = mockCertifications.filter(cert => cert.serviceId === serviceId);
    return {
      status: 200,
      data: certs
    };
  },

  uploadCertification: async (serviceId, data) => {
    // In a real app, this would upload the certification document
    const newCert = {
      id: `cert-${mockCertifications.length + 1}`,
      serviceId,
      ...data,
      isVerified: false,
      verifiedAt: null,
      createdAt: new Date().toISOString()
    };
    
    mockCertifications.push(newCert);
    
    return {
      status: 201,
      data: {
        success: true,
        message: 'Certification uploaded successfully',
        certification: newCert
      }
    };
  },

  deleteCertification: async (certId) => {
    // In a real app, this would delete the certification
    const certIndex = mockCertifications.findIndex(cert => cert.id === certId);
    if (certIndex === -1) {
      return {
        status: 404,
        data: {
          success: false,
          message: 'Certification not found'
        }
      };
    }
    
    mockCertifications.splice(certIndex, 1);
    
    return {
      status: 200,
      data: {
        success: true,
        message: 'Certification deleted successfully'
      }
    };
  },

  getVendorBookings: async (filters = {}) => {
    // In a real app, this would get the vendor's bookings with optional filters
    const bookings = []; // Mock bookings would be generated here
    return {
      status: 200,
      data: bookings
    };
  },

  updateVendorAvailability: async (data) => {
    // In a real app, this would update the vendor's availability in the database
    return {
      status: 200,
      data: {
        success: true,
        message: 'Availability updated successfully',
        availability: data
      }
    };
  },

  getVendorReviews: async (vendorId) => {
    // In a real app, this would get reviews for the vendor
    const reviews = []; // Mock reviews would be generated here
    return {
      status: 200,
      data: reviews
    };
  },

  searchVendors: async (filters = {}) => {
    // In a real app, this would search vendors based on filters
    let results = [...mockVendors];
    
    // Apply filters
    if (filters.serviceType) {
      results = results.filter(vendor => 
        vendor.serviceTypes.includes(filters.serviceType)
      );
    }
    
    if (filters.location) {
      const location = JSON.parse(filters.location);
      results = results.filter(vendor => 
        vendor.location.city === location.city || 
        vendor.location.zipCode === location.zipCode
      );
    }
    
    if (filters.rating) {
      results = results.filter(vendor => 
        parseFloat(vendor.rating) >= parseFloat(filters.rating)
      );
    }
    
    return {
      status: 200,
      data: {
        results,
        total: results.length,
        page: 1,
        limit: 10
      }
    };
  }
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
