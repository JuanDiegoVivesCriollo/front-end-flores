// Declaraciones de tipos TypeScript para Leaflet CDN
// Extendiendo la interfaz Window para incluir Leaflet global

declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

// Tipos adicionales para la funcionalidad del mapa
export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  components?: {
    street?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface NominatimResponse {
  display_name: string;
  address?: {
    road?: string;
    pedestrian?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface AddressMapSelectorProps {
  onAddressSelect: (address: {
    fullAddress: string;
    street: string;
    district: string;
    coordinates: { lat: number; lng: number };
  }) => void;
  initialAddress?: string;
  className?: string;
}

export {};