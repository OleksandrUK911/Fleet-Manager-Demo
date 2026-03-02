// contexts/AuthContext.js — JWT authentication state for the whole app
//
// Usage:
//   Wrap your app with <AuthProvider>.
//   In any component: const { isAuthenticated, user, login, logout } = useAuth();

import React, { createContext, useContext, useState, useCallback } from 'react';
import { loginRequest } from '../api/auth';

const AUTH_KEY = 'fleet_auth';          // localStorage key

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Restore auth state from localStorage on first render
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  /** Call the backend login endpoint, store the result, return it. */
  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    // data: { access_token, token_type, username, role, display_name }
    const authData = {
      token:        data.access_token,
      username:     data.username,
      role:         data.role,
      displayName:  data.display_name,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    setAuth(authData);
    return authData;
  }, []);

  /** Clear token and user state. */
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuth(null);
  }, []);

  const value = {
    isAuthenticated: !!auth?.token,
    user:  auth,           // { token, username, role, displayName } | null
    token: auth?.token || null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
