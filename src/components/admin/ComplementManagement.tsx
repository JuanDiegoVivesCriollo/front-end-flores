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
  Loader
} from 'lucide-react';
import { apiClient } from '@/services/api';
import type { Complement, ComplementType } from '@/types';

// Extender el tipo Complement para incluir los campos del backend
interface ComplementWithUrls extends Complement {
  image_urls?: string[];
  first_image?: string;
}

// Tipos para el formulario
interface ComplementFormData {
  name: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  is_on_sale: boolean;
  type: 'globos' | 'peluches' | 'chocolates';
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  color: string;
  size: string;
  brand: string;
  images: string[];
}

// Helper para obtener la URL de imagen de un complemento
const getComplementImageUrl = (complement: ComplementWithUrls): string => {
  // Priorizar first_image si está disponible (viene del backend)
  if (complement.first_image) {
    return complement.first_image;
  }
  
  // Usar la primera imagen del array image_urls
  if (complement.image_urls && complement.image_urls.length > 0) {
    return complement.image_urls[0];
  }
  
  // Usar la primera imagen del array images
  if (Array.isArray(complement.images) && complement.images.length > 0) {
    return complement.images[0];
  }
  
  // Si images es un string, devolverlo
  if (typeof complement.images === 'string') {
    return complement.images;
  }
  
  return '';
};

// Helper para normalizar URLs de imágenes (UNIFICADO CON FLORES)
const getImageUrl = (imageUrl: string | undefined | null): string => {
  console.log('🧩 ===== PROCESANDO IMAGEN COMPLEMENTO =====');
  console.log('🧩 Input URL:', imageUrl);
  console.log('🧩 Tipo:', typeof imageUrl);
  
  if (!imageUrl || imageUrl.trim() === '') {
    console.log('🧩 ERROR: Empty image URL provided');
    return '';
  }
  
  // Si ya es una URL completa (http/https), úsala directamente
  if (imageUrl.startsWith('http')) {
    console.log('🧩 CASO: URL completa detectada');
    console.log('🧩 OUTPUT:', imageUrl);
    
    // DEBUG: Mostrar posibles URLs alternativas para el problema de symlink
    console.log('🔍 POSIBLES ALTERNATIVAS SI FALLA:');
    console.log('  - Version /api/storage/:', imageUrl.replace('/api/public/storage/', '/api/storage/'));
    console.log('  - Version /storage/:', imageUrl.replace('/api/public/storage/', '/storage/'));
    console.log('  - Version sin public/:', imageUrl.replace('/api/public/', '/api/'));
    
    return imageUrl;
  }
  
  // Si comienza con /storage/, construir la URL correcta para producción
  if (imageUrl.startsWith('/storage/')) {
    const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://floresydetalleslima.com/api/public/storage';
    // Remover el /storage/ del inicio ya que STORAGE_URL ya termina en /storage
    const pathWithoutStorage = imageUrl.replace('/storage/', '/');
    const finalUrl = `${storageUrl}${pathWithoutStorage}`;
    console.log('🧩 CASO: Path /storage/ detectado');
    console.log('🧩 STORAGE_URL:', storageUrl);
    console.log('🧩 INPUT PATH:', imageUrl);
    console.log('🧩 PATH SIN /storage/:', pathWithoutStorage);
    console.log('🧩 OUTPUT FINAL:', finalUrl);
    return finalUrl;
  }
  
  // Para rutas relativas sin /storage/, asumir que van en img/complementos/
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://floresydetalleslima.com/api/public/storage';
  const finalUrl = `${storageUrl}/img/complementos/${imageUrl}`;
  console.log('🧩 CASO: Path relativo detectado');
  console.log('🧩 INPUT:', imageUrl);
  console.log('🧩 OUTPUT:', finalUrl);
  return finalUrl;
};

// Helper para formatear precios de manera segura
const formatPrice = (price: number | string | undefined | null): string => {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
};

// Helper para normalizar datos de complemento del backend
const normalizeComplement = (complement: Record<string, unknown>): ComplementWithUrls => {
  return {
    ...complement,
    price: typeof complement.price === 'string' ? parseFloat(complement.price) : (complement.price as number),
    original_price: complement.original_price 
      ? (typeof complement.original_price === 'string' ? parseFloat(complement.original_price) : (complement.original_price as number))
      : null,
    discount_percentage: typeof complement.discount_percentage === 'string' 
      ? parseFloat(complement.discount_percentage) 
      : (complement.discount_percentage as number),
    stock: typeof complement.stock === 'string' ? parseInt(complement.stock) : (complement.stock as number),
    is_featured: Boolean(complement.is_featured),
    is_active: Boolean(complement.is_active),
    is_on_sale: Boolean(complement.is_on_sale)
  } as ComplementWithUrls;
};

