'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Coffee,
  Clock,
  Users,
  ImageIcon,
  Tag,
  Percent
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Breakfast {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  images: string[] | null;
  items_included: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  stock: number;
  preparation_time: number;
  serves: number;
  sort_order: number;
  created_at: string;
}

export default function DesayunosAdmin() {
  const [breakfasts, setBreakfasts] = useState<Breakfast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBreakfast, setEditingBreakfast] = useState<Breakfast | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  // Image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    discount_percentage: '0',
    items_included: '',
    stock: '0',
    preparation_time: '60',
    serves: '1',
    is_active: true,
    is_featured: false,
    is_on_sale: false,
  });

  useEffect(() => {
    fetchBreakfasts();
  }, []);

  // Helper function to get correct image URL
  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `${API_BASE.replace('/api/v1', '')}/storage/${imagePath}`;
  };

  // Auto-calculate price when on sale
  useEffect(() => {
    if (formData.is_on_sale && formData.original_price && formData.discount_percentage) {
      const originalPrice = parseFloat(formData.original_price);
      const discount = parseInt(formData.discount_percentage);
      if (originalPrice > 0 && discount > 0) {
        const finalPrice = originalPrice - (originalPrice * discount / 100);
        setFormData(prev => ({ ...prev, price: finalPrice.toFixed(2) }));
      }
    }
  }, [formData.original_price, formData.discount_percentage, formData.is_on_sale]);

  const fetchBreakfasts = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE}/catalog/breakfasts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBreakfasts(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching breakfasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (breakfast?: Breakfast) => {
    if (breakfast) {
      setEditingBreakfast(breakfast);
      setFormData({
        name: breakfast.name,
        description: breakfast.description || '',
        short_description: breakfast.short_description || '',
        price: breakfast.price.toString(),
        original_price: breakfast.original_price?.toString() || '',
        discount_percentage: breakfast.discount_percentage?.toString() || '0',
        items_included: breakfast.items_included?.join('\n') || '',
        stock: breakfast.stock.toString(),
        preparation_time: breakfast.preparation_time.toString(),
        serves: breakfast.serves.toString(),
        is_active: breakfast.is_active,
        is_featured: breakfast.is_featured,
        is_on_sale: breakfast.is_on_sale || false,
      });
      // Set image preview if breakfast has images
      if (breakfast.images && breakfast.images[0]) {
        setImagePreview(breakfast.images[0].startsWith('http') ? breakfast.images[0] : `${API_BASE.replace('/api/v1', '')}/storage/${breakfast.images[0]}`);
      } else {
        setImagePreview(null);
      }
      setSelectedImage(null);
    } else {
      setEditingBreakfast(null);
      setFormData({
        name: '',
        description: '',
        short_description: '',
        price: '',
        original_price: '',
        discount_percentage: '0',
        items_included: '',
        stock: '0',
        preparation_time: '60',
        serves: '1',
        is_active: true,
        is_featured: false,
        is_on_sale: false,
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBreakfast(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Calculate final price preview for offers
  const calculateFinalPrice = () => {
    if (formData.original_price && formData.discount_percentage) {
      const originalPrice = parseFloat(formData.original_price);
      const discount = parseInt(formData.discount_percentage);
      if (originalPrice > 0 && discount > 0) {
        return originalPrice - (originalPrice * discount / 100);
      }
    }
    return parseFloat(formData.price) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('auth_token');

    try {
      const itemsArray = formData.items_included
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      // Use FormData to support file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('short_description', formData.short_description);
      submitData.append('price', formData.price);
      if (formData.original_price) submitData.append('original_price', formData.original_price);
      submitData.append('discount_percentage', formData.discount_percentage);
      submitData.append('stock', formData.stock);
      submitData.append('preparation_time', formData.preparation_time);
      submitData.append('serves', formData.serves);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('is_featured', formData.is_featured ? '1' : '0');
      submitData.append('is_on_sale', formData.is_on_sale ? '1' : '0');
      submitData.append('items_included', JSON.stringify(itemsArray));
      
      // Add image if selected
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      const url = editingBreakfast 
        ? `${API_BASE}/admin/breakfasts/${editingBreakfast.id}`
        : `${API_BASE}/admin/breakfasts`;
      
      // For PUT with FormData, we need to use POST with _method
      const method = 'POST';
      if (editingBreakfast) {
        submitData.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: submitData,
      });

      if (response.ok) {
        fetchBreakfasts();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving breakfast:', error);
      alert('Error al guardar el desayuno');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE}/admin/breakfasts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchBreakfasts();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting breakfast:', error);
    }
  };

  const toggleActive = async (breakfast: Breakfast) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE}/admin/breakfasts/${breakfast.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ...breakfast, is_active: !breakfast.is_active }),
      });

      if (response.ok) {
        fetchBreakfasts();
      }
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  // Filter and pagination
  const filteredBreakfasts = breakfasts.filter(breakfast => {
    const matchesSearch = breakfast.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = filterActive === null || breakfast.is_active === filterActive;
    return matchesSearch && matchesActive;
  });

  const totalPages = Math.ceil(filteredBreakfasts.length / itemsPerPage);
  const paginatedBreakfasts = filteredBreakfasts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Desayunos</h1>
          <p className="text-gray-500">Gestiona el catálogo de desayunos sorpresa</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuevo Desayuno
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar desayunos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterActive === null ? '' : filterActive.toString()}
              onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Producto</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Precio</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Porciones</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Tiempo</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedBreakfasts.length > 0 ? (
                paginatedBreakfasts.map((breakfast) => (
                  <tr key={breakfast.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center overflow-hidden">
                          {breakfast.images && breakfast.images[0] ? (
                            <img
                              src={getImageUrl(breakfast.images[0])}
                              alt={breakfast.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Coffee className="w-6 h-6 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{breakfast.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{breakfast.short_description || 'Sin descripción'}</p>
                          {breakfast.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full mt-1">
                              <Star className="w-3 h-3" /> Destacado
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{formatCurrency(breakfast.price)}</p>
                      {breakfast.original_price && (
                        <p className="text-sm text-gray-400 line-through">{formatCurrency(breakfast.original_price)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
                        breakfast.stock > 10 
                          ? 'bg-green-100 text-green-700' 
                          : breakfast.stock > 0 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        <Package className="w-3.5 h-3.5" />
                        {breakfast.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        {breakfast.serves}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {breakfast.preparation_time} min
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActive(breakfast)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          breakfast.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {breakfast.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {breakfast.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(breakfast)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(breakfast.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No se encontraron desayunos</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredBreakfasts.length)} de {filteredBreakfasts.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-amber-500 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingBreakfast ? 'Editar Desayuno' : 'Nuevo Desayuno'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Desayuno</label>
                <div className="flex items-start gap-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all overflow-hidden"
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click para subir</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex-1 text-sm text-gray-500">
                    <p className="mb-2">Formatos permitidos: JPG, PNG, WebP</p>
                    <p className="mb-2">Tamaño máximo: 2MB</p>
                    <p>Dimensiones recomendadas: 800x800px</p>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedImage(null);
                        }}
                        className="mt-3 text-red-600 hover:text-red-700 font-medium"
                      >
                        Eliminar imagen
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                    placeholder="Nombre del desayuno"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none resize-none"
                    placeholder="Descripción detallada del desayuno"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción corta</label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                    placeholder="Breve descripción"
                  />
                </div>
              </div>

              {/* On Sale Toggle with enhanced UI */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_on_sale}
                    onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-800">Este producto está en OFERTA</span>
                  </div>
                </label>

                {/* Sale pricing section */}
                {formData.is_on_sale && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio Original (antes) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                          <input
                            type="number"
                            required={formData.is_on_sale}
                            step="0.01"
                            min="0"
                            value={formData.original_price}
                            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Porcentaje de Descuento *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required={formData.is_on_sale}
                            min="1"
                            max="99"
                            value={formData.discount_percentage}
                            onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                            placeholder="0"
                          />
                          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Price Preview */}
                    {formData.original_price && parseInt(formData.discount_percentage) > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Vista previa del precio:</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-gray-400 line-through text-lg">
                              S/ {parseFloat(formData.original_price).toFixed(2)}
                            </span>
                            <span className="text-3xl font-bold text-red-600">
                              S/ {calculateFinalPrice().toFixed(2)}
                            </span>
                          </div>
                          <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                            -{formData.discount_percentage}%
                          </span>
                        </div>
                        <p className="text-sm text-green-600 mt-2">
                          El cliente ahorra: S/ {(parseFloat(formData.original_price) - calculateFinalPrice()).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Regular Pricing (when not on sale) */}
              {!formData.is_on_sale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo preparación (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Porciones</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.serves}
                    onChange={(e) => setFormData({ ...formData, serves: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Items Included */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Elementos incluidos (uno por línea)</label>
                <textarea
                  value={formData.items_included}
                  onChange={(e) => setFormData({ ...formData, items_included: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none resize-none"
                  placeholder="Café americano&#10;Jugo de naranja&#10;Tostadas con mermelada&#10;Huevos revueltos"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Activo (visible en la tienda)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Destacado (aparece en inicio)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 font-medium transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar desayuno?</h3>
              <p className="text-gray-500 mb-6">Esta acción no se puede deshacer. El desayuno será eliminado permanentemente.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
