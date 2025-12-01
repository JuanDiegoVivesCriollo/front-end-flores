'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { webAuthnService, type BiometricCredential } from '@/services/webauthn';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'register' | 'forgot';
  openAuthModal: (view?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: 'login' | 'register' | 'forgot') => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithBiometric: (email: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  // Biometric functions
  registerBiometric: (deviceName?: string) => Promise<{ success: boolean; message: string }>;
  checkBiometricAvailability: (email: string) => Promise<{ available: boolean; count: number }>;
  listBiometricCredentials: () => Promise<BiometricCredential[]>;
  deleteBiometricCredential: (credentialId: number) => Promise<{ success: boolean; message: string }>;
  isBiometricSupported: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot'>('login');
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

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            // El backend devuelve { success, data: user }
            setUser(data.data || data.user || data);
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const openAuthModal = (view: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // El backend devuelve { success, message, data: { user, token } }
      if (response.ok && data.success && data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
        setUser(data.data.user);
        closeAuthModal();
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Credenciales incorrectas' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión. Intenta nuevamente.' };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          password_confirmation: data.password, // Laravel requiere confirmación
        }),
      });

      const responseData = await response.json();

      // El backend devuelve { success, message, data: { user, token } }
      if (response.ok && responseData.success && responseData.data?.token) {
        localStorage.setItem('auth_token', responseData.data.token);
        setUser(responseData.data.user);
        closeAuthModal();
        return { success: true };
      } else {
        return { success: false, error: responseData.message || 'Error al registrar' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión. Intenta nuevamente.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Error al enviar el correo' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión. Intenta nuevamente.' };
    }
  };

  // Biometric authentication methods
  const loginWithBiometric = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await webAuthnService.loginWithBiometric(email);
      
      if (result.success && result.data) {
        const data = result.data as { token: string; user: User };
        // Set token and user data
        localStorage.setItem('auth_token', data.token);
        webAuthnService.setToken(data.token);
        setUser(data.user);
        closeAuthModal();
        
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
      if (!user) {
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
      if (!user) {
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
      if (!user) {
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
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        isAuthModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
        setAuthModalView,
        login,
        loginWithBiometric,
        register,
        logout,
        forgotPassword,
        registerBiometric,
        checkBiometricAvailability,
        listBiometricCredentials,
        deleteBiometricCredential,
        isBiometricSupported,
      }}
    >
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
