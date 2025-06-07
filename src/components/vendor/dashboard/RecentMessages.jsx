import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { messagesApi } from '../../../utils/api';

const RecentMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        setLoading(true);
        const response = await messagesApi.getConversations();
        
        // Handle both direct array response and response.data array
        const conversationsData = Array.isArray(response) 
          ? response 
          : (Array.isArray(response?.data) ? response.data : []);
        
        // Sort by most recent message
        const sortedConversations = [...conversationsData].sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
          return dateB - dateA;
        });
        
        setConversations(sortedConversations.slice(0, 3));
      } catch (err) {
        console.error('Error fetching recent messages:', err);
        setError('Failed to load recent messages');
        setConversations([]); // Ensure we have an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMessages();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return format(messageDate, 'h:mm a');
    } else if (diffInDays < 7) {
      return format(messageDate, 'EEE');
    } else {
      return format(messageDate, 'MMM d');
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Messages</h3>
        </div>
        <div className="px-4 py-5 sm:p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Messages</h3>
        <Link
          to="/messages"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all
        </Link>
      </div>
      
      {error ? (
        <div className="px-4 py-5 sm:p-6 text-red-600">{error}</div>
      ) : conversations.length === 0 ? (
        <div className="px-4 py-5 sm:p-6 text-center">
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
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any messages yet.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {conversations.map((conversation) => (
            <li key={conversation._id}>
              <Link
                to={`/messages/${conversation.otherUser._id}${conversation.eventId ? `?eventId=${conversation.eventId}` : ''}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {conversation.otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {conversation.otherUser?.name || 'User'}
                        </div>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {conversation.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-xs text-gray-500">
                        {formatDate(conversation.lastMessage?.createdAt)}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  {conversation.event && (
                    <div className="mt-2 ml-14">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {conversation.event.name}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentMessages;
