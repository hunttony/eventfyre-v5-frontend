import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorApi } from '../../../utils/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../common/LoadingSpinner';
import AvailabilityCalendar from './AvailabilityCalendar';

const MyAvailability = () => {
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getAvailability();
      if (response?.data) {
        setAvailability(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Filter time slots for selected date
    const slots = availability.filter(slot => {
      const slotDate = new Date(slot.startTime);
      return slotDate.toDateString() === date.toDateString();
    });
    setTimeSlots(slots);
  };

  const handleAddAvailability = () => {
    // Navigate to add availability form
    navigate('/vendor/availability/add');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">My Availability</h2>
        <button
          onClick={handleAddAvailability}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Availability
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <AvailabilityCalendar
            availability={availability}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Time Slots for {selectedDate.toLocaleDateString()}
            </h3>
            {timeSlots.length > 0 ? (
              <div className="space-y-2">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span>
                      {new Date(slot.startTime).toLocaleTimeString()} - 
                      {new Date(slot.endTime).toLocaleTimeString()}
                    </span>
                    <button className="text-red-600 hover:text-red-800">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No time slots available for this date.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAvailability;
