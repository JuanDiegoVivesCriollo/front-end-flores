'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { openWhatsApp, WHATSAPP_NUMBERS, WHATSAPP_MESSAGES } from '@/utils/whatsapp';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
  showInitialMessage?: boolean;
}

export default function FloatingWhatsApp({
  phoneNumber = WHATSAPP_NUMBERS.MAIN,
  message = WHATSAPP_MESSAGES.GENERAL,
  position = 'bottom-right',
  showInitialMessage = true
}: FloatingWhatsAppProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Mostrar el botón después de 1 segundo
    const timer1 = setTimeout(() => setIsVisible(true), 1000);
    
    // Mostrar mensaje de bienvenida después de 3 segundos (solo la primera vez)
    const timer2 = setTimeout(() => {
      if (showInitialMessage && !localStorage.getItem('whatsapp-welcome-shown')) {
        setShowWelcome(true);
        // Ocultar después de 5 segundos
        setTimeout(() => setShowWelcome(false), 5000);
        localStorage.setItem('whatsapp-welcome-shown', 'true');
      }
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [showInitialMessage]);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const handleClick = () => {
    openWhatsApp();
    
    // Ocultar mensaje de bienvenida al hacer click
    if (showWelcome) {
      setShowWelcome(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div className="relative">
        {/* Mensaje de bienvenida */}
        {showWelcome && (
          <div className="absolute bottom-16 right-0 mb-2 max-w-xs">
            <div className="bg-white rounded-lg shadow-xl border p-3 relative">
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                aria-label="Cerrar mensaje"
              >
                <X className="w-3 h-3" />
              </button>
              
              <div className="flex items-start gap-2 pr-4">
                <div className="bg-green-500 rounded-full p-1 flex-shrink-0">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    ¡Hola! 👋
                  </p>
                  <p className="text-xs text-gray-600">
                    ¿Necesitas ayuda con tus flores? Escríbenos por WhatsApp
                  </p>
                </div>
              </div>
              
              {/* Flecha del tooltip */}
              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
            </div>
          </div>
        )}

        {/* Botón principal */}
        <div className="relative group">
          {/* Ondas de animación detrás del botón */}
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-10 animation-delay-75"></div>
          </div>

          <button
            onClick={handleWhatsAppClick}
            className="relative z-10 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            aria-label="Contactar por WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
            </svg>
          </button>
          
          {/* Tooltip al hacer hover */}
          <div className="absolute bottom-14 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:translate-y-0 translate-y-1 z-20">
            Contáctanos por WhatsApp
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
          </div>
          
          {/* Indicador de notificación (pulse) */}
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 z-20 pointer-events-none">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
