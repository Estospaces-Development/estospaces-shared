/**
 * Auth Helpers
 * 
 * This file re-exports from authService for backwards compatibility.
 * All new code should import directly from authService.
 */

import authService, { AUTH_CONFIG } from '../services/authService';

// Re-export timeouts for backwards compatibility
export const AUTH_TIMEOUTS = AUTH_CONFIG.TIMEOUTS;

// Re-export functions from authService
export const getSessionWithTimeout = authService.getSessionSafe;
export const signInWithTimeout = authService.signInWithEmail;
export const fetchProfileWithTimeout = authService.fetchProfile;
export const getUserRole = authService.getUserRole;
export const getRedirectPath = authService.getRedirectPath;

// Default export
export default {
    AUTH_TIMEOUTS,
    getSessionWithTimeout,
    signInWithTimeout,
    fetchProfileWithTimeout,
    getUserRole,
    getRedirectPath,
};
