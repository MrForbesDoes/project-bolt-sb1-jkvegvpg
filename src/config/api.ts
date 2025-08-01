// API configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'development' ? 'http://localhost:3001' : 'https://litestart-backend.onrender.com');

// Fallback function for when backend is not available
const fallbackSignup = async (userData: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Store in localStorage as fallback
  const existingUsers = JSON.parse(localStorage.getItem('litestart_users') || '[]');
  const newUser = {
    _id: Date.now().toString(),
    ...userData,
    isEmailVerified: true,
    signupDate: new Date().toISOString()
  };
  existingUsers.push(newUser);
  localStorage.setItem('litestart_users', JSON.stringify(existingUsers));
  
  return {
    message: 'Thank you for signing up! You have been added to the waitlist.',
    user: newUser
  };
};

const fallbackGetUsers = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.parse(localStorage.getItem('litestart_users') || '[]');
};

export const API_ENDPOINTS = {
  SIGNUP: API_BASE_URL ? `${API_BASE_URL}/api/signup` : null,
  USERS: API_BASE_URL ? `${API_BASE_URL}/api/users` : null,
  VERIFY_EMAIL: API_BASE_URL ? `${API_BASE_URL}/api/verify-email` : null,
};

// API wrapper functions that handle fallbacks
export const apiCall = {
  signup: async (userData: any) => {
    if (API_BASE_URL) {
      const response = await fetch(API_ENDPOINTS.SIGNUP!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return response.json();
    } else {
      return fallbackSignup(userData);
    }
  },
  
  getUsers: async () => {
    if (API_BASE_URL) {
      const response = await fetch(API_ENDPOINTS.USERS!);
      return response.json();
    } else {
      return fallbackGetUsers();
    }
  },
  
  deleteUser: async (id: string) => {
    if (API_BASE_URL) {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    } else {
      const users = JSON.parse(localStorage.getItem('litestart_users') || '[]');
      const filteredUsers = users.filter((user: any) => user._id !== id);
      localStorage.setItem('litestart_users', JSON.stringify(filteredUsers));
      return { message: 'User deleted successfully' };
    }
  }
};

export default API_BASE_URL; 