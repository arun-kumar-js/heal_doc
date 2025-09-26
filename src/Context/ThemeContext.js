import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
        console.log('🎨 Theme loaded:', JSON.parse(savedTheme) ? 'Dark' : 'Light');
      }
    } catch (error) {
      console.error('❌ Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('themePreference', JSON.stringify(newTheme));
      console.log('🎨 Theme toggled to:', newTheme ? 'Dark' : 'Light');
    } catch (error) {
      console.error('❌ Error saving theme preference:', error);
    }
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // Background colors
      background: isDarkMode ? '#121212' : '#FFFFFF',
      surface: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      cardBackground: isDarkMode ? '#2D2D2D' : '#FFFFFF',
      
      // Text colors
      text: isDarkMode ? '#FFFFFF' : '#000000',
      textSecondary: isDarkMode ? '#B0B0B0' : '#666666',
      textTertiary: isDarkMode ? '#808080' : '#999999',
      
      // Primary colors
      primary: '#4A90E2',
      primaryDark: '#357ABD',
      primaryLight: '#E8F4FD',
      
      // Status colors
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      
      // Border and divider colors
      border: isDarkMode ? '#404040' : '#E0E0E0',
      divider: isDarkMode ? '#333333' : '#F0F0F0',
      
      // Shadow colors
      shadow: isDarkMode ? '#000000' : '#000000',
      
      // Tab bar colors
      tabBarBackground: isDarkMode ? '#1A1A1A' : '#2160D9',
      tabBarActive: isDarkMode ? '#FFFFFF' : '#FFFFFF',
      tabBarInactive: isDarkMode ? '#808080' : '#FFFFFF',
      
      // Header colors
      headerBackground: isDarkMode ? '#1E1E1E' : '#4A90E2',
      headerText: '#FFFFFF',
      
      // Input colors
      inputBackground: isDarkMode ? '#2D2D2D' : '#F5F5F5',
      inputBorder: isDarkMode ? '#404040' : '#E0E0E0',
      inputText: isDarkMode ? '#FFFFFF' : '#000000',
      
      // Button colors
      buttonPrimary: '#4A90E2',
      buttonSecondary: isDarkMode ? '#404040' : '#F0F0F0',
      buttonText: '#FFFFFF',
      
      // Status badge colors
      statusCompleted: '#4CAF50',
      statusScheduled: '#FF9800',
      statusPending: '#F44336',
      
      // Profile image placeholder
      profilePlaceholder: isDarkMode ? '#404040' : '#E8F4FD',
      
      // Card colors for dashboard stats
      cardPrimary: isDarkMode ? '#2D4A6B' : '#4A90E2',      // Blue card - Total Patients
      cardSecondary: isDarkMode ? '#6B2D4A' : '#FF6B8A',    // Pink card - Pending Patients
      cardText: '#FFFFFF',                                  // White text on cards
      cardTextSecondary: isDarkMode ? '#E0E0E0' : '#F0F0F0', // Secondary text on cards
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      round: 50,
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
      },
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

