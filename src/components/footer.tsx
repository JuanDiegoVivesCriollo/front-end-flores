'use client';

import Link from "next/link";
import Image from "next/image";
import { Heart, Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Sección principal */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/img/logo-jazmin.png"
                alt="Flores D' Jazmin"
                width={100}
                height={70}
                className="object-contain"
              />
            </div>
            <p className="text-gray-300 mb-4">
              Tu florería de confianza en Lima. En Flores D&apos; Jazmin creamos momentos especiales con los arreglos florales más frescos y hermosos, diseñados con amor para cada ocasión especial.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-blue-600 p-2 rounded-full transition-colors"
                title="Síguenos en Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-pink-600 p-2 rounded-full transition-colors"
                title="Síguenos en Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-black p-2 rounded-full transition-colors"
                title="Síguenos en TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://wa.me/51919642610"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-green-500 p-2 rounded-full transition-colors"
                title="Contáctanos por WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-pink-600">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/flores" className="text-gray-300 hover:text-pink-600 transition-colors">
                  Catálogo de Flores
                </Link>
              </li>
              <li>
                <Link href="/ocasiones" className="text-gray-300 hover:text-pink-600 transition-colors">
                  Ocasiones Especiales
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-pink-600 transition-colors">
                  Contáctanos
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-gray-300 hover:text-pink-600 transition-colors">
                  Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-pink-600">Nuestros Servicios</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-pink-600 transition-colors">
                  Delivery en Lima
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-pink-600 transition-colors">
                  Ramos personalizados
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-pink-600 transition-colors">
                  Arreglos para eventos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-pink-600 transition-colors">
                  Flores para bodas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-pink-600">Contáctanos</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <span className="text-gray-300">+51 919 642 610</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@floresdjazmin.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-600 flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-sm">Lima, Perú</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <span className="text-gray-300">Lun - Dom: 9:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="w-4 h-4 text-pink-600 animate-pulse" />
              <span className="text-gray-400 text-sm">
                © 2025 Flores D&apos; Jazmin. Hecho con amor en Lima, Perú.
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/terminos" className="text-gray-400 hover:text-pink-600 transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacidad" className="text-gray-400 hover:text-pink-600 transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
