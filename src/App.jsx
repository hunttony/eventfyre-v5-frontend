import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import axios from 'axios';
import './App.css';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Unauthorized from './components/auth/Unauthorized';
import LandingPage from './components/landing/LandingPage';

// Import all dashboard components
import OrganizerDashboard from './components/organizer/dashboard/OrganizerDashboard';
import EventDetail from './components/organizer/EventDetail';
import VendorSelection from './components/organizer/VendorSelection';
import VendorEvents from './components/VendorEvents';
import AttendeeDashboard from './components/attendee/dashboard/AttendeeDashboard';
import TestApiConnection from './components/test/TestApiConnection';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Profile from './components/common/Profile';
import Messaging from './components/Messaging';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  console.log('[ProtectedRoute] Current user:', currentUser);
  console.log('[ProtectedRoute] Required roles:', roles);
  console.log('[ProtectedRoute] Current path:', location.pathname);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

// Layout Components
const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <Link to="/attendee/dashboard/">
        <h2 className="text-center text-3xl font-extrabold text-indigo-600">EventFyre</h2>
      </Link>
    </div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {children}
      </div>
    </div>
  </div>
);

const EventCard = ({ event }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <img 
      src={event.image || `https://picsum.photos/seed/event-${event.id || 'default'}/400/200`} 
      alt={event.title}
      className="w-full h-48 object-cover"
    />
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
      <p className="text-gray-600 mb-2">{event.date} • {event.location}</p>
      <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
      <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
        View Details
      </button>
    </div>
  </div>
);

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchEvents = async () => {
      try {
        // Replace with actual API endpoint
        // const response = await axios.get('/api/events');
        // setEvents(response.data);
        
        // Mock data for now
        setTimeout(() => {
          setEvents([
            {
              id: 1,
              title: 'Tech Conference 2023',
              date: '2023-12-15',
              location: 'San Francisco, CA',
              description: 'Annual technology conference featuring the latest in web development and AI.',
              image: 'https://source.unsplash.com/random/800x400/?conference'
            },
            {
              id: 2,
              title: 'Music Festival',
              date: '2023-11-20',
              location: 'Austin, TX',
              description: 'Three days of amazing music and performances from top artists.',
              image: 'https://source.unsplash.com/random/800x400/?music-festival'
            },
            {
              id: 3,
              title: 'Startup Pitch Night',
              date: '2023-12-05',
              location: 'New York, NY',
              description: 'Watch promising startups pitch their ideas to investors.',
              image: 'https://source.unsplash.com/random/800x400/?startup'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would submit to your backend
    console.log('Form submitted:', formData);
    alert('Event created successfully!');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Event Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition font-medium text-lg"
        >
          Create Event
        </button>
      </form>
    </div>
  );
};

const AppRoutes = () => {
  const { currentUser, isLoading } = useAuth();
  
  return (
    <Routes>
      {/* Test Route - Remove in production */}
      <Route path="/test-api" element={<TestApiConnection />} />
      
      {/* Public Routes */}
      <Route path="/login" element={
        isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : currentUser ? 
        <Navigate to={
          currentUser.role === 'organizer' ? '/organizer/dashboard' :
          currentUser.role === 'vendor' ? '/vendor/dashboard' :
          '/attendee/dashboard'
        } replace /> : 
        <AuthLayout><Login /></AuthLayout>
      } />
      
      <Route path="/register" element={
  isLoading ? (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  ) : currentUser ? 
  <Navigate to={
    currentUser.role === 'organizer' ? '/organizer/dashboard' :
    currentUser.role === 'vendor' ? '/vendor/dashboard' :
    '/attendee/dashboard'
  } replace /> : 
  <AuthLayout><Register /></AuthLayout>
} />
      
      <Route path="/forgot-password" element={
        <AuthLayout><ForgotPassword /></AuthLayout>
      } />
      
      <Route path="/reset-password/:token" element={
        <AuthLayout><ResetPassword /></AuthLayout>
      } />
      
      <Route path="/unauthorized" element={
        <MainLayout>
          <Unauthorized />
        </MainLayout>
      } />

      {/* Organizer Routes */}
      <Route path="/organizer" element={
        <ProtectedRoute roles={['organizer']}>
          <MainLayout>
            <OrganizerDashboard />
          </MainLayout>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="events" element={<OrganizerDashboard />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="events/:id/vendors" element={<VendorSelection />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Vendor Routes */}
      <Route path="/vendor" element={
        <ProtectedRoute roles={['vendor']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VendorEvents />} />
        <Route path="events" element={<VendorEvents />} />
      </Route>
      
      {/* Attendee Routes */}
      <Route path="/attendee/dashboard" element={
  <ProtectedRoute roles={['attendee']}>
    <MainLayout>
      <AttendeeDashboard />
    </MainLayout>
  </ProtectedRoute>
} />

      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/messages" element={
        <ProtectedRoute>
          <MainLayout>
            <Messaging />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Default Route */}``
      <Route path="/" element={
        isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : currentUser ? (
          <Navigate to={
            currentUser.role === 'organizer' ? '/organizer/dashboard' :
            currentUser.role === 'vendor' ? '/vendor/dashboard' :
            '/attendee/dashboard'
          } replace />
        ) : (
          <LandingPage />
        )
      } />
      
      {/* Redirect old login path to root */}
      <Route path="/login" element={
        isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : currentUser ? 
        <Navigate to={
          currentUser.role === 'organizer' ? '/organizer/dashboard' :
          currentUser.role === 'vendor' ? '/vendor/dashboard' :
          '/attendee/dashboard'
        } replace /> : 
        <AuthLayout><Login /></AuthLayout>
      } />

      {/* 404 Route */}
      <Route path="*" element={
        <MainLayout>
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <p className="mt-4 text-lg text-gray-600">Page not found</p>
            <Link 
              to="/landingpage" 
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go back home
            </Link>
          </div>
        </MainLayout>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
