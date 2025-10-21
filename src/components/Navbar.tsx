'use client';

import { useState } from 'react';
import { ShoppingCart, User, Menu, X, Flower2, ChevronDown } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Flores', href: '/flores' },
    { name: 'Ofertas', href: '/ofertas' },
    { name: 'Ocasiones', href: '#', dropdown: ['Cumpleaños', 'Amor', 'Aniversario', 'Amistad', 'Graduación'] },
    { name: 'Condolencias', href: '#', dropdown: ['Coronas', 'Arreglos', 'Ramos'] },
    { name: 'Contáctanos', href: '/contacto' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      {/* Barra superior con anuncios */}
      <AnnouncementBar />

      {/* Navbar principal */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-4 border-b border-pink-100">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Flower2 className="text-rose-400 w-7 h-7" />
          <span className="font-semibold text-xl text-rose-500 tracking-wide">
            Flores & Detalles
          </span>
        </div>

        {/* Menú desktop */}
        <ul className="hidden md:flex gap-8 text-gray-600 font-medium">
          {navItems.map((item, i) => (
            <li
              key={i}
              className="relative group cursor-pointer"
              onMouseEnter={() => setOpenDropdown(item.name)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a
                href={item.href}
                className="flex items-center gap-1 hover:text-rose-400 transition-colors"
              >
                {item.name}
                {item.dropdown && <ChevronDown size={14} />}
              </a>

              {/* Dropdown */}
              {item.dropdown && openDropdown === item.name && (
                <ul className="absolute top-full left-0 bg-white shadow-md rounded-lg py-2 w-40 border border-rose-100">
                  {item.dropdown.map((option, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                      >
                        {option}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Iconos lado derecho */}
        <div className="flex items-center gap-4">
          <a href="/carrito" className="relative">
            <ShoppingCart className="w-6 h-6 text-rose-400 hover:text-rose-500 transition-colors" />
          </a>
          <a href="/login">
            <User className="w-6 h-6 text-rose-400 hover:text-rose-500 transition-colors" />
          </a>

          {/* Botón menú móvil */}
          <button
            className="md:hidden text-rose-400"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-rose-100">
          <ul className="flex flex-col py-4 text-gray-700 font-medium">
            {navItems.map((item, i) => (
              <li key={i}>
                <details className="group">
                  <summary className="px-6 py-2 cursor-pointer flex justify-between items-center hover:bg-rose-50">
                    {item.name}
                    {item.dropdown && <ChevronDown size={16} className="text-gray-500" />}
                  </summary>
                  {item.dropdown && (
                    <ul className="pl-8 bg-rose-50">
                      {item.dropdown.map((option, j) => (
                        <li key={j}>
                          <a
                            href="#"
                            className="block px-4 py-2 text-sm hover:bg-rose-100 text-gray-600"
                          >
                            {option}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}