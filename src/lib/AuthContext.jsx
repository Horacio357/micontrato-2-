import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    // Timeout de seguridad: garantiza que la interfaz nunca se quede en bucle de carga
    const safetyTimeout = setTimeout(() => {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }, 2500);

    try {
      const currentUser = await base44.auth.me();
      if (currentUser && (currentUser.id || currentUser.email)) {
        setUser(currentUser);
        setIsAuthenticated(true);
        base44.functions.invoke('syncSubscriptionStatus', {}).catch(() => {});
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (_) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      clearTimeout(safetyTimeout);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout();
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false, // kept for compatibility
      authError,
      appPublicSettings: null,        // kept for compatibility
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: checkUserAuth,   // kept for compatibility
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};