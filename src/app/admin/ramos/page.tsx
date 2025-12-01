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
  Upload,
  Save,
  Flower2,
  ImageIcon,
  Tag,
  Percent
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Flower {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  sku: string;
  color: string;
  occasion: string;
  images: string[] | null;
  rating: number;
  reviews_count: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  category_id: number | null;
  category?: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const colorOptions = ['Rojo', 'Blanco', 'Rosa', 'Amarillo', 'Morado', 'Naranja', 'Azul', 'Multicolor'];
const occasionOptions = ['Cumpleaños', 'Aniversario', 'Amor y Romance', 'Agradecimiento', 'Condolencias', 'Día de la Madre', 'San Valentín', 'Nacimiento', 'Graduación', 'Boda', 'Corporativo'];

export default function RamosAdmin() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlower, setEditingFlower] = useState<Flower | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  
  // Image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    discount_percentage: '0',
    color: '',
    occasion: '',
    stock: '0',
    is_active: true,
    is_featured: false,
    is_on_sale: false,
    category_id: '',
  });

  // Helper function to get correct image URL
  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return `${API_BASE.replace('/api/v1', '')}/storage/${imagePath}`;
  };

  useEffect(() => {
    fetchFlowers();
    fetchCategories();
  }, []);

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

  const fetchFlowers = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE}/catalog/flowers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFlowers(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching flowers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/catalog/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const handleOpenModal = (flower?: Flower) => {
    if (flower) {
      setEditingFlower(flower);
      setFormData({
        name: flower.name,
        description: flower.description || '',
        short_description: flower.short_description || '',
        price: flower.price.toString(),
        original_price: flower.original_price?.toString() || '',
        discount_percentage: flower.discount_percentage.toString(),
        color: flower.color || '',
        occasion: flower.occasion || '',
        stock: flower.stock.toString(),
        is_active: flower.is_active,
        is_featured: flower.is_featured,
        is_on_sale: flower.is_on_sale,
        category_id: flower.category_id?.toString() || '',
      });
      // Set image preview if flower has images
      if (flower.images && flower.images[0]) {
        setImagePreview(flower.images[0].startsWith('http') ? flower.images[0] : `${API_BASE.replace('/api/v1', '')}/storage/${flower.images[0]}`);
      } else {
        setImagePreview(null);
      }
      setSelectedImage(null);
    } else {
      setEditingFlower(null);
      setFormData({
        name: '',
        description: '',
        short_description: '',
        price: '',
        original_price: '',
        discount_percentage: '0',
        color: '',
        occasion: '',
        stock: '0',
        is_active: true,
        is_featured: false,
        is_on_sale: false,
        category_id: '',
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFlower(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('auth_token');

    try {
      // Use FormData to support file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('short_description', formData.short_description);
      submitData.append('price', formData.price);
      if (formData.original_price) submitData.append('original_price', formData.original_price);
      submitData.append('discount_percentage', formData.discount_percentage);
      submitData.append('color', formData.color);
      submitData.append('occasion', formData.occasion);
      submitData.append('stock', formData.stock);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('is_featured', formData.is_featured ? '1' : '0');
      submitData.append('is_on_sale', formData.is_on_sale ? '1' : '0');
      if (formData.category_id) submitData.append('category_id', formData.category_id);
      
      // Add image if selected
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      const url = editingFlower 
        ? `${API_BASE}/admin/flowers/${editingFlower.id}`
        : `${API_BASE}/admin/flowers`;
      
      // For PUT with FormData, we need to use POST with _method
      const method = 'POST';
      if (editingFlower) {
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
        fetchFlowers();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving flower:', error);
      alert('Error al guardar el ramo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE}/admin/flowers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchFlowers();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting flower:', error);
    }
  };

  const toggleActive = async (flower: Flower) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE}/admin/flowers/${flower.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ...flower, is_active: !flower.is_active }),
      });

      if (response.ok) {
        fetchFlowers();
      }
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  // Filter and pagination
  const filteredFlowers = flowers.filter(flower => {
    const matchesSearch = flower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flower.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = filterActive === null || flower.is_active === filterActive;
    return matchesSearch && matchesActive;
  });

  const totalPages = Math.ceil(filteredFlowers.length / itemsPerPage);
  const paginatedFlowers = filteredFlowers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
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
          <h1 className="text-2xl font-bold text-gray-800">Ramos</h1>
          <p className="text-gray-500">Gestiona el catálogo de ramos y arreglos florales</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-rose-500 text-white rounded-xl hover:from-primary-600 hover:to-rose-600 transition-all shadow-lg shadow-primary-500/25 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuevo Ramo
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterActive === null ? '' : filterActive.toString()}
              onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Categoría</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedFlowers.length > 0 ? (
                paginatedFlowers.map((flower) => (
                  <tr key={flower.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-rose-100 rounded-xl flex items-center justify-center overflow-hidden">
                          {flower.images && flower.images[0] ? (
                            <img
                              src={getImageUrl(flower.images[0])}
                              alt={flower.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Flower2 className="w-6 h-6 text-primary-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{flower.name}</p>
                          <p className="text-sm text-gray-500">SKU: {flower.sku || 'N/A'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {flower.is_featured && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                <Star className="w-3 h-3" /> Destacado
                              </span>
                            )}
                            {flower.is_on_sale && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                -{flower.discount_percentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{formatCurrency(flower.price)}</p>
                      {flower.original_price && (
                        <p className="text-sm text-gray-400 line-through">{formatCurrency(flower.original_price)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
                        flower.stock > 10 
                          ? 'bg-green-100 text-green-700' 
                          : flower.stock > 0 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        <Package className="w-3.5 h-3.5" />
                        {flower.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{flower.category?.name || 'Sin categoría'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActive(flower)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          flower.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {flower.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {flower.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(flower)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(flower.id)}
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Flower2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No se encontraron ramos</p>
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
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredFlowers.length)} de {filteredFlowers.length}
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
                      ? 'bg-primary-500 text-white'
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
                {editingFlower ? 'Editar Ramo' : 'Nuevo Ramo'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Ramo</label>
                <div className="flex items-start gap-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all overflow-hidden"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                    placeholder="Nombre del ramo"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
                    placeholder="Descripción detallada del ramo"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción corta</label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
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

                {/* Sale pricing section - only show when is_on_sale is true */}
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
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
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
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                  >
                    <option value="">Seleccionar color</option>
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ocasión</label>
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                >
                  <option value="">Seleccionar ocasión</option>
                  {occasionOptions.map((occasion) => (
                    <option key={occasion} value={occasion}>{occasion}</option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
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
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-rose-500 text-white rounded-xl hover:from-primary-600 hover:to-rose-600 font-medium transition-all disabled:opacity-50"
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar ramo?</h3>
              <p className="text-gray-500 mb-6">Esta acción no se puede deshacer. El ramo será eliminado permanentemente.</p>
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
