import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function PrivateRoute({ children, roles = [] }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page with the return url
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route is protected by role
  if (roles.length > 0 && !roles.includes(currentUser.role)) {
    // Redirect to unauthorized page or dashboard based on user role
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized so return child components
  return children;
}

export default PrivateRoute;
