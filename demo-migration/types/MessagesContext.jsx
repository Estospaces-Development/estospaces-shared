import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MessagesContext = createContext();

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

// Mock data - in production, this would come from an API
const mockConversations = [
  {
    id: '1',
    agentId: 'agent-1',
    agentName: 'Sarah Johnson',
    agentAgency: 'Prime Realty Group',
    agentAvatar: null,
    agentEmail: 'sarah@primerealty.com',
    agentPhone: '+1 (555) 123-4567',
    isOnline: true,
    propertyId: 'prop-1',
    propertyTitle: 'Modern Downtown Apartment',
    propertyAddress: '123 Main St, Downtown',
    propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    propertyPrice: 450000,
    isArchived: false,
    isMuted: false,
    lastActivity: new Date(Date.now() - 120000).toISOString(),
    unreadCount: 2,
    messages: [
      {
        id: 'msg-1',
        senderId: 'agent-1',
        senderType: 'agent',
        text: 'Hi! I have some properties that might interest you.',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        read: true,
        delivered: true,
        attachments: [],
      },
      {
        id: 'msg-2',
        senderId: 'user',
        senderType: 'user',
        text: 'Hello! I\'m interested in learning more about the Modern Downtown Apartment.',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        read: true,
        delivered: true,
        attachments: [],
      },
    ],
  },
  {
    id: '2',
    agentId: 'agent-2',
    agentName: 'Michael Chen',
    agentAgency: 'Elite Properties',
    agentAvatar: null,
    agentEmail: 'michael@eliteproperties.com',
    agentPhone: '+1 (555) 234-5678',
    isOnline: false,
    propertyId: 'prop-2',
    propertyTitle: 'Luxury Suburban Home',
    propertyAddress: '456 Oak Avenue, Suburbs',
    propertyImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    propertyPrice: 750000,
    isArchived: false,
    isMuted: false,
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
    messages: [
      {
        id: 'msg-3',
        senderId: 'agent-2',
        senderType: 'agent',
        text: 'Thank you for your interest. Let me know if you have any questions.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        delivered: true,
        attachments: [],
      },
    ],
  },
  {
    id: '3',
    agentId: 'agent-3',
    agentName: 'Emily Rodriguez',
    agentAgency: 'City View Realty',
    agentAvatar: null,
    agentEmail: 'emily@cityview.com',
    agentPhone: '+1 (555) 345-6789',
    isOnline: true,
    propertyId: 'prop-3',
    propertyTitle: 'Cozy Family Home',
    propertyAddress: '789 Pine Street, Residential',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
    propertyPrice: 320000,
    isArchived: false,
    isMuted: false,
    lastActivity: new Date(Date.now() - 10800000).toISOString(),
    unreadCount: 1,
    messages: [
      {
        id: 'msg-4',
        senderId: 'agent-3',
        senderType: 'agent',
        text: 'The viewing is scheduled for tomorrow at 3 PM.',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        read: false,
        delivered: true,
        attachments: [],
      },
    ],
  },
];

const quickReplyTemplates = [
  "Is this property still available?",
  "Can I schedule a viewing?",
  "What are the property details?",
  "What's the best time to contact you?",
  "I'm interested in this property.",
];

