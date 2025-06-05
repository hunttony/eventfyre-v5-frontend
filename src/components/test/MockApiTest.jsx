import { useEffect, useState } from 'react';
import { eventsApi } from '../../utils/eventsApi';

const MockApiTest = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all event types in parallel
        const [upcoming, past, saved] = await Promise.all([
          eventsApi.getUpcomingEvents(),
          eventsApi.getPastEvents(),
          eventsApi.getSavedEvents()
        ]);

        console.log('API Responses:', { upcoming, past, saved });
        
        // Handle different response formats
        setUpcomingEvents(upcoming.events || upcoming.data?.events || []);
        setPastEvents(past.events || past.data?.events || []);
        setSavedEvents(saved.events || saved.data?.events || []);
        
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading events...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mock API Test</h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        <EventList title="Upcoming Events" events={upcomingEvents} />
        <EventList title="Past Events" events={pastEvents} />
        <EventList title="Saved Events" events={savedEvents} />
      </div>
    </div>
  );
};

const EventList = ({ title, events }) => (
  <div className="border rounded-lg p-4">
    <h3 className="text-lg font-semibold mb-2">{title} ({events.length})</h3>
    {events.length > 0 ? (
      <ul className="space-y-2">
        {events.map(event => (
          <li key={event.id} className="border-b pb-2">
            <h4 className="font-medium">{event.title}</h4>
            <p className="text-sm text-gray-600">{event.description}</p>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(event.startDate).toLocaleDateString()}
              {event.location && ` • ${event.location.city}, ${event.location.state}`}
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-sm">No events found</p>
    )}
  </div>
);

export default MockApiTest;
