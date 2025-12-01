'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function WelcomeToast() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [previousAuth, setPreviousAuth] = useState(false);

  useEffect(() => {
    // Detectar cuando el usuario acaba de iniciar sesión
    if (isAuthenticated && !previousAuth && user) {
      setShowToast(true);
      // Auto cerrar después de 5 segundos
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    setPreviousAuth(isAuthenticated);
  }, [isAuthenticated, user, previousAuth]);

  if (!showToast || !user) return null;

  return (
    <div className="fixed top-24 right-4 z-[100] animate-slideInRight">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-sm">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">Sesión iniciada</span>
            </div>
            <p className="text-gray-800 font-semibold truncate">
              ¡Bienvenido/a, {user.name?.split(' ')[0]}!
            </p>
            <p className="text-sm text-gray-500">
              {isAdmin ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Acceso de administrador activo
                </span>
              ) : (
                'Disfruta de tu experiencia de compra'
              )}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => setShowToast(false)}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-shrink"
            style={{ animation: 'shrink 5s linear forwards' }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
