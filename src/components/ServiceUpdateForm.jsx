import { useState, useEffect } from 'react';
import { vendorApi } from '../utils/api';

function ServiceUpdateForm() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    duties: '',
    changeTimeLimit: 24
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch vendor's services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await vendorApi.getServices();
        setServices(Array.isArray(response) ? response : (response.data || []));
      } catch (err) {
        console.error('Error fetching services:', err);
        setMessage({
          text: err.message || 'Failed to load services. Please try again later.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Update form data when a service is selected
  useEffect(() => {
    if (selectedService) {
      setFormData({
        duties: selectedService.duties ? selectedService.duties.join(', ') : '',
        changeTimeLimit: selectedService.changeTimeLimit || 24
      });
    }
  }, [selectedService]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      // Validate form data
      if (!formData.duties.trim()) {
        throw new Error('Please provide at least one duty');
      }
      
      if (isNaN(formData.changeTimeLimit) || formData.changeTimeLimit < 1) {
        throw new Error('Change time limit must be at least 1 hour');
      }

      const updateData = {
        duties: formData.duties.split(',').map(d => d.trim()).filter(Boolean),
        changeTimeLimit: Number(formData.changeTimeLimit)
      };
      
      // Update the service
      await vendorApi.updateService(selectedService._id, updateData);
      
      // Refresh services list
      const response = await vendorApi.getServices();
      setServices(Array.isArray(response) ? response : (response.data || []));
      
      // Reset form with updated service data if still selected
      if (selectedService) {
        const updatedService = (Array.isArray(response) ? response : (response.data || []))
          .find(s => s._id === selectedService._id);
        if (updatedService) {
          setSelectedService(updatedService);
          setFormData({
            duties: updatedService.duties ? updatedService.duties.join(', ') : '',
            changeTimeLimit: updatedService.changeTimeLimit || 24
          });
        }
      }
      
      setMessage({
        text: 'Service updated successfully!',
        type: 'success'
      });
      
    } catch (err) {
      console.error('Error updating service:', err);
      setMessage({
        text: err.message || 'Failed to update service. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Update Service Details</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage your service details and update change policies
        </p>
      </div>

      <div className="p-6">
        {message.text && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
            Select Service
          </label>
          <select
            id="service"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedService?._id || ''}
            onChange={(e) => {
              const service = services.find(s => s._id === e.target.value);
              setSelectedService(service || null);
            }}
          >
            <option value="">-- Select a service --</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} ({service.type})
              </option>
            ))}
          </select>
        </div>

        {selectedService && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="duties" className="block text-sm font-medium text-gray-700 mb-1">
                Duties (comma-separated)
              </label>
              <textarea
                id="duties"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.duties}
                onChange={(e) => setFormData({ ...formData, duties: e.target.value })}
                placeholder="e.g., Setup, Photography, Catering, Cleanup"
              />
            </div>

            <div>
              <label htmlFor="changeTimeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Change Time Limit (hours before event)
              </label>
              <input
                type="number"
                id="changeTimeLimit"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.changeTimeLimit}
                onChange={(e) => setFormData({ ...formData, changeTimeLimit: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">
                This is how many hours before an event that changes to this service will be blocked.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ServiceUpdateForm;
