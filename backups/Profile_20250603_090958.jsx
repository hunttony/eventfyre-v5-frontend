import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../utils/api';

/** @typedef {import('../../types/user').User} User */

const Profile = () => {
  /** @type {{ currentUser: User | null, updateUser: (userData: Partial<User>) => void }} */
  const { currentUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    bio: '',
    // Add any additional profile fields here
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State to track if we've attempted to fetch the profile
  const [hasFetched, setHasFetched] = useState(false);
  
  // Fetch profile data on component mount and when currentUser changes
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    let retryTimer = null;

    const fetchProfile = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        // Try to get fresh data from the server
        const response = await authApi.getMe();
        console.log('Fetched profile data:', response); // Debug log
        
        if (!isMounted) return;
        
        if (response) {
          // Use the helper function to safely initialize form data
          const userData = getInitialFormData(response.userData);
          
          setFormData(prev => ({
            ...prev,
            ...userData
          }));
          
          // Update the user context with the latest data
          updateUser(userData);
          
          console.log('Fetched profile data:', response);
          setHasFetched(true);
        } else if (currentUser && !hasFetched) {
          // Fallback to currentUser from context if API call fails
          const fallbackData = getInitialFormData(currentUser);
          setFormData(fallbackData);
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error(`Error fetching profile (attempt ${retryCount + 1}):`, err);
        
        // If we have currentUser data and haven't fetched yet, use it as a fallback
        if (currentUser && !hasFetched) {
          setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            company: currentUser.company || '',
            bio: currentUser.bio || '',
            address: currentUser.address || '',
            city: currentUser.city || '',
            state: currentUser.state || '',
            zipCode: currentUser.zipCode || '',
            website: currentUser.website || '',
            role: currentUser.role || ''
          });
        }
        
        // Handle rate limiting with exponential backoff
        if (err.status === 429 && retryCount < MAX_RETRIES) {
          const delay = 2000 * Math.pow(2, retryCount);
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          
          retryCount++;
          retryTimer = setTimeout(() => {
            if (isMounted) fetchProfile();
          }, delay);
          
          return;
        }
        
        // Only show error if we've exhausted retries and have no data
        if (retryCount >= MAX_RETRIES && !hasFetched) {
          setError('Server is busy. Using cached data. Please try again later.');
        } else if (!currentUser) {
          setError('Failed to load profile data. ' + (err.message || ''));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchProfile();
    
    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [currentUser?.id]); // Only re-run if currentUser.id changes

  // Helper function to safely get string value from form data
  const getStringValue = (value) => {
    // Handle MongoDB $ifNull operator object
    if (value && typeof value === 'object' && '$ifNull' in value) {
      return String(value.$ifNull[0] || '');
    }
    if (value === null || value === undefined || value === '') return '';
    return String(value);
  };
  
  // Helper function to safely initialize form data
  const getInitialFormData = (userData) => {
    const data = {
      name: getStringValue(userData?.name),
      email: getStringValue(userData?.email),
      phone: getStringValue(userData?.phone),
      company: getStringValue(userData?.company),
      bio: getStringValue(userData?.bio),
      address: getStringValue(userData?.address),
      city: getStringValue(userData?.city),
      state: getStringValue(userData?.state),
      zipCode: getStringValue(userData?.zipCode),
      website: getStringValue(userData?.website),
      role: getStringValue(userData?.role)
    };
    console.log('Initialized form data:', data);
    return data;
  };

  // Remove individual field logging to improve performance
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: getStringValue(value)
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    // Create a sanitized copy of all form data using our helper function
    const sanitizedData = {
      name: getStringValue(formData.name).trim(),
      email: getStringValue(formData.email),  // Include email but don't trim it
      phone: getStringValue(formData.phone).trim(),
      company: getStringValue(formData.company).trim(),
      bio: getStringValue(formData.bio).trim(),
      address: getStringValue(formData.address).trim(),
      city: getStringValue(formData.city).trim(),
      state: getStringValue(formData.state).trim(),
      zipCode: getStringValue(formData.zipCode).trim(),
      website: getStringValue(formData.website).trim()
    };
    
    console.log('Submitting sanitized data:', JSON.stringify(sanitizedData, null, 2));
    
    console.log('Submitting profile data:', sanitizedData); // Debug log
    
    // Validate required fields
    if (!sanitizedData.name) {
      setSubmitError('Name is required');
      document.getElementById('name')?.focus();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await authApi.updateProfile(sanitizedData);
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      // Update user context and form data with the response
      updateUser(response);
      setFormData({
        name: response.name || '',
        email: response.email || '',
        phone: response.phone || '',
        company: response.company || '',
        bio: response.bio || '',
        address: response.address || '',
        city: response.city || '',
        state: response.state || '',
        zipCode: response.zipCode || '',
        website: response.website || ''
        
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Update profile error:', err);
      
      // Handle rate limiting specifically
      if (err.status === 429) {
        setSubmitError('Too many requests. Please wait a moment and try again.');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile. Please try again.';
        setSubmitError(errorMessage);
        
        // Log detailed error for debugging
        console.error('Error updating profile:', {
          error: err,
          message: err.message,
          response: err.response?.data,
          status: err.status,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            data: err.config?.data,
          }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // Only log form data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Current form data:', formData);
  }
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Profile Information
            </h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Profile
              </button>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details and account information.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Name */}
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {/* Email (readonly) */}
              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email || ''}
                    disabled
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="sm:col-span-3">
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="company"
                    id="company"
                    value={formData.company || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="sm:col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* City */}
              <div className="sm:col-span-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* State */}
              <div className="sm:col-span-2">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="state"
                    id="state"
                    value={formData.state || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* ZIP Code */}
              <div className="sm:col-span-2">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP / Postal code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="zipCode"
                    id="zipCode"
                    value={formData.zipCode || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Website */}
              <div className="sm:col-span-4">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    https://
                  </span>
                  <input
                    type="text"
                    name="website"
                    id="website"
                    value={formData.website || ''}
                    onChange={handleChange}
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="www.example.com"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="sm:col-span-6">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <div className="mt-1">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Tell us a little bit about yourself..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
                className="text-sm font-semibold leading-6 text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save'}
              </button>
            </div>
            {submitError && (
              <div className="mt-4 text-sm text-red-600">
                {submitError}
              </div>
            )}
          </form>
        ) : (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.name || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.email}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.phone || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.company || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Bio</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.bio || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.address || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">City</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.city || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">State</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.state || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.zipCode || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.website ? (
                    <a 
                      href={String(formData.website || '').startsWith('http') ? String(formData.website) : `https://${formData.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {String(formData.website)}
                    </a>
                  ) : 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Account type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                  {formData.role || 'Not specified'}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
