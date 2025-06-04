import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../utils/api';

const RecentUsers = () => {
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getUsers();
        const users = Array.isArray(response) ? response : (response?.data || []);
        
        // Sort by most recent signup
        const sortedUsers = [...users].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setRecentUsers(sortedUsers.slice(0, 5));
      } catch (err) {
        console.error('Error fetching recent users:', err);
        setError('Failed to load recent users');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      admin: 'bg-purple-100 text-purple-800',
      organizer: 'bg-blue-100 text-blue-800',
      vendor: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          roleClasses[role] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Users</h3>
        </div>
        <div className="px-4 py-5 sm:p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Users</h3>
        <Link
          to="/admin/users"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all
        </Link>
      </div>
      
      {error ? (
        <div className="px-4 py-5 sm:p-6 text-red-600">{error}</div>
      ) : recentUsers.length === 0 ? (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
          <p className="mt-1 text-sm text-gray-500">
            No users have signed up yet.
          </p>
        </div>
      ) : (
        <div className="bg-white overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {recentUsers.map((user) => (
              <li key={user._id}>
                <Link to={`/admin/users/${user._id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name || 'Unnamed User'}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            {getRoleBadge(user.role || 'user')}
                          </div>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <p className="text-sm text-gray-500">
                            {user.email}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <p>Joined {formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecentUsers;
