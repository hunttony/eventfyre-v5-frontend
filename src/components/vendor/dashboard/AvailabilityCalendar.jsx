import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { vendorApi } from '../../../utils/api';

const AvailabilityCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const response = await vendorApi.getAvailability();
        const availabilityData = Array.isArray(response) ? response : (response?.data || []);
        setAvailability(availabilityData);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Failed to load availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const isAvailable = (day) => {
    return availability.some(avail => {
      const availDate = new Date(avail.date);
      return isSameDay(availDate, day) && avail.isAvailable;
    });
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Availability</h3>
        </div>
        <div className="px-4 py-5 sm:p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Calendar</h3>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              type="button"
              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-700">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              type="button"
              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-7 gap-1 text-center text-xs leading-6 text-gray-500">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="font-medium">{day}</div>
          ))}
        </div>
        
        <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
          {monthDays.map((day, dayIdx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDayAvailable = isAvailable(day);
            
            return (
              <div
                key={day.toString()}
                className={`
                  py-1.5 rounded-full
                  ${isSelected ? 'bg-indigo-100' : ''}
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                  ${isDayAvailable ? 'bg-green-50' : ''}
                  ${isSelected && isDayAvailable ? 'ring-2 ring-green-500' : ''}
                  flex justify-center items-center
                `}
                onClick={() => setSelectedDate(day)}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')}>
                  {format(day, 'd')}
                </time>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
            <span>Available</span>
          </div>
          <Link
            to="/vendor/availability"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Manage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
