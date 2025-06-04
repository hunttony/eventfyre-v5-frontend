import { useState } from 'react';
import { vendorApi } from '../utils/api';
import { useNavigate } from 'react-router-dom';

function AvailabilityForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ 
    start: '', 
    end: '', 
    location: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate form data
    if (!formData.start || !formData.end || !formData.location) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (new Date(formData.end) <= new Date(formData.start)) {
      setError('End time must be after start time');
      setIsSubmitting(false);
      return;
    }

    try {
      await vendorApi.addAvailability(formData);
      
      // Reset form and show success message
      setFormData({ start: '', end: '', location: '' });
      alert('Availability added successfully!');
      
      // Optionally redirect or refresh the parent component
      // navigate('/vendor/dashboard');
    } catch (err) {
      console.error('Error adding availability:', err);
      setError(err.message || 'Failed to add availability. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md text-gray-900">
      <h2 className="text-2xl font-bold mb-6">Add Availability</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            id="start"
            value={formData.start}
            onChange={(e) => setFormData({ ...formData, start: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            id="end"
            value={formData.end}
            onChange={(e) => setFormData({ ...formData, end: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Enter location"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Saving...' : 'Save Availability'}
        </button>
      </form>
    </div>
  );
}

export default AvailabilityForm;
