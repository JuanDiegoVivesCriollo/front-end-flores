'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  MessageCircle,
  Heart,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import PaymentMethods from '@/components/PaymentMethods';

const footerLinks = {
  productos: [
    { label: 'Ramos de Rosas', href: '/ramos?categoria=rosas' },
    { label: 'Bouquets', href: '/ramos?categoria=bouquets' },
    { label: 'Orquídeas', href: '/ramos?categoria=orquideas' },
    { label: 'Girasoles', href: '/ramos?categoria=girasoles' },
    { label: 'Arreglos Especiales', href: '/ramos?categoria=arreglos-especiales' },
    { label: 'Desayunos Sorpresa', href: '/desayunos' },
  ],
  ocasiones: [
    { label: 'Cumpleaños', href: '/ocasiones/cumpleanos' },
    { label: 'Aniversario', href: '/ocasiones/aniversario' },
    { label: 'Amor y Romance', href: '/ocasiones/amor-romance' },
    { label: 'Día de la Madre', href: '/ocasiones/dia-madre' },
    { label: 'San Valentín', href: '/ocasiones/san-valentin' },
    { label: 'Condolencias', href: '/ocasiones/condolencias' },
  ],
  ayuda: [
    { label: 'Preguntas Frecuentes', href: '/faq' },
    { label: 'Seguir mi Pedido', href: '/seguimiento' },
    { label: 'Políticas de Envío', href: '/envios' },
    { label: 'Devoluciones', href: '/devoluciones' },
    { label: 'Términos y Condiciones', href: '/terminos' },
    { label: 'Políticas de Privacidad', href: '/privacidad' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Implement newsletter subscription
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <img 
                src="/img/logojazminwa.webp" 
                alt="Flores D'Jazmin" 
                className="h-36 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Tu florería de confianza en Lima. Creamos arreglos florales únicos para 
              cada momento especial de tu vida.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="https://www.google.com/maps/place/flores+y+detalles+lima/@-11.9753631,-77.0062079,17z" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>Av. Próceres de la Independencia N°3301, Mercado Progreso Los Pinos, 2do. Piso - Tienda 12, San Juan de Lurigancho</span>
              </a>
              <a 
                href="tel:+51919642610" 
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span>+51 919 642 610</span>
              </a>
              <a 
                href="mailto:floresydetalleslima1@gmail.com" 
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span>floresydetalleslima1@gmail.com</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <Clock className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p>Lun - Dom: 8:00 AM - 10:00 PM</p>
                  <p>Módulo de Flores: 2:00 PM - 10:00 PM</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a 
                href="https://www.facebook.com/floresydetalleslima/?locale=es_LA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@floresydetalleslima" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://wa.me/51919642610" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="font-semibold text-white mb-4">Productos</h4>
            <ul className="space-y-2">
              {footerLinks.productos.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Occasions Column */}
          <div>
            <h4 className="font-semibold text-white mb-4">Ocasiones</h4>
            <ul className="space-y-2">
              {footerLinks.ocasiones.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="font-semibold text-white mb-4">Ayuda</h4>
            <ul className="space-y-2">
              {footerLinks.ayuda.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-wide py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Flores D&apos;Jazmin. Todos los derechos reservados.
              <span className="inline-flex items-center gap-1 ml-2">
                Hecho con <Heart className="w-4 h-4 text-primary-500 fill-current" /> en Perú
              </span>
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <PaymentMethods variant="footer" showTitle={false} />
            </div>

            {/* Scroll to Top */}
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
              aria-label="Volver arriba"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
