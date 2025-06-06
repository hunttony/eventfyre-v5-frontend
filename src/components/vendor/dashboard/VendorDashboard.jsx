import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorApi } from '../../../utils/api';
import StatsCard from '../../common/StatsCard';
import UpcomingBookings from './UpcomingBookings';
import AvailabilityCalendar from './AvailabilityCalendar';
import RecentMessages from './RecentMessages';

const VendorDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalEarnings: 0,
    responseRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch events and availability in parallel
        const [eventsResponse, availabilityResponse] = await Promise.all([
          vendorApi.getEvents().catch(err => {
            console.warn('Error fetching events:', err);
            return { data: [] }; // Return empty array on error
          }),
          vendorApi.getAvailability().catch(err => {
            console.warn('Error fetching availability:', err);
            return { data: [] }; // Return empty array on error
          })
        ]);

        // Extract data from responses
        const events = Array.isArray(eventsResponse?.data) ? eventsResponse.data : [];
        const availability = Array.isArray(availabilityResponse?.data) ? availabilityResponse.data : [];
        
        const now = new Date();
        const upcoming = events.filter(event => new Date(event.startDate) > now);
        
        // Calculate response rate (mock data for now)
        const responseRate = availability.length > 0 ? 
          Math.min(100, Math.max(0, Math.floor(Math.random() * 100))) : 0;
        
        // Calculate earnings (mock data for now)
        const totalEarnings = events.reduce((sum, event) => sum + (event.price || 0), 0);

        setStats({
          totalBookings: events.length,
          upcomingBookings: upcoming.length,
          totalEarnings,
          responseRate,
        });
      } catch (err) {
        console.error('Error in vendor dashboard data processing:', err);
        setError('Failed to process dashboard data. Some features may be limited.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <div className="flex space-x-3">
          <Link
            to="/vendor/availability"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Manage Availability
          </Link>
          <Link
            to="/vendor/services"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            My Services
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          link="/vendor/bookings"
          linkText="View all bookings"
        />
        <StatsCard
          title="Upcoming"
          value={stats.upcomingBookings}
          icon={
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatsCard
          title="Total Earnings"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          icon={
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          link="/vendor/earnings"
          linkText="View earnings"
        />
        <StatsCard
          title="Response Rate"
          value={`${stats.responseRate}%`}
          icon={
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
      </div>

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <UpcomingBookings />
          <RecentMessages />
        </div>
        
        {/* Right Column */}
        <div>
          <AvailabilityCalendar />
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
