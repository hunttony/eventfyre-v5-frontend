import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authApi } from '../utils/api';
import axios from 'axios';

/** @type {import('../types/user').AuthContextType} */
const AuthContext = createContext(undefined);

/**
 * AuthProvider component that manages authentication state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} AuthProvider component
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [error, setError] = useState(null);
  const isAuthenticated = !!currentUser;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Set the token in axios defaults
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          // Validate token by fetching fresh user data
          const response = await authApi.getMe();
          const user = response.data;
          
          // Ensure user has a role, default to 'attendee' if not set
          if (!user.role) {
            user.role = 'attendee';
          }
          
          setCurrentUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Error validating token:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setCurrentUser(null);
        }
      } else if (storedToken) {
        // Have token but no user, fetch user data
        try {
          const response = await authApi.getMe();
          const user = response.data;
          
          if (!user.role) {
            user.role = 'attendee';
          }
          
          setCurrentUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setCurrentUser(null);
        }
      } else {
        // No token, ensure clean state
        setCurrentUser(null);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Update axios headers when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  /**
   * Logs in a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<{ success: boolean, user?: import('../types/user').User, error?: string }>}
   */
  const login = async (email, password) => {
    try {
      // Clear any previous errors
      setError(null);
      
      // Validate input
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Show loading state
      setLoading(true);
      
      console.log('Attempting login for:', email);
      const response = await authApi.login({ email, password });
      const { token: newToken, user, refreshToken } = response.data || {};
      
      if (!newToken || !user) {
        throw new Error('Invalid response from server. Please try again.');
      }

      // Ensure user has a role, default to 'attendee' if not set
      if (!user.role) {
        user.role = 'attendee';
      }

      // Store in localStorage
      localStorage.setItem('token', newToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setToken(newToken);
      setCurrentUser(user);
      setLoading(false);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      
      // Handle specific error cases
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logs out the current user
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear state
      setToken(null);
      setCurrentUser(null);
      setError(null);
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message || 'Failed to log out' };
    }
  };

  /**
   * Updates the current user's data
   * @param {Partial<import('../types/user').User>} userData - User data to update
   * @returns {void}
   */
  const updateUser = useCallback((userData) => {
    setCurrentUser(prev => {
      if (!prev) return userData;
      const updatedUser = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  /**
   * Checks if the current user has the specified role(s)
   * @param {string|string[]} role - Role or array of roles to check
   * @returns {boolean} True if user has the role, false otherwise
   */
  const hasRole = (role) => {
    if (!currentUser) return false;
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  };

  // Context value
  const contextValue = {
    currentUser,
    isAuthenticated,
    isLoading: loading,
    error,
    token,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole: (roles) => roles.includes(currentUser?.role)
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the auth context
 * @returns {import('../types/user').AuthContextType} Auth context
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
