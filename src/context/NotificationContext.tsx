'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'cart';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>, onComplete?: () => void) => void;
  showCartNotification: (productName?: string, onComplete?: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>, onComplete?: () => void) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration - más corto (1.5 segundos)
    setTimeout(() => {
      removeNotification(id);
      // Ejecutar callback después de que desaparezca la notificación
      if (onComplete) {
        setTimeout(onComplete, 100);
      }
    }, notification.duration || 1500);
  }, [removeNotification]);

  const showCartNotification = useCallback<(productName?: string, onComplete?: () => void) => void>((productName, onComplete) => {
    showNotification({
      type: 'cart',
      title: '¡Añadido al carrito!',
      message: productName,
      duration: 1500
    }, onComplete);
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, showCartNotification }}>
      {children}
      
      {/* Notification Container - Centro de la pantalla - z-index máximo para estar sobre todo */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 9999999 }}
        >
          {/* Backdrop rosa pastel suave */}
          <div className="absolute inset-0 bg-pink-100/90 backdrop-blur-sm animate-fade-in pointer-events-auto" />
          
          {/* Modal de notificación */}
          <div className="relative z-10 animate-notification-pop">
            {notification.type === 'cart' && (
              <div className="bg-pink-50 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-pink-200 px-14 py-12 min-w-[380px] max-w-md mx-4 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-pink-200/40 rounded-full translate-x-1/2 translate-y-1/2" />
                <div className="absolute top-4 right-4 w-2 h-2 bg-pink-300 rounded-full animate-pulse" />
                <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                
                {/* Círculo animado con check - centrado */}
                <div className="flex items-center justify-center mb-8 relative">
                  {/* Círculo de fondo que se dibuja */}
                  <svg className="w-28 h-28" viewBox="0 0 100 100">
                    {/* Círculo de progreso */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#dcfce7"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      strokeDashoffset="283"
                      className="animate-circle-draw"
                      style={{
                        transformOrigin: 'center',
                        transform: 'rotate(-90deg)'
                      }}
                    />
                    {/* Círculo interior verde */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="#22c55e"
                      className="animate-circle-fill"
                    />
                    {/* Check mark */}
                    <path
                      d="M30 50 L45 65 L70 35"
                      fill="none"
                      stroke="white"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="60"
                      strokeDashoffset="60"
                      className="animate-check-draw"
                    />
                  </svg>
                </div>
                
                {/* Título - centrado con mejor tipografía */}
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-3 text-center animate-text-appear tracking-tight">
                  {notification.title}
                </h3>
                
                {/* Mensaje - centrado con mejor estilo */}
                {notification.message && (
                  <p className="text-gray-600 text-base leading-relaxed text-center animate-text-appear-delay font-medium tracking-wide max-w-[280px]">
                    {notification.message}
                  </p>
                )}
                
                {/* Línea decorativa inferior */}
                <div className="mt-6 w-16 h-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full animate-text-appear-delay" />
              </div>
            )}
            
            {/* Notificaciones de tipo success */}
            {notification.type === 'success' && (
              <div className="bg-white rounded-2xl shadow-2xl border border-green-200 p-6 max-w-sm mx-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                    {notification.message && (
                      <p className="text-sm text-gray-500">{notification.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Notificaciones de tipo error */}
            {notification.type === 'error' && (
              <div className="bg-white rounded-2xl shadow-2xl border border-red-200 p-6 max-w-sm mx-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                    {notification.message && (
                      <p className="text-sm text-gray-500">{notification.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
