import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_SAVED_PROPERTIES, MOCK_PROPERTIES, MOCK_OVERSEAS_PROPERTIES } from '../services/mockDataService';
import { notifyPropertySaved } from '../services/notificationsService';

const SavedPropertiesContext = createContext();

export const useSavedProperties = () => {
  const context = useContext(SavedPropertiesContext);
  if (!context) {
    throw new Error('useSavedProperties must be used within a SavedPropertiesProvider');
  }
  return context;
};

export const SavedPropertiesProvider = ({ children }) => {
  // Initialize from localStorage or use mock data
  const [savedProperties, setSavedProperties] = useState(() => {
    try {
      const stored = localStorage.getItem('estospaces_saved_properties');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.filter(p => p && p.id) : MOCK_SAVED_PROPERTIES;
      }
    } catch (err) {
      console.error('Error reading from localStorage:', err);
    }
    return MOCK_SAVED_PROPERTIES;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('estospaces_saved_properties', JSON.stringify(savedProperties));
  }, [savedProperties]);

  // Save a property
  const saveProperty = useCallback(async (property) => {
    try {
      setLoading(true);
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const propertyId = property.id || property;

      // Check if already saved
      if (savedProperties.some(p => p.id === propertyId)) {
        return { success: true, alreadySaved: true };
      }

      // If property object is passed, use it. If ID is passed, find it in mock data
      let propertyToSave = typeof property === 'object' ? property : null;

      if (!propertyToSave) {
        propertyToSave = [...MOCK_PROPERTIES, ...MOCK_OVERSEAS_PROPERTIES].find(p => p.id === propertyId);
      }

      if (!propertyToSave) {
        throw new Error('Property not found');
      }

      const newProperty = {
        ...propertyToSave,
        savedAt: new Date().toISOString()
      };

      setSavedProperties(prev => [...prev, newProperty]);

      // Notify
      const propertyTitle = newProperty.title || 'Property';
      const propertyImage = newProperty.image_urls?.[0] || newProperty.imageUrl;
      notifyPropertySaved('current-user', propertyTitle, propertyId, propertyImage);

      setLoading(false);
      return { success: true, data: newProperty };
    } catch (err) {
      console.error('Error saving property:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, [savedProperties]);

  // Remove a property
  const removeProperty = useCallback(async (propertyId) => {
    try {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error removing property:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // Toggle property saved status
  const toggleProperty = useCallback(async (property) => {
    const propertyId = property.id || property;
    const isSaved = savedProperties.some(p => p.id === propertyId);

    if (isSaved) {
      return await removeProperty(propertyId);
    } else {
      return await saveProperty(property);
    }
  }, [savedProperties, saveProperty, removeProperty]);

  // Check if a property is saved
  const isPropertySaved = useCallback((propertyId) => {
    return savedProperties.some(p => p.id === propertyId);
  }, [savedProperties]);

  const savedPropertyIds = new Set(savedProperties.filter(Boolean).map(p => p.id));
  const savedCount = savedProperties.length;

  return (
    <SavedPropertiesContext.Provider
      value={{
        savedProperties,
        savedPropertyIds,
        loading,
        error,
        saveProperty,
        removeProperty,
        toggleProperty,
        isPropertySaved,
        savedCount,
        refreshSavedProperties: () => { }, // No-op since we have local state
      }}
    >
      {children}
    </SavedPropertiesContext.Provider>
  );
};
