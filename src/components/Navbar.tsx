'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, User, LogOut, Settings, UserCircle, Shield, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import AnnouncementBar from "./AnnouncementBar";
import { regularOccasions, condolenciasOccasions } from '@/config/occasions';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOccasionsMenuOpen, setIsOccasionsMenuOpen] = useState(false);
  const [isCondolenciasMenuOpen, setIsCondolenciasMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, toggleCart } = useCart();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await logout();
      setIsUserMenuOpen(false);
      router.push('/');
    }
  };

  // Manejar click en ocasiones
  const handleOccasionClick = (occasion: string) => {
    console.log('=== INICIO handleOccasionClick ===');
    console.log('Ocasión:', occasion);
    console.log('Router disponible:', !!router);
    
    try {
      // Cerrar todos los menús inmediatamente
      console.log('Cerrando menús...');
      setIsOccasionsMenuOpen(false);
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      
      // Forzar navegación usando router
      const url = `/flores?ocasion=${occasion}`;
      console.log('URL a navegar:', url);
      console.log('URL actual:', window.location.href);
      
      // Usar router.push de manera directa
      console.log('Ejecutando router.push...');
      router.push(url);
      
      console.log('=== FIN handleOccasionClick ===');
    } catch (error) {
      console.error('Error en handleOccasionClick:', error);
    }
  };

  // Función para manejar clicks en el menú sin cerrar inmediatamente
  const handleMenuItemClick = (action: () => void) => {
    // Ejecutar la acción inmediatamente
    action();
    // Cerrar el menú después de un pequeño retraso para mejorar UX
    setTimeout(() => {
      setIsUserMenuOpen(false);
      setIsMenuOpen(false); // También cerrar menú móvil si está abierto
    }, 150);
  };

  const navItems = [
    { id: '/tienda-fisica', label: 'Tienda Física' },
    { id: '/ofertas', label: 'Ofertas' },
    { id: '/flores', label: 'Flores' },
    { id: 'ocasiones', label: 'Ocasiones', hasDropdown: true }, // Menú desplegable para ocasiones regulares
    { id: 'condolencias', label: 'Condolencias', hasDropdown: true }, // Nuevo menú para condolencias
    { id: '/complementos', label: 'Complementos' },
    { id: '/nosotros', label: 'Nosotros' },
    { id: '/servicios', label: 'Servicios' },
    { id: '/contacto', label: 'Contacto' },
  ];

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Solo cerrar si NO es un click en un botón de ocasión
      const isOccasionClick = target.closest('button[data-occasion]');
      
      // No cerrar si se hace click dentro del dropdown del usuario
      if (isUserMenuOpen && !target.closest('[data-user-menu]')) {
        setIsUserMenuOpen(false);
      }
      
      // No cerrar si se hace click dentro del dropdown de ocasiones O si es un click en ocasión
      if (isOccasionsMenuOpen && !target.closest('[data-occasions-menu]') && !isOccasionClick) {
        setIsOccasionsMenuOpen(false);
      }
      
      // No cerrar si se hace click dentro del dropdown de condolencias O si es un click en ocasión
      if (isCondolenciasMenuOpen && !target.closest('[data-condolencias-menu]') && !isOccasionClick) {
        setIsCondolenciasMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isOccasionsMenuOpen, isCondolenciasMenuOpen]);

  return (
    <div>
      {/* Barra de anuncios animada */}
      <AnnouncementBar />
      
      <nav className="bg-white text-gray-800 px-4 py-2 shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/img/logojazmin2.webp"
              alt="Flores y Detalles Lima"
              width={120}
              height={60}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Menu desktop */}
        <div className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            item.hasDropdown ? (
              // Menús desplegables para ocasiones y condolencias
              <div key={item.id} className="relative" data-occasions-menu={item.id === 'ocasiones'} data-condolencias-menu={item.id === 'condolencias'}>
                <button
                  onClick={() => {
                    if (item.id === 'ocasiones') {
                      setIsOccasionsMenuOpen(!isOccasionsMenuOpen);
                      setIsCondolenciasMenuOpen(false); // Cerrar el otro menú
                    } else if (item.id === 'condolencias') {
                      setIsCondolenciasMenuOpen(!isCondolenciasMenuOpen);
                      setIsOccasionsMenuOpen(false); // Cerrar el otro menú
                    }
                  }}
                  className={`flex items-center gap-1 hover:text-pink-bright transition-colors font-medium ${
                    pathname.includes('/flores?ocasion=') || pathname.includes('/flores/condolencias') ? 'text-pink-bright font-semibold' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    (item.id === 'ocasiones' && isOccasionsMenuOpen) || 
                    (item.id === 'condolencias' && isCondolenciasMenuOpen) ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown menu para ocasiones regulares */}
                {item.id === 'ocasiones' && isOccasionsMenuOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border py-6 px-8 z-50 min-w-max" data-occasions-menu>
                    {/* Grid horizontal para desktop - 3 columnas (menos ocasiones) */}
                    <div className="grid grid-cols-3 gap-6 max-w-3xl">
                      {regularOccasions.map((occasion) => {
                        const IconComponent = occasion.icon;
                        return (
                          <button
                            key={occasion.value}
                            data-occasion={occasion.value}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOccasionClick(occasion.value);
                            }}
                            className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-transparent hover:border-pink-200 min-w-[120px]"
                          >
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center group-hover:from-pink-200 group-hover:to-rose-200 transition-all duration-300 shadow-sm group-hover:shadow-md">
                              <IconComponent className="w-7 h-7 text-pink-600 group-hover:text-pink-700 transition-colors" />
                            </div>
                            <span className="font-medium text-sm text-gray-700 group-hover:text-pink-700 transition-colors text-center leading-tight max-w-[100px]">
                              {occasion.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Decorative arrow pointing up */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                  </div>
                )}

                {/* Dropdown menu para condolencias */}
                {item.id === 'condolencias' && isCondolenciasMenuOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border py-6 px-8 z-50 min-w-max" data-condolencias-menu>
                    {/* Grid horizontal para desktop - 2 columnas (4 tipos de condolencias) */}
                    <div className="grid grid-cols-2 gap-6 max-w-2xl">
                      {condolenciasOccasions.map((occasion) => {
                        const IconComponent = occasion.icon;
                        return (
                          <button
                            key={occasion.value}
                            data-occasion={occasion.value}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOccasionClick(occasion.value);
                            }}
                            className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-transparent hover:border-gray-200 min-w-[140px]"
                          >
                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center group-hover:from-gray-200 group-hover:to-slate-200 transition-all duration-300 shadow-sm group-hover:shadow-md">
                              <IconComponent className="w-7 h-7 text-gray-600 group-hover:text-gray-700 transition-colors" />
                            </div>
                            <span className="font-medium text-sm text-gray-700 group-hover:text-gray-800 transition-colors text-center leading-tight max-w-[120px]">
                              {occasion.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Decorative arrow pointing up */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                  </div>
                )}
              </div>
            ) : (
              // Enlaces normales
              <Link
                key={item.id}
                href={item.id}
                onClick={() => setIsMenuOpen(false)}
                className={`hover:text-pink-bright transition-colors font-medium ${
                  pathname === item.id ? 'text-pink-bright font-semibold' : 'text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            )
          ))}
        </div>

        {/* Botones de acción */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={toggleCart}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-bright text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* Menu de usuario autenticado */}
          {isAuthenticated && user ? (
            <div className="relative" data-user-menu>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors"
              >
                <UserCircle className="w-5 h-5" />
                <span className="font-medium">{user.name}</span>
                {isAdmin && <Shield className="w-4 h-4 text-purple-600" />}
              </button>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50" data-user-menu>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
                        <Shield className="w-3 h-3" />
                        Administrador
                      </span>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleMenuItemClick(() => router.push('/admin'))}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <Settings className="w-4 h-4" />
                      Panel de Admin
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleMenuItemClick(() => router.push('/perfil'))}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Botón de login para usuarios no autenticados */
            <Link 
              href="/login" 
              className="bg-pink-bright hover:bg-pink-light text-white font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Menu mobile */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menu mobile expandido */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
          <div className="flex flex-col gap-3 mt-4">
            {navItems.map((item) => (
              item.hasDropdown ? (
                // Menú desplegable para móviles
                <div key={item.id} className="flex flex-col">
                  <button
                    onClick={() => {
                      if (item.id === 'ocasiones') {
                        setIsOccasionsMenuOpen(!isOccasionsMenuOpen);
                        setIsCondolenciasMenuOpen(false);
                      } else if (item.id === 'condolencias') {
                        setIsCondolenciasMenuOpen(!isCondolenciasMenuOpen);
                        setIsOccasionsMenuOpen(false);
                      }
                    }}
                    className={`flex items-center justify-between py-2 text-left font-medium transition-colors ${
                      pathname.includes('/flores?ocasion=') || pathname.includes('/flores/condolencias') ? 'text-pink-bright font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      (item.id === 'ocasiones' && isOccasionsMenuOpen) || 
                      (item.id === 'condolencias' && isCondolenciasMenuOpen) ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {/* Submenu móvil para ocasiones */}
                  {item.id === 'ocasiones' && isOccasionsMenuOpen && (
                    <div className="pl-4 mt-2 space-y-1 relative">
                      <button
                        onClick={() => setIsOccasionsMenuOpen(false)}
                        className="absolute -top-2 -right-2 bg-gray-200 hover:bg-pink-100 text-gray-700 rounded-full p-1 w-7 h-7 flex items-center justify-center z-10"
                        aria-label="Cerrar ocasiones"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {regularOccasions.map((occasion) => {
                        const IconComponent = occasion.icon;
                        return (
                          <button
                            key={occasion.value}
                            data-occasion={occasion.value}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOccasionClick(occasion.value);
                            }}
                            className="flex items-center gap-3 py-2 text-gray-600 hover:text-pink-bright transition-colors w-full text-left"
                          >
                            <IconComponent className="w-4 h-4 text-pink-bright" />
                            <span>{occasion.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Submenu móvil para condolencias */}
                  {item.id === 'condolencias' && isCondolenciasMenuOpen && (
                    <div className="pl-4 mt-2 space-y-1 relative">
                      <button
                        onClick={() => setIsCondolenciasMenuOpen(false)}
                        className="absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-100 text-gray-700 rounded-full p-1 w-7 h-7 flex items-center justify-center z-10"
                        aria-label="Cerrar condolencias"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {condolenciasOccasions.map((occasion) => {
                        const IconComponent = occasion.icon;
                        return (
                          <button
                            key={occasion.value}
                            data-occasion={occasion.value}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOccasionClick(occasion.value);
                            }}
                            className="flex items-center gap-3 py-2 text-gray-600 hover:text-gray-700 transition-colors w-full text-left"
                          >
                            <IconComponent className="w-4 h-4 text-gray-600" />
                            <span>{occasion.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // Enlaces normales para móvil
                <Link
                  key={item.id}
                  href={item.id}
                  onClick={() => setIsMenuOpen(false)}
                  className={`hover:text-pink-bright transition-colors py-2 text-left font-medium ${
                    pathname === item.id ? 'text-pink-bright font-semibold' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
            
            <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
              <button 
                onClick={() => {
                  toggleCart();
                  setIsMenuOpen(false);
                }}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[48px] min-w-[48px] touch-manipulation"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-bright text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Opciones móviles para usuario autenticado */}
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                    <UserCircle className="w-5 h-5" />
                    <span className="font-medium">{user.name}</span>
                    {isAdmin && <Shield className="w-4 h-4 text-purple-600" />}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    {isAdmin && (
                      <button
                        onClick={() => handleMenuItemClick(() => router.push('/admin'))}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded transition-colors text-sm w-full text-left"
                      >
                        <Settings className="w-4 h-4" />
                        Panel de Admin
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleMenuItemClick(() => router.push('/perfil'))}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded transition-colors text-sm w-full text-left"
                    >
                      <User className="w-4 h-4" />
                      Mi Perfil
                    </button>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors text-left text-sm w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-pink-bright hover:bg-pink-light text-white font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      </nav>
    </div>
  );
}