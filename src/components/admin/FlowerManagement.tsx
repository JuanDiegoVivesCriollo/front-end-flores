'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Search,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Package,
  Upload,
  Check,
  Loader,
  Palette,
  Tag,
  Percent,
  DollarSign,
  Calculator
} from 'lucide-react';
import { apiClient } from '@/services/api';
import type { Flower } from '@/types';
import { occasionNames } from '@/config/occasions';

// Extender el tipo Flower para incluir los campos del backend
interface FlowerWithUrls extends Omit<Flower, 'categories' | 'images'> {
  image_urls?: string[];
  first_image?: string;
  categories?: { id: number; name: string; }[];
  images?: string[] | string; // Redefinir images como propiedad flexible
}

// Tipos para el formulario
interface FlowerFormData {
  name: string;
  description: string;
  short_description: string;
  price: string;
  original_price: string;
  discount_percentage: number;
  is_on_sale: boolean;
  category_ids: number[];  // Cambiar a array para múltiples categorías
  stock: string;
  is_featured: boolean;
  is_active: boolean;
  color: string[];  // Array para múltiples colores
  occasion: string[];  // Array para múltiples ocasiones
  sku?: string;
  images: string[];
}

// Colores disponibles (mismos que en ModernFilters)
const flowerColors = [
  { value: "Rojo", label: "Rojo", color: "bg-red-500" },
  { value: "Blanco", label: "Blanco", color: "bg-white border-2 border-gray-300" },
  { value: "Rosa", label: "Rosa", color: "bg-pink-500" },
  { value: "Amarillo", label: "Amarillo", color: "bg-yellow-500" },
  { value: "Morado", label: "Morado", color: "bg-purple-500" },
  { value: "Naranja", label: "Naranja", color: "bg-orange-500" },
  { value: "Azul", label: "Azul", color: "bg-blue-500" },
  { value: "Multicolor", label: "Multicolor", color: "bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400" }
];

// Ocasiones disponibles para el admin
const flowerOccasions = occasionNames.filter(occasion => occasion !== 'Todas');

// Helper para obtener la URL de imagen de una flor
const getFlowerImageUrl = (flower: FlowerWithUrls): string => {
  // Priorizar first_image si está disponible (viene del backend)
  if (flower.first_image) {
    return flower.first_image as string;
  }
  
  // Usar la primera imagen del array image_urls
  if (flower.image_urls && flower.image_urls.length > 0) {
    return flower.image_urls[0] as string;
  }
  
  // Usar la primera imagen del array images
  if (Array.isArray(flower.images) && flower.images.length > 0) {
    let firstImage = flower.images[0];
    
    // Si el primer elemento es un array stringificado, intentar parsearlo
    if (typeof firstImage === 'string' && firstImage.startsWith('[')) {
      try {
        const parsed = JSON.parse(firstImage);
        if (Array.isArray(parsed) && parsed.length > 0) {
          firstImage = parsed[0];
        }
      } catch {
        console.warn('Error parsing image array:', firstImage);
      }
    }
    
    return firstImage as string;
  }
  
  // Si images es un string, verificar si es un array stringificado
  if (typeof flower.images === 'string') {
    if (flower.images.startsWith('[')) {
      try {
        const parsed = JSON.parse(flower.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0] as string;
        }
      } catch {
        console.warn('Error parsing image string:', flower.images);
      }
    }
    return flower.images;
  }
  
  return '';
};

