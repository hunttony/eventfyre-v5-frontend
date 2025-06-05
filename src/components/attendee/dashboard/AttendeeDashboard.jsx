import { useState, useEffect, useCallback } from 'react';
import { Tab } from '@headlessui/react';
import { useAttendee } from '../../../contexts/AttendeeContext';
import StatsCard from '../../common/StatsCard';
import EventList from '../events/EventList';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import FeedbackModal from '../feedback/FeedbackModal';

const AttendeeDashboard = () => {
  const {
    events,
    loading,
    error,
    fetchEvents,
    saveEvent,
    unsaveEvent,
    submitFeedback
  } = useAttendee();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  
  // Show success message after feedback submission
  useEffect(() => {
    if (feedbackSuccess) {
      const timer = setTimeout(() => {
        setFeedbackSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackSuccess]);
  
  // Calculate stats
  const stats = {
    upcomingEvents: events.upcoming.length,
    pastEvents: events.past.length,
    savedEvents: events.saved.length,
    totalSessions: events.upcoming.reduce(
      (total, event) => total + (event.sessions?.length || 0), 0
    )
  };
  
  // Memoize toggle save handler
  const handleToggleSave = useCallback(async (eventId, isCurrentlySaved) => {
    try {
      if (isCurrentlySaved) {
        await unsaveEvent(eventId);
      } else {
        await saveEvent(eventId);
      }
      // The events will be automatically refreshed by the context
    } catch (error) {
      console.error('Error toggling save status:', error);
    }
  }, [saveEvent, unsaveEvent]);

  // Memoize feedback handlers
  const handleOpenFeedback = useCallback((event) => {
    setSelectedEvent(event);
    setFeedbackModalOpen(true);
  }, []);

  // Memoize feedback submission
  const handleFeedbackSubmit = useCallback(async (feedbackData) => {
    try {
      await submitFeedback(feedbackData);
      setFeedbackSuccess(true);
      // Refresh events to show updated feedback status
      await fetchEvents();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackSuccess(false);
      throw error; // Re-throw to be handled by the modal
    }
  }, [submitFeedback, fetchEvents]);

  // Memoize refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Render loading state
  if (loading && !events.upcoming.length) {
    return <LoadingSpinner />;
  }
  
  // Render error state
  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={fetchEvents}
      />
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      {feedbackSuccess && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Thank you for your feedback! Your input helps us improve future events.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Upcoming Events" 
          value={stats.upcomingEvents} 
          icon="📅"
          description="Events you're attending"
        />
        <StatsCard 
          title="Past Events" 
          value={stats.pastEvents} 
          icon="✅"
          description="Events you've attended"
        />
        <StatsCard 
          title="Saved Events" 
          value={stats.savedEvents} 
          icon="🔖"
          description="Events you're interested in"
        />
        <StatsCard 
          title="Upcoming Sessions" 
          value={stats.totalSessions} 
          icon="🗓️"
          description="Sessions in your schedule"
        />
      </div>
      
      {/* Events Tabs */}
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          {['Upcoming', 'Past', 'Saved'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium rounded-md 
                ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                ${
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        
        <Tab.Panels>
          <Tab.Panel>
            <EventList 
              events={events.upcoming} 
              emptyMessage="No upcoming events. Check back later!"
              onSaveEvent={(eventId) => handleToggleSave(eventId, false)}
            />
          </Tab.Panel>
          <Tab.Panel>
            <EventList 
              events={events.past} 
              emptyMessage="You haven't attended any events yet."
              showFeedback
              onFeedbackClick={handleOpenFeedback}
            />
          </Tab.Panel>
          <Tab.Panel>
            <EventList 
              events={events.saved} 
              emptyMessage="You haven't saved any events yet."
              onSaveEvent={(eventId) => handleToggleSave(eventId, true)}
              isSavedList
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => {
          setFeedbackModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default AttendeeDashboard;