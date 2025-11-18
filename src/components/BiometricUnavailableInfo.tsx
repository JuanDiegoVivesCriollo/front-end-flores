'use client';

import { motion } from 'framer-motion';
import { Smartphone, Laptop, Shield, Info } from 'lucide-react';

export default function BiometricUnavailableInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Autenticación Biométrica No Disponible
          </h4>
          <p className="text-xs text-blue-700 mb-3">
            Tu dispositivo actual no cuenta con un autenticador biométrico (huella dactilar o reconocimiento facial).
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              <span>Disponible en smartphones con huella/Face ID</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Laptop className="w-4 h-4 flex-shrink-0" />
              <span>Disponible en laptops con Windows Hello/Touch ID</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>También compatible con llaves de seguridad USB (YubiKey)</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>💡 Tip:</strong> Accede desde tu smartphone para configurar el login biométrico y disfrutar de acceso rápido y seguro.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
