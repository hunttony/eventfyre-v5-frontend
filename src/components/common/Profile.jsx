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
    const fetchProfile = async () => {
      if (!currentUser) {
        setIsLoading(false);
        setError('Please log in to view your profile.');
        return;
      }
  
      try {
        setIsLoading(true);
        const response = await authApi.getMe();
        
        if (!response?.success || !response?.data) {
          throw new Error(response?.message || 'Failed to fetch profile data');
        }
  
        const userData = response.data;
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          company: userData.company || '',
          location: userData.location || '',
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProfile();
  }, [currentUser?.id]); // Only re-run if currentUser.id changes

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
  
    try {
      setIsSubmitting(true);
      setError('');
  
      if (!currentUser) {
        throw new Error('Please log in to update your profile.');
      }
  
      const response = await authApi.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        company: formData.company,
        location: formData.location,
      });
  
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to update profile');
      }
  
      // Update the auth context with the new data
      updateUser(response.data);
      
      setError('Profile updated successfully!');
      setTimeout(() => setError(''), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
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
                  className="mt-1 block w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm cursor-not-allowed"
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
                  value={formData.phone}
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