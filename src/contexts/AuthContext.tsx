import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role?: 'customer' | 'admin';
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User; isAdmin?: boolean }>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requireAuth: (action: () => void) => void;
  openLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onOpenLoginModal: () => void;
}

// Dummy credentials for testing
const DUMMY_ACCOUNT = {
  email: 'test@rfm.com',
  password: 'password123',
  name: 'Test User',
  id: '1',
  role: 'customer' as const
};

const ADMIN_ACCOUNT = {
  email: 'admin@rfm.com',
  password: 'admin123',
  name: 'Admin User',
  id: 'admin1',
  role: 'admin' as const
};

export function AuthProvider({ children, onOpenLoginModal }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Simulated login function - Replace with actual API call later
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; isAdmin?: boolean }> => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // TODO: Replace with actual backend API call
        // Example: const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        
        if (email === DUMMY_ACCOUNT.email && password === DUMMY_ACCOUNT.password) {
          const userData = {
            id: DUMMY_ACCOUNT.id,
            name: DUMMY_ACCOUNT.name,
            email: DUMMY_ACCOUNT.email,
            role: DUMMY_ACCOUNT.role
          };
          setUser(userData);
          setIsLoggedIn(true);
          resolve({ success: true, user: userData, isAdmin: false });
        } else if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
          const userData = {
            id: ADMIN_ACCOUNT.id,
            name: ADMIN_ACCOUNT.name,
            email: ADMIN_ACCOUNT.email,
            role: ADMIN_ACCOUNT.role
          };
          setUser(userData);
          setIsLoggedIn(true);
          resolve({ success: true, user: userData, isAdmin: true });
        } else {
          resolve({ success: false, error: 'Invalid email or password' });
        }
      }, 800);
    });
  };

  // Simulated signup function - Replace with actual API call later
  const signup = async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // TODO: Replace with actual backend API call
        // Example: const response = await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, phone, password }) });
        
        // For demo purposes, accept any signup
        const userData = {
          id: Date.now().toString(),
          name,
          email
        };
        setUser(userData);
        setIsLoggedIn(true);
        resolve({ success: true });
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    // TODO: Add backend logout call here if needed
    // Example: await fetch('/api/auth/logout', { method: 'POST' });
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

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, isAdmin: user?.role === 'admin', login, signup, logout, requireAuth, openLoginModal }}>
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