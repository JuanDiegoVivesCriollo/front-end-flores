'use client';

import { useState } from 'react';
import { MapPin, Phone, Clock, Check } from 'lucide-react';

interface StoreLocation {
  id: number;
  name: string;
  address: string;
  district?: string;
  reference?: string;
  coords: { lat: number; lng: number };
  phone: string;
  hours: string;
  features: string[];
}

// Ubicación de nuestra tienda en San Juan de Lurigancho
const storeLocations: StoreLocation[] = [
  {
    id: 1,
    name: "Flores y Detalles Lima - Mercado Progreso Los Pinos",
    address: "Av. Próceres de la Independencia N°3301",
    district: "San Juan de Lurigancho",
    reference: "Mercado Progreso Los Pinos, 2do. Piso / Tienda 12 - Al costado de Metro de Canto Rey",
    coords: { lat: -11.975445, lng: -77.001516 },
    phone: "+51 919 642 610",
    hours: "Lun-Dom: 8:00 AM - 10:00 PM",
    features: ["Metro Canto Rey a 2 min", "Fácil acceso desde Línea 1", "Variedad completa", "Módulo adicional disponible"]
  }
];

interface GoogleStoreMapProps {
  selectedStore?: number | null;
  onStoreSelect?: (storeId: number) => void;
}

export default function GoogleStoreMapCheckout({ selectedStore, onStoreSelect }: GoogleStoreMapProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const selectedStoreData = storeLocations.find(store => store.id === selectedStore);
  const currentStore = selectedStoreData || storeLocations[0];

  // URL para Google Maps embed
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.8234567890123!2d${currentStore.coords.lng}!3d${currentStore.coords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDU4JzMxLjYiUyA3N8KwMDAnMDUuNSJX!5e0!3m2!1ses!2spe!4v1640995200000!5m2!1ses!2spe&zoom=17`;

  const handleStoreSelect = (storeId: number) => {
    if (onStoreSelect) {
      onStoreSelect(storeId);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    }
  };

  const openInGoogleMaps = () => {
    const googleMapsUrl = "https://www.google.com/maps/place/Flores+%26+Detalles+Lima/@-11.9753631,-77.0062079,17z/data=!4m10!1m2!2m1!1sFlores+%26+Detalles+Lima!3m6!1s0x9105c5415aafe44d:0x5141eade405d580c!8m2!3d-11.9753631!4d-77.0014443!15sChZGbG9yZXMgJiBEZXRhbGxlcyBMaW1hWhgiFmZsb3JlcyAmIGRldGFsbGVzIGxpbWGSAQdmbG9yaXN0mgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVU5QTUhaTWQyVkJFQUWqAXQKDS9nLzExdDByMTFfMjcKDS9nLzExeDh5ZjczejAQASoVIhFmbG9yZXMgJiBkZXRhbGxlcygOMh8QASIb3PlDxnbZPSWlaZsEYGv93mpLAA9iUiV8S6RFMhoQAiIWZmxvcmVzICYgZGV0YWxsZXMgbGltYeABAPoBBAgAEDA!16s%2Fg%2F11t0r11_27?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D";
    window.open(googleMapsUrl, '_blank');
  };

  const getDirections = () => {
    const directionsUrl = "https://www.google.com/maps/place/Flores+%26+Detalles+Lima/@-11.9753631,-77.0062079,17z/data=!4m10!1m2!2m1!1sFlores+%26+Detalles+Lima!3m6!1s0x9105c5415aafe44d:0x5141eade405d580c!8m2!3d-11.9753631!4d-77.0014443!15sChZGbG9yZXMgJiBEZXRhbGxlcyBMaW1hWhgiFmZsb3JlcyAmIGRldGFsbGVzIGxpbWGSAQdmbG9yaXN0mgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVU5QTUhaTWQyVkJFQUWqAXQKDS9nLzExdDByMTFfMjcKDS9nLzExeDh5ZjczejAQASoVIhFmbG9yZXMgJiBkZXRhbGxlcygOMh8QASIb3PlDxnbZPSWlaZsEYGv93mpLAA9iUiV8S6RFMhoQAiIWZmxvcmVzICYgZGV0YWxsZXMgbGltYeABAPoBBAgAEDA!16s%2Fg%2F11t0r11_27?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D";
    window.open(directionsUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          📍 Selecciona tu punto de recojo
        </h3>
        <p className="text-gray-600">
          Elige la tienda más conveniente para recoger tu pedido
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Lista de tiendas */}
        <div className="lg:w-1/2 p-6">
          <div className="space-y-4">
            {storeLocations.map((store) => (
              <div
                key={store.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  selectedStore === store.id
                    ? 'border-pink-bright bg-pink-50 shadow-md'
                    : 'border-gray-200 hover:border-pink-light hover:bg-pink-25'
                }`}
                onClick={() => handleStoreSelect(store.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{store.name}</h4>
                      {selectedStore === store.id && (
                        <div className="bg-pink-bright text-white rounded-full p-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-700">{store.address}</p>
                          <p className="text-gray-500">{store.district}</p>
                          {store.reference && (
                            <p className="text-gray-500 italic text-xs mt-1">{store.reference}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`https://wa.me/${store.phone.replace(/\D/g, '')}`}
                          className="text-green-600 hover:text-green-700 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {store.phone}
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{store.hours}</span>
                      </div>
                    </div>

                    {/* Características de la tienda */}
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {store.features.map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={openInGoogleMaps}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📱 Ver en Google Maps
            </button>
            <button
              onClick={getDirections}
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              🚗 Cómo llegar
            </button>
          </div>
        </div>

        {/* Mapa */}
        <div className="lg:w-1/2">
          <div className="h-96 lg:h-full min-h-[400px] bg-gray-100">
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
          </div>
        </div>
      </div>

      {/* Confirmación */}
      {showConfirmation && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>¡Tienda seleccionada!</span>
        </div>
      )}
    </div>
  );
}
