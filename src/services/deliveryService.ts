// Tipos para el sistema de delivery
export interface DeliveryDistrict {
  id: number;
  name: string;
  slug: string;
  shipping_cost: number | string; // Permitir tanto number como string desde la API
  is_active: boolean;
  zone: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DistrictsByZone {
  [zone: string]: DeliveryDistrict[];
}

export interface ShippingCostResponse {
  district: string;
  shipping_cost: number;
  is_available: boolean;
  formatted_cost: string;
}

export interface DeliveryAvailabilityResponse {
  district: string;
  is_available: boolean;
  shipping_cost: number;
  message: string;
}

// Funciones del servicio de delivery
export class DeliveryService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://xn--floresdejazmnflorera-04bh.com/api';

  static {
    console.log('🔧 DeliveryService baseUrl:', this.baseUrl);
  }

  /**
   * Función utilitaria para convertir shipping_cost a número
   */
  private static getShippingCostAsNumber(cost: number | string): number {
    if (typeof cost === 'number') return cost;
    const parsed = parseFloat(cost.toString());
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Obtener todos los distritos activos
   */
  static async getDistricts(): Promise<DeliveryDistrict[]> {
    try {
      const url = `${this.baseUrl}/delivery/districts`;
      console.log('🚀 Fetching districts from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener distritos');
      }

      return data.data;
    } catch (error) {
      console.error('💥 Error fetching districts:', error);
      throw error;
    }
  }

  /**
   * Obtener distritos agrupados por zona
   */
  static async getDistrictsByZone(): Promise<DistrictsByZone> {
    try {
      const response = await fetch(`${this.baseUrl}/delivery/districts/by-zone`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener distritos por zona');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching districts by zone:', error);
      throw error;
    }
  }

  /**
   * Calcular costo de envío para un distrito específico
   */
  static async getShippingCost(district: string): Promise<ShippingCostResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/delivery/shipping-cost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ district }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al calcular costo de envío');
      }

      return data.data;
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de entrega para un distrito
   */
  static async checkAvailability(district: string): Promise<DeliveryAvailabilityResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/delivery/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ district }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al verificar disponibilidad');
      }

      return data.data;
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      throw error;
    }
  }

  /**
   * Buscar distritos por nombre (filtro local)
   */
  static filterDistrictsByName(districts: DeliveryDistrict[], searchTerm: string): DeliveryDistrict[] {
    if (!searchTerm.trim()) return districts;
    
    const term = searchTerm.toLowerCase().trim();
    return districts.filter(district => 
      district.name.toLowerCase().includes(term) ||
      district.zone.toLowerCase().includes(term)
    );
  }

  /**
   * Obtener distritos más económicos (hasta cierto límite)
   */
  static getCheapestDistricts(districts: DeliveryDistrict[], limit: number = 10): DeliveryDistrict[] {
    return districts
      .sort((a, b) => this.getShippingCostAsNumber(a.shipping_cost) - this.getShippingCostAsNumber(b.shipping_cost))
      .slice(0, limit);
  }

  /**
   * Agrupar distritos por rango de precios
   */
  static groupDistrictsByPriceRange(districts: DeliveryDistrict[]) {
    return {
      economico: districts.filter(d => this.getShippingCostAsNumber(d.shipping_cost) <= 25), // Hasta S/. 25
      moderado: districts.filter(d => this.getShippingCostAsNumber(d.shipping_cost) > 25 && this.getShippingCostAsNumber(d.shipping_cost) <= 50), // S/. 26-50
      premium: districts.filter(d => this.getShippingCostAsNumber(d.shipping_cost) > 50 && this.getShippingCostAsNumber(d.shipping_cost) <= 100), // S/. 51-100
      especial: districts.filter(d => this.getShippingCostAsNumber(d.shipping_cost) > 100) // Más de S/. 100
    };
  }
}
