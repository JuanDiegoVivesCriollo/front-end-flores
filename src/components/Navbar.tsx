'use client';

import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L3 7v11h14V7l-7-5zM10 4.236L15 8v8H5V8l5-3.764z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  FloresApp
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#"
                className="text-gray-900 hover:text-pink-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Inicio
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Catálogo
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Ocasiones
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Sobre Nosotros
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Contacto
              </a>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Button */}
            <button className="text-gray-600 hover:text-pink-600 p-2 rounded-full hover:bg-pink-50 transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Cart Button */}
            <button className="text-gray-600 hover:text-pink-600 p-2 rounded-full hover:bg-pink-50 transition-colors duration-200 relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8v6a1 1 0 001 1h8a1 1 0 001-1v-6M9 19a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Login Button */}
            <button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg">
              Iniciar Sesión
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-pink-600 p-2 rounded-md transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              <a
                href="#"
                className="text-gray-900 hover:text-pink-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Inicio
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-pink-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Catálogo
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-pink-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Ocasiones
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-pink-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Sobre Nosotros
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-pink-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                Contacto
              </a>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between px-3 py-2">
                  <button className="text-gray-600 hover:text-pink-600 p-2 rounded-full hover:bg-pink-50 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button className="text-gray-600 hover:text-pink-600 p-2 rounded-full hover:bg-pink-50 transition-colors duration-200 relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8v6a1 1 0 001 1h8a1 1 0 001-1v-6M9 19a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </button>
                </div>
                <button className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg mx-3 mb-2">
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}