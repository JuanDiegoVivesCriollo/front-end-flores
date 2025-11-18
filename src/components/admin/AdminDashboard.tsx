'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, User, LogOut, Settings, Menu
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useSessionVerification } from '@/hooks/useSessionVerification';
import SessionLoader from '@/components/SessionLoader';
import AdminSidebar from './AdminSidebar';
import DashboardOverview from './DashboardOverview';
import OrderManagement from './OrderManagement';
import FlowerManagement from './FlowerManagement';
import ComplementManagement from './ComplementManagement';
import CustomerManagement from './CustomerManagement';
import LandingPageEditor from './LandingPageEditor';

// Componente de configuración del administrador
function AdminSettings({ 
  notifications, 
  setNotifications 
}: { 
  notifications: number; 
  setNotifications: (value: number) => void; 
}) {
  const { user } = useAuth();
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Configuración del Sistema</h2>
          <p className="text-gray-600 mt-1">Gestiona la configuración general del sistema</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Información del perfil */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Administrador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activo
                </span>
              </div>
            </div>
          </div>
          
          {/* Configuración de notificaciones */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Notificaciones</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notificaciones actuales</label>
                  <p className="text-sm text-gray-500">Número de notificaciones pendientes</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setNotifications(Math.max(0, notifications - 1))}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 bg-gray-100 rounded-md min-w-[40px] text-center">
                    {notifications}
                  </span>
                  <button 
                    onClick={() => setNotifications(notifications + 1)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setNotifications(0)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Limpiar todas las notificaciones
              </button>
            </div>
          </div>
          
          {/* Configuración del sistema */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Configuración del Sistema</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Modo mantenimiento</label>
                  <p className="text-sm text-gray-500">Activar modo mantenimiento para el sitio web</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Registros automáticos</label>
                  <p className="text-sm text-gray-500">Permitir registro automático de nuevos usuarios</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500 transition-colors hover:bg-green-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Acciones peligrosas */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-900 mb-3">Zona de Peligro</h3>
            <div className="space-y-3">
              <p className="text-sm text-red-700">
                Estas acciones son irreversibles. Úsalas con precaución.
              </p>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Limpiar Cache del Sistema
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Reiniciar Base de Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type AdminView = 'overview' | 'orders' | 'flowers' | 'complements' | 'customers' | 'landing' | 'settings';

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [notifications, setNotifications] = useState<number>(3);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true); // Abierto por defecto para desktop
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  
  // Verificación de sesión con loader de seguridad
  const { isVerifying, isValid, error, verifySession } = useSessionVerification();

  // Verificar que el usuario sea admin
  useEffect(() => {
    if (!isAdmin && !isVerifying) {
      router.push('/');
    }
  }, [isAdmin, router, isVerifying]);

  // Manejar el estado del sidebar basado en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Siempre abierto en desktop
      } else {
        setSidebarOpen(false); // Cerrado por defecto en móvil
      }
    };

    // Configurar estado inicial
    handleResize();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await logout();
      router.push('/');
    }
  };

  // Mostrar loader de verificación de sesión
  if (isVerifying || !isValid) {
    return (
      <SessionLoader 
        isVerifying={isVerifying}
        isValid={isValid}
        error={error}
        onRetry={verifySession}
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview />;
      case 'orders':
        return <OrderManagement />;
      case 'flowers':
        return <FlowerManagement />;
      case 'complements':
        return <ComplementManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'landing':
        return <LandingPageEditor />;
      case 'settings':
        return <AdminSettings notifications={notifications} setNotifications={setNotifications} />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Responsivo */}
      <AdminSidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Header Responsivo */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Botón hamburguesa para móvil */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-sm md:text-base text-gray-600 hidden sm:block">
                  Bienvenido, {user?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Notificaciones */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5 md:h-6 md:w-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>
              
              {/* Menú de usuario - oculto en móvil */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  <span className="text-xs text-gray-500">Administrador</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push('/perfil')}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Mi Perfil"
                  >
                    <User className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentView('settings')}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Configuración"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Avatar móvil/desktop */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm md:text-base font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {renderCurrentView()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