export const MessagesProvider = ({ children }) => {
  const [conversations, setConversations] = useState(() => {
    // Load from localStorage or use mock data
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('estospaces-conversations');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return mockConversations;
        }
      }
    }
    return mockConversations;
  });

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, archived, property-specific
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('estospaces-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Get total unread count
  const totalUnreadCount = conversations.reduce((sum, conv) => {
    return sum + (conv.isArchived ? 0 : conv.unreadCount);
  }, 0);

  // Get filtered conversations
  const getFilteredConversations = useCallback(() => {
    let filtered = [...conversations];

    // Apply filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter((conv) => !conv.isArchived && conv.unreadCount > 0);
        break;
      case 'archived':
        filtered = filtered.filter((conv) => conv.isArchived);
        break;
      case 'property-specific':
        // Filter by property if needed - can be enhanced
        break;
      case 'all':
      default:
        filtered = filtered.filter((conv) => !conv.isArchived);
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((conv) => {
        const matchesAgent = conv.agentName.toLowerCase().includes(query);
        const matchesAgency = conv.agentAgency.toLowerCase().includes(query);
        const matchesProperty = 
          conv.propertyTitle?.toLowerCase().includes(query) ||
          conv.propertyAddress?.toLowerCase().includes(query);
        const matchesMessage = conv.messages.some((msg) =>
          msg.text.toLowerCase().includes(query)
        );
        return matchesAgent || matchesAgency || matchesProperty || matchesMessage;
      });
    }

    // Sort by last activity (most recent first)
    return filtered.sort((a, b) => {
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });
  }, [conversations, filter, searchQuery]);

  // Create a new conversation
  const createConversation = useCallback((agentData, propertyData) => {
    const newConversation = {
      id: `conv-${Date.now()}`,
      agentId: agentData.id || `agent-${Date.now()}`,
      agentName: agentData.name,
      agentAgency: agentData.agency || '',
      agentAvatar: agentData.avatar || null,
      agentEmail: agentData.email || '',
      agentPhone: agentData.phone || '',
      isOnline: agentData.isOnline || false,
      propertyId: propertyData?.id || null,
      propertyTitle: propertyData?.title || null,
      propertyAddress: propertyData?.address || null,
      propertyImage: propertyData?.image || null,
      propertyPrice: propertyData?.price || null,
      isArchived: false,
      isMuted: false,
      lastActivity: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
    };

    setConversations((prev) => [newConversation, ...prev]);
    setSelectedConversationId(newConversation.id);
    return newConversation.id;
  }, []);

  // Send a message
  const sendMessage = useCallback((conversationId, text, attachments = []) => {
    if (!text.trim() && attachments.length === 0) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      senderType: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      delivered: false,
      attachments: attachments.map((att) => ({
        id: `att-${Date.now()}-${Math.random()}`,
        name: att.name,
        type: att.type,
        url: att.url || URL.createObjectURL(att.file),
        size: att.size,
      })),
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastActivity: new Date().toISOString(),
          };
        }
        return conv;
      })
    );

    // Simulate message delivery and read status
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === newMessage.id
                  ? { ...msg, delivered: true, read: true }
                  : msg
              ),
            };
          }
          return conv;
        })
      );
    }, 500);

    // Simulate agent response (mock)
    setTimeout(() => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation && Math.random() > 0.5) {
        const responses = [
          'Thanks for your message! I\'ll get back to you shortly.',
          'I\'ll check on that and get back to you.',
          'Great question! Let me find that information for you.',
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];

        const agentMessage = {
          id: `msg-${Date.now()}-agent`,
          senderId: conversation.agentId,
          senderType: 'agent',
          text: response,
          timestamp: new Date().toISOString(),
          read: false,
          delivered: true,
          attachments: [],
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [...conv.messages, agentMessage],
                lastActivity: new Date().toISOString(),
                unreadCount: conv.unreadCount + 1,
              };
            }
            return conv;
          })
        );
      }
    }, 2000);
  }, [conversations]);

  // Mark conversation as read
  const markAsRead = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
            messages: conv.messages.map((msg) => ({ ...msg, read: true })),
          };
        }
        return conv;
      })
    );
  }, []);

  // Archive conversation
  const archiveConversation = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, isArchived: true } : conv
      )
    );
  }, []);

  // Unarchive conversation
  const unarchiveConversation = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, isArchived: false } : conv
      )
    );
  }, []);

  // Mute conversation
  const muteConversation = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, isMuted: true } : conv
      )
    );
  }, []);

  // Unmute conversation
  const unmuteConversation = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, isMuted: false } : conv
      )
    );
  }, []);

  // Delete conversation (soft delete)
  const deleteConversation = useCallback((conversationId) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
    }
  }, [selectedConversationId]);

  // Get conversation by ID
  const getConversation = useCallback(
    (conversationId) => {
      return conversations.find((conv) => conv.id === conversationId);
    },
    [conversations]
  );

  const value = {
    conversations: getFilteredConversations(),
    allConversations: conversations,
    selectedConversationId,
    setSelectedConversationId,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    totalUnreadCount,
    createConversation,
    sendMessage,
    markAsRead,
    archiveConversation,
    unarchiveConversation,
    muteConversation,
    unmuteConversation,
    deleteConversation,
    getConversation,
    quickReplyTemplates,
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

