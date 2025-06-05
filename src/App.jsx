import { Suspense, lazy, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AttendeeProvider } from './contexts/AttendeeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { publicRoutes, protectedRoutes, testRoutes, Loading } from './config/routes.jsx';
import { isDevelopment, getDefaultRoute } from './utils/routeUtils';
import './App.css';

// Layout Components
const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        {children}
      </Suspense>
    </main>
    <Footer />
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <Link to="/" className="block text-center">
        <h2 className="text-center text-3xl font-extrabold text-indigo-600">EventFyre</h2>
      </Link>
    </div>
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          {children}
        </Suspense>
      </div>
    </div>
  </div>
);

// Lazy load components
const Navbar = lazy(() => import('./components/common/Navbar'));
const Footer = lazy(() => import('./components/common/Footer'));
const Link = lazy(() => import('react-router-dom').then(module => ({ default: module.Link })));
const LandingPage = lazy(() => import('./components/landing/LandingPage'));

/**
 * Protected Route Component
 * Handles authentication and role-based access control
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Auth Check Component
 * Handles authentication state and redirects accordingly
 */
const AuthCheck = ({ children, requireGuest = false }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const defaultRoute = useMemo(() => getDefaultRoute(currentUser), [currentUser]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // If no current user and guest access is not required, redirect to login
  if (!currentUser && !requireGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in but guest access is required, redirect to dashboard
  if (currentUser && requireGuest) {
    // Prevent redirect loop by checking if we're already on the default route
    if (location.pathname !== defaultRoute) {
      return <Navigate to={defaultRoute} replace />;
    }
    return <LoadingSpinner fullScreen />;
  }

  return children;
};

/**
 * Renders routes with proper protection and layout
 */
const renderNestedRoutes = (routes, isProtected = false) => {
  return routes.map(({ path, element, roles = [], layout = 'main' }) => {
    // Handle redirect routes (Navigate components)
    if (element.type && element.type.name === 'Navigate') {
      return (
        <Route
          key={path}
          path={path}
          element={element}
        />
      );
    }

    // For regular routes, wrap with the appropriate layout and protection
    const Layout = layout === 'auth' ? AuthLayout : MainLayout;
    
    const routeElement = isProtected ? (
      <ProtectedRoute roles={roles}>
        <Layout>{element}</Layout>
      </ProtectedRoute>
    ) : (
      <AuthCheck requireGuest={!['/', '/unauthorized'].includes(path)}>
        <Layout>{element}</Layout>
      </AuthCheck>
    );

    return (
      <Route
        key={path}
        path={path}
        element={routeElement}
      />
    );
  });
};

/**
 * Main App Routes Component
 */
const AppRoutes = () => {
  const { currentUser } = useAuth();
  const defaultRoute = useMemo(() => getDefaultRoute(currentUser), [currentUser]);

  // Create all route elements
  const allRoutes = useMemo(() => [
    // Public routes
    ...renderNestedRoutes(publicRoutes, false),
    
    // Protected routes
    ...renderNestedRoutes(protectedRoutes, true),
    
    // Test routes (development only)
    ...(isDevelopment ? renderNestedRoutes(testRoutes, false) : []),
    
    // Default route - No AuthCheck to prevent redirect loops
    <Route
      key="/"
      path="/"
      element={
        <MainLayout>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <LandingPage />
          </Suspense>
        </MainLayout>
      }
    />,
    
    // 404 Route
    <Route
      key="*"
      path="*"
      element={
        <MainLayout>
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <p className="mt-4 text-lg text-gray-600">Page not found</p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go back home
            </Link>
          </div>
        </MainLayout>
      }
    />
  ], [currentUser]);

  return (
    <ErrorBoundary>
      <Routes>
        {allRoutes}
      </Routes>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AttendeeProvider>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <AppRoutes />
        </Suspense>
      </AttendeeProvider>
    </AuthProvider>
  );
};

export default App;
