import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PropertyFilterContext = createContext(null);

export const PropertyFilterProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial tab from URL or default to 'all'
  const getInitialTab = useCallback(() => {
    if (location.pathname === '/user/dashboard/discover') {
      const searchParams = new URLSearchParams(location.search);
      const type = searchParams.get('type');
      if (type === 'buy' || type === 'sale') return 'buy';
      if (type === 'rent') return 'rent';
    }
    return 'all';
  }, [location]);

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Update tab state only - navigation is handled separately by the caller
  const setActiveTabWithSync = useCallback((tab, shouldNavigate = false) => {
    setActiveTab(tab);
    
    // Only navigate if explicitly requested
    if (shouldNavigate) {
      if (location.pathname === '/user/dashboard/discover') {
        // If already on discover page, just update the URL
        const searchParams = new URLSearchParams(location.search);
        if (tab === 'all') {
          searchParams.delete('type');
        } else if (tab === 'buy') {
          searchParams.set('type', 'buy');
        } else if (tab === 'rent') {
          searchParams.set('type', 'rent');
        }
        navigate(`/user/dashboard/discover?${searchParams.toString()}`, { replace: true });
      } else {
        // Navigate to discover page with the filter
        if (tab === 'all') {
          navigate('/user/dashboard/discover');
        } else {
          navigate(`/user/dashboard/discover?type=${tab}`);
        }
      }
    }
  }, [location, navigate]);

  // Sync with URL when location changes
  React.useEffect(() => {
    const newTab = getInitialTab();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname, location.search]);

  return (
    <PropertyFilterContext.Provider
      value={{
        activeTab,
        setActiveTab: setActiveTabWithSync,
        // Helper to get API type parameter
        getApiType: () => {
          if (activeTab === 'buy') return 'buy';
          if (activeTab === 'rent') return 'rent';
          return 'all';
        },
      }}
    >
      {children}
    </PropertyFilterContext.Provider>
  );
};

export const usePropertyFilter = () => {
  const context = useContext(PropertyFilterContext);
  if (!context) {
    throw new Error('usePropertyFilter must be used within PropertyFilterProvider');
  }
  return context;
};

