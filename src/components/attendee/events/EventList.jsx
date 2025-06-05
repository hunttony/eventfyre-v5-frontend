import { Link } from 'react-router-dom';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { useAttendee } from '../../../contexts/AttendeeContext';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EventList = ({ 
  events = [], 
  emptyMessage = 'No events found.',
  loading = false,
  onSaveEvent,
  isSavedList = false,
  showFeedback = false,
  onFeedbackClick
}) => {
  EventList.propTypes = {
    events: PropTypes.array,
    emptyMessage: PropTypes.string,
    loading: PropTypes.bool,
    onSaveEvent: PropTypes.func,
    isSavedList: PropTypes.bool,
    showFeedback: PropTypes.bool,
    onFeedbackClick: PropTypes.func
  };

  const { saveEvent, unsaveEvent, isEventSaved } = useAttendee();
  const [localEvents, setLocalEvents] = useState(events);
  const [savingStates, setSavingStates] = useState({});

  // Update local events when props change
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  // Handle save/unsave event
  const handleSaveEvent = async (eventId, isCurrentlySaved) => {
    try {
      setSavingStates(prev => ({ ...prev, [eventId]: true }));
      
      if (isCurrentlySaved) {
        await unsaveEvent(eventId);
      } else {
        await saveEvent(eventId);
      }
      
      // Update local state if needed
      if (onSaveEvent) {
        onSaveEvent(eventId, !isCurrentlySaved);
      }
      
      // Update the local events to reflect the change
      setLocalEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId || event._id === eventId
            ? { ...event, isSaved: !isCurrentlySaved }
            : event
        )
      );
    } catch (error) {
      console.error('Error toggling save status:', error);
    } finally {
      setSavingStates(prev => ({ ...prev, [eventId]: false }));
    }
  };
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-48">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
        <p className="mt-1 text-sm text-gray-500">Check back later for new events.</p>
      </div>
    );
  }

  // Format date with error handling
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date not available';
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Date not available';
    }
  };

  // Format time range
  const formatTimeRange = (startDate, endDate) => {
    try {
      if (!startDate) return 'Time not available';
      
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      let timeStr = format(start, 'h:mm a');
      
      if (endDate) {
        const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
        timeStr += ` - ${format(end, 'h:mm a')}`;
      }
      
      return timeStr;
    } catch (e) {
      console.error('Error formatting time range:', e);
      return 'Time not available';
    }
  };

  // Get event status (upcoming, ongoing, past)
  const getEventStatus = (startDate, endDate) => {
    try {
      if (!startDate) return 'upcoming';
      
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = endDate ? (typeof endDate === 'string' ? parseISO(endDate) : endDate) : start;
      const now = new Date();

      if (isPast(end)) return 'past';
      if (isToday(start) || (now >= start && now <= end)) return 'ongoing';
      return 'upcoming';
    } catch (e) {
      console.error('Error determining event status:', e);
      return 'upcoming';
    }
  };
  
  // Get first image from event or return a placeholder
  const getEventImage = (event) => {
    if (event.image) return event.image;
    if (event.images && event.images.length > 0) return event.images[0];
    // Return a consistent but random image based on event ID or title
    const seed = event.id || event.title || 'event';
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/200`;
  };

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    past: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    upcoming: 'Upcoming',
    ongoing: 'Happening Now',
    past: 'Past',
  };

  // Handle empty state
  if (!loading && (!localEvents || localEvents.length === 0)) {
    return (
      <div className="text-center py-12">
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
        <p className="mt-1 text-sm text-gray-500">Check back later for new events.</p>
      </div>
    );
  }

  // Handle loading state with skeleton loaders
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {localEvents.map((event) => {
        const status = getEventStatus(event.startDate, event.endDate);
        const eventImage = getEventImage(event);
        const eventDate = formatDate(event.startDate);
        const eventTime = formatTimeRange(event.startDate, event.endDate);
        
        return (
          <div 
            key={event._id || event.id || Math.random().toString(36).substr(2, 9)}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
          >
            <div className="relative h-40 bg-gray-100">
              <img
                src={eventImage}
                alt={event.title || 'Event image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  // Fallback to a different image if the original fails to load
const seed = Math.floor(Math.random() * 1000);
e.target.src = `https://picsum.photos/seed/fallback-${seed}/400/200`;
                }}
              />
              <div className="absolute top-2 right-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}
                >
                  {statusLabels[status]}
                </span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {event.title || 'Untitled Event'}
                  </h3>
                  <button 
                    className={`ml-2 mt-1 ${event.isSaved || event.saved ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-gray-400'}`}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const eventId = event._id || event.id;
                      await handleSaveEvent(eventId, event.isSaved || event.saved);
                    }}
                    disabled={savingStates[event._id || event.id]}
                    title={event.isSaved || event.saved ? 'Remove from saved' : 'Save for later'}
                  >
                    {savingStates[event._id || event.id] ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {event.description && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {event.description}
                  </p>
                )}
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-start text-sm text-gray-600">
                    <svg
                      className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{eventDate} • {eventTime}</span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-start text-sm text-gray-600">
                      <svg
                        className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <Link
                  to={`/events/${event._id || event.id}`}
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 group"
                >
                  View details
                  <svg 
                    className="ml-1 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                {showFeedback && status === 'past' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onFeedbackClick) {
                        onFeedbackClick(event);
                      }
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={event.feedbackSubmitted}
                  >
                    {event.feedbackSubmitted ? 'Feedback Submitted' : 'Leave Feedback'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventList;
