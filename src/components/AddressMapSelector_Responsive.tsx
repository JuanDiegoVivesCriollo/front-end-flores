'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { MapPin, Search, Target, Check } from 'lucide-react';

// Definir tipos para evitar problemas de importación
interface LatLng {
  lat: number;
  lng: number;
}

interface AddressComponents {
  street: string;
  district: string;
  city: string;
  state: string;
  country: string;
}

interface GeocodingResult {
  lat: number | string; // La API puede devolver string
  lon: number | string; // La API puede devolver string
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    house_number?: string;
  };
}

interface AddressMapSelectorProps {
  onAddressSelect: (address: {
    fullAddress: string;
    street: string;
    district: string;
    coordinates: LatLng;
  }) => void;
  initialAddress?: string;
  className?: string;
}

export default function AddressMapSelector({ 
  onAddressSelect, 
  initialAddress = '',
  className = '' 
}: AddressMapSelectorProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [addressComponents, setAddressComponents] = useState<AddressComponents | null>(null);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMapSection, setShowMapSection] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lista de distritos de Lima (fallback)
  const limaDistricts = [
    'Cercado de Lima', 'Barranco', 'Breña', 'Chorrillos', 'El Agustino', 'Independencia',
    'Jesús María', 'La Molina', 'La Victoria', 'Lince', 'Los Olivos', 'Magdalena del Mar',
    'Miraflores', 'Pueblo Libre', 'Puente Piedra', 'Rímac', 'San Borja', 'San Isidro',
    'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Luis', 'San Martín de Porres',
    'San Miguel', 'Santa Anita', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador',
    'Villa María del Triunfo', 'Ancón', 'Ate', 'Carabayllo', 'Chaclacayo', 'Cieneguilla',
    'Comas', 'Lurigancho', 'Lurín', 'Pachacamac', 'Pucusana', 'Santa María del Mar',
    'Santa Rosa'
  ];

  // Función para geocodificación
  const searchAddress = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // Construir URL de búsqueda para Lima, Perú
      const searchUrl = new URL('https://nominatim.openstreetmap.org/search');
      searchUrl.searchParams.set('format', 'json');
      searchUrl.searchParams.set('addressdetails', '1');
      searchUrl.searchParams.set('limit', '5');
      searchUrl.searchParams.set('countrycodes', 'pe');
      searchUrl.searchParams.set('q', `${query}, Lima, Peru`);
      
      const response = await fetch(searchUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FloresYDetalles/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: GeocodingResult[] = await response.json();
      console.log('🔍 Search results:', data);
      
      if (data && data.length > 0) {
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        // Si no hay resultados, usar fallback
        throw new Error('No results found');
      }
    } catch (error) {
      console.warn('API search failed, using local fallback:', error);
      
      // Fallback: crear sugerencias basadas en distritos conocidos
      const matchingDistricts = limaDistricts.filter(district =>
        district.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(district.toLowerCase())
      );
      
      const fallbackSuggestions: GeocodingResult[] = matchingDistricts.slice(0, 3).map((district, index) => ({
        lat: -12.0464 + (index * 0.01), // Coordenadas aproximadas de Lima
        lon: -77.0428 + (index * 0.01),
        display_name: `${query}, ${district}, Lima, Perú`,
        address: {
          road: query.split(',')[0]?.trim() || query,
          suburb: district,
          city: 'Lima',
          state: 'Lima',
          country: 'Perú'
        }
      }));
      
      // Si no hay coincidencias de distrito, crear una sugerencia genérica
      if (fallbackSuggestions.length === 0) {
        fallbackSuggestions.push({
          lat: -12.0464,
          lon: -77.0428,
          display_name: `${query}, Lima, Perú`,
          address: {
            road: query,
            suburb: 'Lima',
            city: 'Lima',
            state: 'Lima',
            country: 'Perú'
          }
        });
      }
      
      setSuggestions(fallbackSuggestions);
      setShowSuggestions(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Función para geocodificación inversa
  const reverseGeocode = useCallback(async (location: LatLng) => {
    try {
      const reverseUrl = new URL('https://nominatim.openstreetmap.org/reverse');
      reverseUrl.searchParams.set('format', 'json');
      reverseUrl.searchParams.set('lat', location.lat.toString());
      reverseUrl.searchParams.set('lon', location.lng.toString());
      reverseUrl.searchParams.set('addressdetails', '1');
      
      const response = await fetch(reverseUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FloresYDetalles/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: GeocodingResult = await response.json();
      console.log('🔄 Reverse geocoding result:', data);
      
      if (data.address) {
        const street = `${data.address.house_number || ''} ${data.address.road || ''}`.trim();
        const district = data.address.suburb || data.address.city || '';
        
        const addressComponents: AddressComponents = {
          street: street || 'Dirección no especificada',
          district: district || 'Lima',
          city: data.address.city || 'Lima',
          state: data.address.state || 'Lima',
          country: data.address.country || 'Perú'
        };

        setAddressComponents(addressComponents);
        setSearchQuery(data.display_name);

        // Llamar al callback con la dirección seleccionada
        onAddressSelect({
          fullAddress: data.display_name,
          street: addressComponents.street,
          district: addressComponents.district,
          coordinates: location
        });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      
      // Fallback: usar datos básicos
      const fallbackComponents: AddressComponents = {
        street: searchQuery || 'Dirección no especificada',
        district: 'Lima',
        city: 'Lima',
        state: 'Lima',
        country: 'Perú'
      };
      
      setAddressComponents(fallbackComponents);
      
      onAddressSelect({
        fullAddress: searchQuery || 'Lima, Perú',
        street: fallbackComponents.street,
        district: fallbackComponents.district,
        coordinates: location
      });
    }
  }, [onAddressSelect, searchQuery]);

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion: GeocodingResult) => {
    // Asegurar que las coordenadas sean números
    const lat = typeof suggestion.lat === 'number' ? suggestion.lat : parseFloat(suggestion.lat);
    const lng = typeof suggestion.lon === 'number' ? suggestion.lon : parseFloat(suggestion.lon);
    
    // Validar que las conversiones sean exitosas
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates in suggestion:', suggestion);
      return;
    }
    
    const location = { lat, lng };
    setSelectedLocation(location);
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    reverseGeocode(location);
  };

  // Obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en este navegador');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setSelectedLocation(location);
        reverseGeocode(location);
        setIsSearching(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener tu ubicación actual');
        setIsSearching(false);
      }
    );
  };

  // Manejar cambio en el input de búsqueda con debounce
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(false); // Ocultar sugerencias mientras se escribe
    
    // Debounce: esperar 500ms antes de buscar
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 500);
  };

  // Cleanup del timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Search Section - Mobile Optimized */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar dirección con mapa 📍
        </label>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Buscar dirección en Lima... Ej: Av. Javier Prado 123, San Isidro"
            className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm sm:text-base"
            disabled={isSearching}
          />
          
          {/* Loading indicator */}
          {isSearching && (
            <div className="absolute right-8 sm:right-10 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-bright"></div>
            </div>
          )}
          
          {/* Current location button - Mobile optimized */}
          <button
            type="button"
            onClick={getCurrentLocation}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-pink-bright transition-colors"
            title="Usar mi ubicación actual"
          >
            <Target className="w-4 h-4" />
          </button>
        </div>
        
        {/* Suggestions dropdown - Mobile Optimized */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-800 break-words">{suggestion.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Información de la dirección seleccionada - Mobile Optimized */}
      {addressComponents && (
        <div className="mb-3 sm:mb-4 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            <span className="font-medium text-green-800 text-sm sm:text-base">Dirección seleccionada</span>
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-green-700">
            <div><strong>Calle:</strong> <span className="break-words">{addressComponents.street || 'No especificada'}</span></div>
            <div><strong>Distrito:</strong> {addressComponents.district}</div>
            <div><strong>Ciudad:</strong> {addressComponents.city}</div>
            {selectedLocation && typeof selectedLocation.lat === 'number' && typeof selectedLocation.lng === 'number' && (
              <div className="text-xs text-green-600 mt-2 break-all">
                Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Toggle Button - Mobile First */}
      <div className="mb-3 sm:mb-4">
        <button
          type="button"
          onClick={() => setShowMapSection(!showMapSection)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-pink-bright text-white rounded-lg hover:bg-pink-dark transition-colors text-sm sm:text-base"
        >
          <MapPin className="w-4 h-4" />
          {showMapSection ? 'Ocultar mapa' : 'Ver en mapa'}
        </button>
      </div>

      {/* Sección del mapa simplificada - Mobile Optimized */}
      {showMapSection && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="text-gray-600 text-sm sm:text-base">
              🗺️ <strong>Función de mapa interactivo</strong>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Para una experiencia completa con mapa interactivo, puedes:
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-gray-600 text-left">
              <div>• Usar el botón &quot;Mi ubicación&quot; para detectar automáticamente tu posición</div>
              <div>• Buscar tu dirección en el campo de búsqueda arriba</div>
              <div>• Seleccionar de las sugerencias que aparecen</div>
            </div>
            <div className="mt-3 sm:mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs sm:text-sm text-blue-700 text-left">
                💡 <strong>Tip:</strong> Escribe direcciones como &quot;Av. Javier Prado 123, San Isidro&quot; 
                para obtener mejores resultados de búsqueda.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help text - Mobile optimized */}
      <div className="mt-3 text-xs sm:text-sm text-gray-500">
        <p>🎯 <strong>Tip:</strong> Para mejores resultados, incluye el número de casa y referencias cercanas</p>
        <p className="mt-1">📍 <strong>Ejemplo:</strong> &quot;Av. Javier Prado 1234, San Isidro, cerca al centro comercial&quot;</p>
      </div>
    </div>
  );
}
