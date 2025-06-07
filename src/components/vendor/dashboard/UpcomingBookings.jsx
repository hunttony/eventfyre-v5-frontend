import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorApi } from '../../../utils/api';

const UpcomingBookings = () => {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      try {
        setLoading(true);
        setError('');
        
        const { data: bookings = [], success, message } = await vendorApi.getEvents();
        
        if (!success) {
          console.warn('Warning:', message);
          // Continue with empty array instead of showing error for better UX
        }
        
        // Filter for upcoming bookings (within next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const upcoming = Array.isArray(bookings) 
          ? bookings
              .filter(booking => {
                try {
                  const bookingDate = booking?.startDate ? new Date(booking.startDate) : null;
                  return bookingDate && bookingDate > now && bookingDate <= thirtyDaysFromNow;
                } catch (e) {
                  console.warn('Invalid booking date format:', booking?.startDate);
                  return false;
                }
              })
              .sort((a, b) => {
                try {
                  return new Date(a.startDate) - new Date(b.startDate);
                } catch (e) {
                  return 0;
                }
              })
              .slice(0, 5)
          : [];
        
        setUpcomingBookings(upcoming);
      } catch (err) {
        console.error('Error fetching upcoming bookings:', err);
        setError('Failed to load upcoming bookings');
        setUpcomingBookings([]); // Ensure we have an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingBookings();
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Bookings</h3>
        </div>
        <div className="px-4 py-5 sm:p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Bookings</h3>
        <Link
          to="/vendor/bookings"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all
        </Link>
      </div>
      
      {error ? (
        <div className="px-4 py-5 sm:p-6 text-red-600">{error}</div>
      ) : upcomingBookings.length === 0 ? (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming bookings</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any upcoming bookings in the next 30 days.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {upcomingBookings.map((booking) => (
              <li key={booking._id}>
                <Link
                  to={`/vendor/bookings/${booking._id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="min-w-0 flex-1">
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {booking.event?.name || 'Event'}
                            </p>
                            <p className="mt-1 flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {booking.event?.location || 'Location not specified'}
                            </p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <p>{formatDate(booking.startDate)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <svg
                          className="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UpcomingBookings;
