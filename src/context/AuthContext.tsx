import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, ModuleName } from '../types';
import { INITIAL_USERS, CURRENT_LOGGED_USER } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (module: ModuleName, action?: 'view' | 'create' | 'edit' | 'delete') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'jme_auth_token_session';
const USER_KEY = 'jme_auth_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on load
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } else {
      // Default initial session for immediate prototype experience
      const defaultToken = 'jwt-jme-auth-token-' + btoa('alopez@jme.com.gt');
      setToken(defaultToken);
      setUser(CURRENT_LOGGED_USER);
      localStorage.setItem(TOKEN_KEY, defaultToken);
      localStorage.setItem(USER_KEY, JSON.stringify(CURRENT_LOGGED_USER));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string): Promise<boolean> => {
    // Find matching user or fallback
    const matched = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || CURRENT_LOGGED_USER;
    const generatedToken = 'jwt-jme-bearer-' + Math.random().toString(36).substring(2) + '.' + btoa(matched.email);
    
    setToken(generatedToken);
    setUser(matched);
    localStorage.setItem(TOKEN_KEY, generatedToken);
    localStorage.setItem(USER_KEY, JSON.stringify(matched));
    return true;
  };

  const loginAsRole = (role: UserRole) => {
    let target = INITIAL_USERS.find(u => u.role === role);
    if (!target) {
      target = { ...CURRENT_LOGGED_USER, role };
    }
    const fakeToken = `jwt-jme-role-${role.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    setToken(fakeToken);
    setUser(target);
    localStorage.setItem(TOKEN_KEY, fakeToken);
    localStorage.setItem(USER_KEY, JSON.stringify(target));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const hasPermission = (module: ModuleName, action: 'view' | 'create' | 'edit' | 'delete' = 'view'): boolean => {
    if (!user) return false;
    if (user.role === 'Administrador') return true;

    const modulePerm = user.permissions?.find(p => p.module === module);
    if (!modulePerm) return false;

    return !!modulePerm[action];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        loginAsRole,
        logout,
        hasPermission,
      }}
    >
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
