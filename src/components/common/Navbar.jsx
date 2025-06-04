import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold">
                EventFyre
              </Link>
            </div>
            {currentUser && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to={
                    currentUser.role === 'organizer' ? '/organizer/dashboard' : 
                    currentUser.role === 'vendor' ? '/vendor/dashboard' : 
                    '/attendee/dashboard'
                  }
                  className="border-transparent text-white hover:bg-indigo-500 hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to={
                    currentUser.role === 'organizer' 
                      ? '/organizer/events' 
                      : currentUser.role === 'vendor' 
                        ? '/vendor/events' 
                        : '/attendee/dashboard/events'
                  }
                  className="border-transparent text-white hover:bg-indigo-500 hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  {currentUser.role === 'organizer' ? 'My Events' : currentUser.role === 'vendor' ? 'Assigned Events' : 'My Events'}
                </Link>
                <Link
                  to="/messages"
                  className="border-transparent text-white hover:bg-indigo-500 hover:border-indigo-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Messages
                </Link>
              </div>
            )}
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="text-white hover:bg-indigo-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {currentUser.name || 'Profile'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-800"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:bg-indigo-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {currentUser && (
            <>
              <Link
                to={currentUser.role === 'organizer' ? '/organizer/dashboard' : currentUser.role === 'vendor' ? '/vendor/dashboard' : '/AttendeeDashboard'}
                className="bg-indigo-700 text-white block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium"
              >
                Dashboard
              </Link>
              <Link
                to={
                  currentUser.role === 'organizer' 
                    ? '/organizer/events' 
                    : currentUser.role === 'vendor' 
                      ? '/vendor/events' 
                      : '/attendee/events'
                }
                className="border-transparent text-white hover:bg-indigo-500 hover:border-indigo-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                {currentUser.role === 'organizer' ? 'My Events' : currentUser.role === 'vendor' ? 'Assigned Events' : 'My Events'}
              </Link>
              <Link
                to="/messages"
                className="border-transparent text-white hover:bg-indigo-500 hover:border-indigo-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Messages
              </Link>
              <Link
                to="/profile"
                className="border-transparent text-white hover:bg-indigo-500 hover:border-indigo-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left border-transparent text-white hover:bg-indigo-500 hover:border-indigo-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Logout
              </button>
            </>
          )}
          {!currentUser && (
            <>
              <Link
                to="/login"
                className="border-transparent text-white hover:bg-indigo-500 hover:border-indigo-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border-transparent text-white hover:bg-indigo-500 hover:border-indigo-300 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
