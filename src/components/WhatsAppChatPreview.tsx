'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import Image from 'next/image';
import { openWhatsApp, WHATSAPP_NUMBERS, WHATSAPP_MESSAGES } from '@/utils/whatsapp';

interface WhatsAppChatPreviewProps {
  productName: string;
  productPrice: number;
  productImage?: string;
  onClose?: () => void;
}

export default function WhatsAppChatPreview({ 
  productName, 
  productPrice, 
  productImage,
  onClose 
}: WhatsAppChatPreviewProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  
  const handleOpenWhatsApp = () => {
    openWhatsApp({ 
      phoneNumber: WHATSAPP_NUMBERS.MAIN, 
      message: WHATSAPP_MESSAGES.PRODUCT_INQUIRY(productName, productPrice)
    });
  };

  if (isMinimized) {
    return null;
  }

  return (
    <div
      className="hidden lg:block fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] z-[9999] shadow-2xl animate-slide-up"
    >
      {/* WhatsApp Chat Window */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <Image 
                src="/img/logojazminwa.webp" 
                alt="Flores D'Jazmin" 
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-semibold text-sm">Flores D&apos;Jazmin</p>
              <p className="text-xs text-green-200">En línea</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-white/10 rounded-full p-1 transition-colors"
              aria-label="Minimizar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="hover:bg-white/10 rounded-full p-1 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Chat Background */}
        <div 
          className="bg-[#ECE5DD] p-4 h-80 overflow-y-auto relative"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d0c8' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        >
          <div className="space-y-3">
            {/* Mensaje del negocio */}
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white rounded-lg rounded-tl-none shadow-sm max-w-[85%] p-3">
                <p className="text-sm text-gray-800 mb-2">
                  ¡Hola! 👋 Gracias por tu interés
                </p>
                
                {/* Product Card */}
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 mb-2">
                  <div className="space-y-2">
                    {productImage && (
                      <Image 
                        src={productImage} 
                        alt={productName}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {productName}
                      </p>
                      <p className="text-lg font-bold text-[#075E54] mt-1">
                        S/ {productPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-800">
                  Este producto <span className="font-semibold">{productName}</span> puede ser tuyo por tan solo{' '}
                  <span className="font-bold text-green-600">S/ {productPrice.toFixed(2)}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Mensaje de seguimiento */}
            <div className="flex justify-start animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white rounded-lg rounded-tl-none shadow-sm max-w-[85%] p-3">
                <p className="text-sm text-gray-800">
                  Si tienes alguna duda, contáctanos 💬
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with CTA */}
        <div className="bg-white p-3 border-t border-gray-200">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Send className="w-5 h-5" />
            Abrir Chat de WhatsApp
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Respuesta rápida • Atención personalizada
          </p>
        </div>
      </div>
    </div>
  );
}
