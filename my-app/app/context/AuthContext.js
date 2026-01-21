'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({});

// Use environment variable for backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credential) => {
    try {
      console.log('Sending credential to backend...');
      
      const response = await fetch(`${API_URL}/api/routes/auth/google/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || `Authentication failed (${response.status})`);
      }

      const data = await response.json();
      console.log('Received from backend:', data);
      
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoggingOut(true);
      
      // Call backend logout endpoint
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          await fetch(`${API_URL}/api/routes/auth/logout/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (backendError) {
          // Continue with logout even if backend call fails
          console.warn('Backend logout failed, continuing with local logout:', backendError);
        }
      }
      
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Clear user state
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even on error for security
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      return { success: false, error: error.message };
    } finally {
      setLoggingOut(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    loggingOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};