import { useState, useEffect } from 'react';
import { eventsApi } from '../../../utils/api';
import mockEventsApi from '../../../utils/mockApi';
import StatsCard from '../../common/StatsCard';
import { Tab } from '@headlessui/react';
import EventList from '../events/EventList';

const AttendeeDashboard = () => {
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    pastEvents: 0,
    savedEvents: 0,
  });
  
  const [events, setEvents] = useState({
    upcoming: [],
    past: [],
    saved: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Function to fetch all events data
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[AttendeeDashboard] Fetching events data...');
      
      // Fetch all event data in parallel
      const [upcomingResponse, pastResponse, savedResponse] = await Promise.all([
        mockEventsApi.getUpcomingEvents(),
        mockEventsApi.getPastEvents(),
        mockEventsApi.getSavedEvents()
      ]);
      
      console.log('[AttendeeDashboard] Fetched data:', {
        upcoming: upcomingResponse,
        past: pastResponse,
        saved: savedResponse
      });
      
      // Update events state
      setEvents({
        upcoming: upcomingResponse?.data || [],
        past: pastResponse?.data || [],
        saved: savedResponse?.data || []
      });
      
      // Update stats
      setStats({
        upcomingEvents: upcomingResponse?.data?.length || 0,
        pastEvents: pastResponse?.data?.length || 0,
        savedEvents: savedResponse?.data?.length || 0
      });
      
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle refresh action
  const handleRefresh = async () => {
    await fetchEvents();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  // Function to get tab name by index
  const getTabName = (index) => {
    switch (index) {
      case 0: return 'upcoming';
      case 1: return 'past';
      case 2: return 'saved';
      default: return 'upcoming';
    }
  };

  // Get current tab events
  const currentTab = getTabName(selectedTab);
  const currentEvents = events[currentTab] || [];
  const emptyMessages = {
    upcoming: 'No upcoming events found.',
    past: 'No past events found.',
    saved: 'No saved events found.'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon="calendar"
          color="indigo"
          onClick={() => setSelectedTab(0)}
          isActive={selectedTab === 0}
        />
        <StatsCard
          title="Past Events"
          value={stats.pastEvents}
          icon="check-circle"
          color="green"
          onClick={() => setSelectedTab(1)}
          isActive={selectedTab === 1}
        />
        <StatsCard
          title="Saved Events"
          value={stats.savedEvents}
          icon="bookmark"
          color="yellow"
          onClick={() => setSelectedTab(2)}
          isActive={selectedTab === 2}
        />
      </div>

      {/* Events Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="border-b border-gray-200 flex">
            <Tab
              className={({ selected }) =>
                `px-4 py-3 text-sm font-medium ${selected ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
              }
            >
              Upcoming Events
            </Tab>
            <Tab
              className={({ selected }) =>
                `px-4 py-3 text-sm font-medium ${selected ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
              }
            >
              Past Events
            </Tab>
            <Tab
              className={({ selected }) =>
                `px-4 py-3 text-sm font-medium ${selected ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
              }
            >
              Saved Events
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel className="p-4">
              <EventList 
                events={events.upcoming} 
                emptyMessage={emptyMessages.upcoming}
                loading={loading}
              />
            </Tab.Panel>
            <Tab.Panel className="p-4">
              <EventList 
                events={events.past} 
                emptyMessage={emptyMessages.past}
                loading={loading}
              />
            </Tab.Panel>
            <Tab.Panel className="p-4">
              <EventList 
                events={events.saved} 
                emptyMessage={emptyMessages.saved}
                loading={loading}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Please try refreshing the page or contact support if the issue persists.</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeeDashboard;