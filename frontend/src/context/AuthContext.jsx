import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Hardcoded mock user to bypass login page
  const [user, setUser] = useState({ id: 'demo123', email: 'demo@smartfintech.app' });        
  const loading = false;

  const login = useCallback(async (email, password) => { return user; }, [user]);
  const register = useCallback(async (email, password) => { return user; }, [user]);
  const logout = useCallback(async () => {}, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
