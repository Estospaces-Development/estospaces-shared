import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as propertiesService from '../services/propertiesService';

const PropertiesContext = createContext();

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
};

export const PropertiesProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [appliedProperties, setAppliedProperties] = useState([]);
  const [viewedProperties, setViewedProperties] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    country: 'UK',
    status: 'online',
    propertyType: null,
    city: null,
    postcode: null,
    minPrice: null,
    maxPrice: null,
    minBedrooms: null,
    maxBedrooms: null,
    minBathrooms: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  });

  // Get current user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch UK properties (or manager's properties if user is a manager)
  const fetchProperties = useCallback(async (reset = false) => {
    if (!supabase) {
      setError('Supabase not configured');
      return;
    }

    setLoading(true);
    setError(null);

    // Create abort controller for cleanup
    const abortController = new AbortController();

    try {
      const offset = reset ? 0 : (pagination.page - 1) * pagination.limit;

      // Check if current user is a manager
      let isManager = false;
      if (currentUser) {
        // Check user role from metadata
        const userRole = currentUser.user_metadata?.role;
        if (userRole === 'manager') {
          isManager = true;
        } else {
          // Check profile table
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          isManager = profile?.role === 'manager';
        }
      }

      // If manager, fetch only their properties
      if (isManager && currentUser) {
        let query = supabase
          .from('properties')
          .select('*', { count: 'exact' })
          .eq('agent_id', currentUser.id);

        // Apply status filter
        if (filters.status === 'online' || filters.status === 'active') {
          query = query.or('status.eq.online,status.eq.active');
        } else if (filters.status) {
          query = query.eq('status', filters.status);
        }

        // Apply other filters
        if (filters.propertyType) {
          query = query.eq('property_type', filters.propertyType);
        }
        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }
        if (filters.postcode) {
          query = query.ilike('postcode', `%${filters.postcode}%`);
        }
        if (filters.minPrice !== null) {
          query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice !== null) {
          query = query.lte('price', filters.maxPrice);
        }
        if (filters.minBedrooms !== null) {
          query = query.gte('bedrooms', filters.minBedrooms);
        }
        if (filters.maxBedrooms !== null) {
          query = query.lte('bedrooms', filters.maxBedrooms);
        }
        if (filters.minBathrooms !== null) {
          query = query.gte('bathrooms', filters.minBathrooms);
        }

        query = query
          .order('created_at', { ascending: false })
          .range(offset, offset + pagination.limit - 1);

        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        // Debug: Log the first property to see the actual structure
        if (data && data.length > 0 && import.meta.env.DEV) {
          console.log('Sample property data:', {
            id: data[0].id,
            title: data[0].title,
            images: data[0].images,
            image: data[0].image,
            image_url: data[0].image_url,
            allKeys: Object.keys(data[0])
          });
        }

        if (reset) {
          setProperties(data || []);
        } else {
          setProperties(prev => [...prev, ...(data || [])]);
        }

        setPagination(prev => ({
          ...prev,
          total: count || 0,
          hasMore: (data?.length || 0) === pagination.limit,
        }));
      } else {
        // Regular user - fetch UK properties
        const result = await propertiesService.getUKProperties({
          ...filters,
          limit: pagination.limit,
          offset,
          userId: currentUser?.id || null,
        });

        if (result.error) {
          // Handle table not found error specifically
          if (result.error.code === 'TABLE_NOT_FOUND' || 
              (result.error.message && result.error.message.includes('relation') && result.error.message.includes('does not exist'))) {
            setError('Properties table not found. Please run the SQL schema setup in Supabase Dashboard. See SETUP_INSTRUCTIONS.md for details.');
          } else {
            setError(result.error.message || 'Failed to fetch properties');
          }
          setProperties([]);
          setPagination(prev => ({ ...prev, total: 0, hasMore: false }));
          setLoading(false);
          return;
        }

        if (reset) {
          setProperties(result.data || []);
        } else {
          setProperties(prev => [...prev, ...(result.data || [])]);
        }

        setPagination(prev => ({
          ...prev,
          total: result.count || 0,
          hasMore: (result.data?.length || 0) === pagination.limit,
        }));
      }
    } catch (err) {
      // Silently ignore abort errors (these happen when component unmounts)
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        console.log('Property fetch aborted (component unmounted)');
        return;
      }

      console.error('Error fetching properties:', err);
      // Check for table not found error
      if (err.message && (err.message.includes('relation') || err.message.includes('does not exist'))) {
        setError('Properties table not found. Please run the SQL schema setup in Supabase Dashboard. See SETUP_INSTRUCTIONS.md for details.');
      } else {
        setError(err.message || 'Failed to fetch properties');
      }
      setProperties([]);
      setPagination(prev => ({ ...prev, total: 0, hasMore: false }));
    } finally {
      setLoading(false);
    }

    // Cleanup function
    return () => {
      abortController.abort();
    };
  }, [filters, pagination.page, pagination.limit, currentUser]);

  // Search properties
  const searchProperties = useCallback(async (searchQuery) => {
    if (!supabase) {
      setError('Supabase not configured');
      return;
    }

    if (!searchQuery.trim()) {
      fetchProperties(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await propertiesService.searchProperties({
        searchQuery,
        country: filters.country,
        status: filters.status,
        limit: pagination.limit,
        offset: 0,
        userId: currentUser?.id || null,
      });

      if (result.error) {
        throw result.error;
      }

      setProperties(result.data || []);
      setPagination(prev => ({
        ...prev,
        page: 1,
        total: result.data?.length || 0,
        hasMore: false,
      }));
    } catch (err) {
      // Silently ignore abort errors
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        console.log('Property search aborted (component unmounted)');
        return;
      }

      console.error('Error searching properties:', err);
      setError(err.message || 'Failed to search properties');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, currentUser, fetchProperties]);

  // Fetch saved properties
  const fetchSavedProperties = useCallback(async () => {
    if (!currentUser) {
      setSavedProperties([]);
      return;
    }

    try {
      const result = await propertiesService.getSavedProperties(currentUser.id);
      if (result.error) throw result.error;
      setSavedProperties(result.data || []);
    } catch (err) {
      // Silently ignore abort errors
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        return;
      }
      console.error('Error fetching saved properties:', err);
    }
  }, [currentUser]);

  // Fetch applied properties
  const fetchAppliedProperties = useCallback(async () => {
    if (!currentUser) {
      setAppliedProperties([]);
      return;
    }

    try {
      const result = await propertiesService.getAppliedProperties(currentUser.id);
      if (result.error) throw result.error;
      setAppliedProperties(result.data || []);
    } catch (err) {
      // Silently ignore abort errors
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        return;
      }
      console.error('Error fetching applied properties:', err);
    }
  }, [currentUser]);

  // Fetch viewed properties
  const fetchViewedProperties = useCallback(async () => {
    if (!currentUser) {
      setViewedProperties([]);
      return;
    }

    try {
      const result = await propertiesService.getViewedProperties(currentUser.id);
      if (result.error) throw result.error;
      setViewedProperties(result.data || []);
    } catch (err) {
      // Silently ignore abort errors
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        return;
      }
      console.error('Error fetching viewed properties:', err);
    }
  }, [currentUser]);

  // Save property
  const saveProperty = useCallback(async (propertyId) => {
    if (!currentUser) {
      setError('Please log in to save properties');
      return { success: false };
    }

    try {
      const result = await propertiesService.saveProperty(propertyId, currentUser.id);
      if (result.error) throw result.error;

      // Update local state
      setProperties(prev =>
        prev.map(p => (p.id === propertyId ? { ...p, is_saved: true } : p))
      );
      await fetchSavedProperties();

      return { success: true };
    } catch (err) {
      console.error('Error saving property:', err);
      setError(err.message || 'Failed to save property');
      return { success: false, error: err };
    }
  }, [currentUser, fetchSavedProperties]);

  // Unsave property
  const unsaveProperty = useCallback(async (propertyId) => {
    if (!currentUser) {
      return { success: false };
    }

    try {
      const result = await propertiesService.unsaveProperty(propertyId, currentUser.id);
      if (result.error) throw result.error;

      // Update local state
      setProperties(prev =>
        prev.map(p => (p.id === propertyId ? { ...p, is_saved: false } : p))
      );
      await fetchSavedProperties();

      return { success: true };
    } catch (err) {
      console.error('Error unsaving property:', err);
      return { success: false, error: err };
    }
  }, [currentUser, fetchSavedProperties]);

  // Apply to property
  const applyToProperty = useCallback(async (propertyId, applicationData = {}) => {
    if (!currentUser) {
      setError('Please log in to apply to properties');
      return { success: false };
    }

    try {
      const result = await propertiesService.applyToProperty(
        propertyId,
        currentUser.id,
        applicationData
      );
      if (result.error) throw result.error;

      // Update local state
      setProperties(prev =>
        prev.map(p => (p.id === propertyId ? { ...p, is_applied: true, application_status: 'pending' } : p))
      );
      await fetchAppliedProperties();

      return { success: true, data: result.data };
    } catch (err) {
      console.error('Error applying to property:', err);
      setError(err.message || 'Failed to apply to property');
      return { success: false, error: err };
    }
  }, [currentUser, fetchAppliedProperties]);

  // Track property view
  const trackPropertyView = useCallback(async (propertyId) => {
    if (!currentUser) return;

    try {
      await propertiesService.trackPropertyView(propertyId, currentUser.id);
      await fetchViewedProperties();
    } catch (err) {
      console.error('Error tracking property view:', err);
    }
  }, [currentUser, fetchViewedProperties]);

  // Load user data when user changes
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (currentUser && isMounted) {
        await Promise.all([
          fetchSavedProperties(),
          fetchAppliedProperties(),
          fetchViewedProperties(),
        ]);
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [currentUser, fetchSavedProperties, fetchAppliedProperties, fetchViewedProperties]);

  // Fetch properties when filters change
  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      if (isMounted) {
        await fetchProperties(true);
      }
    };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, [filters, fetchProperties]);

  const value = {
    properties,
    savedProperties,
    appliedProperties,
    viewedProperties,
    currentUser,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    fetchProperties,
    searchProperties,
    saveProperty,
    unsaveProperty,
    applyToProperty,
    trackPropertyView,
    fetchSavedProperties,
    fetchAppliedProperties,
    fetchViewedProperties,
    setPagination,
    setError,
  };

  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
};

