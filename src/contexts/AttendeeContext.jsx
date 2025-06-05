import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { eventsApi } from '../utils/api';
import { useAuth } from './AuthContext';

const AttendeeContext = createContext();

export const AttendeeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState({
    upcoming: [],
    past: [],
    saved: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching events...');
      
      const [upcoming, past, saved] = await Promise.all([
        eventsApi.getUpcomingEvents().catch(err => {
          console.error('Error fetching upcoming events:', err);
          return { data: [] }; // Return empty array on error
        }),
        eventsApi.getPastEvents().catch(err => {
          console.error('Error fetching past events:', err);
          return { data: [] }; // Return empty array on error
        }),
        eventsApi.getSavedEvents().catch(err => {
          console.error('Error fetching saved events:', err);
          return { data: [] }; // Return empty array on error
        })
      ]);
      
      console.log('Fetched events:', { upcoming, past, saved });
      
      setEvents({
        upcoming: upcoming?.data || [],
        past: past?.data || [],
        saved: saved?.data || []
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch events';
      setError(errorMsg);
      console.error('Error in fetchEvents:', err);
      
      // Set empty arrays to prevent UI from breaking
      setEvents({
        upcoming: [],
        past: [],
        saved: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const registerForEvent = async (eventId, registrationData) => {
    try {
      setLoading(true);
      const response = await eventsApi.registerForEvent(eventId, registrationData);
      await fetchEvents(); // Refresh events after registration
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async (eventId) => {
    try {
      setLoading(true);
      await eventsApi.saveEvent(eventId);
      await fetchEvents(); // Refresh events
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to save event');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const unsaveEvent = async (eventId) => {
    try {
      setLoading(true);
      await eventsApi.unsaveEvent(eventId);
      await fetchEvents(); // Refresh events
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to unsave event');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (eventId, feedbackData) => {
    try {
      setLoading(true);
      const response = await eventsApi.submitFeedback(eventId, feedbackData);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch events when the component mounts or when the user changes
  useEffect(() => {
    if (currentUser) {
      console.log('Current user detected, fetching events...');
      fetchEvents();
    } else {
      console.log('No current user, skipping events fetch');
      // Reset events when user logs out
      setEvents({
        upcoming: [],
        past: [],
        saved: []
      });
    }
  }, [fetchEvents, currentUser]);

  return (
    <AttendeeContext.Provider
      value={{
        events,
        loading,
        error,
        fetchEvents,
        registerForEvent,
        saveEvent,
        unsaveEvent,
        submitFeedback
      }}
    >
      {children}
    </AttendeeContext.Provider>
  );
};

export const useAttendee = () => {
  const context = useContext(AttendeeContext);
  if (!context) {
    throw new Error('useAttendee must be used within an AttendeeProvider');
  }
  return context;
};
