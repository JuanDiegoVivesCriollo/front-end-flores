'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Tipo de usuario básico
interface User {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterFormData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  verifyToken: () => Promise<boolean>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      // Implementación básica - verificar si existe token
      const token = localStorage.getItem('auth_token');
      return Boolean(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      // TODO: Implementar llamada a API cuando esté disponible
      console.log('Logging out...');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        const isValid = await verifyToken();
        if (!isValid) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          return;
        }

        // Cargar datos del usuario desde localStorage
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } finally {
      setIsLoading(false);
    }
  }, [verifyToken]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (isAuthenticated) {
      const tokenCheckInterval = setInterval(async () => {
        const isValid = await verifyToken();
        if (!isValid) {
          await logout();
        }
      }, 5 * 60 * 1000); // 5 minutos

      return () => clearInterval(tokenCheckInterval);
    }
  }, [isAuthenticated, verifyToken, logout]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Implementar llamada real a la API
      console.log('Login attempt:', { email, password: '***' });
      
      // Simulación temporal
      localStorage.setItem('auth_token', 'demo-token');
      const demoUser = { name: 'Usuario Demo', email, role: 'user' };
      localStorage.setItem('user_data', JSON.stringify(demoUser));
      setUser(demoUser);
      setIsAuthenticated(true);
      
      return { success: true, message: 'Inicio de sesión exitoso' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error de conexión' };
    }
  };

  const register = async (userData: RegisterFormData): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Implementar llamada real a la API
      console.log('Register attempt:', userData);
      
      // Simulación temporal
      localStorage.setItem('auth_token', 'demo-token');
      const newUser = { 
        name: userData.name, 
        email: userData.email, 
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        postal_code: userData.postal_code,
        role: 'user'
      };
      localStorage.setItem('user_data', JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, message: 'Registro exitoso' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error de conexión' };
    }
  };

  const logoutAll = async (): Promise<void> => {
    try {
      // TODO: Implementar llamada a API para cerrar todas las sesiones
      console.log('Logout all sessions...');
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Implementar llamada a API
      console.log('Change password attempt:', { currentPassword: '***', newPassword: '***' });
      return { success: true, message: 'Contraseña cambiada exitosamente' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error al cambiar contraseña' };
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Implementar llamada a API
      console.log('Update profile attempt:', userData);
      
      // Simulación temporal - actualizar usuario local
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
      
      return { success: true, message: 'Perfil actualizado exitosamente' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error al actualizar perfil' };
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading,
      login, 
      register,
      logout,
      logoutAll,
      updateProfile,
      changePassword,
      verifyToken,
      isAdmin
    }}>
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