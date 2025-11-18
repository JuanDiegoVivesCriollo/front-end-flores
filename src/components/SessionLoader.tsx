'use client';

import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface SessionLoaderProps {
  isVerifying: boolean;
  isValid: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function SessionLoader({ isVerifying, isValid, error, onRetry }: SessionLoaderProps) {
  if (isVerifying) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Shield className="w-full h-full text-pink-600" />
          </motion.div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando sesión...
          </h2>
          <p className="text-gray-600">
            Validando credenciales de seguridad
          </p>
          
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2 h-2 bg-pink-600 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValid && error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto mb-4"
          >
            {error.includes('expirada') ? (
              <AlertTriangle className="w-full h-full text-orange-500" />
            ) : (
              <XCircle className="w-full h-full text-red-500" />
            )}
          </motion.div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error.includes('expirada') ? 'Sesión Expirada' : 'Error de Sesión'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <div className="space-y-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Intentar de nuevo
              </button>
            )}
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ir al login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isValid) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white z-50 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <CheckCircle className="w-full h-full text-green-500" />
          </motion.div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sesión válida
          </h2>
          <p className="text-gray-600">
            Acceso autorizado
          </p>
        </div>
      </motion.div>
    );
  }

  return null;
}
