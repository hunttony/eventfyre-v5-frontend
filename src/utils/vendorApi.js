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
  },

  // Availability Management
  getAvailability: async (id) => {
    // If ID is provided, fetch a single availability
    if (id) {
      try {
        const response = await get(`/vendor/availability/${id}`);
        return {
          success: true,
          data: response?.data || null,
          message: 'Availability retrieved successfully'
        };
      } catch (error) {
        return handleError(error);
      }
    }
    
    // Otherwise, fetch all availability
    try {
      const response = await get('/vendor/availability');
      return {
        success: true,
        data: Array.isArray(response?.data) ? response.data : [],
        message: 'Availability retrieved successfully'
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Alias for getAvailability with ID
  getAvailabilityById: async (id) => {
    return vendorApi.getAvailability(id);
  },

  addAvailability: async (availabilityData) => {
    try {
      const response = await post('/vendor/availability', availabilityData);
      return {
        success: true,
        data: response.data,
        message: 'Availability added successfully'
      };
    } catch (error) {
      return handleError(error);
    }
  },

  updateAvailability: async (availabilityId, availabilityData) => {
    try {
      const response = await put(`/vendor/availability/${availabilityId}`, availabilityData);
      return {
        success: true,
        data: response.data,
        message: 'Availability updated successfully'
      };
    } catch (error) {
      return handleError(error);
    }
  },

  deleteAvailability: async (availabilityId) => {
    try {
      await del(`/vendor/availability/${availabilityId}`);
      return {
        success: true,
        message: 'Availability deleted successfully'
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Get availability slots for a specific date range
  getAvailabilitySlots: async (startDate, endDate, serviceId = null) => {
    try {
      const params = { startDate, endDate };
      if (serviceId) params.serviceId = serviceId;
      
      const response = await get('/vendor/availability/slots', { params });
      return {
        success: true,
        data: Array.isArray(response?.data) ? response.data : [],
        message: 'Availability slots retrieved successfully'
      };
    } catch (error) {
      return handleError(error);
    }
  }
};
