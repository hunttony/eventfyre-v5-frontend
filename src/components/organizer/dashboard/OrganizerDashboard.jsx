import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { organizerApi } from '../../../utils/api';
import StatsCard from '../../common/StatsCard';
import RecentEvents from './RecentEvents';
import UpcomingEvents from './UpcomingEvents';
import VendorAvailability from './VendorAvailability';
import { CalendarIcon, PlusIcon, UserGroupIcon, InboxIcon, BellIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const OrganizerDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalVendors: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [quickActions] = useState([
    { id: 1, name: 'Create Event', href: '/organizer/events/new', icon: PlusIcon, bgColor: 'bg-indigo-600' },
    { id: 2, name: 'Invite Vendors', href: '/organizer/vendors/invite', icon: UserGroupIcon, bgColor: 'bg-green-600' },
    { id: 3, name: 'View Calendar', href: '/organizer/calendar', icon: CalendarIcon, bgColor: 'bg-purple-600' },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        
        // Debug: Log the API base URL
        console.log('API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1');
        
        // Fetch both events and vendors in parallel
        const [eventsResponse, vendorsResponse] = await Promise.all([
          organizerApi.getEvents().catch(err => {
            console.error('Error fetching events:', err);
            return [];
          }),
          organizerApi.getAvailableVendors().catch(err => {
            console.error('Error fetching vendors:', err);
            return [];
          }),
        ]);

        console.log('Events Response:', eventsResponse);
        console.log('Vendors Response:', vendorsResponse);

        const events = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse?.data || []);
        const vendors = Array.isArray(vendorsResponse) ? vendorsResponse : (vendorsResponse?.data || []);
        
        console.log('Processed Events:', events);
        console.log('Processed Vendors:', vendors);
        
        const now = new Date();
        const upcoming = events.filter(event => event?.startDate && new Date(event.startDate) > now);
        const active = events.filter(event => 
          event?.startDate && event?.endDate &&
          new Date(event.startDate) <= now && new Date(event.endDate) >= now
        );

        console.log('Upcoming Events:', upcoming);
        console.log('Active Events:', active);

        const newStats = {
          totalEvents: events.length,
          activeEvents: active.length,
          totalVendors: vendors.length,
          upcomingEvents: upcoming.length,
        };
        
        setStats(newStats);
        console.log('Updated stats:', newStats);
      } catch (err) {
        console.error('Error in fetchDashboardData:', err);
        setError('Failed to load dashboard data. Please try again later.');
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

  // Handle quick action click
  const handleQuickAction = (action) => {
    navigate(action.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            className="inline-flex items-center p-2 border border-gray-300 rounded-full shadow-sm text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="sr-only">View notifications</span>
            <div className="relative">
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadMessages}
                </span>
              )}
            </div>
          </button>
          <Link
            to="/organizer/events/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Event
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {quickActions.map((action) => (
              <div
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="group cursor-pointer overflow-hidden rounded-lg bg-white border border-gray-200 hover:border-indigo-500 transition-colors duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md ${action.bgColor} text-white`}>
                      <action.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                        {action.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          icon={
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          link="/organizer/events"
          linkText="View all events"
        />
        <StatsCard
          title="Active Events"
          value={stats.activeEvents}
          icon={
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
        <StatsCard
          title="Available Vendors"
          value={stats.totalVendors}
          icon={
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          link="/organizer/vendors"
          linkText="Browse vendors"
        />
        <StatsCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          icon={
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          link="/organizer/events"
          linkText="View all events"
          trend="up"
          trendValue="12%"
        />
        <StatsCard
          title="Active Events"
          value={stats.activeEvents}
          icon={
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
          trend="up"
          trendValue="5%"
        />
        <StatsCard
          title="Available Vendors"
          value={stats.totalVendors}
          icon={
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          link="/organizer/vendors"
          linkText="Browse vendors"
          trend="up"
          trendValue="8%"
        />
        <StatsCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="down"
          trendValue="3%"
        />
      </div>

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <RecentEvents />
          <VendorAvailability />
        </div>
        
        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <UpcomingEvents />
          
          {/* Messages/Notifications Card */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Messages</h3>
                <Link to="/organizer/messages" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  View all
                </Link>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No new messages</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You'll see new messages here when you receive them.
                </p>
                <div className="mt-6">
                  <Link
                    to="/organizer/messages/compose"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Message
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