// Helper para normalizar URLs de imágenes (UNIFICADO CON CATALOGO)
const getImageUrl = (imageUrl: string | undefined | null): string => {
  console.log('🖼️ ===== PROCESANDO IMAGEN =====');
  console.log('🖼️ Input URL:', imageUrl);
  console.log('🖼️ Tipo:', typeof imageUrl);
  
  if (!imageUrl || imageUrl.trim() === '') {
    console.log('🖼️ ERROR: Empty image URL provided');
    return '';
  }
  
  // Si ya es una URL completa (http/https), úsala directamente
  if (imageUrl.startsWith('http')) {
    console.log('🖼️ CASO: URL completa detectada');
    console.log('🖼️ OUTPUT:', imageUrl);
    
    // DEBUG: Mostrar posibles URLs alternativas para el problema de symlink
    console.log('🔍 POSIBLES ALTERNATIVAS SI FALLA:');
    console.log('  - Version /api/storage/:', imageUrl.replace('/api/public/storage/', '/api/storage/'));
    console.log('  - Version /storage/:', imageUrl.replace('/api/public/storage/', '/storage/'));
    console.log('  - Version sin public/:', imageUrl.replace('/api/public/', '/api/'));
    
    return imageUrl;
  }
  
  // Si es solo un filename (sin /storage/), construir la ruta completa
  if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
    console.log('🖼️ CASO: Solo filename detectado');
    imageUrl = `/storage/img/flores/${imageUrl}`;
    console.log('🖼️ Path construido:', imageUrl);
  }
  
  // Si comienza con /storage/, construir la URL correcta
  if (imageUrl.startsWith('/storage/')) {
    console.log('🖼️ CASO: Storage path detectado');
    
    // CORRECCION: Las imágenes están en /api/public/storage/ por el symlink de Laravel
    const baseUrl = 'https://floresydetalleslima.com/api/public';
    console.log('🖼️ Base URL corregida:', baseUrl);
    
    const finalUrl = `${baseUrl}${imageUrl}`;
    console.log('🖼️ ===== RESULTADO FINAL =====');
    console.log('🖼️ Storage path:', imageUrl);
    console.log('🖼️ Final URL:', finalUrl);
    console.log('🖼️ =============================');
    
    // DEBUG: Mostrar posibles URLs alternativas para problemas de symlink
    console.log('🔍 POSIBLES ALTERNATIVAS SI FALLA:');
    console.log('  - Version /api/storage/:', `https://floresydetalleslima.com/api${imageUrl}`);
    console.log('  - Version directa:', `https://floresydetalleslima.com${imageUrl}`);
    console.log('  - Version storage sin /storage/:', `https://floresydetalleslima.com/api/storage${imageUrl.replace('/storage', '')}`);
    
    return finalUrl;
  }
  
  // Para rutas que empiezan con slash, asumir que son del frontend
  if (imageUrl.startsWith('/')) {
    console.log('🖼️ CASO: Frontend path');
    console.log('🖼️ OUTPUT:', imageUrl);
    return imageUrl;
  }
  
  // Fallback
  console.log('🖼️ CASO: Fallback');
  console.log('🖼️ INPUT no reconocido:', imageUrl);
  return '';
};

// Helper para formatear precios de manera segura
const formatPrice = (price: number | string | undefined | null): string => {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
};

// Helper para normalizar datos de flor del backend
const normalizeFlower = (flower: Record<string, unknown>): FlowerWithUrls => {
  return {
    ...flower,
    price: typeof flower.price === 'string' ? parseFloat(flower.price) : (flower.price as number),
    original_price: flower.original_price 
      ? (typeof flower.original_price === 'string' ? parseFloat(flower.original_price) : (flower.original_price as number))
      : null,
    discount_percentage: typeof flower.discount_percentage === 'string' 
      ? parseFloat(flower.discount_percentage) 
      : (flower.discount_percentage as number),
    stock: typeof flower.stock === 'string' ? parseInt(flower.stock) : (flower.stock as number),
    category_id: typeof flower.category_id === 'string' ? parseInt(flower.category_id) : (flower.category_id as number),
    is_featured: Boolean(flower.is_featured),
    is_active: Boolean(flower.is_active),
    is_on_sale: Boolean(flower.is_on_sale)
  } as FlowerWithUrls;
};

