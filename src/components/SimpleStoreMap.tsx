'use client';

import { useState } from 'react';
import { getWhatsAppUrl, WHATSAPP_NUMBERS, WHATSAPP_MESSAGES } from '@/utils/whatsapp';
import { MapPin, Clock, Phone, Navigation, ExternalLink } from 'lucide-react';

interface SimpleMapProps {
  height?: string;
  zoom?: number;
}

export default function SimpleStoreMap({ height = '400px' }: SimpleMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Coordenadas exactas de la tienda
  const storeLocation = {
    lat: -11.975445,
    lng: -77.001516,
    address: "Av. Próceres de la Independencia N°3301, Mercado Progreso Los Pinos, 2do. Piso"
  };

  // URLs para diferentes mapas
  const googleMapsUrl = "https://www.google.com/maps/place/Flores+%26+Detalles+Lima/@-11.9753631,-77.0062079,17z/data=!4m10!1m2!2m1!1sFlores+%26+Detalles+Lima!3m6!1s0x9105c5415aafe44d:0x5141eade405d580c!8m2!3d-11.9753631!4d-77.0014443!15sChZGbG9yZXMgJiBEZXRhbGxlcyBMaW1hWhgiFmZsb3JlcyAmIGRldGFsbGVzIGxpbWGSAQdmbG9yaXN0mgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVU5QTUhaTWQyVkJFQUWqAXQKDS9nLzExdDByMTFfMjcKDS9nLzExeDh5ZjczejAQASoVIhFmbG9yZXMgJiBkZXRhbGxlcygOMh8QASIb3PlDxnbZPSWlaZsEYGv93mpLAA9iUiV8S6RFMhoQAiIWZmxvcmVzICYgZGV0YWxsZXMgbGltYeABAPoBBAgAEDA!16s%2Fg%2F11t0r11_27?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D";
  const wazeUrl = `https://waze.com/ul?ll=${storeLocation.lat},${storeLocation.lng}&navigate=yes`;

  const handleMapLoad = () => {
    setIsLoading(false);
  };

  const handleMapError = () => {
    setIsLoading(false);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg border border-gray-300 bg-white">
      {/* Mapa o imagen de respaldo */}
      <div className="relative" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-pink-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm font-medium">Cargando ubicación...</p>
              <p className="text-gray-500 text-xs mt-1">Av. Próceres de la Independencia N°3301</p>
            </div>
          </div>
        )}
        
        {/* Mapa embebido de Google Maps */}
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1951.${Math.floor(Math.random() * 1000)}!2d${storeLocation.lng}!3d${storeLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDU4JzMxLjYiUyA3N8KwMDAnMDUuNSJX!5e0!3m2!1ses!2spe!4v${Date.now()}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={handleMapLoad}
          onError={handleMapError}
          className="w-full h-full"
        />
        
        {/* Overlay con información de la tienda */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-lg text-pink-600 mb-1">
                Flores y Detalles Lima
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {storeLocation.address}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>+51 919 642 610</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Lun - Dom: 8:00 AM - 8:00 PM</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Google Maps
                </a>
                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  Waze
                </a>
                <a
                  href={getWhatsAppUrl({ 
                    phoneNumber: WHATSAPP_NUMBERS.MAIN, 
                    message: WHATSAPP_MESSAGES.LOCATION_INFO(storeLocation.address)
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Información adicional */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-700 mb-1">🚇 Metro</div>
            <p className="text-gray-600">Línea 1 - Estación Canto Rey</p>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700 mb-1">🚌 Transporte</div>
            <p className="text-gray-600">Múltiples líneas de bus</p>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700 mb-1">🅿️ Estacionamiento</div>
            <p className="text-gray-600">Disponible en el mercado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
