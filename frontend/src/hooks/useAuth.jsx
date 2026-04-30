// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api'; // Adjust path as needed

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access');
        if (accessToken) {
          // Fetch user profile with the stored token
          const response = await authAPI.profile();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth error:', error);
        // If token is invalid, clear it
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // Call your actual login API
      const response = await authAPI.login({ username, password });
      
      // Store tokens
      if (response.data.access) {
        localStorage.setItem('access', response.data.access);
      }
      if (response.data.refresh) {
        localStorage.setItem('refresh', response.data.refresh);
      }
      
      // Fetch and store user data
      const profileResponse = await authAPI.profile();
      const userData = profileResponse.data;
      setUser(userData);
      
      // Also store user in localStorage for quick access (optional)
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to be caught by your component
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    // Optional: Call logout API if your backend has one
    // authAPI.logout();
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}