export default function ComplementManagement() {
  // Estados principales
  const [complements, setComplements] = useState<ComplementWithUrls[]>([]);
  const [complementTypes] = useState<ComplementType[]>([
    { id: 'globos', name: 'Globos', description: 'Globos decorativos' },
    { id: 'peluches', name: 'Peluches', description: 'Peluches y muñecos' },
    { id: 'chocolates', name: 'Chocolates', description: 'Chocolates y dulces' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedComplement, setSelectedComplement] = useState<ComplementWithUrls | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para el formulario
  const [formData, setFormData] = useState<ComplementFormData>({
    name: '',
    description: '',
    short_description: '',
    price: 0,
    original_price: null,
    discount_percentage: 0,
    is_on_sale: false,
    type: 'globos',
    stock: 0,
    is_featured: false,
    is_active: true,
    color: '',
    size: '',
    brand: '',
    images: []
  });
  
  // Estados para carga de imagen
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Estados de guardado
  const [isSaving, setSaving] = useState(false);

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadComplements();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadComplements = async () => {
    try {
      const response = await apiClient.getComplements({ per_page: 100 });
      if (response.success && response.data?.data) {
        // Normalizar los datos del backend para asegurar tipos correctos
        const normalizedComplements = response.data.data.map(complement => 
          normalizeComplement(complement as unknown as Record<string, unknown>)
        );
        setComplements(normalizedComplements);
      }
    } catch (error) {
      console.error('Error loading complements:', error);
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
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // Subir imagen al servidor
      const response = await apiClient.uploadImage(file, 'complementos');
      
      if (response.success && response.data?.url) {
        const serverImageUrl = response.data.url;
        
        // DEBUG: Log para verificar la URL que recibimos del servidor
        console.log('🧩 =================================');
        console.log('🧩 IMAGEN SUBIDA AL SERVIDOR:');
        console.log('🧩 URL from server:', serverImageUrl);
        console.log('🧩 Response completa:', response.data);
        console.log('🧩 =================================');
        
        // Procesar URL antes de mostrar preview
        const processedUrl = getImageUrl(serverImageUrl);
        console.log('� URL procesada para vista previa:', processedUrl);
        
        // Actualizar preview
        setImagePreview(processedUrl);
        
        // Actualizar formData con URL original del servidor
        setFormData(prev => ({
          ...prev,
          images: [serverImageUrl]  // Guardar URL original del servidor
        }));

        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        
        console.log('🧩 Imagen subida exitosamente:', serverImageUrl);
      } else {
        throw new Error(response.message || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('🧩 Error uploading image:', error);
      alert('Error al subir la imagen: ' + (error as Error).message);
      setImagePreview('');
    } finally {
      setIsUploading(false);
    }
  };

  // Abrir modal para crear nuevo complemento
  const handleCreateComplement = () => {
    setSelectedComplement(null);
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      short_description: '',
      price: 0,
      original_price: null,
      discount_percentage: 0,
      is_on_sale: false,
      type: 'globos',
      stock: 0,
      is_featured: false,
      is_active: true,
      color: '',
      size: '',
      brand: '',
      images: []
    });
    console.log('🆕 Creando nuevo complemento, limpiando preview');
    setImagePreview('');
    setShowModal(true);
  };

  // Abrir modal para editar complemento
  const handleEditComplement = (complement: ComplementWithUrls) => {
    setSelectedComplement(complement);
    setIsEditing(true);
    setFormData({
      name: complement.name || '',
      description: complement.description || '',
      short_description: complement.short_description || '',
      price: complement.price || 0,
      original_price: complement.original_price || null,
      discount_percentage: complement.discount_percentage || 0,
      is_on_sale: complement.is_on_sale || false,
      type: complement.type || 'globos',
      stock: complement.stock || 0,
      is_featured: complement.is_featured || false,
      is_active: complement.is_active !== undefined ? complement.is_active : true,
      color: complement.color || '',
      size: complement.size || '',
      brand: complement.brand || '',
      images: Array.isArray(complement.images) ? complement.images : (complement.images ? [complement.images] : [])
    });
    
    // Establecer preview de imagen existente
    const existingImage = Array.isArray(complement.images) ? complement.images[0] : complement.images;
    setImagePreview(getImageUrl(existingImage));
    setShowModal(true);
  };

  // Guardar complemento (crear o actualizar)
  const handleSaveComplement = async () => {
    // Validaciones básicas
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('La descripción es requerida');
      return;
    }
    
    if (formData.price <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    setSaving(true);
    
    try {
      const complementData = {
        ...formData,
        is_on_sale: formData.discount_percentage > 0,
        original_price: formData.original_price || null
      };

      let response;
      if (isEditing && selectedComplement) {
        response = await apiClient.updateComplement(selectedComplement.id, complementData);
      } else {
        response = await apiClient.createComplement(complementData);
      }

      if (response.success) {
        await loadComplements();
        setShowModal(false);
        setImagePreview('');
        alert(isEditing ? 'Complemento actualizado exitosamente' : 'Complemento creado exitosamente');
      } else {
        throw new Error(response.message || 'Error al guardar el complemento');
      }
    } catch (error) {
      console.error('Error saving complement:', error);
      alert(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Eliminar complemento
  const handleDeleteComplement = async (complementId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este complemento? Esta acción no se puede deshacer.')) {
      try {
        const response = await apiClient.deleteComplement(complementId);
        
        if (response.success) {
          setComplements(complements.filter(complement => complement.id !== complementId));
          alert('Complemento eliminado exitosamente');
        } else {
          throw new Error(response.message || 'Error al eliminar el complemento');
        }
      } catch (error) {
        console.error('Error deleting complement:', error);
        alert(`Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  // Filtrar complementos
  const filteredComplements = complements.filter(complement => {
    const matchesSearch = complement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || complement.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Complementos</h1>
          <p className="text-gray-600 mt-1">Administra el catálogo de complementos</p>
        </div>
        <button
          onClick={handleCreateComplement}
          className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Complemento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar complementos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {complementTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de complementos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imagen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complemento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplements.map((complement) => (
                  <motion.tr
                    key={complement.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-16 w-16 relative">
                        <Image
                          src={getImageUrl(getComplementImageUrl(complement)) || '/placeholder-flower.jpg'}
                          alt={complement.name}
                          fill
                          className="object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-flower.jpg';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{complement.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {complement.short_description || complement.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {complementTypes.find(t => t.id === complement.type)?.name || complement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        S/ {formatPrice(complement.price)}
                        {complement.original_price && parseFloat(complement.original_price.toString()) > parseFloat(complement.price.toString()) && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            S/ {formatPrice(complement.original_price)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{complement.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complement.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {complement.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {complement.is_featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Destacado
                          </span>
                        )}
                        {complement.is_on_sale && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            En oferta
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditComplement(complement)}
                          className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComplement(complement.id)}
                          className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredComplements.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay complementos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterType ? 'No se encontraron complementos que coincidan con los filtros.' : 'Comienza creando tu primer complemento.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ComplementModal
            complement={selectedComplement}
            isEdit={isEditing}
            formData={formData}
            setFormData={setFormData}
            complementTypes={complementTypes}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            isUploading={isUploading}
            uploadSuccess={uploadSuccess}
            isSaving={isSaving}
            onClose={() => {
              setSelectedComplement(null);
              setShowModal(false);
              setImagePreview('');
            }}
            onSave={handleSaveComplement}
            onImageUpload={handleImageUpload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente Modal para crear/editar complementos
function ComplementModal({ 
  isEdit, 
  formData, 
  setFormData, 
  complementTypes,
  imagePreview, 
  setImagePreview,
  isUploading,
  uploadSuccess,
  isSaving,
  onClose, 
  onSave,
  onImageUpload
}: {
  complement: ComplementWithUrls | null;
  isEdit: boolean;
  formData: ComplementFormData;
  setFormData: (data: ComplementFormData) => void;
  complementTypes: ComplementType[];
  imagePreview: string;
  setImagePreview: (url: string) => void;
  isUploading: boolean;
  uploadSuccess: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onImageUpload: (file: File) => void;
}) {
  const handleInputChange = (field: keyof ComplementFormData, value: string | number | boolean | null) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar Complemento' : 'Nuevo Complemento'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del complemento *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Ej: Globo corazón rojo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción corta
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Descripción breve para mostrar en el catálogo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción completa *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Descripción detallada del complemento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as 'globos' | 'peluches' | 'chocolates')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {complementTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Ej: Rojo, Azul, Rosa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Ej: Pequeño, Mediano, Grande"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Marca del producto (especialmente para chocolates)"
                />
              </div>
            </div>

            {/* Precios e imagen */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio actual (S/) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio original (S/)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.original_price || ''}
                    onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => handleInputChange('discount_percentage', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del complemento
                </label>
                
                {imagePreview && (
                  <div className="mb-4 relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="object-cover rounded-lg border border-gray-300"
                      onError={() => {
                        console.log('Error cargando imagen preview:', imagePreview);
                        setImagePreview('');
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview('')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="mt-2">
                  <label className="cursor-pointer">
                    <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      {isUploading ? (
                        <>
                          <Loader className="h-5 w-5 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : uploadSuccess ? (
                        <>
                          <Check className="h-5 w-5 mr-2 text-green-600" />
                          Imagen subida
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mr-2" />
                          {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {/* Configuraciones */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                    Complemento destacado
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Complemento activo
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={isSaving || isUploading}
              className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Actualizar' : 'Crear'} Complemento
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
