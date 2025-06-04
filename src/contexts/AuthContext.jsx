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
      } 
      // Case 2: Response has data object with token and user
      else if (response.data?.token && response.data?.user) {
        ({ token, user } = response.data);
      }
      // Case 3: Response has data with user and token is in a different format
      else if (response.data?.user && response.headers?.authorization) {
        token = response.headers.authorization.replace('Bearer ', '');
        user = response.data.user;
      } 
      // Case 4: Response is just the user object with token as a property
      else if (response.user && response.user.token) {
        token = response.user.token;
        user = response.user;
        // Remove token from user object before storing
        const { token: _, ...userWithoutToken } = user;
        user = userWithoutToken;
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format from server');
      }
      
      if (!token || !user) {
        throw new Error('Missing token or user data in response');
      }
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setToken(token);
      setCurrentUser(user);
      
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
      const response = await authApi.register(userData);
      const { token, user } = response;
      
      setToken(token);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
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
    hasRole: (role) => currentUser?.role === role,
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
