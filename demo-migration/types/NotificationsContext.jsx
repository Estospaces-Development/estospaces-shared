import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const NotificationsContext = createContext();

export const NOTIFICATION_TYPES = {
  // Appointments/Viewings
  APPOINTMENT_APPROVED: 'appointment_approved',
  APPOINTMENT_REJECTED: 'appointment_rejected',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  VIEWING_BOOKED: 'viewing_booked',
  VIEWING_CONFIRMED: 'viewing_confirmed',
  VIEWING_CANCELLED: 'viewing_cancelled',
  VIEWING_RESCHEDULED: 'viewing_rescheduled',

  // Applications
  APPLICATION_UPDATE: 'application_update',
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_APPROVED: 'application_approved',
  APPLICATION_REJECTED: 'application_rejected',
  DOCUMENTS_REQUESTED: 'documents_requested',

  // Verification
  DOCUMENT_VERIFIED: 'document_verified',
  PROFILE_VERIFIED: 'profile_verified',

  // Messages
  MESSAGE_RECEIVED: 'message_received',
  TICKET_RESPONSE: 'ticket_response',

  // Properties
  PROPERTY_SAVED: 'property_saved',
  PRICE_DROP: 'price_drop',
  NEW_PROPERTY_MATCH: 'new_property_match',
  PROPERTY_AVAILABLE: 'property_available',
  PROPERTY_UNAVAILABLE: 'property_unavailable',

  // Payments
  PAYMENT_REMINDER: 'payment_reminder',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',

  // Contracts
  CONTRACT_UPDATE: 'contract_update',
  CONTRACT_EXPIRING: 'contract_expiring',

  // System
  SYSTEM: 'system',
  WELCOME: 'welcome',
};

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZ0G6XjdzhFDxcFae0hDSraFhazdNsU';

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || supabaseKey;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/notifications?user_id=eq.${user.id}&order=created_at.desc&limit=50`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // In development, if no real notifications, add some mocks
        if (import.meta.env.DEV && data.length === 0) {
          const mocks = [
            {
              id: 'mock-1',
              title: 'New Lead: Alex Mercer',
              message: 'Alex Mercer inquired about "Stunning 4-Bedroom Victorian House".',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              read: false,
              type: 'message_received'
            },
            {
              id: 'mock-2',
              title: 'Document Verified',
              message: 'Your proof of identity has been successfully verified.',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              read: true,
              type: 'document_verified'
            },
            {
              id: 'mock-3',
              title: 'System Update',
              message: 'Maintenance scheduled for tonight at 2:00 AM UTC.',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              read: false,
              type: 'system'
            }
          ];
          setNotifications(mocks);
          setUnreadCount(mocks.filter(n => !n.read).length);
        } else {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.read).length);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      // Fallback for development if fetch fails (e.g. no supabase)
      if (import.meta.env.DEV) {
        const mocks = [
          {
            id: 'mock-1',
            title: 'New Lead: Alex Mercer',
            message: 'Alex Mercer inquired about "Stunning 4-Bedroom Victorian House".',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            read: false,
            type: 'message_received'
          },
          {
            id: 'mock-2',
            title: 'Document Verified',
            message: 'Your proof of identity has been successfully verified.',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            read: true,
            type: 'document_verified'
          },
          {
            id: 'mock-3',
            title: 'System Update',
            message: 'Maintenance scheduled for tonight at 2:00 AM UTC.',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            read: false,
            type: 'system'
          }
        ];
        setNotifications(mocks);
        setUnreadCount(mocks.filter(n => !n.read).length);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user) return;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZ0G6XjdzhFDxcFae0hDSraFhazdNsU';

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || supabaseKey;

      await fetch(
        `${supabaseUrl}/rest/v1/notifications?id=eq.${notificationId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ read: true }),
        }
      );

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [user]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user || unreadCount === 0) return;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZ0G6XjdzhFDxcFae0hDSraFhazdNsU';

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || supabaseKey;

      await fetch(
        `${supabaseUrl}/rest/v1/notifications?user_id=eq.${user.id}&read=eq.false`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ read: true }),
        }
      );

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [user, unreadCount]);

  // Create a notification (used by other parts of the app)
  const createNotification = useCallback(async (type, title, message, data = {}) => {
    if (!user) return;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZ0G6XjdzhFDxcFae0hDSraFhazdNsU';

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || supabaseKey;

      const response = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          user_id: user.id,
          type,
          title,
          message,
          data,
          read: false,
        }),
      });

      if (response.ok) {
        const [newNotification] = await response.json();
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        return newNotification;
      }
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!user) return;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZ0G6XjdzhFDxcFae0hDSraFhazdNsU';

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || supabaseKey;

      await fetch(
        `${supabaseUrl}/rest/v1/notifications?id=eq.${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [user, notifications]);

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        createNotification,
        deleteNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export default NotificationsContext;


