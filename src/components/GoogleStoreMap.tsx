'use client';

import React from 'react';
import { getWhatsAppUrl, WHATSAPP_NUMBERS } from '@/utils/whatsapp';

interface GoogleMapProps {
  height?: string;
  zoom?: number;
  className?: string;
}

export default function GoogleStoreMap({ 
  height = '400px', 
  zoom = 17,
  className = ''
}: GoogleMapProps) {
  // Coordenadas exactas de la tienda (Mercado Progreso Los Pinos)
  const storeLocation = {
    lat: -11.975445,
    lng: -77.001516,
    name: "Flores y Detalles Lima - Mercado Progreso Los Pinos",
    address: "Av. Próceres de la Independencia N°3301, Mercado Progreso Los Pinos, 2do. Piso - Tienda 12",
    district: "San Juan de Lurigancho"
  };

  // URL para Google Maps embed
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.8234567890123!2d${storeLocation.lng}!3d${storeLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDU4JzMxLjYiUyA3N8KwMDAnMDUuNSJX!5e0!3m2!1ses!2spe!4v1640995200000!5m2!1ses!2spe&zoom=${zoom}`;
  
  // URL para abrir en Google Maps
  const openInGoogleMaps = () => {
    const googleMapsUrl = "https://www.google.com/maps/place/Flores+%26+Detalles+Lima/@-11.9753631,-77.0062079,17z/data=!4m10!1m2!2m1!1sFlores+%26+Detalles+Lima!3m6!1s0x9105c5415aafe44d:0x5141eade405d580c!8m2!3d-11.9753631!4d-77.0014443!15sChZGbG9yZXMgJiBEZXRhbGxlcyBMaW1hWhgiFmZsb3JlcyAmIGRldGFsbGVzIGxpbWGSAQdmbG9yaXN0mgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVU5QTUhaTWQyVkJFQUWqAXQKDS9nLzExdDByMTFfMjcKDS9nLzExeDh5ZjczejAQASoVIhFmbG9yZXMgJiBkZXRhbGxlcygOMh8QASIb3PlDxnbZPSWlaZsEYGv93mpLAA9iUiV8S6RFMhoQAiIWZmxvcmVzICYgZGV0YWxsZXMgbGltYeABAPoBBAgAEDA!16s%2Fg%2F11t0r11_27?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D";
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden shadow-lg ${className}`} style={{ height }}>
      {/* Google Maps Embed */}
      <iframe
        src={googleMapsEmbedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación de Flores y Detalles Lima"
      />
      
      {/* Overlay con información */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-bold text-gray-900 mb-1">{storeLocation.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{storeLocation.address}</p>
        <p className="text-xs text-gray-500 mb-3">{storeLocation.district}</p>
        
        <div className="flex flex-col gap-2">
          <button
            onClick={openInGoogleMaps}
            className="bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Ver en Google Maps
          </button>
          
          <a
            href="https://www.google.com/maps/place/Flores+%26+Detalles+Lima/@-11.9753631,-77.0062079,17z/data=!4m10!1m2!2m1!1sFlores+%26+Detalles+Lima!3m6!1s0x9105c5415aafe44d:0x5141eade405d580c!8m2!3d-11.9753631!4d-77.0014443!15sChZGbG9yZXMgJiBEZXRhbGxlcyBMaW1hWhgiFmZsb3JlcyAmIGRldGFsbGVzIGxpbWGSAQdmbG9yaXN0mgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVU5QTUhaTWQyVkJFQUWqAXQKDS9nLzExdDByMTFfMjcKDS9nLzExeDh5ZjczejAQASoVIhFmbG9yZXMgJiBkZXRhbGxlcygOMh8QASIb3PlDxnbZPSWlaZsEYGv93mpLAA9iUiV8S6RFMhoQAiIWZmxvcmVzICYgZGV0YWxsZXMgbGltYeABAPoBBAgAEDA!16s%2Fg%2F11t0r11_27?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white text-xs px-3 py-2 rounded hover:bg-green-700 transition-colors text-center"
          >
            Cómo llegar
          </a>
        </div>
      </div>
      
      {/* Contact info overlay */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a 
            href={getWhatsAppUrl({ phoneNumber: WHATSAPP_NUMBERS.MAIN })}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            +51 919 642 610
          </a>
        </div>
      </div>
    </div>
  );
}
