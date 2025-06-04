import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Unauthorized() {
  const { currentUser } = useAuth();
  
  // Determine the redirect path based on user role
  const getRedirectPath = () => {
    if (!currentUser) return '/login';
    
    switch(currentUser.role) {
      case 'organizer':
        return '/organizer/dashboard';
      case 'vendor':
        return '/vendor/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Unauthorized Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
          <div className="mt-6">
            <Link
              to={getRedirectPath()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to {!currentUser ? 'Login' : 'Dashboard'}
            </Link>
          </div>
          {currentUser && (
            <div className="mt-4 text-sm text-gray-500">
              <p>You are logged in as: <span className="font-medium">{currentUser.name}</span> ({currentUser.role})</p>
              <p className="mt-1">If you believe this is an error, please contact support.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
