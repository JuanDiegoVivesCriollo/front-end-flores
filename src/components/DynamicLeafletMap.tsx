'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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

interface DynamicLeafletMapProps {
  storeLocations: StoreLocation[];
  selectedStore?: number | null;
  onStoreSelect?: (storeId: number) => void;
}

export default function DynamicLeafletMap({ storeLocations, onStoreSelect }: DynamicLeafletMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Importar Leaflet dinámicamente
    import('leaflet').then((leaflet) => {
      setL(leaflet);
      
      // Configurar iconos por defecto
      const DefaultIcon = leaflet.Icon.Default.prototype as {
        _getIconUrl?: () => void;
      };
      delete DefaultIcon._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  if (!isClient || !L) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-bright mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[-11.975833, -76.999167]} // Centro en Mercado Los Pinos
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        key="map-container" // Key único para evitar reutilización
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {storeLocations.map((store) => (
          <Marker 
            key={`marker-${store.id}`}
            position={store.coords}
            eventHandlers={{
              click: () => {
                if (onStoreSelect) {
                  onStoreSelect(store.id);
                }
              }
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-gray-900 mb-2">{store.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                {store.district && (
                  <p className="text-xs text-gray-500 mb-1">📍 {store.district}</p>
                )}
                {store.reference && (
                  <p className="text-xs text-gray-500 mb-2 italic">{store.reference}</p>
                )}
                <p className="text-xs text-gray-600 mb-2">📞 {store.phone}</p>
                <p className="text-xs text-gray-600 mb-3">🕐 {store.hours}</p>
                {onStoreSelect && (
                  <button
                    onClick={() => onStoreSelect(store.id)}
                    className="w-full bg-pink-bright hover:bg-pink-dark text-white px-3 py-1 rounded text-sm transition-colors"
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
  );
}
