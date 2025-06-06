import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
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
  /** @type {[import('../types/user').User | null, Function]} */
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults and check for existing token on initial load
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
          setCurrentUser(response.data);
          // Update stored user data
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Error validating token, using stored user data:', error);
          // Fallback to stored user data
          setCurrentUser(JSON.parse(storedUser));
        }
      } else if (storedToken) {
        // Have token but no user, fetch user data
        try {
          const response = await authApi.getMe();
          setCurrentUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
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
      // Validate input
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Valid email is required');
      }
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const response = await authApi.login({ email, password });
      console.log('Login response:', response);

      const { token, user } = response.data || {};
      if (!token || !user) {
        throw new Error('Missing token or user data in response');
      }

      // Ensure user has a role, default to 'attendee' if not set
      if (!user.role) {
        console.warn('User role not set, defaulting to attendee');
        user.role = 'attendee';
      }

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setToken(token);
      setCurrentUser(user);

      console.log('User logged in with role:', user.role);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  };

  /**
   * Registers a new user
   * @param {Object} userData - User data (email, password, name, etc.)
   * @returns {Promise<{ success: boolean, user?: import('../types/user').User, error?: string }>}
   */
  const register = async (userData) => {
    try {
      // Validate input
      if (!userData?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        throw new Error('Valid email is required');
      }
      if (!userData?.password || userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      if (!userData?.name) {
        throw new Error('Name is required');
      }

      console.log('Starting registration with data:', userData);
      const response = await authApi.register(userData);
      console.log('Registration response:', response);

      const { token, user } = response.data || {};
      if (!token || !user) {
        throw new Error('Missing token or user data in response');
      }

      // Ensure user has a role, default to 'attendee' if not set
      if (!user.role) {
        user.role = userData.role || 'attendee';
      }

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setToken(token);
      setCurrentUser(user);

      console.log('User registered with role:', user.role);
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      };
    }
  };

  /**
   * Logs out the current user
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const logout = async () => {
    try {
      const response = await authApi.logout();
      // Reset state
      setToken(null);
      setCurrentUser(null);
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure state is cleared even if API call fails
      setToken(null);
      setCurrentUser(null);
      return {
        success: false,
        error: error.message || 'Logout failed'
      };
    }
  };

  /**
   * Updates the current user's data
   * @param {Partial<import('../types/user').User>} userData - Partial user data to update
   * @returns {void}
   */
  // In your AuthContext.jsx
const updateUser = useCallback((userData) => {
  setCurrentUser(prev => {
    // Only update if data has actually changed
    if (JSON.stringify(prev) === JSON.stringify(userData)) {
      return prev;
    }
    return { ...prev, ...userData };
  });
}, []);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading: loading,
    login,
    register,
    logout,
    updateUser,
    hasRole: (role) => {
      if (!currentUser) return false;
      if (Array.isArray(role)) {
        return role.includes(currentUser.role);
      }
      return currentUser.role === role;
    },
    hasAnyRole: (roles) => roles.includes(currentUser?.role)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the auth context
 * @returns {AuthContextType} Auth context
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
