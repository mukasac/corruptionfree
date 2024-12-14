// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  updateUser: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check token expiration
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.exp) return true;
      // Add 1 minute buffer for clock skew
      return (decoded.exp * 1000) - 60000 < Date.now();
    } catch {
      return true;
    }
  };

  // Token management
  const setToken = (token: string) => {
    document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax; ${
      process.env.NODE_ENV === 'development' ? 'Secure;' : ''
    }`;
  };

  const removeToken = () => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  };

  const getToken = (): string | null => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) return null;
    
    if (isTokenExpired(token)) {
      removeToken();
      return null;
    }
    
    return token;
  };

  // Initial auth check
  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        setUser(null);
        return;
      }

      const res = await fetch('/api/auth/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Clear invalid token
        removeToken();
        setUser(null);
        if (res.status !== 401) {
          // Only set error for non-auth related issues
          const error = await res.json();
          setError(error.message || 'Authentication check failed');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setError('Failed to verify authentication status');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Auto logout on token expiration
  useEffect(() => {
    if (!user) return;

    const checkTokenInterval = setInterval(() => {
      const token = getToken();
      if (!token) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTokenInterval);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }

      const { user: userData, token }: AuthResponse = await res.json();
      
      if (!userData.isActive) {
        throw new Error('Account is inactive');
      }

      setToken(token);
      setUser(userData);

      // Redirect based on role
      if (userData.role === 'ADMIN' || userData.role === 'MODERATOR') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token || !user) throw new Error('Not authenticated');

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update user');
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isModerator = () => user?.role === 'MODERATOR';
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      logout,
      isAdmin,
      isModerator,
      updateUser,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Optional: Add loading component
export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : null;
};

// Optional: Add admin guard
export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, isModerator } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (!loading && user && !isAdmin() && !isModerator()) {
      router.push('/');
    }
  }, [loading, user, router, isAdmin, isModerator]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (user && (isAdmin() || isModerator())) ? <>{children}</> : null;
};