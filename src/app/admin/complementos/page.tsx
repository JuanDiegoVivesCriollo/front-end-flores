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
  Gift,
  ImageIcon,
  Tag,
  Percent
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Complement {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  type: string;
  image: string | null;
  images: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  stock: number;
  sort_order: number;
  created_at: string;
}

const complementTypes = [
  { value: 'chocolates', label: 'Chocolates' },
  { value: 'peluches', label: 'Peluches' },
  { value: 'globos', label: 'Globos' },
  { value: 'tarjetas', label: 'Tarjetas' },
  { value: 'decoraciones', label: 'Decoraciones' },
  { value: 'vinos', label: 'Vinos' },
  { value: 'otros', label: 'Otros' },
];

export default function ComplementosAdmin() {
  const [complements, setComplements] = useState<Complement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComplement, setEditingComplement] = useState<Complement | null>(null);
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
    price: '',
    original_price: '',
    discount_percentage: '0',
    type: 'chocolates',
    stock: '0',
    is_active: true,
    is_featured: false,
    is_on_sale: false,
  });

  useEffect(() => {
    fetchComplements();
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

  const fetchComplements = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE}/catalog/complements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setComplements(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching complements:', error);
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

  const handleOpenModal = (complement?: Complement) => {
    if (complement) {
      setEditingComplement(complement);
      setFormData({
        name: complement.name,
        description: complement.description || '',
        price: complement.price.toString(),
        original_price: complement.original_price?.toString() || '',
        discount_percentage: complement.discount_percentage?.toString() || '0',
        type: complement.type || 'chocolates',
        stock: complement.stock.toString(),
        is_active: complement.is_active,
        is_featured: complement.is_featured,
        is_on_sale: complement.is_on_sale || false,
      });
      // Set image preview if complement has images
      const imgSrc = complement.images?.[0] || complement.image;
      if (imgSrc) {
        setImagePreview(imgSrc.startsWith('http') ? imgSrc : `${API_BASE.replace('/api/v1', '')}/storage/${imgSrc}`);
      } else {
        setImagePreview(null);
      }
      setSelectedImage(null);
    } else {
      setEditingComplement(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        discount_percentage: '0',
        type: 'chocolates',
        stock: '0',
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
    setEditingComplement(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Calculate final price preview for offers
  const calculateFinalPrice = (): string => {
    if (formData.original_price && formData.discount_percentage) {
      const originalPrice = parseFloat(formData.original_price);
      const discount = parseInt(formData.discount_percentage);
      if (originalPrice > 0 && discount > 0) {
        return (originalPrice - (originalPrice * discount / 100)).toFixed(2);
      }
    }
    return (parseFloat(formData.price) || 0).toFixed(2);
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
      submitData.append('price', formData.price);
      if (formData.original_price) submitData.append('original_price', formData.original_price);
      submitData.append('discount_percentage', formData.discount_percentage);
      submitData.append('type', formData.type);
      submitData.append('stock', formData.stock);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('is_featured', formData.is_featured ? '1' : '0');
      submitData.append('is_on_sale', formData.is_on_sale ? '1' : '0');
      
      // Add image if selected
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      const url = editingComplement 
        ? `${API_BASE}/admin/complements/${editingComplement.id}`
        : `${API_BASE}/admin/complements`;
      
      // For PUT with FormData, we need to use POST with _method
      const method = 'POST';
      if (editingComplement) {
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
        fetchComplements();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving complement:', error);
      alert('Error al guardar el complemento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE}/admin/complements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchComplements();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting complement:', error);
    }
  };

  const toggleActive = async (complement: Complement) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE}/admin/complements/${complement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ...complement, is_active: !complement.is_active }),
      });

      if (response.ok) {
        fetchComplements();
      }
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  // Filter and pagination
  const filteredComplements = complements.filter(complement => {
    const matchesSearch = complement.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = filterActive === null || complement.is_active === filterActive;
    const matchesType = !filterType || complement.type === filterType;
    return matchesSearch && matchesActive && matchesType;
  });

  const totalPages = Math.ceil(filteredComplements.length / itemsPerPage);
  const paginatedComplements = filteredComplements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const getTypeLabel = (type: string) => {
    return complementTypes.find(t => t.value === type)?.label || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      chocolates: 'bg-amber-100 text-amber-700',
      peluches: 'bg-pink-100 text-pink-700',
      globos: 'bg-blue-100 text-blue-700',
      tarjetas: 'bg-purple-100 text-purple-700',
      decoraciones: 'bg-green-100 text-green-700',
      vinos: 'bg-red-100 text-red-700',
      otros: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
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
          <h1 className="text-2xl font-bold text-gray-800">Complementos</h1>
          <p className="text-gray-500">Gestiona chocolates, peluches, globos y más</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-500/25 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuevo Complemento
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar complementos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            >
              <option value="">Todos los tipos</option>
              {complementTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={filterActive === null ? '' : filterActive.toString()}
              onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Precio</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedComplements.length > 0 ? (
                paginatedComplements.map((complement) => (
                  <tr key={complement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center overflow-hidden">
                          {(complement.images?.[0] || complement.image) ? (
                            <img
                              src={getImageUrl(complement.images?.[0] || complement.image)}
                              alt={complement.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Gift className="w-6 h-6 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{complement.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{complement.description || 'Sin descripción'}</p>
                          {complement.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mt-1">
                              <Star className="w-3 h-3" /> Destacado
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(complement.type)}`}>
                        {getTypeLabel(complement.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{formatCurrency(complement.price)}</p>
                      {complement.original_price && (
                        <p className="text-sm text-gray-400 line-through">{formatCurrency(complement.original_price)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
                        complement.stock > 10 
                          ? 'bg-green-100 text-green-700' 
                          : complement.stock > 0 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        <Package className="w-3.5 h-3.5" />
                        {complement.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActive(complement)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          complement.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {complement.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {complement.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(complement)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(complement.id)}
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
                    <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No se encontraron complementos</p>
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
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredComplements.length)} de {filteredComplements.length}
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
                      ? 'bg-blue-500 text-white'
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingComplement ? 'Editar Complemento' : 'Nuevo Complemento'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setSelectedImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Haz clic o arrastra una imagen</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
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
              </div>

              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="Nombre del complemento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                  placeholder="Descripción del complemento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  {complementTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Offer Toggle */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_on_sale}
                    onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
                    className="w-5 h-5 rounded border-orange-300 text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-orange-700">🏷️ En Oferta</span>
                    <p className="text-xs text-orange-600">Activa para mostrar precio con descuento</p>
                  </div>
                </label>
              </div>

              {/* Pricing - Conditional based on is_on_sale */}
              {formData.is_on_sale ? (
                <div className="space-y-4 bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Precio anterior *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formData.original_price}
                        onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">% Descuento *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="99"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                        placeholder="20"
                      />
                    </div>
                  </div>
                  {/* Auto-calculated price preview */}
                  {formData.original_price && formData.discount_percentage && (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Precio final calculado:</span>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">
                            S/ {calculateFinalPrice()}
                          </span>
                          <span className="text-sm text-gray-400 line-through ml-2">
                            S/ {parseFloat(formData.original_price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">
                        Ahorro: S/ {(parseFloat(formData.original_price) - parseFloat(calculateFinalPrice())).toFixed(2)} ({formData.discount_percentage}% desc.)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="0.00"
                  />
                </div>
              )}

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="0"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Activo</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Destacado</span>
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
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 font-medium transition-all disabled:opacity-50"
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar complemento?</h3>
              <p className="text-gray-500 mb-6">Esta acción no se puede deshacer. El complemento será eliminado permanentemente.</p>
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
