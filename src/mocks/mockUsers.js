// Mock users for development and testing
// WARNING: These are test credentials - never use real passwords in production code

export const mockUsers = [
  // Vendor Accounts
  {
    id: 'user1',
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    fullName: 'John Doe',
    role: 'vendor',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'Professional event vendor with 5+ years experience',
    phone: '+1 (555) 123-4567'
  },
  {
    id: 'user3',
    username: 'alex_wong',
    email: 'alex@example.com',
    password: 'password123',
    fullName: 'Alex Wong',
    role: 'vendor',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'Event services specialist',
    phone: '+1 (555) 234-5678'
  },
  
  // Organizer Accounts
  {
    id: 'user2',
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    fullName: 'Jane Smith',
    role: 'organizer',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    company: 'Event Masters Inc.',
    phone: '+1 (555) 345-6789'
  },
  {
    id: 'user4',
    username: 'sarah_lee',
    email: 'sarah@example.com',
    password: 'password123',
    fullName: 'Sarah Lee',
    role: 'organizer',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    company: 'Celebration Planners',
    phone: '+1 (555) 456-7890'
  },
  
  // Attendee Accounts
  {
    id: 'user5',
    username: 'mike_johnson',
    email: 'mike@example.com',
    password: 'password123',
    fullName: 'Mike Johnson',
    role: 'attendee',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    interests: ['music', 'technology', 'networking'],
    phone: '+1 (555) 567-8901'
  },
  {
    id: 'user6',
    username: 'emily_chen',
    email: 'emily@example.com',
    password: 'password123',
    fullName: 'Emily Chen',
    role: 'attendee',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    interests: ['art', 'design', 'workshops'],
    phone: '+1 (555) 678-9012'
  },
  {
    id: 'user7',
    username: 'david_kim',
    email: 'david@example.com',
    password: 'password123',
    fullName: 'David Kim',
    role: 'attendee',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    interests: ['business', 'startups', 'innovation'],
    phone: '+1 (555) 789-0123'
  },
  {
    id: 'user8',
    username: 'sophia_rodriguez',
    email: 'sophia@example.com',
    password: 'password123',
    fullName: 'Sophia Rodriguez',
    role: 'attendee',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    interests: ['education', 'community', 'networking'],
    phone: '+1 (555) 890-1234'
  }
];

// Find user by credentials
export const findUser = (usernameOrEmail, password) => {
  return mockUsers.find(user => 
    (user.username === usernameOrEmail || user.email === usernameOrEmail) && 
    user.password === password
  );
};

// Get user by ID
export const getUserById = (userId) => {
  return mockUsers.find(user => user.id === userId);
};
