import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute component that handles authentication and role-based access control.
 * 
 * @param {Object} props - Component props
 * @param {Array} [props.allowedRoles] - Array of roles that are allowed to access the route
 * @param {React.ReactNode} [props.fallback] - Fallback component to render when access is denied
 * @param {string} [props.redirectTo] - Path to redirect to when access is denied (overrides fallback)
 * @returns {JSX.Element} The protected route component
 */
const ProtectedRoute = ({ 
  allowedRoles = [], 
  fallback = null,
  redirectTo = null
}) => {
  const { currentUser, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  // Check if user has any of the allowed roles
  // If no roles are specified, any authenticated user can access
  const hasRequiredRole = allowedRoles.length === 0 || 
    allowedRoles.some(role => currentUser.role === role);

  // If user doesn't have required role, show fallback or redirect
  if (!hasRequiredRole) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access this page.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated and has required role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
