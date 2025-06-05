import { createContext, useContext, useState, useEffect } from 'react';
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
          
          // Try to validate the token by fetching fresh user data
          try {
            const response = await authApi.getMe();
            setCurrentUser(response.user);
            // Update stored user data
            localStorage.setItem('user', JSON.stringify(response.user));
          } catch (error) {
            console.error('Error validating token, using stored user data:', error);
            // If token validation fails but we have stored user data, use it
            setCurrentUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setCurrentUser(null);
        }
      } else if (storedToken) {
        // We have a token but no stored user, try to fetch user data
        try {
          const response = await authApi.getMe();
          setCurrentUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
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
   * @returns {Promise<void>}
   */
  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      console.log('Login response:', response); // Debug log
      
      // Handle different response formats
      let token, user;
      
      // Case 1: Response has token and user at top level
      if (response.token && response.user) {
        ({ token, user } = response);
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
      } else if (response.data?.token && response.data?.user) {
        // Standard response format from our mock API
        ({ token, user } = response.data);
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format from server');
      }
      
      if (!token || !user) {
        throw new Error('Missing token or user data in response');
      }
      
      // Ensure user has a role, default to 'attendee' if not set
      if (!user.role) {
        console.warn('User role not set, defaulting to attendee');
        user.role = 'attendee';
      }
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setToken(token);
      setCurrentUser(user);
      
      console.log('User logged in with role:', user.role);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Starting registration with data:', userData);
      const response = await authApi.register(userData);
      console.log('Registration response:', response);
      
      // Handle response format
      let token, user;
      
      if (response.data?.token && response.data?.user) {
        // Standard response format from our mock API
        ({ token, user } = response.data);
      } else if (response.token && response.user) {
        // Alternative format
        ({ token, user } = response);
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format from server');
      }
      
      if (!token || !user) {
        throw new Error('Missing token or user data in response');
      }
      
      // Ensure user has a role, default to 'attendee' if not set
      if (!user.role) {
        user.role = userData.role || 'attendee';
      }
      
      // Store token and user in localStorage
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
        error: error.response?.data?.message || error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  /**
   * Logs out the current user
   * @returns {void}
   */
  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setToken(null);
    setCurrentUser(null);
    
    // Optionally call backend logout endpoint if you have one
    // await axios.post('/api/v1/auth/logout');
  };

  /**
   * Updates the current user's data
   * @param {Partial<import('../types/user').User>} userData - Partial user data to update
   * @returns {void}
   */
  const updateUser = (userData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...userData
    }));
  };

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
