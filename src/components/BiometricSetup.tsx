'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, X, Shield, Smartphone, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import BiometricUnavailableInfo from './BiometricUnavailableInfo';

interface BiometricSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BiometricSetup({ isOpen, onClose, onSuccess }: BiometricSetupProps) {
  const { registerBiometric, isBiometricSupported } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [deviceName, setDeviceName] = useState('');

  const handleRegister = async () => {
    setIsRegistering(true);
    setError('');

    try {
      const name = deviceName.trim() || `${getBrowserName()} - ${getDeviceName()}`;
      const result = await registerBiometric(name);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Error al configurar autenticación biométrica');
    } finally {
      setIsRegistering(false);
    }
  };

  const getBrowserName = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Navegador';
  };

  const getDeviceName = (): string => {
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iPhone/iPad';
    if (/Android/.test(userAgent)) return 'Android';
    if (/Windows/.test(userAgent)) return 'Windows';
    if (/Mac/.test(userAgent)) return 'Mac';
    return 'Dispositivo';
  };

  // Si no hay soporte biométrico, mostrar modal informativo
  if (!isBiometricSupported) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6 text-white relative">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Biometría No Disponible</h2>
                      <p className="text-white/90 text-sm mt-1">
                        Este dispositivo no tiene autenticador biométrico
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <BiometricUnavailableInfo />

                  <div className="mt-6">
                    <button
                      onClick={onClose}
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Fingerprint className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Configura tu Huella Digital
                    </h2>
                    <p className="text-pink-100 text-sm mt-1">
                      Acceso rápido y seguro
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      ¡Configuración Exitosa!
                    </h3>
                    <p className="text-gray-600">
                      Ahora puedes iniciar sesión con tu huella dactilar
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Más Seguro
                          </h4>
                          <p className="text-sm text-gray-600">
                            Tu huella es única y más segura que una contraseña
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                        <Smartphone className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Más Rápido
                          </h4>
                          <p className="text-sm text-gray-600">
                            Inicia sesión con solo un toque
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Device Name Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del dispositivo (opcional)
                      </label>
                      <input
                        type="text"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder={`${getBrowserName()} - ${getDeviceName()}`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Te ayudará a identificar este dispositivo más tarde
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            {error}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        disabled={isRegistering}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Ahora no
                      </button>
                      <button
                        onClick={handleRegister}
                        disabled={isRegistering}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isRegistering ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Configurando...</span>
                          </>
                        ) : (
                          <>
                            <Fingerprint className="w-5 h-5" />
                            <span>Configurar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-center text-gray-500 mt-4">
                      Tus datos biométricos se almacenan de forma segura en tu dispositivo
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
