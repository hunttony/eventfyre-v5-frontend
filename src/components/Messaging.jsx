import { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../utils/api';

function Messaging() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState({
    conversations: true,
    messages: false,
    sending: false
  });
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await messagesApi.getConversations();
        setConversations(response.data || []);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(prev => ({ ...prev, conversations: false }));
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = useCallback(async () => {
        if (!selectedConversation) return;
        
        setLoading(prev => ({ ...prev, messages: true }));
        try {
          const response = await messagesApi.getMessages(
            selectedConversation.userId,
            selectedConversation.eventId || null
          );
          setMessages(response.data || []);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setError('Failed to load messages');
        } finally {
          setLoading(prev => ({ ...prev, messages: false }));
        }
      }, [selectedConversation]);

      fetchMessages();
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(prev => ({ ...prev, sending: true }));
    
    try {
      await messagesApi.sendMessage({
        recipientId: selectedConversation.userId,
        eventId: selectedConversation.eventId || undefined,
        content: newMessage.trim()
      });

      // Refresh messages
      const response = await messagesApi.getMessages(
        selectedConversation.userId,
        selectedConversation.eventId || null
      );
      setMessages(response.data || []);
      setNewMessage('');
      setError('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-gray-100 rounded-lg shadow">
      {/* Conversations sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
        </div>
        
        {loading.conversations ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-gray-500">No conversations yet</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {conversations.map((conv) => (
              <li 
                key={`${conv.userId}-${conv.eventId || 'none'}`}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedConversation?.userId === conv.userId && selectedConversation?.eventId === conv.eventId ? 'bg-blue-50' : ''}`}
                onClick={() => setSelectedConversation({
                  userId: conv.userId,
                  eventId: conv.eventId,
                  userName: conv.userName,
                  eventTitle: conv.eventTitle
                })}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">
                    {conv.userName}
                    {conv.eventTitle && <span className="text-sm text-gray-500 ml-2">({conv.eventTitle})</span>}
                  </h3>
                  {conv.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {conv.lastMessage?.content || 'No messages yet'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedConversation.userName}
                {selectedConversation.eventTitle && (
                  <span className="text-sm text-gray-600 ml-2">• {selectedConversation.eventTitle}</span>
                )}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading.messages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg._id} 
                    className={`flex ${msg.senderId._id === localStorage.getItem('userId') ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.senderId._id === localStorage.getItem('userId') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId._id === localStorage.getItem('userId') ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading.sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading.sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default Messaging;
