import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ru');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('@language');
      if (saved) setLanguage(saved);
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLang) => {
    try {
      await AsyncStorage.setItem('@language', newLang);
      setLanguage(newLang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key) => translations[language]?.[key] || key;

  if (isLoading) return null;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
