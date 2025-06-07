import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../utils/api';
import { XCircleIcon, PencilIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { currentUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    company: '',
    location: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const initialLoad = useRef(true);

  // Fetch profile data on component mount and when currentUser changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      console.log('Fetching profile data...');
      if (!currentUser) {
        console.log('No current user, cannot fetch profile');
        if (isMounted) {
          setIsLoading(false);
          setError('Please log in to view your profile.');
        }
        return;
      }
      
      // Clear any existing user data to force a fresh fetch
      localStorage.removeItem('user');
  
      try {
        if (isMounted) {
          console.log('Starting to fetch profile data...');
          setIsLoading(true);
        }
        
        console.log('Calling authApi.getMe() with force refresh...');
        const response = await authApi.getMe(true); // Force refresh from server
        console.log('Raw API Response:', JSON.stringify(response, null, 2));
        
        if (!isMounted) {
          console.log('Component unmounted, aborting...');
          return;
        }
        
        if (!response) {
          throw new Error('No response received from server');
        }
        
        if (!response.success) {
          console.error('API Error:', response.message || 'No error message provided');
          throw new Error(response.message || 'Failed to fetch profile data');
        }
        
        if (!response.data) {
          console.error('No data in response:', response);
          throw new Error('No data received from server');
        }
  
        // Extract user data from the response
        // The user data is nested under response.data.userData
        const userData = response.data?.userData || response.data?.data?.userData || response.data;
        console.log('Extracted user data:', JSON.stringify(userData, null, 2));
        
        if (!userData) {
          console.error('No user data found in response');
          throw new Error('User data is missing from response');
        }
        
        if (isMounted) {
          // Use the nested fields from userData
          const newFormData = {
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            company: userData.company || '',
            location: userData.location || userData.city || '', // Fallback to city if location is not available
          };
          console.log('Setting form data:', newFormData);
          setFormData(newFormData);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load profile data');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
  
    fetchProfile();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [currentUser]); // Re-run when currentUser changes

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    console.log('Form submission started');
    try {
      // Prevent default form submission
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      
      console.log('Form data before submission:', JSON.stringify(formData, null, 2));
      
      // Prevent multiple submissions
      if (isSubmitting) {
        console.log('Submission already in progress');
        return;
      }
      
      // Reset error state
      setError('');
  
      console.log('Starting profile update...');
      setIsSubmitting(true);
      setError('');
  
      // Validate current user and token
      if (!currentUser) {
        const errorMsg = 'Please log in to update your profile.';
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      // Check if token is expired
      const token = localStorage.getItem('token');
      if (!token) {
        const errorMsg = 'Your session has expired. Please log in again.';
        console.error(errorMsg);
        setError(errorMsg);
        // Optionally redirect to login page
        // navigate('/login', { state: { from: window.location.pathname } });
        return;
      }

      try {
        // Create update data with only changed fields
        const updateData = {};
        const fields = ['name', 'email', 'phone', 'bio', 'company', 'location'];
        
        fields.forEach(field => {
          if (formData[field] !== currentUser[field]) {
            updateData[field] = formData[field] !== '' ? formData[field] : null;
          }
        });

        // If no fields changed, show message and return
        if (Object.keys(updateData).length === 0) {
          console.log('No changes detected');
          setError('No changes detected');
          return;
        }
    
        console.log('Updating profile with data:', updateData);
        
        // Make the API call
        const response = await authApi.updateProfile(updateData);
        console.log('Update profile response:', response);
    
        if (!response?.success) {
          // If the error is about session expiration, handle it specifically
          if (response?.message?.includes('expired') || response?.message?.includes('token')) {
            const errorMsg = 'Your session has expired. Please log in again.';
            console.error('Session expired:', errorMsg);
            setError(errorMsg);
            // Optionally redirect to login page
            // navigate('/login', { state: { from: window.location.pathname } });
            return;
          }
          
          const errorMsg = response?.message || 'Failed to update profile';
          console.error('API error:', errorMsg, response);
          setError(errorMsg);
          return;
        }
    
        // Get the updated user data from the response
        const responseData = response.data;
        console.log('Update profile response data:', responseData);
        
        // The user data is nested under responseData.userData
        const updatedUser = responseData.userData || responseData.data?.userData || responseData;
        
        if (!updatedUser) {
          const errorMsg = 'No user data returned from server';
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }
        
        console.log('Updating user context with:', updatedUser);
        
        // Update the user context with the complete user data
        updateUser(updatedUser);
        
        // Create a complete form data object with all fields
        const completeFormData = {
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          bio: updatedUser.bio || '',
          company: updatedUser.company || '',
          location: updatedUser.location || ''
        };
        
        console.log('Updating form data with:', completeFormData);
        
        // Update the form data
        setFormData(completeFormData);
        
        // Also update localStorage to ensure consistency
        try {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUserData = { ...currentUser, ...updatedUser };
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          console.log('Updated localStorage with user data');
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
        
        console.log('Profile update successful');
        setError('Profile updated successfully!');
        setTimeout(() => setError(''), 3000);
        setIsEditing(false);
      } catch (apiError) {
        console.error('API Error in handleSubmit:', apiError);
        
        // Handle specific error cases
        if (apiError.message?.includes('expired') || apiError.message?.includes('token')) {
          const errorMsg = 'Your session has expired. Please log in again.';
          console.error('Session expired:', errorMsg);
          setError(errorMsg);
          // Optionally redirect to login page
          // navigate('/login', { state: { from: window.location.pathname } });
        } else {
          setError(apiError.message || 'Failed to update profile. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      // Don't set error state if it's already set by the inner catch
      if (!error) {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      console.log('Profile update process completed');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const renderField = (label, value, isTextArea = false) => (
    <div className="sm:col-span-1">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">
        {value || <span className="text-gray-400">Not provided</span>}
      </dd>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Profile Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {isEditing ? 'Update your personal information' : 'View and manage your profile'}
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PencilIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {error && (
          <div
            className={`${
              error.includes('successfully') ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'
            } p-4 m-4 rounded`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon
                  className={`h-5 w-5 ${error.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className={`text-sm ${error.includes('successfully') ? 'text-green-600' : 'text-red-700'}`}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="mt-1 block w-full border border-gray-300 text-gray-800 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone || currentUser.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  About
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              {renderField('Full Name', formData.name)}
              {renderField('Email', formData.email)}
              {renderField('Phone', formData.phone)}
              {renderField('Company', formData.company)}
              {renderField('Location', formData.location)}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">About</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {formData.bio || <span className="text-gray-400">Not provided</span>}
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