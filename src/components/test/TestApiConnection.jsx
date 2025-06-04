import { useEffect, useState } from 'react';
import { authApi } from '../../utils/api';

const TestApiConnection = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing API connection to /auth/me...');
        const response = await authApi.getMe();
        console.log('API Response:', response);
        setTestResult({
          success: true,
          data: response.data,
          status: response.status,
          statusText: response.statusText
        });
      } catch (err) {
        console.error('API Test Error:', err);
        setError({
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) return <div>Testing API connection...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <h2 className="font-bold">Connection Failed</h2>
          <p><strong>Error:</strong> {error.message}</p>
          {error.status && <p><strong>Status:</strong> {error.status} {error.statusText}</p>}
          {error.data && (
            <div className="mt-2 p-2 bg-red-50 rounded">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(error.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : testResult ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          <h2 className="font-bold">Connection Successful!</h2>
          <p><strong>Status:</strong> {testResult.status} {testResult.statusText}</p>
          <div className="mt-2 p-2 bg-green-50 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Verify the backend server is running at <code>http://localhost:5000</code></li>
          <li>Check the backend CORS configuration allows requests from <code>http://localhost:5173</code></li>
          <li>Verify the API endpoints match between frontend and backend</li>
          <li>Check the browser's Network tab for detailed request/response information</li>
          <li>Inspect the browser's Console for any error messages</li>
        </ol>
      </div>
    </div>
  );
};

export default TestApiConnection;
