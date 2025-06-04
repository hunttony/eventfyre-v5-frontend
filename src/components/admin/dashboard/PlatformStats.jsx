import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { adminApi } from '../../../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PlatformStats = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    users: { labels: [], data: [] },
    events: { labels: [], data: [] },
    revenue: { labels: [], data: [] },
    userActivity: { labels: [], data: [] },
    topCategories: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch this data from your API
        // For now, we'll generate mock data
        const mockData = generateMockData(timeRange);
        setStats(mockData);
      } catch (err) {
        console.error('Error fetching platform stats:', err);
        setError('Failed to load platform statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  const generateMockData = (range) => {
    // Generate mock data based on the selected time range
    let labels = [];
    const now = new Date();
    
    if (range === 'week') {
      // Last 7 days
      labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - i));
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
    } else if (range === 'month') {
      // Last 30 days
      labels = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (29 - i));
        return date.getDate();
      });
    } else if (range === 'year') {
      // Last 12 months
      labels = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(now.getMonth() - (11 - i));
        return date.toLocaleDateString('en-US', { month: 'short' });
      });
    }

    // Generate random data with realistic patterns
    const randomData = (length, min, max) => {
      let lastValue = Math.floor(Math.random() * (max - min + 1)) + min;
      return Array.from({ length }, () => {
        // Add some randomness but keep the trend
        lastValue = Math.max(min, Math.min(max, lastValue + (Math.random() * 20 - 10)));
        return Math.round(lastValue);
      });
    };

    return {
      users: {
        labels,
        data: randomData(labels.length, 50, 500)
      },
      events: {
        labels,
        data: randomData(labels.length, 5, 100)
      },
      revenue: {
        labels,
        data: randomData(labels.length, 100, 5000)
      },
      userActivity: {
        labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
        data: [10, 5, 8, 15, 35, 40, 30, 20]
      },
      topCategories: [
        { name: 'Wedding', count: 128, percent: 28 },
        { name: 'Corporate', count: 86, percent: 19 },
        { name: 'Birthday', count: 76, percent: 17 },
        { name: 'Concert', count: 65, percent: 14 },
        { name: 'Other', count: 104, percent: 22 },
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1F2937',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        callbacks: {
          label: function(context) {
            return context.parsed.y;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: '#F3F4F6',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(value) {
            return value % 1 === 0 ? value : '';
          },
        },
        border: {
          display: false,
          dash: [4, 4],
        },
        min: 0,
      },
    },
  };


  const userGrowthData = {
    labels: stats.users.labels,
    datasets: [
      {
        label: 'New Users',
        data: stats.users.data,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const eventTrendsData = {
    labels: stats.events.labels,
    datasets: [
      {
        label: 'Events Created',
        data: stats.events.data,
        backgroundColor: '#10B981',
        borderRadius: 4,
      },
    ],
  };

  const revenueData = {
    labels: stats.revenue.labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: stats.revenue.data,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const userActivityData = {
    labels: stats.userActivity.labels,
    datasets: [
      {
        label: 'Active Users',
        data: stats.userActivity.data,
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
    ],
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Platform Statistics</h3>
        </div>
        <div className="px-4 py-5 sm:p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Platform Statistics</h3>
            <p className="mt-1 text-sm text-gray-500">
              Overview of platform growth and performance
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1.5 text-sm font-medium rounded-l-md ${
                  timeRange === 'week'
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1.5 text-sm font-medium ${
                  timeRange === 'month'
                    ? 'bg-indigo-100 text-indigo-700 border-t border-b border-indigo-300'
                    : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('year')}
                className={`px-3 py-1.5 text-sm font-medium rounded-r-md ${
                  timeRange === 'year'
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:p-6">
        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* User Growth Chart */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">User Growth</h4>
                <span className="text-xs text-gray-500">{timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'Last 12 months'}</span>
              </div>
              <div className="h-64">
                <Line data={userGrowthData} options={chartOptions} />
              </div>
            </div>

            {/* Event Trends Chart */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">Event Trends</h4>
                <span className="text-xs text-gray-500">{timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'Last 12 months'}</span>
              </div>
              <div className="h-64">
                <Bar data={eventTrendsData} options={chartOptions} />
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">Revenue</h4>
                <span className="text-xs text-gray-500">{timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'Last 12 months'}</span>
              </div>
              <div className="h-64">
                <Line data={revenueData} options={chartOptions} />
              </div>
            </div>

            {/* User Activity & Categories */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">User Activity (24h)</h4>
                <div className="h-48">
                  <Bar data={userActivityData} options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        ...chartOptions.scales.y,
                        max: 50,
                        ticks: {
                          ...chartOptions.scales.y.ticks,
                          stepSize: 10,
                        },
                      },
                    },
                  }} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Top Categories</h4>
                  <span className="text-xs text-gray-500">By event count</span>
                </div>
                <div className="space-y-3">
                  {stats.topCategories.map((category, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{category.name}</span>
                        <span className="font-medium text-gray-900">{category.count} events</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${category.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformStats;
