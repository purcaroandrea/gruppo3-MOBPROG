import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState('system');

  const activeTheme = theme === 'system' ? (systemTheme || 'light') : theme;

  // All'avvio, controlla se l'utente aveva già salvato una preferenza
  useEffect(() => {
    AsyncStorage.getItem('app-theme-preference').then((savedTheme) => {
      if (savedTheme) setTheme(savedTheme);
    });
  }, []);

  const toggleTheme = () => {
    const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    AsyncStorage.setItem('app-theme-preference', nextTheme);
  };

  const selectTheme = (newTheme) => {
    setTheme(newTheme);
    AsyncStorage.setItem('app-theme-preference', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, theme, selectTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}