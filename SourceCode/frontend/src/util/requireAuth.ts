/**
 * Centralized authentication helpers.
 *
 * IMPORTANT: These helpers are a UX/session-management layer only.
 * The backend remains the final authorization boundary.
 */

import { notification } from '../services/notificationService';

interface JwtPayload {
    exp?: number;
    role?: string;
}

/**
 * Reads and safely decodes the JWT currently stored in localStorage
 * (or an explicitly supplied token). Returns null when no valid
 * token payload can be decoded.
 */
export const getJwtPayload = (token?: string): JwtPayload | null => {
    const raw = token || localStorage.getItem("jwt");

    if (!raw) return null;

    try {
        return JSON.parse(atob(raw.split(".")[1])) as JwtPayload;
    } catch {
        return null;
    }
};

/**
 * Returns true when a non-expired JWT is present in localStorage.
 * A missing/invalid/expired token is treated as logged out.
 */
export const isAuthenticated = (): boolean => {
    const payload = getJwtPayload();

    if (!payload) return false;

    if (!payload.exp) return true;

    return payload.exp * 1000 > Date.now();
};

/**
 * Checks the current session for protected actions.
 * When logged out it shows a user-facing message and returns the login
 * redirect path (without performing the navigation itself).
 */
export const requireAuthentication = (
    message = "Please log in to continue."
): string | null => {
    if (isAuthenticated()) return null;

    notification.warning(message);
    return "/login";
};
