import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('dp_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response?.data?.user) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('dp_token');
        }
      } catch (error) {
        localStorage.removeItem('dp_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response?.data?.token) {
      localStorage.setItem('dp_token', response.data.token);
      setUser(response.data.user);
    }
    return response.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('dp_token');
      setUser(null);
    }
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
