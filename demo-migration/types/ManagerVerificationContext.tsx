/**
 * Manager Verification Context
 * Provides verification status and manager profile to all Manager Dashboard components
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import * as managerVerificationService from '../services/managerVerificationService';
import type {
  ManagerProfile,
  ManagerDocument,
  VerificationStatus,
  ManagerProfileType,
  DocumentType,
  ManagerVerificationSummary
} from '../services/managerVerificationService';

// ============================================================================
// Types
// ============================================================================

interface ManagerVerificationContextValue {
  // State
  managerProfile: ManagerProfile | null;
  documents: ManagerDocument[];
  verificationStatus: VerificationStatus | null;
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;

  // Computed
  requiredDocuments: DocumentType[];
  missingDocuments: DocumentType[];
  isComplete: boolean;
  canSubmit: boolean;

  // Actions
  refetch: () => Promise<void>;
  createProfile: (profileType: ManagerProfileType) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<ManagerProfile>) => Promise<{ error: string | null }>;
  uploadDocument: (file: File, documentType: DocumentType, metadata?: {
    documentNumber?: string;
    expiryDate?: string;
  }) => Promise<{ error: string | null }>;
  deleteDocument: (documentType: DocumentType) => Promise<{ error: string | null }>;
  submitForVerification: () => Promise<{ error: string | null }>;

  // Helpers
  getDocumentByType: (type: DocumentType) => ManagerDocument | undefined;
  getDocumentStatus: (type: DocumentType) => 'not_uploaded' | 'pending' | 'approved' | 'rejected' | 'reupload_required';
}

// ============================================================================
// Context
// ============================================================================

const ManagerVerificationContext = createContext<ManagerVerificationContextValue | null>(null);

interface ManagerVerificationProviderProps {
  children: ReactNode;
}

// ============================================================================
// Provider
// ============================================================================

export const ManagerVerificationProvider = ({ children }: ManagerVerificationProviderProps) => {
  const { user, isAuthenticated, getRole } = useAuth();

  // State
  const [managerProfile, setManagerProfile] = useState<ManagerProfile | null>(null);
  const [documents, setDocuments] = useState<ManagerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  // ========================================================================
  // Computed Values
  // ========================================================================

  const verificationStatus = managerProfile?.verification_status || null;
  const isVerified = verificationStatus === 'approved';

  const requiredDocuments = managerProfile
    ? managerVerificationService.getRequiredDocuments(managerProfile.profile_type)
    : [];

  const uploadedDocumentTypes = documents.map(d => d.document_type);
  const missingDocuments = requiredDocuments.filter(
    d => !uploadedDocumentTypes.includes(d)
  );

  const isComplete = missingDocuments.length === 0 && managerProfile !== null;
  const canSubmit = isComplete &&
    verificationStatus !== 'submitted' &&
    verificationStatus !== 'under_review' &&
    verificationStatus !== 'approved';

  // ========================================================================
  // Fetch Data
  // ========================================================================

  const fetchData = useCallback(async () => {
    if (!user?.id || !isAuthenticated || fetchingRef.current) return;

    // Fetch for managers and admins (admins might also have manager profiles)
    const role = getRole();
    if (role !== 'manager' && role !== 'admin') {
      setIsLoading(false);
      return;
    }

    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Check for mock user in localStorage - use mock data instead of API calls
      let isMockUser = false;
      try {
        const mockUserData = localStorage.getItem('mockUser');
        if (mockUserData) {
          const parsed = JSON.parse(mockUserData);
          isMockUser = parsed && parsed.isAuthenticated;
        }
      } catch (e) {
        // Ignore parse errors
      }

      if (isMockUser) {
        // Use mock verification data for demo purposes
        console.log('🧪 ManagerVerificationContext: Using mock verification data');

        const mockProfile: ManagerProfile = {
          id: user.id,
          profile_type: 'broker',
          verification_status: 'approved',
          license_number: 'RERA-2024-DEMO-001',
          license_expiry_date: '2025-12-31',
          association_membership_id: 'REAL-ESTATE-ASSOC-001',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const mockDocuments: ManagerDocument[] = [
          {
            id: 'doc-1',
            manager_id: user.id,
            document_type: 'broker_license',
            document_url: '/mock/broker-license.pdf',
            document_name: 'Broker License.pdf',
            document_number: 'RERA-2024-DEMO-001',
            expiry_date: '2025-12-31',
            verification_status: 'approved',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'doc-2',
            manager_id: user.id,
            document_type: 'government_id',
            document_url: '/mock/government-id.pdf',
            document_name: 'Government ID.pdf',
            verification_status: 'approved',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        if (mountedRef.current) {
          setManagerProfile(mockProfile);
          setDocuments(mockDocuments);
        }
      } else {
        // Real API call for non-mock users
        const result = await managerVerificationService.getManagerVerificationSummary(user.id);

        if (!mountedRef.current) return;

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setManagerProfile(result.data.profile);
          setDocuments(result.data.documents);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError((err as Error).message);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [user?.id, user?.email, isAuthenticated, getRole]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  // ========================================================================
  // Actions
  // ========================================================================

  const refetch = useCallback(async () => {
    fetchingRef.current = false;
    await fetchData();
  }, [fetchData]);

  const createProfile = useCallback(async (
    profileType: ManagerProfileType
  ): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }

    const result = await managerVerificationService.createOrUpdateManagerProfile(user.id, {
      profile_type: profileType,
      verification_status: 'incomplete',
    });

    if (result.error) {
      return { error: result.error };
    }

    if (result.data && mountedRef.current) {
      setManagerProfile(result.data);
    }

    return { error: null };
  }, [user?.id]);

  const updateProfile = useCallback(async (
    data: Partial<ManagerProfile>
  ): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }

    const result = await managerVerificationService.createOrUpdateManagerProfile(user.id, data);

    if (result.error) {
      return { error: result.error };
    }

    if (result.data && mountedRef.current) {
      setManagerProfile(result.data);
    }

    return { error: null };
  }, [user?.id]);

  const uploadDocument = useCallback(async (
    file: File,
    documentType: DocumentType,
    metadata?: { documentNumber?: string; expiryDate?: string }
  ): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }

    // Upload file to storage
    const uploadResult = await managerVerificationService.uploadManagerDocument(
      file,
      user.id,
      documentType
    );

    if (uploadResult.error) {
      return { error: uploadResult.error };
    }

    // Save document record (convert empty strings to undefined for database compatibility)
    const submitResult = await managerVerificationService.submitManagerDocument({
      managerId: user.id,
      documentType,
      documentUrl: uploadResult.url!,
      documentName: file.name,
      documentNumber: metadata?.documentNumber || undefined,
      expiryDate: metadata?.expiryDate || undefined,
    });

    if (submitResult.error) {
      return { error: submitResult.error };
    }

    // Refresh documents
    await refetch();

    return { error: null };
  }, [user?.id, refetch]);

  const deleteDocument = useCallback(async (
    documentType: DocumentType
  ): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }

    const result = await managerVerificationService.deleteManagerDocument(user.id, documentType);

    if (result.error) {
      return { error: result.error };
    }

    // Refresh documents
    await refetch();

    return { error: null };
  }, [user?.id, refetch]);

  const submitForVerification = useCallback(async (): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }

    const result = await managerVerificationService.submitForVerification(user.id);

    if (result.error) {
      return { error: result.error };
    }

    if (result.data && mountedRef.current) {
      setManagerProfile(result.data);
    }

    return { error: null };
  }, [user?.id]);

  // ========================================================================
  // Helpers
  // ========================================================================

  const getDocumentByType = useCallback((type: DocumentType): ManagerDocument | undefined => {
    return documents.find(d => d.document_type === type);
  }, [documents]);

  const getDocumentStatus = useCallback((
    type: DocumentType
  ): 'not_uploaded' | 'pending' | 'approved' | 'rejected' | 'reupload_required' => {
    const doc = documents.find(d => d.document_type === type);
    if (!doc) return 'not_uploaded';

    switch (doc.verification_status) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'reupload_required':
        return 'reupload_required';
      default:
        return 'pending';
    }
  }, [documents]);

  // ========================================================================
  // Context Value
  // ========================================================================

  const value: ManagerVerificationContextValue = {
    // State
    managerProfile,
    documents,
    verificationStatus,
    isVerified,
    isLoading,
    error,

    // Computed
    requiredDocuments,
    missingDocuments,
    isComplete,
    canSubmit,

    // Actions
    refetch,
    createProfile,
    updateProfile,
    uploadDocument,
    deleteDocument,
    submitForVerification,

    // Helpers
    getDocumentByType,
    getDocumentStatus,
  };

  return (
    <ManagerVerificationContext.Provider value={value}>
      {children}
    </ManagerVerificationContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useManagerVerification = (): ManagerVerificationContextValue => {
  const context = useContext(ManagerVerificationContext);
  if (!context) {
    throw new Error('useManagerVerification must be used within a ManagerVerificationProvider');
  }
  return context;
};

export default ManagerVerificationContext;
