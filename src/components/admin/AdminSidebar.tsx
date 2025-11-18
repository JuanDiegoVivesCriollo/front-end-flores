'use client';

import { 
  Home,
  ShoppingCart, 
  Users, 
  Package, 
  Gift,
  Settings,
  Edit3,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type AdminView = 'overview' | 'orders' | 'flowers' | 'complements' | 'customers' | 'landing' | 'settings';

interface AdminSidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'overview' as AdminView, label: 'Resumen', icon: Home },
  { id: 'orders' as AdminView, label: 'Pedidos', icon: ShoppingCart },
  { id: 'flowers' as AdminView, label: 'Flores', icon: Package },
  { id: 'complements' as AdminView, label: 'Complementos', icon: Gift },
  { id: 'customers' as AdminView, label: 'Clientes', icon: Users },
  { id: 'landing' as AdminView, label: 'Página Principal', icon: Edit3 },
  { id: 'settings' as AdminView, label: 'Configuración', icon: Settings },
];

export default function AdminSidebar({ currentView, onViewChange, isOpen, onToggle }: AdminSidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleMenuClick = (view: AdminView) => {
    onViewChange(view);
    // Cerrar el sidebar en móvil después de seleccionar
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed md:relative
          inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg border-r border-gray-200 
          flex flex-col
          transition-transform duration-300 ease-in-out
          md:translate-x-0 md:block
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header del Sidebar */}
        <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-pink-600">Flores Admin</h2>
          <button
            onClick={onToggle}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 md:p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-left
                  ${isActive 
                    ? 'bg-pink-100 text-pink-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm md:text-base">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 md:p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm md:text-base">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}
