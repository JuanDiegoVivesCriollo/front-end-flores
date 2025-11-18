'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Package,
  Eye,
  AlertCircle,
  Upload
} from 'lucide-react';
import { apiClient } from '@/services/api';
import type { Flower, Category } from '@/types';

// Helper function to normalize image URLs (sin placeholder)
const normalizeImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl || imageUrl.trim() === '') return '';
  
  // If it's already an absolute URL (http/https), return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it's already a full path starting with /, return as is
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // If it's a relative path, add the /img/ prefix
  if (imageUrl && !imageUrl.startsWith('/')) {
    return `/img/${imageUrl}`;
  }
  
  return '';
};

interface FlowerFormData {
  name: string;
  description: string;
  short_description?: string;
  price: number | string;
  original_price?: number | string;
  discount_percentage: number;
  is_on_sale: boolean;
  category_id: number;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  color: string;
  occasion: string;
  images: string[];
}

export default function FlowerManagement() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchFlowers();
    fetchCategories();
  }, []); // Remove the problematic dependency

  const fetchFlowers = async () => {
    setIsLoading(true);
    try {
      // Solicitar todas las flores (sin límite de paginación para el admin)
      const response = await apiClient.getFlowers({ per_page: 100 }); // Usar 100 como límite alto
      if (response.success && response.data?.data) {
        // Procesar las flores para agregar campos calculados de compatibilidad
        const processedFlowers = response.data.data.map((flower: Flower) => {
          const firstImage = Array.isArray(flower.images) 
            ? flower.images[0] 
            : (typeof flower.images === 'string' ? JSON.parse(flower.images)[0] : undefined);
          
          return {
            ...flower,
            // Campos calculados para compatibilidad con componentes existentes
            image_url: normalizeImageUrl(firstImage),
            sale_price: flower.discount_percentage > 0 ? flower.price * (1 - flower.discount_percentage / 100) : undefined,
            stock_quantity: flower.stock,
            is_available: flower.stock > 0 && flower.is_active
          };
        });
        setFlowers(processedFlowers);
        console.log(`✅ Cargadas ${processedFlowers.length} flores del backend`);
      } else {
        console.error('Error fetching flowers:', response.message);
        setFlowers([]);
      }
    } catch (error) {
      console.error('Error fetching flowers:', error);
      setFlowers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error('Error fetching categories:', response.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Categorías de fallback si hay error
      setCategories([
        { 
          id: 1, 
          name: 'Rosas', 
          slug: 'rosas',
          description: 'Hermosas rosas en diversos colores',
          image: undefined,
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: 2, 
          name: 'Tulipanes', 
          slug: 'tulipanes',
          description: 'Tulipanes frescos y coloridos',
          image: undefined,
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: 3, 
          name: 'Girasoles', 
          slug: 'girasoles',
          description: 'Girasoles radiantes y alegres',
          image: undefined,
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: 4, 
          name: 'Orquídeas', 
          slug: 'orquideas',
          description: 'Orquídeas exóticas y elegantes',
          image: undefined,
          is_active: true,
          sort_order: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
      ]);
    }
  };

  const handleCreateFlower = () => {
    setSelectedFlower(null);
    setIsEditing(false);
    setShowFlowerModal(true);
  };

  const handleEditFlower = (flower: Flower) => {
    setSelectedFlower(flower);
    setIsEditing(true);
    setShowFlowerModal(true);
  };

  const handleDeleteFlower = async (flowerId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta flor? Esta acción no se puede deshacer.')) {
      try {
        const response = await apiClient.deleteFlower(flowerId);
        
        if (response.success) {
          // Eliminar la flor de la lista local
          setFlowers(flowers.filter(f => f.id !== flowerId));
          alert('Flor eliminada exitosamente');
        } else {
          throw new Error(response.message || 'Error al eliminar la flor');
        }
      } catch (error) {
        console.error('Error deleting flower:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        alert(`Error al eliminar la flor: ${errorMessage}`);
      }
    }
  };

  const filteredFlowers = flowers.filter(flower => {
    const matchesSearch = flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flower.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || flower.category_id.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const FlowerModal = ({ flower, isEdit, onClose, onSave }: {
    flower: Flower | null;
    isEdit: boolean;
    onClose: () => void;
    onSave: (flowerData: FlowerFormData) => void;
  }) => {
    const [formData, setFormData] = useState<FlowerFormData>({
      name: flower?.name || '',
      description: flower?.description || '',
      short_description: flower?.short_description || '',
      price: flower?.price || '',
      original_price: flower?.original_price || '',
      discount_percentage: flower?.discount_percentage || 0,
      is_on_sale: (flower?.discount_percentage || 0) > 0,
      category_id: flower?.category_id || 1,
      stock: flower?.stock || flower?.stock_quantity || 0,
      is_featured: flower?.is_featured || false,
      is_active: flower?.is_active || flower?.is_available || true,
      color: flower?.color || '',
      occasion: flower?.occasion || '',
      images: flower?.images || [flower?.image_url || ''].filter(Boolean)
    });

    // Obtener la primera imagen disponible para el preview inicial
    const getInitialPreview = () => {
      let imageUrl = '';
      
      if (flower?.first_image) {
        imageUrl = flower.first_image;
      } else if (flower?.image_urls?.[0]) {
        imageUrl = flower.image_urls[0];
      } else if (Array.isArray(flower?.images) && flower.images[0]) {
        imageUrl = flower.images[0];
      } else if (flower?.image_url) {
        imageUrl = flower.image_url;
      }
      
      // Si la URL ya es completa, usarla tal como está
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Si es una ruta relativa, construir URL completa
      if (imageUrl) {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${imageUrl}`;
      }
      
      return '';
    };

    const [imagePreview, setImagePreview] = useState<string>(getInitialPreview());
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Efecto para actualizar el preview cuando cambia la flor prop (solo al abrir modal)
    useEffect(() => {
      console.log('🔄 FlowerModal useEffect ejecutado, flower:', flower);
      
      // Solo actualizar si tenemos una flor
      if (!flower) {
        console.log('❌ No hay flower, limpiando preview');
        setImagePreview('');
        return;
      }

      let imageUrl = '';
      
      if (flower.first_image) {
        imageUrl = flower.first_image;
      } else if (flower.image_urls?.[0]) {
        imageUrl = flower.image_urls[0];
      } else if (Array.isArray(flower.images) && flower.images[0]) {
        imageUrl = flower.images[0];
      } else if (flower.image_url) {
        imageUrl = flower.image_url;
      }
      
      if (imageUrl) {
        // Si la URL ya es completa, usarla tal como está
        if (imageUrl.startsWith('http')) {
          console.log('✅ Seteando preview con URL completa:', imageUrl);
          setImagePreview(imageUrl);
        } else {
          // Si es una ruta relativa, construir URL completa
          const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${imageUrl}`;
          console.log('✅ Seteando preview con URL construida:', fullUrl);
          setImagePreview(fullUrl);
        }
      } else {
        console.log('❌ No hay imageUrl, limpiando preview');
        setImagePreview('');
      }
    }, [flower]); // Se ejecuta cuando cambia la prop flower

  const processImageFile = async (file: File) => {
    // Validar tipo de archivo (priorizar WebP)
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Recomendar WebP para mejor compresión
    if (!file.type.includes('webp')) {
      const shouldContinue = confirm(
        'Para mejor rendimiento y calidad, recomendamos usar imágenes en formato WebP. ¿Deseas continuar con este formato?'
      );
      if (!shouldContinue) return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Crear preview inmediato mientras se sube
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      console.log('Iniciando subida de imagen...');
      
      // Subir imagen al servidor
      const response = await apiClient.uploadImage(file, 'flores');
      
      console.log('Respuesta de subida:', response);
      
      if (response.success && response.data) {
        const imageUrl = response.data.url;
        
        // Construir URL completa para preview
        const fullPreviewUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${imageUrl}`;
        
        console.log('🔄 Cambiando preview de URL temporal a URL del servidor:', {
          from: previewUrl,
          to: fullPreviewUrl
        });
        
        // Limpiar el objeto URL temporal después de un delay para dar tiempo a que se cargue la imagen
        setTimeout(() => {
          URL.revokeObjectURL(previewUrl);
        }, 3000);
        setImagePreview(fullPreviewUrl);
        
        // Actualizar formData con la nueva URL de imagen
        const newImages = [imageUrl]; // Solo la ruta relativa para guardar en BD
        setFormData({ ...formData, images: newImages });
        
        console.log('✅ Imagen subida exitosamente:', {
          imageUrl,
          fullPreviewUrl,
          newImages,
          previewSet: fullPreviewUrl
        });
        // alert('Imagen subida exitosamente'); // Removido para mejor UX
      } else {
        // Si falla, revertir el preview
        URL.revokeObjectURL(previewUrl);
        setImagePreview('');
        throw new Error(response.message || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir la imagen';
      alert(`Error al subir la imagen: ${errorMessage}`);
      
      // Limpiar preview en caso de error
      setImagePreview('');
      setFormData({ ...formData, images: [] });
    } finally {
      setIsUploading(false);
    }
  };    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      await processImageFile(file);
    };

  const removeImage = async () => {
    try {
      // Si hay una imagen cargada y es una URL del servidor, intentar eliminarla
      if (imagePreview && imagePreview.startsWith('/storage/')) {
        await apiClient.deleteImage(imagePreview);
      }
    } catch (error) {
      console.warn('No se pudo eliminar la imagen del servidor:', error);
    }
    
    setImagePreview('');
    setFormData({ ...formData, images: [] });
    
    // Limpiar el input file
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isEdit ? 'Editar Flor' : 'Crear Nueva Flor'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio {formData.is_on_sale ? '(Precio con descuento)' : ''}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price === 0 ? '' : formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                {/* Toggle para Ofertas Especiales */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600 text-lg">🏷️</span>
                      <span className="font-semibold text-gray-800">Flores en Oferta Especial</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newIsOnSale = !formData.is_on_sale;
                        setFormData({
                          ...formData,
                          is_on_sale: newIsOnSale,
                          discount_percentage: newIsOnSale ? formData.discount_percentage || 10 : 0,
                          original_price: newIsOnSale ? (formData.original_price || formData.price || '') : ''
                        });
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        formData.is_on_sale ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          formData.is_on_sale ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {formData.is_on_sale && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio Original (antes del descuento)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required={formData.is_on_sale}
                          value={formData.original_price === 0 ? '' : formData.original_price}
                          onChange={(e) => setFormData({ ...formData, original_price: e.target.value === '' ? '' : Number(e.target.value) })}
                          placeholder="0.00"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Este precio aparecerá tachado en la tarjeta de oferta</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Porcentaje de Descuento (%)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          max="80"
                          required={formData.is_on_sale}
                          value={formData.discount_percentage}
                          onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Descuento que se mostrará en la etiqueta de oferta</p>
                      </div>

                      <div className="bg-orange-100 border border-orange-200 rounded-md p-3">
                        <p className="text-sm text-orange-800">
                          <span className="font-semibold">Vista previa:</span> Esta flor aparecerá en la sección &ldquo;Flores en Oferta Especial&rdquo; 
                          {formData.original_price && formData.price && (
                            <>
                              {' '}con precio original <span className="line-through">S/. {Number(formData.original_price).toFixed(2)}</span>
                              {' '}y precio de oferta <span className="font-bold text-orange-600">S/. {Number(formData.price).toFixed(2)}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ej: Rojo, Blanco, Amarillo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ocasión
                  </label>
                  <select
                    required
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">Selecciona una ocasión</option>
                    <option value="Cumpleaños">🎂 Cumpleaños</option>
                    <option value="Aniversario">💕 Aniversario</option>
                    <option value="Amor">❤️ Amor</option>
                    <option value="Para Él">💙 Para Él</option>
                    <option value="Pedida de Mano">💍 Pedida de Mano</option>
                    <option value="Felicitaciones">🎉 Felicitaciones</option>
                    <option value="Graduación">🎓 Graduación</option>
                    <option value="Mejórate Pronto">🌻 Mejórate Pronto</option>
                    <option value="Boda">💒 Boda</option>
                    <option value="San Valentín">💝 San Valentín</option>
                    <option value="Día de la Madre">👩‍👧‍👦 Día de la Madre</option>
                    <option value="Condolencias">🕯️ Condolencias</option>
                    <option value="Solo porque sí">🌸 Solo porque sí</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen Principal
                  </label>
                  
                  <div className="space-y-4">
                    {/* Preview de la imagen */}
                    {imagePreview && (
                      <div className="relative w-full h-48 border border-gray-200 rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Área de carga con drag and drop */}
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-300 hover:border-pink-400'
                      }`}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(false);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(false);
                        
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          processImageFile(file);
                        }
                      }}
                    >
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/webp,image/jpeg,image/png,image/jpg"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600 font-medium">
                              {imagePreview ? 'Cambiar imagen' : 'Seleccionar o arrastrar imagen'}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              Recomendado: WebP para mejor calidad
                            </span>
                            <span className="text-xs text-gray-400">
                              También: PNG, JPG hasta 5MB
                            </span>
                            {dragActive && (
                              <span className="text-xs text-pink-500 font-medium mt-1">
                                Suelta la imagen aquí
                              </span>
                            )}
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción Corta
                </label>
                <textarea
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Descripción breve para mostrar en el catálogo"
                />
              </div>

              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Producto destacado</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activo</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Flores</h1>
          <p className="text-sm text-gray-600 mt-1">
            {flowers.length} {flowers.length === 1 ? 'flor' : 'flores'} {filteredFlowers.length !== flowers.length && `(${filteredFlowers.length} ${filteredFlowers.length === 1 ? 'mostrada' : 'mostradas'})`}
          </p>
        </div>
        <button
          onClick={handleCreateFlower}
          className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Flor
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar flores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de flores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlowers.map((flower) => (
          <motion.div
            key={flower.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-w-16 aspect-h-9">
              <Image
                src={normalizeImageUrl(flower.image_url)}
                alt={flower.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {flower.name}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {(flower.discount_percentage > 0 || flower.original_price) && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                      🏷️ En Oferta
                    </span>
                  )}
                  {flower.is_featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Destacado
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    flower.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {flower.is_available ? 'Disponible' : 'Agotado'}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {flower.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {/* Mostrar precios según si está en oferta */}
                  {(flower.discount_percentage > 0 || flower.original_price) ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-orange-600">
                        S/. {Number(flower.price).toFixed(2)}
                      </span>
                      {flower.original_price && (
                        <span className="text-sm text-gray-500 line-through">
                          S/. {Number(flower.original_price).toFixed(2)}
                        </span>
                      )}
                      {flower.discount_percentage > 0 && (
                        <span className="bg-orange-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                          -{flower.discount_percentage}%
                        </span>
                      )}
                    </div>
                  ) : flower.sale_price && Number(flower.sale_price) < Number(flower.price) ? (
                    <>
                      <span className="text-lg font-bold text-pink-600">
                        S/. {Number(flower.sale_price).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        S/. {Number(flower.price).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      S/. {Number(flower.price).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className={`text-sm ${
                    Number(flower.stock || flower.stock_quantity) <= 5 
                      ? 'text-red-600 font-semibold' 
                      : 'text-gray-500'
                  }`}>
                    {Number(flower.stock || flower.stock_quantity)}
                  </span>
                  {Number(flower.stock || flower.stock_quantity) <= 5 && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log('Ver detalles de:', flower.name);
                    alert(`Detalles de ${flower.name}\nID: ${flower.id}\nSlug: ${flower.slug}\nVistas: ${flower.views || 0}`);
                  }}
                  className="flex items-center justify-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditFlower(flower)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteFlower(flower.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de flor */}
      {showFlowerModal && (
        <FlowerModal
          flower={selectedFlower}
          isEdit={isEditing}
          onClose={() => {
            setSelectedFlower(null);
            setShowFlowerModal(false);
          }}
          onSave={async (flowerData) => {
            try {
              if (isEditing && selectedFlower) {
                // Asegurar que images sea un array válido
                const validImages = Array.isArray(flowerData.images) 
                  ? flowerData.images.filter(img => img && img.trim() !== '') 
                  : [];
                
                // Para actualización, mantener imágenes existentes si no hay nuevas
                const finalImages = validImages.length > 0 
                  ? validImages 
                  : (Array.isArray(selectedFlower.images) ? selectedFlower.images : []);

                console.log('Debug: Sending update data:', {
                  name: flowerData.name,
                  images: finalImages,
                  images_type: typeof finalImages,
                  images_is_array: Array.isArray(finalImages),
                  original_images: selectedFlower.images
                });

                // Actualizar flor existente
                const response = await apiClient.updateFlower(selectedFlower.id, {
                  name: flowerData.name,
                  description: flowerData.description,
                  short_description: flowerData.short_description,
                  price: typeof flowerData.price === 'string' ? parseFloat(flowerData.price) || 0 : flowerData.price,
                  original_price: flowerData.is_on_sale && flowerData.original_price 
                    ? (typeof flowerData.original_price === 'string' ? parseFloat(flowerData.original_price) || 0 : flowerData.original_price)
                    : null,
                  discount_percentage: flowerData.is_on_sale ? flowerData.discount_percentage : 0,
                  is_on_sale: flowerData.is_on_sale,
                  category_id: flowerData.category_id,
                  stock: flowerData.stock,
                  sku: selectedFlower.sku || `FLOWER-${Date.now()}`, // Usar SKU existente o generar uno
                  images: finalImages,
                  color: flowerData.color,
                  occasion: flowerData.occasion,
                  is_featured: flowerData.is_featured,
                  is_active: flowerData.is_active
                });
                
                if (response.success && response.data) {
                  // Actualizar la lista de flores localmente
                  const updatedFlowerData = response.data!;
                  setFlowers(flowers.map(f => 
                    f.id === selectedFlower.id ? {
                      ...f,
                      ...updatedFlowerData,
                      image_url: normalizeImageUrl(updatedFlowerData.image_url || updatedFlowerData.images?.[0]),
                      stock_quantity: updatedFlowerData.stock_quantity || updatedFlowerData.stock,
                      discount_percentage: updatedFlowerData.discount_percentage || 0
                    } : f
                  ));
                  const wasOnSale = selectedFlower.discount_percentage > 0 || selectedFlower.original_price;
                  const isNowOnSale = flowerData.is_on_sale;
                  
                  if (!wasOnSale && isNowOnSale) {
                    alert('¡Flor actualizada exitosamente! 🏷️ Esta flor ahora aparecerá en la sección "Flores en Oferta Especial" de la página principal.');
                  } else if (wasOnSale && !isNowOnSale) {
                    alert('Flor actualizada exitosamente. La flor fue removida de la sección de ofertas especiales.');
                  } else {
                    alert('Flor actualizada exitosamente');
                  }
                  
                  // Opcional: refrescar toda la lista para asegurar consistencia
                  await fetchFlowers();
                } else {
                  throw new Error(response.message || 'Error al actualizar la flor');
                }
              } else {
                // Asegurar que images sea un array válido para creación
                const validImages = Array.isArray(flowerData.images) 
                  ? flowerData.images.filter(img => img && img.trim() !== '') 
                  : [];
                
                // Para creación, validar que tenga al menos una imagen
                if (validImages.length === 0) {
                  alert('Por favor, sube al menos una imagen para la flor.');
                  return;
                }

                console.log('Debug: Sending create data:', {
                  name: flowerData.name,
                  images: validImages,
                  images_type: typeof validImages,
                  images_is_array: Array.isArray(validImages)
                });

                // Crear nueva flor
                const response = await apiClient.createFlower({
                  name: flowerData.name,
                  description: flowerData.description,
                  short_description: flowerData.short_description,
                  price: typeof flowerData.price === 'string' ? parseFloat(flowerData.price) || 0 : flowerData.price,
                  original_price: flowerData.is_on_sale && flowerData.original_price 
                    ? (typeof flowerData.original_price === 'string' ? parseFloat(flowerData.original_price) || 0 : flowerData.original_price)
                    : null,
                  discount_percentage: flowerData.is_on_sale ? flowerData.discount_percentage : 0,
                  is_on_sale: flowerData.is_on_sale,
                  category_id: flowerData.category_id,
                  stock: flowerData.stock,
                  sku: `FLOWER-${Date.now()}`, // Generar SKU único
                  images: validImages,
                  color: flowerData.color || '',
                  occasion: flowerData.occasion || '',
                  is_featured: flowerData.is_featured || false,
                  is_active: flowerData.is_active || true
                });
                
                if (response.success && response.data) {
                  // Agregar la nueva flor a la lista
                  const newFlowerData = response.data;
                  setFlowers([...flowers, {
                    ...newFlowerData,
                    image_url: normalizeImageUrl(newFlowerData.image_url || newFlowerData.images?.[0]),
                    stock_quantity: newFlowerData.stock_quantity || newFlowerData.stock,
                    discount_percentage: newFlowerData.discount_percentage || 0
                  }]);
                  
                  if (flowerData.is_on_sale) {
                    alert('¡Flor creada exitosamente! 🏷️ Esta flor aparecerá en la sección "Flores en Oferta Especial" de la página principal.');
                  } else {
                    alert('Flor creada exitosamente');
                  }
                  
                  // Opcional: refrescar toda la lista para asegurar consistencia
                  await fetchFlowers();
                } else {
                  throw new Error(response.message || 'Error al crear la flor');
                }
              }
              setShowFlowerModal(false);
              setSelectedFlower(null);
            } catch (error) {
              console.error('Error saving flower:', error);
              const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
              alert(`Error al guardar la flor: ${errorMessage}`);
            }
          }}
        />
      )}
    </div>
  );
}
