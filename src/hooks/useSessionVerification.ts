'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services/api';

interface SessionVerificationState {
  isVerifying: boolean;
  isValid: boolean;
  error: string | null;
}

export const useSessionVerification = () => {
  const [state, setState] = useState<SessionVerificationState>({
    isVerifying: true,
    isValid: false,
    error: null
  });
  
  const { user, logout } = useAuth();

  useEffect(() => {
    const verifySession = async () => {
      setState(prev => ({ ...prev, isVerifying: true, error: null }));
      
      try {
        // Verificar si hay token y usuario
        const token = localStorage.getItem('auth_token');
        
        if (!token || !user) {
          setState({ isVerifying: false, isValid: false, error: 'No hay sesión activa' });
          return false;
        }

        // Intentar una llamada simple al API para verificar si el token es válido
        try {
          const response = await apiClient.getFlowers({ per_page: 1 });
          
          if (response.success) {
            setState({ isVerifying: false, isValid: true, error: null });
            return true;
          } else {
            throw new Error('Token inválido');
          }
        } catch {
          // Si el API falla, el token puede estar expirado
          logout();
          setState({ isVerifying: false, isValid: false, error: 'Sesión expirada' });
          return false;
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        setState({ 
          isVerifying: false, 
          isValid: false, 
          error: 'Error al verificar la sesión' 
        });
        return false;
      }
    };

    if (user) {
      verifySession();
    } else {
      setState({ isVerifying: false, isValid: false, error: null });
    }
  }, [user, logout]);

  const manualVerify = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token || !user) {
      setState({ isVerifying: false, isValid: false, error: 'No hay sesión activa' });
      return false;
    }

    setState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      const response = await apiClient.getFlowers({ per_page: 1 });
      
      if (response.success) {
        setState({ isVerifying: false, isValid: true, error: null });
        return true;
      } else {
        logout();
        setState({ isVerifying: false, isValid: false, error: 'Sesión expirada' });
        return false;
      }
    } catch {
      logout();
      setState({ isVerifying: false, isValid: false, error: 'Sesión expirada' });
      return false;
    }
  };

  return {
    ...state,
    verifySession: manualVerify,
    forceLogout: () => {
      logout();
      setState({ isVerifying: false, isValid: false, error: 'Sesión cerrada' });
    }
  };
};
