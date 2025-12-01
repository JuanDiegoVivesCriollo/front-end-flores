'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Send, Phone } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  showAfter?: number; // ms
}

// WhatsApp SVG Icon
const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function FloatingWhatsApp({ 
  phoneNumber = '51919642610',
  showAfter = 2000
}: FloatingWhatsAppProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [showPulse, setShowPulse] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, showAfter);

    return () => clearTimeout(timer);
  }, [showAfter]);

  // Stop pulse after first interaction
  useEffect(() => {
    if (isOpen) {
      setShowPulse(false);
    }
  }, [isOpen]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const openWhatsApp = (message: string = '') => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}${message ? `?text=${encodedMessage}` : ''}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppClick = () => {
    openWhatsApp(customMessage);
    setIsOpen(false);
    setCustomMessage('');
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:+${phoneNumber}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleWhatsAppClick();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCustomMessage('');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Full Screen Chat */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          {/* Header */}
          <div className="bg-[#25D366] p-4 text-white safe-area-top">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <Image
                    src="/img/logojazminwa.webp"
                    alt="Flores D'Jazmin"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Flores D&apos;Jazmin</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                    En línea
                  </p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-3 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-5 bg-[#E5DDD5] overflow-y-auto">
            {/* Greeting Bubble */}
            <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[85%]">
              <p className="text-base text-gray-700 leading-relaxed">
                ¡Hola! 👋 Bienvenido a <strong>Flores D&apos;Jazmin</strong>. ¿En qué podemos ayudarte hoy?
              </p>
              <span className="text-xs text-gray-400 mt-2 block text-right">
                Ahora
              </span>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-[#F0F0F0] safe-area-bottom">
            <div className="flex gap-3 items-end mb-3">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje..."
                rows={1}
                className="flex-1 px-4 py-3 border-0 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#25D366] text-base resize-none overflow-hidden"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={handleWhatsAppClick}
                className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#128C7E] transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Action - Only Call */}
            <button
              onClick={handlePhoneClick}
              className="w-full py-3 text-base text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Phone className="w-5 h-5" />
              Llamar al +51 919 642 610
            </button>
          </div>
        </div>
      )}

      {/* Desktop Chat Box */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && !isMobile && (
          <div className="absolute bottom-20 right-0 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-[#25D366] p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <Image
                      src="/img/logojazminwa.webp"
                      alt="Flores D'Jazmin"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Flores D&apos;Jazmin</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                      En línea
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="p-5 bg-[#E5DDD5] min-h-[180px]">
              {/* Greeting Bubble */}
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[90%]">
                <p className="text-sm text-gray-700 leading-relaxed">
                  ¡Hola! 👋 Bienvenido a <strong>Flores D&apos;Jazmin</strong>. ¿En qué podemos ayudarte hoy?
                </p>
                <span className="text-[11px] text-gray-400 mt-2 block text-right">
                  Ahora
                </span>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-[#F0F0F0]">
              <div className="flex gap-3 items-end">
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu mensaje..."
                  rows={1}
                  className="flex-1 px-4 py-3 border-0 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#25D366] text-sm resize-none overflow-hidden"
                  style={{
                    minHeight: '44px',
                    maxHeight: '120px',
                    height: 'auto'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
                <button
                  onClick={handleWhatsAppClick}
                  className="w-11 h-11 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#128C7E] transition-colors flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Action - Only Call */}
            <div className="px-4 pb-4 bg-[#F0F0F0]">
              <button
                onClick={handlePhoneClick}
                className="w-full py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Phone className="w-4 h-4" />
                Llamar al +51 919 642 610
              </button>
            </div>
          </div>
        )}

        {/* Floating Button - Always visible (hidden when mobile chat is open) */}
        {!(isOpen && isMobile) && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative w-16 h-16 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#128C7E] transition-all hover:scale-105 flex items-center justify-center ${
              isOpen ? 'rotate-0' : ''
            }`}
            aria-label="Abrir WhatsApp"
          >
            {isOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <WhatsAppIcon className="w-8 h-8" />
            )}

            {/* Pulse Animation */}
            {showPulse && !isOpen && (
              <>
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
              </>
            )}
          </button>
        )}

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap hidden md:block">
            <div className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg">
              ¿Necesitas ayuda?
            </div>
            <div className="w-2 h-2 bg-gray-800 rotate-45 absolute -bottom-1 right-6" />
          </div>
        )}
      </div>
    </>
  );
}
