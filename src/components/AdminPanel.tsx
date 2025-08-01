import React, { useState, useEffect } from 'react';
import { apiCall } from '../config/api';
import API_BASE_URL from '../config/api';

interface User {
  _id: string;
  name: string;
  email: string;
  userType: 'startup' | 'student';
  isEmailVerified: boolean;
  signupDate: string;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'startup' | 'student'>('all');
  const [nameFilter, setNameFilter] = useState('');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin password - in production, this should be more secure
  const ADMIN_PASSWORD = 'BES25';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      // Store authentication in session storage
      sessionStorage.setItem('admin_authenticated', 'true');
    } else {
      setLoginError('Incorrect password');
      setPassword('');
    }
  };

  // Check if already authenticated
  useEffect(() => {
    const authenticated = sessionStorage.getItem('admin_authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesType = userTypeFilter === 'all' || user.userType === userTypeFilter;
    const matchesName = user.name.toLowerCase().includes(nameFilter.toLowerCase());
    return matchesType && matchesName;
  });

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      setBackendStatus(response.ok ? 'online' : 'offline');
    } catch (err) {
      setBackendStatus('offline');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiCall.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      console.log('Deleting user with ID:', id);
      const result = await apiCall.deleteUser(id);
      console.log('Delete result:', result);

      // Refresh the data to ensure consistency
      await fetchUsers();
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const deleteAllUsers = async () => {
    if (!confirm('Are you sure you want to delete ALL users? This cannot be undone!')) {
      return;
    }

    try {
      console.log('Deleting all users');
      
      if (backendStatus === 'online') {
        // Call the backend API to delete all users
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete all users');
        }
      } else {
        // Clear local storage if backend is offline
        localStorage.removeItem('litestart_users');
      }
      
      // Refresh the data to ensure consistency
      await fetchUsers();
      alert('All users deleted successfully!');
    } catch (err) {
      console.error('Delete all error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete all users');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkBackendStatus();
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">LiteStart Admin</h1>
            <p className="text-gray-600">Enter password to access admin panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
            </div>
            
            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {loginError}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">LiteStart Admin Panel</h1>
            <div className="space-x-4">
              <button
                onClick={fetchUsers}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Refresh
              </button>
              <button
                onClick={deleteAllUsers}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Delete All Users
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Backend Status Indicator */}
          <div className={`mb-4 p-3 rounded-lg ${
            backendStatus === 'online' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : backendStatus === 'offline'
              ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
              : 'bg-gray-100 border border-gray-400 text-gray-700'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                backendStatus === 'online' ? 'bg-green-500' : 
                backendStatus === 'offline' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}></div>
              <span className="font-medium">
                {backendStatus === 'online' ? '🟢 Render Backend Active - Connected to MongoDB' :
                 backendStatus === 'offline' ? '🟡 Render Backend Sleeping - Using Local Storage' :
                 '⚪ Checking Render connection...'}
              </span>
            </div>
            {backendStatus === 'offline' && (
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  <strong>⚠️ Render Backend Status:</strong> The backend on Render may be sleeping (free tier behavior). New signups are stored locally and will sync when the backend wakes up.
                </p>
                <p className="text-sm">
                  <strong>What happens:</strong> When users sign up while backend is sleeping, data goes to their local storage first, then syncs to MongoDB when Render wakes up (~30 seconds).
                </p>
                <p className="text-sm">
                  <strong>Current data source:</strong> Local browser storage (showing cached data while backend wakes up)
                </p>
                <p className="text-sm text-blue-600">
                  💡 This is normal for Render's free tier. Data will appear here once the backend is fully awake.
                </p>
              </div>
            )}
            {backendStatus === 'online' && (
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  <strong>🟢 Render Backend Active:</strong> Connected to MongoDB - viewing all global signups from users worldwide.
                </p>
                <p className="text-sm">
                  <strong>Status:</strong> Backend is awake and processing requests in real-time.
                </p>
                <p className="text-sm text-green-600">
                  ✅ All new signups are immediately saved to MongoDB and visible here.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-8 space-y-2 md:space-y-0">
            <p className="text-gray-600">
              Total Users: <span className="font-semibold">{users.length}</span>
            </p>
            <p className="text-blue-700">
              Startups: <span className="font-semibold">{users.filter(u => u.userType === 'startup').length}</span>
            </p>
            <p className="text-green-700">
              Students: <span className="font-semibold">{users.filter(u => u.userType === 'student').length}</span>
            </p>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
              <select
                value={userTypeFilter}
                onChange={e => setUserTypeFilter(e.target.value as 'all' | 'startup' | 'student')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="startup">Startups</option>
                <option value="student">Students</option>
              </select>
              <input
                type="text"
                placeholder="Search by name..."
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signup Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.userType === 'startup' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.userType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.signupDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isEmailVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isEmailVerified ? '✅ Verified' : '❌ Not Verified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 