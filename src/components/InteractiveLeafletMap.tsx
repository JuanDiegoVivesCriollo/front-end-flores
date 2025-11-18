'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface LatLng {
  lat: number;
  lng: number;
}

interface InteractiveLeafletMapProps {
  onLocationSelect: (location: LatLng) => void;
  selectedLocation: LatLng | null;
  className?: string;
}

// Componente para manejar clicks en el mapa
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (location: LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    }
  });
  return null;
}

export default function InteractiveLeafletMap({ 
  onLocationSelect, 
  selectedLocation, 
  className = '' 
}: InteractiveLeafletMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Importar Leaflet dinámicamente y configurar iconos
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
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  // Centro por defecto en Lima
  const defaultCenter: [number, number] = [-12.0464, -77.0428];
  const mapCenter: [number, number] = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng] 
    : defaultCenter;

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0 rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Componente para manejar clicks */}
        <MapClickHandler onLocationSelect={onLocationSelect} />
        
        {/* Marcador en la ubicación seleccionada */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
        )}
      </MapContainer>
    </div>
  );
}