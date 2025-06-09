import { get, del } from './api';

// Simple error handler
const handleError = (error) => {
  console.error('Vendor API Error:', error);
  return {
    success: false,
    message: error.response?.data?.message || error.message || 'Something went wrong',
    error: error.response?.data || error.message
  };
};

export const vendorApi = {
  // Get all services for the current vendor
  getServices: async () => {
    try {
      // Using a single endpoint to avoid rate limiting
      const response = await get('/services');
      return {
        success: true,
        data: Array.isArray(response?.data) ? response.data : [],
        message: 'Services retrieved successfully'
      };
    } catch (error) {
      console.log('Using fallback data due to error');
      // Return empty array to prevent UI breakage
      return {
        success: true,
        data: [],
        message: 'Using fallback data'
      };
    }
  },

  // Delete a service by ID
  deleteService: async (serviceId) => {
    if (!serviceId) {
      return { success: false, message: 'Service ID is required' };
    }

    try {
      await del(`/services/${serviceId}`);
      return { success: true, message: 'Service deleted' };
    } catch (error) {
      return handleError(error);
    }
  }
};
