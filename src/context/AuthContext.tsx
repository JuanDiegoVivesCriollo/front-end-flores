'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import { webAuthnService, type BiometricCredential } from '@/services/webauthn';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithBiometric: (email: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterFormData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  verifyToken: () => Promise<boolean>;
  registerBiometric: (deviceName?: string) => Promise<{ success: boolean; message: string }>;
  checkBiometricAvailability: (email: string) => Promise<{ available: boolean; count: number }>;
  listBiometricCredentials: () => Promise<BiometricCredential[]>;
  deleteBiometricCredential: (credentialId: number) => Promise<{ success: boolean; message: string }>;
  isBiometricSupported: boolean;
  isAdmin: boolean;
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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  // Check biometric support on mount
  useEffect(() => {
    const checkSupport = async () => {
      const supported = webAuthnService.isWebAuthnSupported();
      setIsBiometricSupported(supported);
      
      if (supported) {
        const available = await webAuthnService.isPlatformAuthenticatorAvailable();
        setIsBiometricSupported(available);
      }
    };
    
    checkSupport();
  }, []);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiClient.verifyToken();
      return response.success;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.logout();
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
        apiClient.setToken(token);
        
        // Verificar que el token sea válido
        const isValid = await verifyToken();
        if (!isValid) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          return;
        }

        const response = await apiClient.getProfile();
        
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          // Token inválido
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
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
    // Verificar si el usuario está autenticado al cargar
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    // Configurar verificación periódica del token (cada 5 minutos)
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
      const response = await apiClient.login(email, password);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        return { success: true, message: 'Inicio de sesión exitoso' };
      } else {
        return { success: false, message: response.message || 'Error al iniciar sesión' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error de conexión' };
    }
  };

  const register = async (userData: RegisterFormData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.register(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        return { success: true, message: 'Registro exitoso' };
      } else {
        return { success: false, message: response.message || 'Error al registrarse' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error de conexión' };
    }
  };

  const logoutAll = async (): Promise<void> => {
    try {
      await apiClient.logoutAll();
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
      const response = await apiClient.changePassword(currentPassword, newPassword);
      if (response.success) {
        return { success: true, message: 'Contraseña cambiada exitosamente' };
      } else {
        return { success: false, message: response.message || 'Error al cambiar contraseña' };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error al cambiar contraseña' };
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.updateProfile(userData);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user_data', JSON.stringify(response.data));
        return { success: true, message: 'Perfil actualizado exitosamente' };
      } else {
        return { success: false, message: response.message || 'Error al actualizar perfil' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error al actualizar perfil' };
    }
  };

  const isAdmin = user?.role === 'admin';

  // Biometric authentication methods
  const loginWithBiometric = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await webAuthnService.loginWithBiometric(email);
      
      if (result.success && result.data) {
        // Set token and user data
        apiClient.setToken(result.data.token);
        webAuthnService.setToken(result.data.token);
        setUser(result.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user_data', JSON.stringify(result.data.user));
        
        return { success: true, message: 'Inicio de sesión biométrico exitoso' };
      }
      
      return { success: false, message: result.message || 'Error en autenticación biométrica' };
    } catch (error) {
      console.error('Biometric login error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error de conexión' };
    }
  };

  const registerBiometric = async (deviceName?: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isAuthenticated) {
        return { success: false, message: 'Debe iniciar sesión primero' };
      }

      webAuthnService.setToken(localStorage.getItem('auth_token'));
      const result = await webAuthnService.registerBiometric(deviceName);
      
      return result;
    } catch (error) {
      console.error('Biometric registration error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error registrando credencial biométrica' };
    }
  };

  const checkBiometricAvailability = async (email: string): Promise<{ available: boolean; count: number }> => {
    try {
      return await webAuthnService.checkBiometricAvailability(email);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { available: false, count: 0 };
    }
  };

  const listBiometricCredentials = async (): Promise<BiometricCredential[]> => {
    try {
      if (!isAuthenticated) {
        return [];
      }

      webAuthnService.setToken(localStorage.getItem('auth_token'));
      const result = await webAuthnService.listCredentials();
      
      return result.success ? (result.data || []) : [];
    } catch (error) {
      console.error('Error listing biometric credentials:', error);
      return [];
    }
  };

  const deleteBiometricCredential = async (credentialId: number): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isAuthenticated) {
        return { success: false, message: 'Debe iniciar sesión primero' };
      }

      webAuthnService.setToken(localStorage.getItem('auth_token'));
      return await webAuthnService.deleteCredential(credentialId);
    } catch (error) {
      console.error('Error deleting biometric credential:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Error eliminando credencial' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading,
      login,
      loginWithBiometric,
      register,
      logout,
      logoutAll,
      updateProfile,
      changePassword,
      verifyToken,
      registerBiometric,
      checkBiometricAvailability,
      listBiometricCredentials,
      deleteBiometricCredential,
      isBiometricSupported,
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
