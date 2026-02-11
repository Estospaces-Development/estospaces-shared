import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { isSupabaseAvailable } from '../lib/supabase';
import authService, {
    AuthState,
    ProfileData,
    AUTH_CONFIG
} from '../services/authService';
import type { User, Session } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

interface AuthContextValue {
    // State
    session: Session | null;
    user: User | null;
    profile: ProfileData | null;
    authState: AuthState;
    loading: boolean;
    profileLoading: boolean;
    error: string | null;

    // Authentication
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;

    // Computed
    isAuthenticated: boolean;
    isSupabaseConfigured: boolean;

    // Profile methods
    fetchProfile: (userId: string) => Promise<ProfileData | null>;
    updateProfile: (updates: Partial<ProfileData>) => Promise<{ data?: ProfileData; error?: string }>;
    createProfile: (profileData?: Partial<ProfileData>) => Promise<{ data?: ProfileData; error?: string } | ProfileData | null>;

    // Helpers
    getDisplayName: () => string;
    getRole: () => string;
    getAvatarUrl: () => string | null;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

// ============================================================================
// Provider
// ============================================================================

export const AuthProvider = ({ children }: AuthProviderProps) => {
    // Core state
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [authState, setAuthState] = useState<AuthState>('loading');
    const [error, setError] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Refs to prevent duplicate operations
    const initializingRef = useRef(false);
    const mountedRef = useRef(true);

    // ========================================================================
    // Profile Operations
    // ========================================================================

    const fetchProfile = useCallback(async (userId: string): Promise<ProfileData | null> => {
        if (!userId || !mountedRef.current) return null;

        setProfileLoading(true);
        try {
            const profileData = await authService.fetchProfile(userId);
            if (mountedRef.current) {
                setProfile(profileData);
            }
            return profileData;
        } finally {
            if (mountedRef.current) {
                setProfileLoading(false);
            }
        }
    }, []);

    const updateProfile = useCallback(async (updates: Partial<ProfileData>): Promise<{ data?: ProfileData; error?: string }> => {
        // Check for mock user
        const mockUserData = localStorage.getItem('mockUser');
        if (mockUserData) {
            try {
                const parsedMockUser = JSON.parse(mockUserData);
                if (parsedMockUser && parsedMockUser.isAuthenticated && user?.id.startsWith('mock-')) {
                    console.log('🧪 AuthContext: Updating mock profile', updates);

                    // Update mock user in localStorage
                    const updatedMockUser = {
                        ...parsedMockUser,
                        ...updates, // This might need mapping if field names differ, but strictly ProfileData keys match what we store mostly
                        name: updates.full_name || parsedMockUser.name,
                        role: updates.role || parsedMockUser.role,
                    };
                    localStorage.setItem('mockUser', JSON.stringify(updatedMockUser));

                    // Update synthetic profile state
                    const updatedProfile = {
                        ...profile,
                        ...updates,
                        updated_at: new Date().toISOString(),
                    } as ProfileData;

                    if (mountedRef.current) {
                        setProfile(updatedProfile);
                    }
                    return { data: updatedProfile };
                }
            } catch (e) {
                console.warn('Failed to parse mock user in updateProfile:', e);
            }
        }

        if (!isSupabaseAvailable() || !user?.id) {
            return { error: 'Not authenticated' };
        }

        setProfileLoading(true);
        try {
            const { supabase } = await import('../lib/supabase');
            if (!supabase) {
                return { error: 'Supabase not available' };
            }

            const { data, error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    ...updates,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'id' })
                .select()
                .single();

            if (updateError) {
                return { error: updateError.message };
            }

            if (mountedRef.current) {
                setProfile(data as ProfileData);
            }
            return { data: data as ProfileData };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Update failed';
            return { error: message };
        } finally {
            if (mountedRef.current) {
                setProfileLoading(false);
            }
        }
    }, [user, profile]);

