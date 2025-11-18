'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Truck } from 'lucide-react';
import { DeliveryService, DeliveryDistrict } from '@/services/deliveryService';

interface DistrictSelectorProps {
  selectedDistrict: string;
  onDistrictChange: (district: string, shippingCost: number) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

// Función utilitaria para convertir shipping_cost a número
const getShippingCostAsNumber = (cost: number | string): number => {
  if (typeof cost === 'number') return cost;
  const parsed = parseFloat(cost.toString());
  return isNaN(parsed) ? 0 : parsed;
};

export default function DistrictSelector({ 
  selectedDistrict, 
  onDistrictChange, 
  onValidationChange,
  className = '' 
}: DistrictSelectorProps) {
  const [districts, setDistricts] = useState<DeliveryDistrict[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<DeliveryDistrict[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>('');

  // Cargar distritos al montar el componente
  useEffect(() => {
    loadDistricts();
  }, []);

  // Filtrar distritos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = DeliveryService.filterDistrictsByName(districts, searchTerm);
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts(districts);
    }
  }, [searchTerm, districts]);

  // Validar distrito seleccionado
  useEffect(() => {
    const isValid = selectedDistrict.trim() !== '' && 
                   districts.some(d => d.name === selectedDistrict);
    onValidationChange?.(isValid);
  }, [selectedDistrict, districts, onValidationChange]);

  // Sincronizar searchTerm con selectedDistrict cuando viene desde afuera
  useEffect(() => {
    if (selectedDistrict && selectedDistrict !== searchTerm) {
      console.log('🔄 Syncing DistrictSelector:', { selectedDistrict, currentSearchTerm: searchTerm });
      setSearchTerm(selectedDistrict);
      setIsOpen(false); // Cerrar dropdown si está abierto
    }
  }, [selectedDistrict, searchTerm]);

  const loadDistricts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await DeliveryService.getDistricts();
      setDistricts(data);
      setFilteredDistricts(data);
    } catch (error) {
      console.error('Error loading districts:', error);
      setError('Error al cargar distritos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistrictSelect = async (district: DeliveryDistrict) => {
    try {
      setSearchTerm(district.name);
      setIsOpen(false);
      onDistrictChange(district.name, getShippingCostAsNumber(district.shipping_cost));
    } catch (error) {
      console.error('Error selecting district:', error);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    if (value !== selectedDistrict) {
      onDistrictChange(value, 0);
    }
    setIsOpen(true);
  };

  const selectedDistrictData = districts.find(d => d.name === selectedDistrict);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Distrito de entrega *
      </label>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Buscar distrito..."
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-transparent text-sm sm:text-base"
            autoComplete="off"
          />
        </div>

        {/* Mostrar costo de envío si hay distrito seleccionado - Mobile Optimized */}
        {selectedDistrictData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-green-800">
                Costo de envío a {selectedDistrictData.name}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-green-700">
              S/. {getShippingCostAsNumber(selectedDistrictData.shipping_cost).toFixed(2)}
            </div>
          </motion.div>
        )}

        {/* Dropdown de distritos - Mobile Optimized */}
        {isOpen && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto"
          >
            {filteredDistricts.length > 0 ? (
              <div className="py-1">
                {filteredDistricts.map((district, index) => (
                  <motion.button
                    key={district.id}
                    type="button"
                    onClick={() => handleDistrictSelect(district)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-pink-bright flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-xs sm:text-sm text-gray-900 truncate">{district.name}</div>
                        <div className="text-xs text-gray-500 truncate">{district.zone}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-xs sm:text-sm font-semibold text-gray-700">
                        S/. {getShippingCostAsNumber(district.shipping_cost).toFixed(2)}
                      </div>
                      <div className={`text-xs ${
                        getShippingCostAsNumber(district.shipping_cost) <= 25 ? 'text-green-600' :
                        getShippingCostAsNumber(district.shipping_cost) <= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getShippingCostAsNumber(district.shipping_cost) <= 25 ? 'Económico' :
                         getShippingCostAsNumber(district.shipping_cost) <= 50 ? 'Moderado' : 'Premium'}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="py-4 px-4 text-center text-gray-500">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No se encontraron distritos</p>
                <p className="text-xs">Intenta con otro término de búsqueda</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Loading state - Mobile Optimized */}
        {isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-pink-bright"></div>
              <span className="ml-2 text-sm sm:text-base text-gray-600">Cargando distritos...</span>
            </div>
          </div>
        )}

        {/* Error state - Mobile Optimized */}
        {error && (
          <div className="mt-2 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs sm:text-sm text-red-800">{error}</p>
            <button
              onClick={loadDistricts}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Información adicional - Mobile Optimized */}
      {districts.length > 0 && (
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p>💡 Los precios de envío varían según el distrito de destino</p>
          <p>📍 Disponible en {districts.length} distritos de Lima y Callao</p>
        </div>
      )}
    </div>
  );
}
