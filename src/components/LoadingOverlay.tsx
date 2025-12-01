'use client';

import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
  variant?: 'fullscreen' | 'inline' | 'button';
  showProgress?: boolean;
}

export default function LoadingOverlay({ 
  isLoading, 
  message = 'Cargando...', 
  subMessage,
  variant = 'fullscreen',
  showProgress = false
}: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Animated dots
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Fake progress for UX
  useEffect(() => {
    if (!isLoading || !showProgress) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 90);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading, showProgress]);

  if (!isLoading) return null;

  // Button variant - small inline loader
  if (variant === 'button') {
    return (
      <span className="inline-flex items-center gap-2">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
            fill="none"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>{message}</span>
      </span>
    );
  }

  // Inline variant - for sections
  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative w-16 h-16">
          {/* Elegant pulsing flower */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-500" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">{message}{dots}</p>
        {subMessage && (
          <p className="text-sm text-gray-400 mt-1">{subMessage}</p>
        )}
      </div>
    );
  }

  // Fullscreen variant - Elegant and refined
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Elegant flower loader */}
        <div className="relative w-28 h-28 mb-6">
          {/* Soft outer glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200/50 to-rose-200/50 blur-xl animate-pulse" />
          
          {/* Main flower container */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Petals - gentle breathing animation */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-8 h-8"
                style={{
                  transform: `rotate(${i * 60}deg)`,
                }}
              >
                <div 
                  className="w-full h-full rounded-full bg-gradient-to-br from-pink-300 to-rose-400 origin-bottom"
                  style={{
                    transform: 'translateY(-14px) scale(0.6, 1)',
                    animation: 'petal-breathe 2s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              </div>
            ))}
            
            {/* Center circle with subtle pulse */}
            <div className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 shadow-lg shadow-amber-200/50 animate-pulse" />
            <div className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-amber-200 to-yellow-300" />
          </div>
          
          {/* Subtle sparkle */}
          <div 
            className="absolute top-2 right-4 w-2 h-2 rounded-full bg-white shadow-lg"
            style={{ animation: 'sparkle 2s ease-in-out infinite' }}
          />
          <div 
            className="absolute bottom-4 left-2 w-1.5 h-1.5 rounded-full bg-white shadow-lg"
            style={{ animation: 'sparkle 2s ease-in-out infinite', animationDelay: '1s' }}
          />
        </div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {message}{dots}
          </h3>
          {subMessage && (
            <p className="text-gray-500 text-sm">{subMessage}</p>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="w-56 mt-6">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading states for specific actions
export function CheckoutLoading() {
  return (
    <LoadingOverlay 
      isLoading={true}
      message="Preparando tu pedido"
      subMessage="Estamos configurando todo para tu compra..."
      showProgress
    />
  );
}

export function PaymentLoading() {
  return (
    <LoadingOverlay 
      isLoading={true}
      message="Procesando pago"
      subMessage="Por favor no cierres esta ventana"
      showProgress
    />
  );
}

export function OrderLoading() {
  return (
    <LoadingOverlay 
      isLoading={true}
      message="Creando tu orden"
      subMessage="Solo un momento más..."
      showProgress
    />
  );
}

export function UploadLoading() {
  return (
    <LoadingOverlay 
      isLoading={true}
      message="Subiendo comprobante"
      subMessage="Verificando tu pago..."
    />
  );
}