    const createProfile = useCallback(async (profileData?: Partial<ProfileData>): Promise<{ data?: ProfileData; error?: string } | ProfileData | null> => {
        // Check for mock user
        if (user?.id.startsWith('mock-')) {
            // Mock users don't need real profile creation in Supabase
            console.log('🧪 AuthContext: Creating mock profile (noop)', profileData);
            if (mountedRef.current && profileData) {
                setProfile(profileData as ProfileData);
            }
            return { data: profileData as ProfileData };
        }

        if (!isSupabaseAvailable() || !user?.id) {
            return { error: 'Not authenticated' };
        }

        try {
            const { supabase } = await import('../lib/supabase');
            if (!supabase) {
                return { error: 'Supabase not available' };
            }

            const { data, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    full_name: profileData?.full_name || user.user_metadata?.full_name || '',
                    role: profileData?.role || user.user_metadata?.role || 'user',
                    ...profileData,
                })
                .select()
                .single();

            if (createError) {
                // Profile might already exist
                if (createError.code === '23505') {
                    // Fetch existing profile instead
                    return await fetchProfile(user.id);
                }
                return { error: createError.message };
            }

            if (mountedRef.current) {
                setProfile(data as ProfileData);
            }
            return { data: data as ProfileData };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Create failed';
            return { error: message };
        }
    }, [user, fetchProfile]);

    // ========================================================================
    // Session Management
    // ========================================================================

    const refreshSession = useCallback(async () => {
        if (!mountedRef.current) return;

        // First, check for mock user in localStorage (for demo/development)
        try {
            const mockUserData = localStorage.getItem('mockUser');
            if (mockUserData) {
                const parsedMockUser = JSON.parse(mockUserData);
                if (parsedMockUser && parsedMockUser.isAuthenticated) {
                    console.log('🔓 AuthContext: Refreshing/Restoring mock session');

                    const syntheticUser = {
                        id: `mock-${parsedMockUser.email.replace(/[^a-z0-9]/gi, '-')}`,
                        app_metadata: { provider: 'email' },
                        user_metadata: {
                            full_name: (parsedMockUser.name === 'Regular User' ? 'User' : parsedMockUser.name) || 'Demo User',
                            role: parsedMockUser.role || 'user',
                            email: parsedMockUser.email
                        },
                        aud: 'authenticated',
                        created_at: new Date().toISOString(),
                        email: parsedMockUser.email,
                        phone: '',
                        confirmation_sent_at: '',
                        confirmed_at: new Date().toISOString(),
                        last_sign_in_at: new Date().toISOString(),
                        role: 'authenticated',
                        updated_at: new Date().toISOString(),
                    } as User;

                    const syntheticSession = {
                        access_token: 'mock-token-' + Date.now(),
                        refresh_token: 'mock-refresh-token',
                        expires_in: 3600,
                        token_type: 'bearer',
                        user: syntheticUser
                    } as Session;

                    setSession(syntheticSession);
                    setUser(syntheticUser);
                    setAuthState('authenticated');
                    setProfile({
                        id: syntheticUser.id,
                        email: syntheticUser.email || '',
                        full_name: parsedMockUser.name || 'Demo User',
                        role: parsedMockUser.role || 'user',
                        phone: undefined,
                        avatar_url: undefined,
                        is_verified: true, // Mock users are always verified
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                    setError(null);
                    return;
                }
            }
        } catch (e) {
            console.warn('Failed to parse mock user in refreshSession:', e);
        }

        const { session: freshSession, error: sessionError } = await authService.getSessionSafe();

        if (!mountedRef.current) return;

        if (sessionError) {
            setError(sessionError);
            setAuthState('error');
            return;
        }

        if (freshSession) {
            setSession(freshSession);
            setUser(freshSession.user);
            setAuthState('authenticated');
            setError(null);

            // Fetch profile in background
            fetchProfile(freshSession.user.id);
        } else {
            setSession(null);
            setUser(null);
            setProfile(null);
            setAuthState('unauthenticated');
            setError(null);
        }
    }, [fetchProfile]);

    const signOut = useCallback(async () => {
        // Clear mock user from localStorage
        localStorage.removeItem('mockUser');

        const { error: signOutError } = await authService.signOut();

        if (mountedRef.current) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setAuthState('unauthenticated');

            if (signOutError) {
                setError(signOutError);
            } else {
                setError(null);
            }
        }
    }, []);

    // ========================================================================
    // Initialization
    // ========================================================================

    useEffect(() => {
        mountedRef.current = true;

        // Prevent duplicate initialization in StrictMode
        if (initializingRef.current) return;
        initializingRef.current = true;

        const initialize = async () => {
            setAuthState('loading');

            // First, check for mock user in localStorage (for demo/development)
            try {
                const mockUserData = localStorage.getItem('mockUser');
                if (mockUserData) {
                    const parsedMockUser = JSON.parse(mockUserData);
                    if (parsedMockUser && parsedMockUser.isAuthenticated) {
                        console.log('🔓 AuthContext: Restoring mock session from localStorage');

                        // Create a synthetic user object for mock users
                        const syntheticUser = {
                            id: `mock-${parsedMockUser.email.replace(/[^a-z0-9]/gi, '-')}`,
                            app_metadata: { provider: 'email' },
                            user_metadata: {
                                full_name: (parsedMockUser.name === 'Regular User' ? 'User' : parsedMockUser.name) || 'Demo User',
                                role: parsedMockUser.role || 'user',
                                email: parsedMockUser.email
                            },
                            aud: 'authenticated',
                            created_at: new Date().toISOString(),
                            email: parsedMockUser.email,
                            phone: '',
                            confirmation_sent_at: '',
                            confirmed_at: new Date().toISOString(),
                            last_sign_in_at: new Date().toISOString(),
                            role: 'authenticated',
                            updated_at: new Date().toISOString(),
                        } as User;

                        const syntheticSession = {
                            access_token: 'mock-token-' + Date.now(),
                            refresh_token: 'mock-refresh-token',
                            expires_in: 3600,
                            token_type: 'bearer',
                            user: syntheticUser
                        } as Session;

                        if (mountedRef.current) {
                            setSession(syntheticSession);
                            setUser(syntheticUser);
                            setAuthState('authenticated');
                            setProfile({
                                id: syntheticUser.id,
                                email: syntheticUser.email || '',
                                full_name: parsedMockUser.name || 'Demo User',
                                role: parsedMockUser.role || 'user',
                                phone: undefined,
                                avatar_url: undefined,
                                is_verified: true, // Mock users are always verified
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });
                        }
                        return;
                    }
                }
            } catch (e) {
                console.warn('Failed to parse mock user from localStorage:', e);
            }

            // If no mock user, check for real Supabase session
            if (!isSupabaseAvailable()) {
                setAuthState('unauthenticated');
                return;
            }

            // Get initial session from Supabase
            const { session: initialSession, error: sessionError } = await authService.getSessionSafe();

            if (!mountedRef.current) return;

            if (sessionError) {
                // Don't show error for initial load - user might just not be logged in
                console.warn('Initial session check warning:', sessionError);
                setSession(null);
                setUser(null);
                setAuthState('unauthenticated');
                return;
            }

            if (initialSession) {
                setSession(initialSession);
                setUser(initialSession.user);
                setAuthState('authenticated');

                // Fetch profile in background (non-blocking)
                fetchProfile(initialSession.user.id);
            } else {
                setAuthState('unauthenticated');
            }
        };

        // Set up auth state listener FIRST
        const unsubscribe = authService.onAuthStateChange(async (event, newSession) => {
            if (!mountedRef.current) return;

            // Check for mock user in localStorage
            let isMockAuthenticated = false;
            try {
                const mockUserData = localStorage.getItem('mockUser');
                if (mockUserData) {
                    const parsed = JSON.parse(mockUserData);
                    isMockAuthenticated = parsed && parsed.isAuthenticated;
                }
            } catch (e) {
                // Ignore parse errors
            }

            console.log(`🔔 Auth state change: ${event}`, { hasNewSession: !!newSession, isMockAuthenticated });

            // Ignore token refresh events - session is still valid
            if (event === 'TOKEN_REFRESHED') {
                if (newSession) {
                    setSession(newSession);
                    setUser(newSession.user);
                }
                return;
            }

            if (event === 'SIGNED_IN' && newSession) {
                // Real Supabase sign-in always takes precedence
                setSession(newSession);
                setUser(newSession.user);
                setAuthState('authenticated');
                setError(null);

                // Fetch profile for new sign-in
                fetchProfile(newSession.user.id);
                return;
            }

            if (event === 'SIGNED_OUT') {
                // Signed out event - clear everything
                // Note: signOut() already clears mockUser from localStorage before calling authService.signOut()
                setSession(null);
                setUser(null);
                setProfile(null);
                setAuthState('unauthenticated');
                setError(null);
                return;
            }

            // Handle other events (USER_UPDATED, INITIAL_SESSION, etc.)
            if (newSession) {
                setSession(newSession);
                setUser(newSession.user);
                setAuthState('authenticated');
            } else if (!isMockAuthenticated) {
                // ONLY clear session if we don't have a mock user
                // This prevents INITIAL_SESSION(null) from wiping out restored mock sessions
                setSession(null);
                setUser(null);
                setProfile(null);
                setAuthState('unauthenticated');
            } else {
                console.log('🛡️ AuthContext: Retaining mock session despite null auth event');
            }
        });

        // Then initialize
        initialize();

        return () => {
            mountedRef.current = false;
            unsubscribe();
        };
    }, [fetchProfile]);

    // ========================================================================
    // Helper Functions
    // ========================================================================

    const getDisplayName = useCallback((): string => {
        if (profile?.full_name) return profile.full_name;
        if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    }, [profile, user]);

    const getRole = useCallback((): string => {
        if (profile?.role) return profile.role;
        if (user?.user_metadata?.role) return user.user_metadata.role;
        return 'user';
    }, [profile, user]);

    const getAvatarUrl = useCallback((): string | null => {
        if (profile?.avatar_url) return profile.avatar_url;
        if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
        return null;
    }, [profile, user]);

    // ========================================================================
    // Context Value
    // ========================================================================

    const value: AuthContextValue = {
        // State
        session,
        user,
        profile,
        authState,
        loading: authState === 'loading',
        profileLoading,
        error,

        // Authentication
        signOut,
        refreshSession,

        // Computed
        isAuthenticated: authState === 'authenticated' && !!session,
        isSupabaseConfigured: isSupabaseAvailable(),

        // Profile methods
        fetchProfile,
        updateProfile,
        createProfile,

        // Helpers
        getDisplayName,
        getRole,
        getAvatarUrl,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ============================================================================
// Hook
// ============================================================================

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Re-export types and config for convenience
export type { AuthState, ProfileData };
export { AUTH_CONFIG };

export default AuthContext;
