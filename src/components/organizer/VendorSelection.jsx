import { useState, useEffect } from 'react';
import axios from 'axios';

function VendorSelection({ eventId, onVendorsUpdated }) {
  const [searchParams, setSearchParams] = useState({
    date: '',
    location: '',
    serviceType: ''
  });
  const [availableVendors, setAvailableVendors] = useState([]);
  const [assignedVendors, setAssignedVendors] = useState([]);
  const [loading, setLoading] = useState({
    search: false,
    assign: {},
    unassign: {}
  });
  const [error, setError] = useState('');

  // Fetch assigned vendors when component mounts or eventId changes
  useEffect(() => {
    if (eventId) {
      fetchAssignedVendors();
    }
  }, [eventId]);

  const fetchAssignedVendors = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v2/organizer/events/${eventId}/vendors`, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      setAssignedVendors(response.data.data || []);
    } catch (err) {
      console.error('Error fetching assigned vendors:', err);
      setError('Failed to load assigned vendors');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchParams.date || !searchParams.location || !searchParams.serviceType) {
      setError('Please fill in all search fields');
      return;
    }

    setLoading(prev => ({ ...prev, search: true }));
    setError('');

    try {
      const response = await axios.get('http://localhost:3000/api/v2/organizer/vendors/available', {
        params: {
          date: searchParams.date,
          location: searchParams.location,
          serviceType: searchParams.serviceType
        },
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      
      // Filter out already assigned vendors
      const assignedVendorIds = new Set(assignedVendors.map(v => v._id));
      const filteredVendors = (response.data.data || []).filter(
        vendor => !assignedVendorIds.has(vendor._id)
      );
      
      setAvailableVendors(filteredVendors);
    } catch (err) {
      console.error('Error searching vendors:', err);
      setError(err.response?.data?.message || 'Failed to search for vendors');
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  const handleAssignVendor = async (vendorId) => {
    if (!eventId) return;
    
    setLoading(prev => ({
      ...prev,
      assign: { ...prev.assign, [vendorId]: true }
    }));
    
    try {
      await axios.post(
        `http://localhost:3000/api/v2/organizer/events/${eventId}/vendors/${vendorId}`,
        {},
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );
      
      // Update the assigned vendors list
      const vendorToAdd = availableVendors.find(v => v._id === vendorId);
      if (vendorToAdd) {
        setAssignedVendors(prev => [...prev, vendorToAdd]);
        setAvailableVendors(prev => prev.filter(v => v._id !== vendorId));
      }
      
      if (onVendorsUpdated) {
        onVendorsUpdated();
      }
    } catch (err) {
      console.error('Error assigning vendor:', err);
      setError(err.response?.data?.message || 'Failed to assign vendor');
    } finally {
      setLoading(prev => ({
        ...prev,
        assign: { ...prev.assign, [vendorId]: false }
      }));
    }
  };

  const handleUnassignVendor = async (vendorId) => {
    if (!eventId) return;
    
    setLoading(prev => ({
      ...prev,
      unassign: { ...prev.unassign, [vendorId]: true }
    }));
    
    try {
      await axios.delete(
        `http://localhost:3000/api/v2/organizer/events/${eventId}/vendors/${vendorId}`,
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );
      
      // Update the assigned vendors list
      const vendorToRemove = assignedVendors.find(v => v._id === vendorId);
      if (vendorToRemove) {
        setAssignedVendors(prev => prev.filter(v => v._id !== vendorId));
        setAvailableVendors(prev => [...prev, vendorToRemove]);
      }
      
      if (onVendorsUpdated) {
        onVendorsUpdated();
      }
    } catch (err) {
      console.error('Error unassigning vendor:', err);
      setError(err.response?.data?.message || 'Failed to unassign vendor');
    } finally {
      setLoading(prev => ({
        ...prev,
        unassign: { ...prev.unassign, [vendorId]: false }
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Find Available Vendors</h3>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-3">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Event Date & Time *
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="City, State"
                required
              />
            </div>
            
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                Service Type *
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={searchParams.serviceType}
                onChange={(e) => setSearchParams({ ...searchParams, serviceType: e.target.value })}
                className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Select a service type</option>
                <option value="Photography">Photography</option>
                <option value="Catering">Catering</option>
                <option value="Venue">Venue</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Decoration">Decoration</option>
                <option value="Audio/Visual">Audio/Visual</option>
                <option value="Security">Security</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading.search || !searchParams.date || !searchParams.location || !searchParams.serviceType}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.search ? 'Searching...' : 'Find Vendors'}
            </button>
          </div>
        </form>
      </div>

      {/* Available Vendors */}
      {availableVendors.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Available Vendors
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Vendors available for your event
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {availableVendors.map((vendor) => (
                <li key={vendor._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {vendor.businessName ? vendor.businessName.charAt(0).toUpperCase() : 'V'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {vendor.businessName || 'Vendor'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {vendor.serviceTypes?.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAssignVendor(vendor._id)}
                        disabled={loading.assign[vendor._id]}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading.assign[vendor._id] ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Assigned Vendors */}
      {assignedVendors.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Assigned Vendors
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Vendors assigned to this event
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {assignedVendors.map((vendor) => (
                <li key={vendor._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {vendor.businessName || 'Vendor'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {vendor.serviceTypes?.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleUnassignVendor(vendor._id)}
                        disabled={loading.unassign[vendor._id]}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading.unassign[vendor._id] ? 'Removing...' : 'Remove'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Implement message functionality
                          alert('Messaging feature will be implemented here');
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {!loading.search && availableVendors.length === 0 && assignedVendors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria to find available vendors.
          </p>
        </div>
      )}
    </div>
  );
}

export default VendorSelection;
