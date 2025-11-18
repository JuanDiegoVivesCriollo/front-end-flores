'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'cart';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showCartNotification: (productName: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 2000);
  }, [removeNotification]);

  const showCartNotification = useCallback((productName: string) => {
    showNotification({
      type: 'cart',
      title: '¡Añadido al carrito!',
      message: `${productName} se agregó correctamente`,
      duration: 2000
    });
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, showCartNotification }}>
      {children}
      
      {/* Notification Container - CENTRO DE LA PANTALLA CON BACKDROP */}
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex items-center justify-center"
            style={{ zIndex: 999999 }}
          >
            {/* Backdrop semi-transparente */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            
            {/* Modal de notificación */}
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -50 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
              className="relative z-10"
            >
              {notification.type === 'cart' && (
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-8 max-w-sm mx-4 text-center">
                  {/* Icono de check verde animado */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                    className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.3, duration: 0.6, ease: "easeInOut" }}
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  </motion.div>
                  
                  {/* Título */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {notification.title}
                  </h3>
                  
                  {/* Mensaje */}
                  {notification.message && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {notification.message}
                    </p>
                  )}
                </div>
              )}
              
              {/* Otras notificaciones (success, error, info) */}
              {notification.type !== 'cart' && (
                <div className={`
                  min-w-80 max-w-sm p-4 rounded-xl shadow-2xl backdrop-blur-sm border mx-4
                  ${notification.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : ''}
                  ${notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : ''}
                  ${notification.type === 'info' ? 'bg-blue-500/90 border-blue-400 text-white' : ''}
                `}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
                      {notification.type === 'error' && <X className="w-5 h-5" />}
                      {notification.type === 'info' && <CheckCircle className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      {notification.message && (
                        <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