export default function FlowerManagement() {
  // Estados principales
  const [flowers, setFlowers] = useState<FlowerWithUrls[]>([]);
  const [flowerCategories] = useState([
    { id: 1, name: 'Rosas', description: 'Hermosas rosas para toda ocasión' },
    { id: 2, name: 'Tulipanes', description: 'Tulipanes frescos y coloridos' },
    { id: 3, name: 'Girasoles', description: 'Girasoles brillantes y alegres' },
    { id: 4, name: 'Orquídeas', description: 'Orquídeas elegantes y exóticas' },
    { id: 5, name: 'Lirios', description: 'Lirios fragantes y sofisticados' },
    { id: 6, name: 'Claveles', description: 'Claveles duraderos y vibrantes' },
    { id: 7, name: 'Gerberas', description: 'Gerberas coloridas y alegres' },
    { id: 8, name: 'Lilies', description: 'Lilies elegantes y aromáticos' },
    { id: 9, name: 'Mixtas', description: 'Arreglos florales mixtos' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFlower, setSelectedFlower] = useState<FlowerWithUrls | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para el formulario
  const [formData, setFormData] = useState<FlowerFormData>({
    name: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    discount_percentage: 0,
    is_on_sale: false,
    category_ids: [],  // Array vacío para múltiples categorías
    stock: '',
    is_featured: false,
    is_active: true,
    color: [],  // Array vacío para múltiples colores
    occasion: [],  // Array vacío para múltiples ocasiones
    images: []
  });
  
  // Estado para characteristics (solo para compatibilidad - no se usará)
  const [characteristics, setCharacteristics] = useState<string[]>(['']);

  // Función para formatear texto pegado automáticamente
  const formatPastedText = (pastedText: string): string => {
    return pastedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.startsWith('-') || line.startsWith('•') ? line : `- ${line}`)
      .join('\n');
  };

  // Manejar paste en descripción
  const handleDescriptionPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const formattedText = formatPastedText(pastedText);
    setFormData(prev => ({ ...prev, description: formattedText }));
  };
  
  // Estados para carga de imagen
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Estados de guardado
  const [isSaving, setSaving] = useState(false);

  // Función para calcular precio final con descuento
  const calculateFinalPrice = useCallback((originalPrice: string, discountPercentage: number): number => {
    const price = parseFloat(originalPrice) || 0;
    if (discountPercentage > 0 && price > 0) {
      return price - (price * discountPercentage / 100);
    }
    return price;
  }, []);

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadFlowers();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadFlowers = async () => {
    try {
      const response = await apiClient.getFlowers({ per_page: 100 });
      if (response.success && response.data?.data) {
        // Normalizar los datos del backend para asegurar tipos correctos
        const normalizedFlowers = response.data.data.map(flower => 
          normalizeFlower(flower as unknown as Record<string, unknown>)
        );
        setFlowers(normalizedFlowers);
      }
    } catch (error) {
      console.error('Error loading flowers:', error);
    }
  };

  // Manejar subida de imagen
  const handleImageUpload = async (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const response = await apiClient.uploadImage(file, 'flores');
      
      if (response.success && response.data?.url) {
        const serverImageUrl = response.data.url;
        
        // DEBUG: Log para verificar la URL que recibimos del servidor
        console.log('🌸 =================================');
        console.log('🌸 IMAGEN SUBIDA AL SERVIDOR:');
        console.log('🌸 URL from server:', serverImageUrl);
        console.log('🌸 Response completa:', response.data);
        console.log('🌸 =================================');
        
        // Procesar URL antes de guardar
        const processedUrl = getImageUrl(serverImageUrl);
        console.log('🌸 URL procesada para vista previa:', processedUrl);
        
        // Actualizar el estado del formulario - USAR MISMA LÓGICA QUE COMPLEMENTOS
        setFormData(prev => ({
          ...prev,
          images: [serverImageUrl]  // Guardar URL original del servidor
        }));

        setUploadSuccess(true);
      } else {
        throw new Error('Error al subir la imagen');
      }

      setTimeout(() => setUploadSuccess(false), 2000);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Guardar flor (crear o actualizar)
  const handleSaveFlower = async () => {
    // Validaciones básicas
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    if (formData.category_ids.length === 0) {
      alert('Debe seleccionar al menos una categoría');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Las características detalladas son requeridas');
      return;
    }
    
    if (!formData.short_description.trim()) {
      alert('La descripción breve es requerida');
      return;
    }
    
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    if (formData.images.length === 0) {
      alert('Debe subir al menos una imagen');
      return;
    }

    setSaving(true);
    
    try {
      // Simplificar: todas las ocasiones se manejan igual
      const flowerData = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock: parseInt(formData.stock) || 0,
        color: formData.color.join(', '), // Convertir array a string separado por comas
        occasion: formData.occasion.join(', '), // Todas las ocasiones como string separado por comas
        category_ids: formData.category_ids, // Enviar array de categorías
        sku: formData.sku || `FLOWER-${Date.now()}`, // Generar SKU si no existe
        is_on_sale: formData.discount_percentage > 0
      };

      console.log('🌸 Enviando flor:', flowerData);

      let response;
      if (isEditing && selectedFlower) {
        response = await apiClient.updateFlower(selectedFlower.id, flowerData);
      } else {
        response = await apiClient.createFlower(flowerData);
      }

      if (response.success) {
        await loadFlowers();
        setShowModal(false);
        resetForm();
        alert(isEditing ? 'Flor actualizada exitosamente' : 'Flor creada exitosamente');
      } else {
        throw new Error(response.message || 'Error al guardar la flor');
      }
    } catch (error) {
      console.error('Error saving flower:', error);
      alert(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Eliminar flor
  const handleDeleteFlower = async (flowerId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta flor? Esta acción no se puede deshacer.')) {
      try {
        const response = await apiClient.deleteFlower(flowerId);
        if (response.success) {
          await loadFlowers();
          alert('Flor eliminada exitosamente');
        } else {
          throw new Error(response.message || 'Error al eliminar la flor');
        }
      } catch (error) {
        console.error('Error deleting flower:', error);
        alert(`Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  // Eliminar TODAS las flores
  const handleDeleteAllFlowers = async () => {
    const confirmMessage = `🚨 ADVERTENCIA: Esta acción eliminará TODAS las flores (${flowers.length} flores) de la base de datos.\n\n¿Estás absolutamente seguro? Esta acción NO se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      const secondConfirmation = confirm('⚠️ CONFIRMACIÓN FINAL: ¿Realmente quieres eliminar TODAS las flores? Escribe "CONFIRMAR" mentalmente y presiona OK.');
      
      if (secondConfirmation) {
        try {
          // Eliminar cada flor individualmente
          let deletedCount = 0;
          for (const flower of flowers) {
            try {
              const response = await apiClient.deleteFlower(flower.id);
              if (response.success) {
                deletedCount++;
              }
            } catch (error) {
              console.error(`Error al eliminar flor ${flower.id}:`, error);
            }
          }
          
          await loadFlowers();
          alert(`✅ Eliminación completada: ${deletedCount} flores eliminadas de ${flowers.length}`);
        } catch (error) {
          console.error('Error deleting all flowers:', error);
          alert(`Error durante la eliminación masiva: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      price: '',
      original_price: '',
      discount_percentage: 0,
      is_on_sale: false,
      category_ids: [], // Array vacío para múltiples categorías
      stock: '',
      is_featured: false,
      is_active: true,
      color: [], // Array vacío para colores
      occasion: [], // Array vacío para ocasiones
      images: []
    });
  };

  // Abrir modal para crear nueva flor
  const handleCreateNew = () => {
    resetForm();
    setSelectedFlower(null);
    setIsEditing(false);
    setShowModal(true);
  };

  // Abrir modal para editar flor
  const handleEdit = (flower: FlowerWithUrls) => {
    // Convertir ocasiones de string a array
    const occasionsArray = flower.occasion 
      ? flower.occasion.split(',').map(o => o.trim()).filter(o => o.length > 0)
      : [];

    // Convertir colores de string a array
    const colorsArray = flower.color 
      ? flower.color.split(',').map(c => c.trim()).filter(c => c.length > 0)
      : [];

    // Obtener categorías múltiples (si existe en el flower), sino usar la categoría principal
    const categoriesArray = flower.categories && flower.categories.length > 0
      ? flower.categories.map(cat => cat.id)
      : (flower.category_id ? [flower.category_id] : []);

    console.log('🌸 Cargando flor para edición:', {
      flowerName: flower.name,
      occasionsArray: occasionsArray
    });

    setFormData({
      name: flower.name || '',
      description: flower.description || '',
      short_description: flower.short_description || '',
      price: flower.price?.toString() || '',
      original_price: flower.original_price?.toString() || '',
      discount_percentage: flower.discount_percentage || 0,
      is_on_sale: flower.is_on_sale || false,
      category_ids: categoriesArray, // Array de categorías
      stock: flower.stock?.toString() || '',
      is_featured: flower.is_featured || false,
      is_active: flower.is_active !== false,
      color: colorsArray, // Array de colores
      occasion: occasionsArray, // Array de ocasiones
      images: Array.isArray(flower.images) ? flower.images : (flower.images ? [flower.images] : [])
    });
    
    setSelectedFlower(flower);
    setIsEditing(true);
    setShowModal(true);
  };

  // Filtrar flores
  const filteredFlowers = flowers.filter(flower => {
    const matchesSearch = flower.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flower.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || flower.category_id === parseInt(filterCategory);
    return matchesSearch && matchesCategory;
  });

  // Obtener nombre de categoría
  const getCategoryName = (categoryId: number) => {
    const category = flowerCategories.find(cat => cat.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Flores</h1>
          <p className="text-gray-600 mt-1">Administra tu catálogo de flores</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDeleteAllFlowers}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Eliminar Todas
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Flor
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar flores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {flowerCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de flores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-pink-600" />
          </div>
        ) : filteredFlowers.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No se encontraron flores</h3>
            <p className="text-gray-600">
              {searchTerm || filterCategory
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primera flor'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Imagen</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Nombre</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Categoría</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Precio</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Stock</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFlowers.map((flower) => {
                  const imageUrl = getFlowerImageUrl(flower);
                  
                  return (
                    <tr key={flower.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                          {imageUrl ? (
                            <Image
                              src={getImageUrl(imageUrl)}
                              alt={flower.name || 'Flor'}
                              fill
                              className="object-cover"
                              onError={() => {
                                console.error('Error loading image:', imageUrl);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">{flower.name}</div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {flower.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {getCategoryName(flower.category_id)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          S/. {formatPrice(flower.price)}
                        </div>
                        {flower.is_on_sale && flower.original_price && (
                          <div className="text-sm text-gray-500 line-through">
                            S/. {formatPrice(flower.original_price)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (flower.stock || 0) > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {flower.stock || 0} unidades
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            flower.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {flower.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                          {flower.is_featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Destacada
                            </span>
                          )}
                          {flower.is_on_sale && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Oferta
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(flower)}
                            className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                            title="Editar flor"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFlower(flower.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar flor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de creación/edición */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
          setShowModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Flor' : 'Nueva Flor'}
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
              </div>

              <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la flor *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Ej: Rosas rojas Premium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción breve *
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Una descripción corta y atractiva que se mostrará debajo del nombre en el catálogo..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Esta descripción aparecerá debajo del nombre de la flor en el catálogo principal
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Características detalladas *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                onPaste={handleDescriptionPaste}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Pega tu texto aquí y automáticamente se agregarán los guiones. Ejemplo:&#10;&#10;Ramo con base de 20 girasoles premium&#10;Nubecitas&#10;Follaje verde&#10;Papel decorativo&#10;Lazo decorativo&#10;Tarjeta de cuidado de flores&#10;Sachet de preservante de flores&#10;Tarjeta dedicatoria en sobre"
              />
              <p className="text-sm text-gray-500 mt-1">
                Pega tu texto y automáticamente se agregará el formato con guiones. También puedes escribir directamente.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">✨ Editor de características</h4>
                <button
            type="button"
            onClick={() => {
              const newCharacteristics = [...characteristics, ''];
              setCharacteristics(newCharacteristics);
            }}
            className="px-3 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 transition-colors"
                >
            + Agregar característica
                </button>
              </div>
              
              <div className="space-y-2">
                {characteristics.map((characteristic, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-pink-500 font-bold">•</span>
              <input
                type="text"
                value={characteristic}
                onChange={(e) => {
                  const newCharacteristics = [...characteristics];
                  newCharacteristics[index] = e.target.value;
                  setCharacteristics(newCharacteristics);
                  
                  // Actualizar formData con formato de lista
                  const formattedDescription = newCharacteristics
              .filter(char => char.trim())
              .map(char => `- ${char}`)
              .join('\n');
                  setFormData(prev => ({ ...prev, description: formattedDescription }));
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Escribe una característica (ej: Flores frescas de alta calidad)"
              />
              {characteristics.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
              const newCharacteristics = characteristics.filter((_, i) => i !== index);
              setCharacteristics(newCharacteristics);
              
              // Actualizar formData
              const formattedDescription = newCharacteristics
                .filter(char => char.trim())
                .map(char => `- ${char}`)
                .join('\n');
              setFormData(prev => ({ ...prev, description: formattedDescription }));
                  }}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
                ))}
              </div>
              
              {characteristics.filter(char => char.trim()).length > 0 && (
                <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
            <h5 className="text-xs font-medium text-gray-600 mb-2">👁 Vista previa:</h5>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {characteristics
                .filter(char => char.trim())
                .map(char => `- ${char}`)
                .join('\n')}
            </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-2" />
                Categorías * (Selecciona una o varias)
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto bg-white">
                <div className="grid grid-cols-2 gap-2">
            {flowerCategories.map(category => (
              <label
                key={category.id}
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.category_ids.includes(category.id)}
                  onChange={(e) => {
              if (e.target.checked) {
                // Agregar categoría al array
                setFormData(prev => ({
                  ...prev,
                  category_ids: [...prev.category_ids, category.id]
                }));
              } else {
                // Remover categoría del array
                setFormData(prev => ({
                  ...prev,
                  category_ids: prev.category_ids.filter(id => id !== category.id)
                }));
              }
                  }}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">{category.name}</span>
              </label>
            ))}
                </div>
                {formData.category_ids.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <strong>Seleccionadas ({formData.category_ids.length}):</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.category_ids.map(categoryId => {
              const categoryObj = flowerCategories.find(c => c.id === categoryId);
              return (
                <span
                  key={categoryId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {categoryObj?.name}
                  <button
                    type="button"
                    onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  category_ids: prev.category_ids.filter(id => id !== categoryId)
                }));
                    }}
                    className="ml-1 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              );
                  })}
                </div>
              </div>
            </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-2" />
                Colores * (Selecciona uno o varios)
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto bg-white">
                <div className="grid grid-cols-2 gap-2">
            {flowerColors.map(color => (
              <label
                key={color.value}
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.color.includes(color.value)}
                  onChange={(e) => {
              if (e.target.checked) {
                // Agregar color al array
                setFormData(prev => ({
                  ...prev,
                  color: [...prev.color, color.value]
                }));
              } else {
                // Remover color del array
                setFormData(prev => ({
                  ...prev,
                  color: prev.color.filter(c => c !== color.value)
                }));
              }
                  }}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <div className={`w-4 h-4 rounded-full ${color.color} flex-shrink-0`} />
                <span className="text-sm text-gray-700">{color.label}</span>
              </label>
            ))}
                </div>
                {formData.color.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <strong>Seleccionados ({formData.color.length}):</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.color.map(colorValue => {
              const colorObj = flowerColors.find(c => c.value === colorValue);
              return (
                <span
                  key={colorValue}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  <div className={`w-3 h-3 rounded-full ${colorObj?.color} mr-1`} />
                  {colorValue}
                  <button
                    type="button"
                    onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  color: prev.color.filter(c => c !== colorValue)
                }));
                    }}
                    className="ml-1 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              );
                  })}
                </div>
              </div>
            </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Ocasiones * (Selecciona una o varias)
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto bg-white">
                <div className="grid grid-cols-2 gap-2">
            {flowerOccasions.map(occasion => (
              <label
                key={occasion}
                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.occasion.includes(occasion)}
                  onChange={(e) => {
              // Lógica simple: agregar o quitar ocasión
              if (e.target.checked) {
                setFormData(prev => ({
                  ...prev,
                  occasion: [...prev.occasion, occasion]
                }));
              } else {
                setFormData(prev => ({
                  ...prev,
                  occasion: prev.occasion.filter(o => o !== occasion)
                }));
              }
                  }}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">{occasion}</span>
              </label>
            ))}
                </div>
                {formData.occasion.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <strong>Seleccionadas ({formData.occasion.length}):</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.occasion.map(occasion => (
              <span
                key={occasion}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800"
              >
                {occasion}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                ...prev,
                occasion: prev.occasion.filter(o => o !== occasion)
                    }));
                  }}
                  className="ml-1 hover:text-pink-600"
                >
                  ×
                </button>
              </span>
                  ))}
                </div>
              </div>
            </div>
                )}
              </div>
            </div>

            {/* Nota: Los tipos de condolencia ahora son ocasiones directas */}

            {/* Precio - Solo mostrar cuando NO hay oferta especial */}
            {!formData.is_on_sale && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Precio *
                </label>
                <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Ingresa el precio"
                />
              </div>
            )}
          </div>

          {/* Stock y ofertas especiales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock disponible
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Cantidad disponible"
              />
            </div>

            {/* Oferta especial toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Percent className="w-4 h-4 inline mr-2" />
                Oferta especial
              </label>
              <div className="flex items-center">
                <input
            type="checkbox"
            id="is_on_sale"
            checked={formData.is_on_sale}
            onChange={(e) => {
              const isOnSale = e.target.checked;
              setFormData(prev => ({ 
                ...prev, 
                is_on_sale: isOnSale,
                // Si se desactiva la oferta, limpiar precio original y descuento
                original_price: isOnSale ? prev.original_price : '',
                discount_percentage: isOnSale ? prev.discount_percentage : 0,
                // Si se desactiva la oferta, el precio actual se mantiene
                price: isOnSale ? prev.price : prev.original_price || prev.price
              }));
            }}
            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="is_on_sale" className="ml-2 text-sm text-gray-700">
            Activar precio especial
                </label>
              </div>
            </div>
          </div>

          {/* Sección de configuración de oferta especial */}
          {formData.is_on_sale && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center gap-2 text-orange-700 font-medium">
                <DollarSign className="w-5 h-5" />
                <span>Configuración de Oferta Especial</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio original *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.original_price}
              onChange={(e) => {
                const originalPrice = e.target.value;
                setFormData(prev => {
                  const discountPercentage = prev.discount_percentage;
                  const finalPrice = originalPrice && discountPercentage > 0 
              ? calculateFinalPrice(originalPrice, discountPercentage)
              : parseFloat(originalPrice) || 0;
                  
                  return {
              ...prev,
              original_price: originalPrice,
              price: finalPrice > 0 ? finalPrice.toFixed(2) : originalPrice
                  };
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Precio sin descuento"
            />
                </div>
                
                <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descuento (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.discount_percentage}
              onChange={(e) => {
                const discountPercentage = parseFloat(e.target.value) || 0;
                setFormData(prev => {
                  const originalPrice = prev.original_price;
                  const finalPrice = originalPrice && discountPercentage > 0 
              ? calculateFinalPrice(originalPrice, discountPercentage)
              : parseFloat(originalPrice) || 0;
                  
                  return {
              ...prev,
              discount_percentage: discountPercentage,
              price: finalPrice > 0 ? finalPrice.toFixed(2) : originalPrice
                  };
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="% de descuento"
            />
                </div>
                
                <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calculator className="w-4 h-4 inline mr-1" />
              Precio final
            </label>
            <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-700 font-semibold">
                S/ {formData.price || '0.00'}
              </span>
            </div>
                </div>
              </div>
              
              {formData.original_price && formData.discount_percentage > 0 && (
                <div className="bg-white rounded-lg p-3 border border-orange-300">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Vista previa:</span> 
              <span className="line-through text-gray-500 ml-2">S/ {formData.original_price}</span>
              <span className="text-green-600 font-bold ml-2">S/ {formData.price}</span>
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs ml-2">
                -{formData.discount_percentage}%
              </span>
            </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Checkboxes de estado */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Flor activa (visible en el catálogo)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                Flor destacada (aparece en la página principal)
              </label>
            </div>
          </div>

          {/* Subida de imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes de la flor *
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImageUpload(file);
            }
                }}
                className="hidden"
                id="image-upload"
              />
              
              <label
                htmlFor="image-upload"
                className="cursor-pointer"
              >
                <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-gray-600">
              Haz clic para subir una imagen
            </span>
            <span className="text-xs text-gray-500 mt-1">
              PNG, JPG hasta 5MB
            </span>
                </div>
              </label>

              {isUploading && (
                <div className="mt-4 flex items-center justify-center gap-2">
            <Loader className="w-5 h-5 animate-spin text-pink-600" />
            <span className="text-gray-600">Subiendo imagen...</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span>Imagen subida exitosamente</span>
                </div>
              )}
            </div>

            {/* Preview de imágenes */}
            {formData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
            Imágenes subidas ({formData.images.length}):
                </p>
                <div className="grid grid-cols-3 gap-2">
            {formData.images.map((image, index) => {
              const imageUrl = getImageUrl(image);
              return (
                <div key={index} className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={imageUrl}
                alt={`Imagen ${index + 1}`}
                width={120}
                height={120}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('🖼️ Error loading image:', imageUrl);
                  console.error('🖼️ Original image URL:', image);
                  e.currentTarget.style.display = 'none';
                  const errorDiv = e.currentTarget.parentElement?.querySelector('.error-placeholder') as HTMLElement;
                  if (errorDiv) {
                    errorDiv.style.display = 'flex';
                  }
                }}
                onLoad={() => {
                  console.log('🖼️ Successfully loaded image:', imageUrl);
                }}
              />
              <div 
                className="error-placeholder w-full h-full flex items-center justify-center text-xs text-red-500 bg-red-50"
                style={{ display: 'none' }}
              >
                Error al cargar imagen
              </div>
                  </div>
                  <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  images: prev.images.filter((_, i) => i !== index)
                }));
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
              X
                  </button>
                </div>
              );
            })}
                </div>
              </div>
            )}
          </div>
              </div>

              {/* Footer del modal */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveFlower}
            disabled={isSaving || isUploading}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Actualizar' : 'Guardar'}
              </>
            )}
          </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
