import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState('system'); // Può essere 'light', 'dark' o 'system'

  // Calcola quale tema usare effettivamente in questo momento
  const activeTheme = theme === 'system' ? (systemTheme || 'light') : theme;

  // All'avvio, controlla se l'utente aveva già salvato una preferenza
  useEffect(() => {
    AsyncStorage.getItem('app-theme-preference').then((savedTheme) => {
      if (savedTheme) setTheme(savedTheme);
    });
  }, []);

  // La funzione che useremo per il bottone
  const toggleTheme = () => {
    const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    AsyncStorage.setItem('app-theme-preference', nextTheme); // Salva la scelta
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}