import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { authService } from './api';

interface AuthUser {
  id: string;
  username: string;
  full_name: string;
  is_superuser: boolean;
  main_hostel?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token guardado al cargar
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('caritas_token') : null;
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('caritas_user') : null;
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('caritas_token');
        localStorage.removeItem('caritas_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      const { token: newToken, user_id, username: userUsername, full_name, is_superuser, main_hostel } = response.data;
      
      const userData: AuthUser = {
        id: user_id,
        username: userUsername,
        full_name,
        is_superuser,
        main_hostel,
      };

      setToken(newToken);
      setUser(userData);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('caritas_token', newToken);
        localStorage.setItem('caritas_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('caritas_token');
        localStorage.removeItem('caritas_user');
      }
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}