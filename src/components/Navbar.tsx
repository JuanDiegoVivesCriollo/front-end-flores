'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, User, LogOut, UserCircle } from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, toggleCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await logout();
      setIsUserMenuOpen(false);
      router.push('/');
    }
  };

  const navItems = [
    { id: '/flores', label: 'Ramos' },
    { id: '/ocasiones', label: 'Ocasiones' },
    { id: '/contacto', label: 'Contacto' },
  ];

  const isRouteActive = (itemPath: string) => {
    if (itemPath === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(itemPath);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (isUserMenuOpen && !target.closest('[data-user-menu]')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <nav className="bg-white text-gray-800 px-4 py-3 shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Links izquierda - Desktop */}
        <div className="hidden lg:flex gap-6 xl:gap-8 items-center flex-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.id}
              className={`relative hover:text-pink-600 transition-all duration-300 font-medium text-base pb-1 ${
                isRouteActive(item.id) 
                  ? 'text-pink-600 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-pink-600 after:rounded-full' 
                  : 'text-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Logo centrado - Desktop */}
        <div className="hidden lg:flex items-center justify-center flex-shrink-0 px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/img/logo-jazmin.png"
              alt="Flores D' Jazmin"
              width={120}
              height={60}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Iconos derecha - Desktop */}
        <div className="hidden lg:flex items-center gap-3 flex-1 justify-end">
          <button 
            onClick={toggleCart}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* Icono de usuario */}
          {isAuthenticated && user ? (
            <div className="relative" data-user-menu>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                aria-label="Mi cuenta"
              >
                <UserCircle className="w-5 h-5 text-gray-700" />
              </button>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50" data-user-menu>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  
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
            <Link 
              href="/login"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Iniciar sesión"
            >
              <User className="w-5 h-5 text-gray-700" />
            </Link>
          )}
        </div>

        {/* Mobile: Logo izquierda, iconos derecha */}
        <div className="lg:hidden flex items-center justify-between w-full">
          <Link href="/" className="flex items-center">
            <Image
              src="/img/logo-jazmin.png"
              alt="Flores D' Jazmin"
              width={90}
              height={45}
              className="object-contain"
            />
          </Link>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleCart}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile expandido */}
      {isMenuOpen && (
        <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
          <div className="flex flex-col gap-3 mt-4 px-4">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.id}
                onClick={() => setIsMenuOpen(false)}
                className={`relative hover:text-pink-600 transition-all duration-300 py-2 text-left font-medium pb-3 ${
                  isRouteActive(item.id) 
                    ? 'text-pink-600 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-pink-600 after:rounded-full' 
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                    <UserCircle className="w-5 h-5" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                  
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
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2"
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
  );
}
