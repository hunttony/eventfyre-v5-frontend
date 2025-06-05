/**
 * Get the default route based on user role
 * @param {Object} user - Current user object
 * @returns {string} Default route for the user's role
 */
export const getDefaultRoute = (user) => {
  if (!user) return '/login';
  
  const roleRoutes = {
    organizer: '/organizer/dashboard',
    vendor: '/vendor/dashboard',
    admin: '/admin/dashboard',
    // Default to attendee dashboard for any other role
    default: '/attendee/dashboard'
  };
  
  return roleRoutes[user.role] || roleRoutes.default;
};

/**
 * Check if the current user has the required role
 * @param {Object} user - Current user object
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {boolean} Whether the user has the required role
 */
export const hasRequiredRole = (user, allowedRoles = []) => {
  if (!user || !user.role) return false;
  if (allowedRoles.length === 0) return true; // No role restriction
  return allowedRoles.includes(user.role);
};

/**
 * Get the appropriate layout component based on route
 * @param {string} path - Current route path
 * @returns {React.Component} Layout component
 */
export const getLayoutComponent = (path) => {
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  return authRoutes.some(route => path.startsWith(route)) ? 'auth' : 'main';
};

/**
 * Check if the current environment is development
 * @returns {boolean} Whether the current environment is development
 */
export const isDevelopment = () => {
  return import.meta.env.DEV;
};
