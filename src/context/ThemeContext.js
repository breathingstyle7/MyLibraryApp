import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedTheme = await AsyncStorage.getItem('isDarkMode');
    const savedFontSize = await AsyncStorage.getItem('fontSize');
    if (savedTheme !== null) setIsDarkMode(JSON.parse(savedTheme));
    if (savedFontSize !== null) setFontSize(JSON.parse(savedFontSize));
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(newTheme));
  };

  const updateFontSize = async (size) => {
    setFontSize(size);
    await AsyncStorage.setItem('fontSize', JSON.stringify(size));
  };

  const theme = {
    background: isDarkMode ? '#121212' : '#f8f9fa',
    card: isDarkMode ? '#1e1e1e' : '#fff',
    text: isDarkMode ? '#fff' : '#333',
    subText: isDarkMode ? '#aaa' : '#666',
    primary: '#2e64e5',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, fontSize, updateFontSize, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};