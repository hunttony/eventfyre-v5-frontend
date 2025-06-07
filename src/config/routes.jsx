import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load components for better performance
const Login = lazy(() => import('../components/auth/Login'));
const Register = lazy(() => import('../components/auth/Register'));
const ForgotPassword = lazy(() => import('../components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../components/auth/ResetPassword'));
const Unauthorized = lazy(() => import('../components/auth/Unauthorized'));
const LandingPage = lazy(() => import('../components/landing/LandingPage'));
const OrganizerDashboard = lazy(() => import('../components/organizer/dashboard/OrganizerDashboard'));
const EventDetail = lazy(() => import('../components/organizer/EventDetail'));
const VendorSelection = lazy(() => import('../components/organizer/VendorSelection'));
const VendorEvents = lazy(() => import('../components/VendorEvents'));
const VendorDashboard = lazy(() => import('../components/Vendor/dashboard/VendorDashboard'));
const MyAvailability = lazy(() => import('../components/Vendor/dashboard/MyAvailability'));
const MyServices = lazy(() => import('../components/Vendor/dashboard/MyServices'));
const AttendeeDashboard = lazy(() => import('../components/attendee/dashboard/AttendeeDashboard'));
const Profile = lazy(() => import('../components/common/Profile'));
const Messaging = lazy(() => import('../components/Messaging'));

// Test routes (only in development)
const TestApiConnection = lazy(() => import('../components/test/TestApiConnection'));
const MockApiTest = lazy(() => import('../components/test/MockApiTest'));

// Loading component for lazy loading
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

// Public routes (no authentication required)
export const publicRoutes = [
  {
    path: '/login',
    element: <Login />,
    layout: 'auth'
  },
  {
    path: '/register',
    element: <Register />,
    layout: 'auth'
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    layout: 'auth'
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
    layout: 'auth'
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
    layout: 'main'
  },
  {
    path: '/',
    element: <LandingPage />,
    layout: 'main'
  }
];

// Protected routes (authentication required)
export const protectedRoutes = [
  // Organizer routes
  {
    path: '/organizer',
    element: <Navigate to="dashboard" replace />,
    roles: ['organizer']
  },
  {
    path: '/organizer/dashboard',
    element: <OrganizerDashboard />,
    roles: ['organizer']
  },
  {
    path: '/organizer/events',
    element: <OrganizerDashboard />,
    roles: ['organizer']
  },
  {
    path: '/organizer/events/:id',
    element: <EventDetail />,
    roles: ['organizer']
  },
  {
    path: '/organizer/events/:id/vendors',
    element: <VendorSelection />,
    roles: ['organizer']
  },
  
  // Vendor routes
  {
    path: '/vendor',
    element: <Navigate to="dashboard" replace />,
    roles: ['vendor']
  },
  {
    path: '/vendor/dashboard',
    element: <VendorDashboard />,
    roles: ['vendor']
  },
  {
    path: '/vendor/events',
    element: <VendorEvents />,
    roles: ['vendor']
  },
  {
    path: '/vendor/availability',
    element: <MyAvailability />,
    roles: ['vendor']
  },
  {
    path: '/vendor/availability/add',
    element: <div>Add Availability Form</div>,
    roles: ['vendor']
  },
  {
    path: '/vendor/services',
    element: <MyServices />,
    roles: ['vendor']
  },
  {
    path: '/vendor/services/add',
    element: <div>Add Service Form</div>,
    roles: ['vendor']
  },
  {
    path: '/vendor/services/edit/:id',
    element: <div>Edit Service Form</div>,
    roles: ['vendor']
  },
  
  // Attendee routes
  {
    path: '/attendee/dashboard',
    element: <AttendeeDashboard />,
    roles: ['attendee']
  },
  
  // Common routes
  {
    path: '/profile',
    element: <Profile />,
    roles: ['attendee', 'organizer', 'vendor', 'admin']
  },
  {
    path: '/messages',
    element: <Messaging />,
    roles: ['attendee', 'organizer', 'vendor', 'admin']
  }
];

// Test routes (development only)
export const testRoutes = [
  {
    path: '/test-api',
    element: <TestApiConnection />,
    layout: 'main'
  },
  {
    path: '/test-mock-api',
    element: <MockApiTest />,
    layout: 'main'
  }
];

export { Loading };
