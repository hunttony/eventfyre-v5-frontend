import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { get, del } from '../../utils/api';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  UserGroupIcon,
  TagIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Components
import VendorSelection from './VendorSelection';
import AttendeeList from './AttendeeList';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [deleting, setDeleting] = useState(false);
  
  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await get(`/events/${eventId}`);
        setEvent(data.event);
        setError('');
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId]);
  
  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(true);
      await del(`/events/${eventId}`);
      toast.success('Event deleted successfully');
      navigate('/organizer/events');
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error(err.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };
  
  // Format date range
  const formatDateRange = (start, end) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    // If same day, show date once with time range
    if (startDate.toDateString() === endDate.toDateString()) {
      return (
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
          <span>{format(startDate, 'MMMM d, yyyy')}</span>
          <span className="mx-2">•</span>
          <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
          <span>{format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}</span>
        </div>
      );
    }
    
    // Different days
    return (
      <div className="space-y-2">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
          <span>Starts: {format(startDate, 'MMMM d, yyyy h:mm a')}</span>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
          <span>Ends: {format(endDate, 'MMMM d, yyyy h:mm a')}</span>
        </div>
      </div>
    );
  };
  
  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }
  
  // Event not found
  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Event Not Found</h2>
          <p className="mt-2 text-gray-600">The requested event could not be found or you don't have permission to view it.</p>
          <div className="mt-6">
            <Link
              to="/organizer/events"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const { 
    title, 
    description, 
    startDate, 
    endDate, 
    location, 
    category, 
    status, 
    maxAttendees,
    currentAttendees,
    price,
    imageUrl,
    vendors = [],
    attendees = []
  } = event;
  
  // Calculate attendance percentage
  const attendancePercentage = maxAttendees 
    ? Math.round((currentAttendees / maxAttendees) * 100) 
    : 0;
  
  // Status badge colors
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  
  // Tab component
  const TabButton = ({ name, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
        isActive
          ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-5 w-5 mr-2" />
      {name.charAt(0).toUpperCase() + name.slice(1)}
    </button>
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with back button and actions */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <Link 
            to="/organizer/events" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Events
          </Link>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Link
            to={`/organizer/events/${eventId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDeleteEvent}
            disabled={deleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <TrashIcon className="-ml-1 mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Event image */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="bg-gray-200 h-64 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <TabButton 
            name="details" 
            icon={InformationCircleIcon} 
            isActive={activeTab === 'details'}
          />
          <TabButton 
            name="vendors" 
            icon={UserGroupIcon} 
            isActive={activeTab === 'vendors'}
          />
          <TabButton 
            name="attendees" 
            icon={UsersIcon} 
            isActive={activeTab === 'attendees'}
          />
          <TabButton 
            name="analytics" 
            icon={DocumentTextIcon} 
            isActive={activeTab === 'analytics'}
          />
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {activeTab === 'details' && (
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Event Information</h3>
            
            <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {/* Date and Time */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Date & Time
                </h4>
                <div className="text-sm text-gray-900">
                  {formatDateRange(startDate, endDate)}
                </div>
              </div>
              
              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                  <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Location
                </h4>
                <div className="text-sm text-gray-900">
                  {location?.name ? (
                    <>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-gray-600">
                        {[location.address, location.city, location.state, location.zipCode, location.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {location.url && (
                        <a 
                          href={location.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                        >
                          View on map
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">No location specified</p>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg sm:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Description
                </h4>
                <div className="prose max-w-none text-sm text-gray-900">
                  {description || 'No description provided.'}
                </div>
              </div>
              
              {/* Event Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                  <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Event Details
                </h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900">{category || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="text-sm text-gray-900">
                      {price ? `$${parseFloat(price).toFixed(2)}` : 'Free'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                    <dd className="text-sm text-gray-900">
                      {maxAttendees ? `${currentAttendees || 0} / ${maxAttendees} (${attendancePercentage}%)` : 'Unlimited'}
                    </dd>
                  </div>
                </dl>
              </div>
              
              {/* Attendance Progress */}
              {maxAttendees > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Attendance</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${attendancePercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {currentAttendees || 0} of {maxAttendees} spots filled
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'vendors' && (
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Vendors</h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Vendor
              </button>
            </div>
            
            <VendorSelection 
              eventId={eventId} 
              currentVendors={vendors} 
            />
          </div>
        )}
        
        {activeTab === 'attendees' && (
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Attendees</h3>
            <AttendeeList 
              eventId={eventId}
              attendees={attendees}
              maxAttendees={maxAttendees}
            />
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Event Analytics</h3>
            <p className="mt-2 text-sm text-gray-500">
              Analytics data will be available after the event has started.
            </p>
            {/* Analytics content would go here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
