import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ApplicationsContext = createContext();

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationsProvider');
  }
  return context;
};

// Application status stages
export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  APPOINTMENT_BOOKED: 'appointment_booked',
  VIEWING_SCHEDULED: 'viewing_scheduled',
  VIEWING_COMPLETED: 'viewing_completed',
  UNDER_REVIEW: 'under_review',
  DOCUMENTS_REQUESTED: 'documents_requested',
  VERIFICATION_IN_PROGRESS: 'verification_in_progress',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
  COMPLETED: 'completed',
};

// Status display configuration
export const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  pending: { label: 'Pending Review', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  submitted: { label: 'Submitted', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  appointment_booked: { label: 'Appointment Booked', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  viewing_scheduled: { label: 'Viewing Scheduled', color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
  viewing_completed: { label: 'Viewing Completed', color: 'cyan', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
  under_review: { label: 'Under Review', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
  documents_requested: { label: 'Documents Required', color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  verification_in_progress: { label: 'Verification in Progress', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  approved: { label: 'Approved', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  rejected: { label: 'Rejected', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  withdrawn: { label: 'Withdrawn', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-500' },
  completed: { label: 'Completed', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
};

export const ApplicationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: null, end: null });

  // Fetch applications from Supabase
  const fetchApplications = useCallback(async () => {
    if (!user?.id || !isSupabaseAvailable()) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('applied_properties')
        .select(`
          id,
          user_id,
          property_id,
          status,
          application_data,
          created_at,
          updated_at,
          properties (
            id,
            title,
            address_line_1,
            city,
            postcode,
            price,
            property_type,
            listing_type,
            image_urls,
            contact_name,
            contact_email,
            contact_phone,
            company
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data to match our application format
      const transformedApplications = (data || []).map((item, index) => {
        const property = item.properties || {};
        const appData = item.application_data || {};

        let images = [];
        try {
          images = property.image_urls
            ? (Array.isArray(property.image_urls) ? property.image_urls : JSON.parse(property.image_urls))
            : [];
        } catch (e) {
          images = [];
        }

        return {
          id: item.id,
          referenceId: `APP-${new Date(item.created_at).getFullYear()}-${String(index + 1).padStart(3, '0')}`,
          propertyId: item.property_id,
          propertyTitle: property.title || appData.property_title || 'Property',
          propertyAddress: property.address_line_1 || appData.property_address || `${property.city || ''} ${property.postcode || ''}`.trim() || 'UK',
          propertyImage: images[0] || appData.property_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
          propertyType: property.property_type || appData.property_type || 'apartment',
          propertyPrice: property.price || appData.property_price || 0,
          listingType: property.listing_type || appData.listing_type || 'sale',
          agentId: null,
          agentName: property.contact_name || appData.agent_name || 'Agent',
          agentAgency: property.company || appData.agent_company || '',
          agentEmail: property.contact_email || appData.agent_email || '',
          agentPhone: property.contact_phone || appData.agent_phone || '',
          status: item.status || APPLICATION_STATUS.PENDING,
          submittedDate: item.created_at,
          lastUpdated: item.updated_at || item.created_at,
          deadline: appData.deadline || null,
          requiresAction: item.status === APPLICATION_STATUS.DOCUMENTS_REQUESTED,
          conversationId: appData.conversation_id || null,
          personalInfo: appData.personal_info || {},
          financialInfo: appData.financial_info || {},
          documents: appData.documents || [],
          notes: appData.notes || '',
          // Appointment details
          appointment: appData.appointment || null,
          hasAppointment: !!appData.appointment,
        };
      });

      setApplications(transformedApplications);
    } catch (err) {
      console.error('Error fetching applications:', err);
      // In development, provide mock data if Supabase is unreachable
      if (import.meta.env.DEV) {
        const mockApplications = [
          {
            id: 'mock-app-1',
            referenceId: 'APP-2026-001',
            propertyId: 'mock-prop-1',
            propertyTitle: 'Luxury 3-Bed Apartment in Kensington',
            propertyAddress: '45 High Street, Kensington, London W8 5SF',
            propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
            propertyType: 'apartment',
            propertyPrice: 2500,
            listingType: 'rent',
            agentName: 'Sarah Mitchell',
            agentAgency: 'Premier Estates',
            agentEmail: 'sarah@premierestates.co.uk',
            agentPhone: '+44 20 7123 4567',
            status: 'under_review',
            submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            requiresAction: false,
          },
          {
            id: 'mock-app-2',
            referenceId: 'APP-2026-002',
            propertyId: 'mock-prop-2',
            propertyTitle: 'Modern Studio near Tower Bridge',
            propertyAddress: '12 Riverside Walk, London SE1 2UP',
            propertyImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
            propertyType: 'studio',
            propertyPrice: 1800,
            listingType: 'rent',
            agentName: 'James Wilson',
            agentAgency: 'City Living',
            agentEmail: 'james@cityliving.co.uk',
            agentPhone: '+44 20 7987 6543',
            status: 'documents_requested',
            submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            requiresAction: true,
          },
        ];
        setApplications(mockApplications);
        setError(null); // Clear error since we have fallback data
      } else {
        setError(err.message);
        setApplications([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Subscribe to real-time updates for application status changes
  useEffect(() => {
    if (!user?.id || !isSupabaseAvailable()) return;

    const subscription = supabase
      .channel('application-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applied_properties',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[Applications] Real-time update received:', payload);
          // Update local state with new status
          setApplications(prev =>
            prev.map(app =>
              app.id === payload.new.id
                ? {
                  ...app,
                  status: payload.new.status,
                  lastUpdated: payload.new.updated_at || new Date().toISOString(),
                  requiresAction: payload.new.status === APPLICATION_STATUS.DOCUMENTS_REQUESTED,
                }
                : app
            )
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Create a new application
  const createApplication = useCallback(async (applicationData) => {
    if (!user?.id || !isSupabaseAvailable()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('applied_properties')
        .insert({
          user_id: user.id,
          property_id: applicationData.property_id || null,
          status: APPLICATION_STATUS.PENDING,
          application_data: {
            property_title: applicationData.property_title,
            property_address: applicationData.property_address,
            property_price: applicationData.property_price,
            property_type: applicationData.property_type || 'apartment',
            listing_type: applicationData.listing_type || 'rent',
            agent_name: applicationData.agent_name,
            agent_email: applicationData.agent_email,
            agent_phone: applicationData.agent_phone,
            agent_company: applicationData.agent_company,
            personal_info: applicationData.personal_info || {},
            financial_info: applicationData.financial_info || {},
            notes: applicationData.notes || '',
            move_in_date: applicationData.move_in_date,
            employment_status: applicationData.employment_status,
            annual_income: applicationData.annual_income,
          },
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Notify the user
      try {
        const { notifyApplicationSubmitted } = await import('../services/notificationsService');
        await notifyApplicationSubmitted(
          user.id,
          applicationData.property_title || 'Property',
          applicationData.property_id || '',
          data.id
        );
      } catch (notifyErr) {
        console.log('Could not send user notification:', notifyErr);
      }

      // Notify all managers and admins
      try {
        const { notifyManagersApplicationSubmitted } = await import('../services/notificationsService');
        const userName = applicationData.personal_info?.full_name || user.email?.split('@')[0] || 'User';
        const userEmail = applicationData.personal_info?.email || user.email || '';
        await notifyManagersApplicationSubmitted(
          userName,
          userEmail,
          applicationData.property_title || 'Property',
          applicationData.property_id || '',
          data.id
        );
      } catch (notifyErr) {
        console.log('Could not send manager notification:', notifyErr);
      }

      // Refresh applications list
      await fetchApplications();

      return { success: true, data };
    } catch (err) {
      console.error('Error creating application:', err);
      return { success: false, error: err.message };
    }
  }, [user?.id, fetchApplications]);

  // Update application status
  const updateApplicationStatus = useCallback(async (applicationId, newStatus) => {
    if (!isSupabaseAvailable()) {
      return { success: false, error: 'Database not available' };
    }

    try {
      const { error: updateError } = await supabase
        .from('applied_properties')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: newStatus, lastUpdated: new Date().toISOString() }
            : app
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error updating application:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Withdraw application
  const withdrawApplication = useCallback(async (applicationId) => {
    return updateApplicationStatus(applicationId, APPLICATION_STATUS.WITHDRAWN);
  }, [updateApplicationStatus]);

  // Get selected application
  const selectedApplication = applications.find(app => app.id === selectedApplicationId);

  // Filter applications
  const filteredApplications = React.useMemo(() => {
    let filtered = [...applications];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Apply property type filter
    if (propertyTypeFilter !== 'all') {
      filtered = filtered.filter((app) => app.propertyType === propertyTypeFilter);
    }

    // Apply date range filter
    if (dateRangeFilter.start) {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.submittedDate);
        return appDate >= new Date(dateRangeFilter.start);
      });
    }
    if (dateRangeFilter.end) {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.submittedDate);
        return appDate <= new Date(dateRangeFilter.end);
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((app) => {
        const matchesProperty = app.propertyTitle?.toLowerCase().includes(query);
        const matchesAddress = app.propertyAddress?.toLowerCase().includes(query);
        const matchesReference = app.referenceId?.toLowerCase().includes(query);
        const matchesAgent = app.agentName?.toLowerCase().includes(query);
        return matchesProperty || matchesAddress || matchesReference || matchesAgent;
      });
    }

    // Sort by most recent activity
    return filtered.sort((a, b) => {
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });
  }, [applications, statusFilter, propertyTypeFilter, dateRangeFilter, searchQuery]);

  // Get applications requiring action
  const getApplicationsRequiringAction = useCallback(() => {
    return applications.filter((app) => app.requiresAction);
  }, [applications]);

  // Get applications with deadline warnings (within 5 days)
  const getApplicationsWithDeadlineWarnings = useCallback(() => {
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    return applications.filter((app) => {
      if (!app.deadline) return false;
      const deadlineDate = new Date(app.deadline);
      return deadlineDate <= fiveDaysFromNow && deadlineDate > new Date();
    });
  }, [applications]);

  const value = {
    applications: filteredApplications,
    allApplications: applications,
    selectedApplication,
    selectedApplicationId,
    setSelectedApplicationId,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    propertyTypeFilter,
    setPropertyTypeFilter,
    dateRangeFilter,
    setDateRangeFilter,
    createApplication,
    updateApplicationStatus,
    withdrawApplication,
    fetchApplications,
    getApplicationsRequiringAction,
    getApplicationsWithDeadlineWarnings,
  };

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
};
