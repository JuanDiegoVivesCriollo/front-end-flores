'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Navigation, Map } from 'lucide-react';

// Declaración de tipos para Leaflet
declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressSelectorProps {
  onLocationSelect: (location: LocationData) => void;
  defaultLocation?: LocationData;
}

export default function AddressSelector({ onLocationSelect, defaultLocation }: AddressSelectorProps) {
  const [activeMode, setActiveMode] = useState<'map' | 'search' | 'current'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(defaultLocation || null);
  
  // Estados para buscador
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Referencias del mapa
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        try {
          // Crear script de Leaflet
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          
          script.onload = () => {
            console.log('✅ Leaflet cargado correctamente');
            setLeafletLoaded(true);
          };
          
          script.onerror = () => {
            console.error('❌ Error cargando Leaflet');
          };
          
          document.head.appendChild(script);
        } catch (error) {
          console.error('❌ Error al cargar Leaflet:', error);
        }
      } else if (window.L) {
        setLeafletLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  // Inicializar mapa cuando Leaflet esté cargado
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.L) return;

    try {
      // Coordenadas de Lima, Perú
      const defaultLat = selectedLocation?.lat || -12.0464;
      const defaultLng = selectedLocation?.lng || -77.0428;

      // Crear mapa
      leafletMapRef.current = window.L.map(mapRef.current).setView([defaultLat, defaultLng], 13);

      // Agregar capa de tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);

      // Agregar marcador si hay ubicación seleccionada
      if (selectedLocation) {
        markerRef.current = window.L.marker([selectedLocation.lat, selectedLocation.lng])
          .addTo(leafletMapRef.current)
          .bindPopup(selectedLocation.address)
          .openPopup();
      }

      // Manejar clicks en el mapa
      leafletMapRef.current.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        // Remover marcador anterior
        if (markerRef.current && leafletMapRef.current) {
          leafletMapRef.current.removeLayer(markerRef.current);
        }

        // Agregar nuevo marcador
        if (leafletMapRef.current) {
          markerRef.current = window.L.marker([lat, lng]).addTo(leafletMapRef.current);
        }

        // Obtener dirección usando geocodificación inversa
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`
          );
          const data = await response.json();
          
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          
          const locationData: LocationData = { lat, lng, address };
          
          console.log('🗺️ Ubicación seleccionada del mapa:', {
            address,
            lat,
            lng,
            source: 'map_click'
          });
          
          setSelectedLocation(locationData);
          onLocationSelect(locationData);
          
          if (markerRef.current) {
            markerRef.current.bindPopup(address).openPopup();
          }
        } catch (error) {
          console.error('Error obteniendo dirección:', error);
          const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          const locationData: LocationData = { lat, lng, address };
          
          console.log('🗺️ Ubicación del mapa (sin geocodificación):', {
            address,
            lat,
            lng,
            source: 'map_click_fallback'
          });
          
          setSelectedLocation(locationData);
          onLocationSelect(locationData);
        }
      });

      console.log('✅ Mapa inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
    }
  }, [selectedLocation, onLocationSelect]);

  // Efecto para inicializar mapa
  useEffect(() => {
    if (leafletLoaded && mapRef.current && activeMode === 'map' && !leafletMapRef.current) {
      initializeMap();
    }
  }, [leafletLoaded, activeMode, initializeMap]);

  // Función para buscar sugerencias
  const searchAddresses = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Lima, Peru')}&format=json&limit=5&accept-language=es`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error buscando direcciones:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Manejar cambio en el buscador
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Crear nuevo timeout para buscar
    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);
  };

  // Seleccionar sugerencia
  const selectSuggestion = (suggestion: AddressSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const address = suggestion.display_name;
    
    const locationData: LocationData = { lat, lng, address };
    setSelectedLocation(locationData);
    
    console.log('🔍 Dirección seleccionada desde sugerencias:', {
      address,
      lat,
      lng,
      source: 'search_suggestion'
    });
    
    onLocationSelect(locationData);
    
    setSearchQuery(address);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          // Obtener dirección de la ubicación actual
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`
          );
          const data = await response.json();
          
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          const locationData: LocationData = { lat, lng, address };
          
          console.log('📍 Ubicación actual obtenida:', {
            address,
            lat,
            lng,
            source: 'current_location'
          });
          
          setSelectedLocation(locationData);
          onLocationSelect(locationData);
          setSearchQuery(address);
          
          // Si el mapa está activo, actualizar la vista
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([lat, lng], 15);
            
            if (markerRef.current) {
              leafletMapRef.current.removeLayer(markerRef.current);
            }
            
            markerRef.current = window.L.marker([lat, lng])
              .addTo(leafletMapRef.current)
              .bindPopup(address)
              .openPopup();
          }
        } catch (error) {
          console.error('Error obteniendo dirección actual:', error);
          const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          const locationData: LocationData = { lat, lng, address };
          
          console.log('📍 Ubicación actual (sin geocodificación):', {
            address,
            lat,
            lng,
            source: 'current_location_fallback'
          });
          
          setSelectedLocation(locationData);
          onLocationSelect(locationData);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación actual');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Selector de modo */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => setActiveMode('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            activeMode === 'search'
              ? 'bg-pink-500 text-white border-pink-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Search className="h-4 w-4" />
          Buscar dirección
        </button>
        
        <button
          onClick={() => setActiveMode('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            activeMode === 'map'
              ? 'bg-pink-500 text-white border-pink-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Map className="h-4 w-4" />
          Seleccionar en mapa
        </button>
        
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-blue-500 text-white border-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Navigation className="h-4 w-4" />
          {isLoading ? 'Obteniendo...' : 'Usar mi ubicación'}
        </button>
      </div>

      {/* Contenido según el modo activo */}
      {activeMode === 'search' && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar dirección en Lima..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
              </div>
            )}
          </div>
          
          {/* Sugerencias */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-800 break-words leading-relaxed whitespace-normal">
                      {suggestion.display_name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeMode === 'map' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Haz click en el mapa para seleccionar tu ubicación
          </p>
          <div 
            ref={mapRef} 
            className="w-full h-80 rounded-lg border border-gray-300 overflow-hidden"
            style={{ minHeight: '320px' }}
          >
            {!leafletLoaded && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Cargando mapa...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ubicación seleccionada */}
      {selectedLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-800 mb-1">Ubicación seleccionada:</h4>
              <p className="text-sm text-green-700">{selectedLocation.address}</p>
              <p className="text-xs text-green-600 mt-1">
                Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}