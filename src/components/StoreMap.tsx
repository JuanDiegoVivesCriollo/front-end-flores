'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Phone, Clock } from 'lucide-react';

// Importar CSS de Leaflet
import 'leaflet/dist/leaflet.css';

// Cargar componentes de Leaflet dinámicamente para evitar errores de SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface StoreLocation {
  id: number;
  name: string;
  address: string;
  district?: string;
  reference?: string;
  coords: [number, number];
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
    coords: [-11.975123, -77.001345], // Coordenadas más precisas del Mercado Progreso Los Pinos
    phone: "+51 919 642 610",
    hours: "Lun-Dom: 8:00 AM - 10:00 PM",
    features: ["Metro Canto Rey a 2 min", "Fácil acceso desde Línea 1", "Variedad completa", "Módulo adicional disponible"]
  }
];

interface StoreMapProps {
  selectedStore?: number | null;
  onStoreSelect?: (storeId: number) => void;
}

export default function StoreMap({ selectedStore, onStoreSelect }: StoreMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedStoreName, setSelectedStoreName] = useState('');

  useEffect(() => {
    setIsClient(true);
    
    // Configurar iconos de Leaflet después de que se carga en el cliente
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        import('leaflet').then((L) => {
          // Configurar los iconos por defecto de Leaflet
          const DefaultIcon = L.Icon.Default.prototype as unknown as Record<string, unknown>;
          delete DefaultIcon._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });
        }).catch(console.error);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleStoreSelect = (storeId: number) => {
    const store = storeLocations.find(s => s.id === storeId);
    if (store && onStoreSelect) {
      onStoreSelect(storeId);
      setSelectedStoreName(store.name);
      setShowConfirmation(true);
      
      // Auto ocultar confirmación después de 3 segundos
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    }
  };

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-bright mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ubicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal de confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">¡Tienda seleccionada!</h3>
              <p className="text-gray-600 mb-4">{selectedStoreName}</p>
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-pink-bright text-white px-4 py-2 rounded hover:bg-pink-dark transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de tiendas */}
      <div className="grid md:grid-cols-2 gap-4">
        {storeLocations.map((store) => (
          <div
            key={store.id}
            onClick={() => handleStoreSelect(store.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedStore === store.id
                ? 'border-pink-bright bg-pink-50'
                : 'border-gray-200 hover:border-pink-light'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{store.name}</h4>
              {selectedStore === store.id && (
                <div className="w-3 h-3 bg-pink-bright rounded-full"></div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {store.address}
            </p>
            
            {store.district && (
              <p className="text-xs text-gray-500 mb-2">
                📍 {store.district}
              </p>
            )}
            
            {store.reference && (
              <p className="text-xs text-gray-500 mb-3 italic">
                {store.reference}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                {store.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                {store.hours}
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {store.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>

            {selectedStore === store.id && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm font-medium">✓ Tienda seleccionada para recojo</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mapa interactivo */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-pink-bright" />
          Mapa de ubicaciones
        </h3>
        
        {isClient ? (
          <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300 relative">
            <MapContainer
              center={[-11.975123, -77.001345]} // Centro en la ubicación exacta del Mercado Progreso Los Pinos
              zoom={18}
              style={{ height: '100%', width: '100%', minHeight: '384px' }}
              className="z-0"
              scrollWheelZoom={true}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {storeLocations.map((store) => (
                <Marker 
                  key={store.id}
                  position={store.coords}
                  eventHandlers={{
                    click: () => handleStoreSelect(store.id)
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[280px]">
                      <h4 className="font-bold text-gray-900 mb-2">{store.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{store.address}</p>
                      <p className="text-sm text-gray-600 mb-2">{store.reference}</p>
                      <p className="text-xs text-gray-600 mb-2">📍 {store.district}</p>
                      <p className="text-xs text-gray-600 mb-2">📞 {store.phone}</p>
                      <p className="text-xs text-gray-600 mb-3">🕐 {store.hours}</p>
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-700 font-medium mb-1">Características:</p>
                        {store.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      {onStoreSelect && (
                        <button
                          onClick={() => handleStoreSelect(store.id)}
                          className="w-full bg-pink-bright text-white py-2 px-3 rounded text-sm hover:bg-pink-dark transition-colors"
                        >
                          Seleccionar esta tienda
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-bright mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Información del mapa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          Ubicación de nuestra tienda
        </h3>
        
        <div className="space-y-2 text-sm text-blue-800">
          {storeLocations.map((store) => (
            <div key={store.id} className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">{store.name}</p>
                <p className="text-blue-600">{store.address}</p>
                {store.reference && (
                  <p className="text-blue-500 text-xs italic">{store.reference}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-blue-200">
          <p className="text-blue-700 text-sm mb-2">
            📍 <strong>Plus Code de ubicación:</strong> 2XFX+RCC, Lima 15419
          </p>
          <p className="text-blue-600 text-xs mb-3">
            Mercado el Progreso Los Pinos - Al costado de Metro de Canto Rey
          </p>
          <p className="text-blue-600 text-xs mb-3">
            <strong>Coordenadas exactas:</strong> -11.975445, -77.001516
          </p>
          
          <div className="bg-blue-100 rounded-lg p-3">
            <h5 className="font-semibold text-blue-900 mb-2">¿Cómo llegar?</h5>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>🚇 <strong>En Metro:</strong> Estación Canto Rey (Línea 1)</li>
              <li>🚌 <strong>En bus:</strong> Av. Próceres de la Independencia</li>
              <li>🚗 <strong>En auto:</strong> Busca &quot;Mercado Los Pinos&quot; en Google Maps</li>
              <li>📱 <strong>Con GPS:</strong> Usa el Plus Code 2XFX+RCC</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Información adicional de recojo */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-3">Información de recojo en tienda</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• El recojo en tienda es completamente gratuito</li>
          <li>• Horario de atención según cada ubicación</li>
          <li>• Lleva tu DNI para recoger el pedido</li>
          <li>• Puedes recoger hasta 7 días después de la compra</li>
          <li>• Te avisaremos cuando tu pedido esté listo</li>
        </ul>
      </div>
    </div>
  );
}
