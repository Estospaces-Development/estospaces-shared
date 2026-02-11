import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyInterested: string;
  status: string;
  score: number;
  budget: string;
  lastContact: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Lead>;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  getLead: (id: string) => Lead | undefined;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within LeadProvider');
  }
  return context;
};

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);

  // Load leads from service
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { getLeads } = await import('../services/leadsService');
        const result = await getLeads();
        if (result.data) {
          // Transform service data to match Context Lead interface if needed
          // The mock data in leadsService already matches well but let's be safe
          const serviceLeads = result.data.map((l: any) => ({
            id: l.id,
            name: l.name,
            email: l.email,
            phone: l.phone,
            propertyInterested: l.propertyInterested,
            status: l.status,
            score: l.score,
            budget: l.budget,
            lastContact: l.lastContact,
            createdAt: l.createdAt,
            updatedAt: l.updatedAt
          }));
          setLeads(serviceLeads);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    fetchLeads();
  }, []);

  // Save leads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('leads', JSON.stringify(leads));
  }, [leads]);

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads((prev) => [...prev, newLead]);

    // Notify managers and admins about new lead
    try {
      const { notifyManagersNewLead } = await import('../services/notificationsService');
      await notifyManagersNewLead(
        leadData.name,
        leadData.email,
        leadData.propertyInterested,
        newLead.id
      );
    } catch (notifyErr) {
      console.log('Could not send lead notification:', notifyErr);
    }

    return newLead;
  };

  const updateLead = (id: string, leadData: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, ...leadData, updatedAt: new Date().toISOString() }
          : lead
      )
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  };

  const getLead = (id: string): Lead | undefined => {
    return leads.find((lead) => lead.id === id);
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        addLead,
        updateLead,
        deleteLead,
        getLead,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

