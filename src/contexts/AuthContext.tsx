import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role?: 'customer' | 'admin';
  phone?: string;
  profilePicture?: string;
  googleId?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isAdmin: boolean;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User; isAdmin?: boolean }>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  requireAuth: (action: () => void) => void;
  openLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onOpenLoginModal: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

export function AuthProvider({ children, onOpenLoginModal }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; isAdmin?: boolean }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      setIsLoggedIn(true);
      return { success: true, user: data.user, isAdmin: data.user?.role === 'admin' };
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      setUser(data.user);
      setIsLoggedIn(true);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    setIsLoggedIn(false);
  };

  const requireAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      onOpenLoginModal();
    }
  };

  const openLoginModal = () => {
    onOpenLoginModal();
  };

  useEffect(() => {
    const hydrate = async () => {
      try {
        setIsHydrating(true);
        // Try to get current user
        let res = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        
        // If access token expired, try to refresh
        if (!res.ok && res.status === 401) {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          
          if (refreshRes.ok) {
            // Retry /auth/me after refresh
            res = await fetch(`${API_BASE}/auth/me`, {
              method: 'GET',
              credentials: 'include',
            });
          }
        }
        
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser(data.user);
            setIsLoggedIn(true);
          }
        }
      } catch {
        // ignore hydration errors
      } finally {
        setIsHydrating(false);
      }
    };
    hydrate();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, isAdmin: user?.role === 'admin', isHydrating, login, signup, logout, requireAuth, openLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
