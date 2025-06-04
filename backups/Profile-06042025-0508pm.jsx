import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../utils/api';
import { XCircleIcon } from '@heroicons/react/24/outline';

/** @typedef {import('../../types/user').User} User */

const Profile = () => {
  /** @type {{ currentUser: User | null, updateUser: (userData: Partial<User>) => void }} */
  const { currentUser, updateUser } = useAuth();

  // Define role-specific fields configuration
  const roleFields = {
    common: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', readOnly: true },
      { name: 'phone', label: 'Phone', type: 'tel', required: true },
      { name: 'bio', label: 'Bio', type: 'textarea', required: false },
      { name: 'profileImage', label: 'Profile Image', type: 'file', accept: 'image/*', required: false },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: false },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'], required: false },
      { name: 'preferredLanguage', label: 'Preferred Language', type: 'select', options: ['English', 'Spanish', 'French', 'Other'], required: false }
    ],
    organizer: [
      { name: 'company', label: 'Organization Name', type: 'text', required: true },
      { name: 'companyLogo', label: 'Company Logo', type: 'file', accept: 'image/*', required: false },
      { name: 'website', label: 'Website', type: 'url', required: false },
      { name: 'taxId', label: 'Tax ID', type: 'text', required: false },
      { name: 'address', label: 'Street Address', type: 'text', required: true },
      { name: 'address2', label: 'Address Line 2', type: 'text', required: false },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'state', label: 'State/Province', type: 'text', required: true },
      { name: 'zipCode', label: 'ZIP/Postal Code', type: 'text', required: true },
      { name: 'country', label: 'Country', type: 'text', required: true },
      { name: 'businessPhone', label: 'Business Phone', type: 'tel', required: false },
      { name: 'businessEmail', label: 'Business Email', type: 'email', required: false },
      { name: 'socialMedia', label: 'Social Media Links', type: 'group', fields: [
        { name: 'facebook', label: 'Facebook', type: 'url', required: false },
        { name: 'twitter', label: 'Twitter', type: 'url', required: false },
        { name: 'instagram', label: 'Instagram', type: 'url', required: false },
        { name: 'linkedin', label: 'LinkedIn', type: 'url', required: false }
      ]},
      { name: 'businessHours', label: 'Business Hours', type: 'group', fields: [
        { name: 'monday', label: 'Monday', type: 'text', required: false },
        { name: 'tuesday', label: 'Tuesday', type: 'text', required: false },
        { name: 'wednesday', label: 'Wednesday', type: 'text', required: false },
        { name: 'thursday', label: 'Thursday', type: 'text', required: false },
        { name: 'friday', label: 'Friday', type: 'text', required: false },
        { name: 'saturday', label: 'Saturday', type: 'text', required: false },
        { name: 'sunday', label: 'Sunday', type: 'text', required: false }
      ]}
    ],
    vendor: [
      { name: 'company', label: 'Business Name', type: 'text', required: true },
      { name: 'businessType', label: 'Type of Business', type: 'select', options: ['Catering', 'Venue', 'Entertainment', 'Photography', 'Other'], required: true },
      { name: 'companyLogo', label: 'Business Logo', type: 'file', accept: 'image/*', required: false },
      { name: 'website', label: 'Website', type: 'url', required: false },
      { name: 'taxId', label: 'Tax ID', type: 'text', required: false },
      { name: 'services', label: 'Services Offered', type: 'textarea', required: true },
      { name: 'serviceAreas', label: 'Service Areas', type: 'text', required: false },
      { name: 'address', label: 'Business Address', type: 'text', required: true },
      { name: 'address2', label: 'Address Line 2', type: 'text', required: false },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'state', label: 'State/Province', type: 'text', required: true },
      { name: 'zipCode', label: 'ZIP/Postal Code', type: 'text', required: true },
      { name: 'country', label: 'Country', type: 'text', required: true },
      { name: 'businessPhone', label: 'Business Phone', type: 'tel', required: true },
      { name: 'businessEmail', label: 'Business Email', type: 'email', required: true },
      { name: 'yearsInBusiness', label: 'Years in Business', type: 'number', required: false },
      { name: 'certifications', label: 'Certifications', type: 'textarea', required: false },
      { name: 'socialMedia', label: 'Social Media Links', type: 'group', fields: [
        { name: 'facebook', label: 'Facebook', type: 'url', required: false },
        { name: 'instagram', label: 'Instagram', type: 'url', required: false },
        { name: 'pinterest', label: 'Pinterest', type: 'url', required: false },
        { name: 'youtube', label: 'YouTube', type: 'url', required: false }
      ]}
    ],
    attendee: [
      { name: 'interests', label: 'Interests', type: 'tags', required: false },
      { name: 'profession', label: 'Profession', type: 'text', required: false },
      { name: 'company', label: 'Company', type: 'text', required: false },
      { name: 'industry', label: 'Industry', type: 'text', required: false },
      { name: 'location', label: 'Location', type: 'text', required: false },
      { name: 'address', label: 'Address', type: 'text', required: false },
      { name: 'city', label: 'City', type: 'text', required: false },
      { name: 'state', label: 'State/Province', type: 'text', required: false },
      { name: 'zipCode', label: 'ZIP/Postal Code', type: 'text', required: false },
      { name: 'country', label: 'Country', type: 'text', required: false },
      { name: 'emergencyContact', label: 'Emergency Contact', type: 'group', fields: [
        { name: 'name', label: 'Name', type: 'text', required: false },
        { name: 'relationship', label: 'Relationship', type: 'text', required: false },
        { name: 'phone', label: 'Phone', type: 'tel', required: false },
        { name: 'email', label: 'Email', type: 'email', required: false }
      ]},
      { name: 'dietaryRestrictions', label: 'Dietary Restrictions', type: 'tags', options: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Nut Allergy', 'Dairy-Free', 'Kosher', 'Halal', 'Other'], required: false },
      { name: 'accessibilityNeeds', label: 'Accessibility Needs', type: 'textarea', required: false },
      { name: 'socialMedia', label: 'Social Media', type: 'group', fields: [
        { name: 'linkedin', label: 'LinkedIn', type: 'url', required: false },
        { name: 'twitter', label: 'Twitter', type: 'url', required: false },
        { name: 'instagram', label: 'Instagram', type: 'url', required: false }
      ]}
    ]
  };

  // Initialize form data as null initially to distinguish between loading and empty states
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasFetched, setHasFetched] = useState(false);

  // Get role-specific fields for the current user
  const getRoleSpecificFields = useCallback((role) => {
    switch (role) {
      case 'organizer':
        return [...roleFields.organizer];
      case 'vendor':
        return [...roleFields.vendor];
      case 'attendee':
        return [...roleFields.attendee];
      default:
        return [];
    }
  }, []);

  // Fetch profile data on component mount and when currentUser changes
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    let retryTimer = null;

    const fetchProfile = async () => {
      if (!isMounted) return;

      try {
        // Only show loading if we don't have any data yet
        if (!formData) {
          setIsLoading(true);
        }
        setError('');

        const response = await authApi.getMe();
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetched profile data:', response);
        }

        if (!isMounted) return;

        let userData;
        if (response?.userData) {
          // Use getInitialFormData to handle all data processing
          userData = getInitialFormData(response.userData);
          updateUser(userData);
          setHasFetched(true);
        } else if (currentUser && !hasFetched) {
          // Fallback to currentUser from context if API call fails
          userData = getInitialFormData(currentUser);
        }
        
        // Single state update with all data
        if (userData) {
          setFormData(prev => ({
            ...(prev || {}),
            ...userData
          }));
        }
      } catch (err) {
        if (!isMounted) return;

        if (process.env.NODE_ENV === 'development') {
          console.error(`Error fetching profile (attempt ${retryCount + 1}):`, err);
        }

        if (currentUser && !hasFetched) {
          const fallbackData = getInitialFormData(currentUser);
          setFormData(fallbackData);
        }

        if (err.status === 429 && retryCount < MAX_RETRIES) {
          const delay = 2000 * Math.pow(2, retryCount);
          if (process.env.NODE_ENV === 'development') {
            console.log(`Rate limited. Retrying in ${delay}ms...`);
          }
          retryCount++;
          retryTimer = setTimeout(() => {
            if (isMounted) fetchProfile();
          }, delay);
          return;
        }

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
  }, [currentUser]);

  // Helper function to safely get string value from form data
  const getStringValue = (value) => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'object' && '$ifNull' in value) {
      try {
        return String(value.$ifNull[0] || '');
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Invalid $ifNull structure:', value, err);
        }
        return '';
      }
    }
    return String(value);
  };

  // Helper function to safely initialize form data
  const getInitialFormData = (userData) => {
    if (!userData) return {};
    
    // Get all possible field names from roleFields
    const allFieldNames = [
      ...roleFields.common.map(f => f.name),
      ...roleFields.organizer.map(f => f.name),
      ...roleFields.vendor.map(f => f.name),
      ...roleFields.attendee.map(f => f.name)
    ];
    
    // Create initial data object with all fields
    const data = {};
    
    // Only include fields that are defined in roleFields
    allFieldNames.forEach(field => {
      if (field) {
        data[field] = getStringValue(userData[field]);
      }
    });
    
    // Always include these core fields
    const coreFields = {
      name: getStringValue(userData.name),
      email: getStringValue(userData.email),
      phone: getStringValue(userData.phone),
      company: getStringValue(userData.company),
      bio: getStringValue(userData.bio),
      role: getStringValue(userData.role),
      website: getStringValue(userData.website),
      services: getStringValue(userData.services),
      interests: getStringValue(userData.interests),
      location: getStringValue(userData.location)
    };
    
    const result = { ...data, ...coreFields };
    if (process.env.NODE_ENV === 'development') {
      console.log('Initialized form data:', result);
    }
    return result;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Prevent updating if the field is read-only
    if (type === 'email' && e.target.readOnly) {
      return;
    }
    
    let processedValue = value;
    if (type === 'email') {
      processedValue = value.toLowerCase().trim();
    } else if (type === 'url' && value && !value.match(/^https?:\/\//)) {
      processedValue = `https://${value}`;
    } else if (type === 'tel') {
      processedValue = value.replace(/[^0-9+\-()\s]/g, '');
    } else if (type === 'text' || type === 'textarea') {
      processedValue = value.trimStart();
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const roleSpecificFields = getRoleSpecificFields(currentUser?.role || 'attendee');
      const requiredFields = [
        ...roleFields.common.filter(f => f.required).map(f => f.name),
        ...roleSpecificFields.filter(f => f.required).map(f => f.name)
      ];

      const missingFields = requiredFields.filter(field => !formData[field]?.trim());
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (formData.website && !/^https?:\/\//.test(formData.website)) {
        setError('Website URL must start with http:// or https://');
        return;
      }

      const dataToUpdate = { ...formData };
      Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] === '') {
          dataToUpdate[key] = undefined;
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Updating profile with data:', dataToUpdate);
      }

      const updatedUser = await authApi.updateProfile(dataToUpdate);
      updateUser(updatedUser);

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating profile:', err);
      }
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render a form field based on its type
  const renderField = (field) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleChange,
      disabled: isSubmitting || (field.readOnly === true),
      className: `block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
        field.readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
      }`,
      required: field.required,
      placeholder: field.placeholder || `Enter your ${field.label.toLowerCase()}`
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={3} />;
      case 'select':
        return (
          <select {...commonProps}>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'url':
        return (
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              https://
            </span>
            <input
              type="text"
              {...commonProps}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm border-gray-300"
              placeholder="example.com"
            />
          </div>
        );
      default:
        return <input type={field.type} {...commonProps} />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Initialize with empty object if formData is null
  const safeFormData = formData || {};

  // Render the profile form with role-specific fields
  const renderForm = () => {
    if (!currentUser) return null;

    const role = currentUser.role || 'attendee';
    const roleSpecificFields = getRoleSpecificFields(role);
    const allFields = [...roleFields.common, ...roleSpecificFields];

    const basicInfoFields = ['name', 'email', 'phone', 'bio'];
    const sections = [
      {
        title: 'Basic Information',
        fields: allFields.filter(f => f?.name && basicInfoFields.includes(f.name))
      },
      {
        title: role === 'organizer' ? 'Organization Details' :
              role === 'vendor' ? 'Business Information' : 'Additional Information',
        fields: allFields.filter(f => f?.name && !basicInfoFields.includes(f.name))
      }
    ].filter(section => section.fields.length > 0);

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-6">
            {sections.length > 1 && (
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
              </div>
            )}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {section.fields.map((field) => (
                <div key={field.name} className={field.fullWidth ? 'sm:col-span-6' : 'sm:col-span-6 md:col-span-3'}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="mt-1">
                    {renderField(field)}
                  </div>
                  {field.helpText && (
                    <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setIsSubmitting(false);
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Current form data:', formData);
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Profile Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isEditing ? 'Update your profile information' : 'View your profile details'}
              </p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 m-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {isEditing ? renderForm() : (
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <dl className="space-y-6">
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formData.name || 'Not provided'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formData.email || 'Not provided'}
                    </dd>
                  </div>
                  {formData.phone && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formData.phone}
                      </dd>
                    </div>
                  )}
                  {formData.company && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        {formData.role === 'organizer' ? 'Organization' : 'Business'}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formData.company}
                      </dd>
                    </div>
                  )}
                  {(formData.address || formData.city || formData.state || formData.zipCode) && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        {formData.role === 'vendor' ? 'Business Address' : 'Address'}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {[formData.address, formData.city, formData.state, formData.zipCode].filter(Boolean).join(', ')}
                      </dd>
                    </div>
                  )}
                  {formData.website && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Website</dt>
                      <dd className="mt-1 text-sm text-blue-600 sm:mt-0 sm:col-span-2">
                        <a
                          href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {formData.website}
                        </a>
                      </dd>
                    </div>
                  )}
                  {formData.bio && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        {formData.role === 'organizer' ? 'About Organization' :
                         formData.role === 'vendor' ? 'Business Description' : 'About Me'}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                        {formData.bio}
                      </dd>
                    </div>
                  )}
                  {formData.services && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Services Offered</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                        {formData.services}
                      </dd>
                    </div>
                  )}
                  {formData.interests && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Interests</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                        {formData.interests}
                      </dd>
                    </div>
                  )}
                  {formData.location && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formData.location}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;