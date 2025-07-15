import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '@/services/api/userService';
import { toast } from 'react-toastify';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      setLoading(true);
      
      // Auto-login for demo purposes
      const currentUser = await userService.autoLogin();
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to initialize user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const userData = await userService.login(email, password);
      setUser(userData);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (error) {
      toast.error('Login failed: ' + error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await userService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.info('You have been logged out');
    } catch (error) {
      toast.error('Logout failed: ' + error.message);
      throw error;
    }
  };

  const updateProfile = async (userData) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = await userService.updateProfile(user.Id, userData);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      toast.error('Failed to update profile: ' + error.message);
      throw error;
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      await userService.updatePreferences(user.Id, preferences);
      const updatedUser = await userService.getCurrentUser();
      setUser(updatedUser);
      toast.success('Preferences updated successfully');
      return updatedUser;
    } catch (error) {
      toast.error('Failed to update preferences: ' + error.message);
      throw error;
    }
  };

  const hasPermission = (permission) => {
    return userService.hasPermission(permission);
  };

  const isManager = () => {
    return userService.isManager();
  };

  const canViewAllDeals = () => {
    return userService.canViewAllDeals();
  };

  const canEditAllDeals = () => {
    return userService.canEditAllDeals();
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    updatePreferences,
    hasPermission,
    isManager,
    canViewAllDeals,
    canEditAllDeals
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};