import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { organizerApi } from '../../../utils/api';

const VendorAvailability = () => {
  const [availableVendors, setAvailableVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailableVendors = async () => {
      try {
        setLoading(true);
        // This would typically be an API call to get vendors with availability
        // For now, we'll simulate it with a timeout
        const response = await organizerApi.getAvailableVendors();
        const vendors = Array.isArray(response) ? response : (response?.data || []);
        setAvailableVendors(vendors);
      } catch (err) {
        console.error('Error fetching available vendors:', err);
        setError('Failed to load vendor availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableVendors();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Vendor Availability</h3>
        </div>
        <div className="px-4 py-5 sm:p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Vendor Availability</h3>
        <Link
          to="/organizer/vendors"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all
        </Link>
      </div>
      
      {error ? (
        <div className="px-4 py-5 sm:p-6 text-red-600">{error}</div>
      ) : availableVendors.length === 0 ? (
        <div className="px-4 py-5 sm:p-6 text-gray-500 text-center">
          No vendor availability data available
        </div>
      ) : (
        <div className="bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {availableVendors.slice(0, 3).map((vendor) => (
              <li key={vendor._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {vendor.name ? vendor.name.charAt(0).toUpperCase() : 'V'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {vendor.name || 'Vendor Name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vendor.serviceType || 'Service Type'}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Available
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">
                      <p>Next available: {vendor.nextAvailableDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="bg-gray-50 px-4 py-4 sm:px-6 text-right">
        <Link
          to="/organizer/vendors/available"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all available vendors<span aria-hidden="true"> &rarr;</span>
        </Link>
      </div>
    </div>
  );
};

export default VendorAvailability;
