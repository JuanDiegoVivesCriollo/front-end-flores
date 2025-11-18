'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  Eye,
  MessageCircle,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Phone
} from 'lucide-react';
import { apiClient } from '@/services/api';
import type { Order } from '@/types';
import OrderDetailsModal from './OrderDetailsModal';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  preparing: { label: 'Preparando', color: 'bg-purple-100 text-purple-800', icon: Package },
  ready: { label: 'Listo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  in_transit: { label: 'En camino', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
};

const paymentStatusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-800' },
};

interface OrderWithExpanded extends Order {
  isExpanded?: boolean;
  isEditing?: boolean;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrderWithExpanded[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estado para el modal de detalles
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const itemsPerPage = 12;

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Obteniendo pedidos reales del backend...');
      
      const response = await apiClient.getAllOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        per_page: itemsPerPage,
        page: currentPage
      });

      if (response.success && response.data) {
        console.log('✅ Pedidos obtenidos:', response.data);
        const ordersWithExtras = (response.data.data || []).map(order => ({
          ...order,
          isExpanded: false,
          isEditing: false
        }));
        setOrders(ordersWithExtras);
        setTotalPages(response.data.last_page || 1);
        setTotalOrders(response.data.total || 0);
      } else {
        console.warn('⚠️ No se pudieron obtener los pedidos:', response);
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setOrders([]);
      setTotalPages(1);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Actualizar estado de pedido
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const response = await apiClient.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        console.log('✅ Estado actualizado:', { orderId, newStatus });
      } else {
        console.error('❌ Error actualizando estado:', response.message);
        alert('Error al actualizar el estado del pedido');
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Error al actualizar el estado del pedido');
    } finally {
      setIsUpdating(null);
    }
  };

  // Eliminar todos los pedidos
  const deleteAllOrders = async () => {
    if (!window.confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los pedidos? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await apiClient.deleteAllOrders();
      
      if (response.success) {
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
        setCurrentPage(1);
        alert(`✅ Se eliminaron ${response.data?.deleted_count || 0} pedidos exitosamente`);
        fetchOrders(); // Refrescar la lista
      } else {
        console.error('❌ Error deleting all orders:', response.message);
        alert('❌ Error al eliminar los pedidos: ' + (response.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ Error deleting all orders:', error);
      alert('❌ Error al eliminar los pedidos');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Seleccionar/deseleccionar orden
  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Seleccionar todas las órdenes
  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  // Funciones para el modal de detalles
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setIsDetailsModalOpen(false);
  };

  const handleOrderStatusUpdate = async (orderId: number, newStatus: string) => {
    return updateOrderStatus(orderId, newStatus);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const filteredOrders = orders; // Ya viene filtrado del backend

  if (isLoading) {
    return (
      <div className="p-3 md:p-6">
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
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalOrders > 0 ? `${totalOrders} pedidos encontrados` : 'No hay pedidos'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={orders.length === 0 || isDeleting}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Eliminando...' : 'Eliminar Todos'}
          </button>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Eliminación
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar <strong>TODOS</strong> los pedidos? 
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteAllOrders}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar Todo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros Responsivos */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col gap-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por número de pedido o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          {/* Filtros y acciones */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Buscar
            </button>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 min-w-0 flex-1"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Selección múltiple */}
            {orders.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-600">
                  {selectedOrders.length > 0 ? `${selectedOrders.length} seleccionados` : 'Seleccionar todo'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
          <p className="text-gray-500">
            {orders.length === 0 
              ? 'Aún no se han realizado pedidos. Los pedidos aparecerán cuando los clientes completen sus compras con IziPay.'
              : 'No se encontraron pedidos que coincidan con los filtros aplicados.'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Vista Mobile - Cards */}
          {isMobile ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
                const paymentInfo = paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig];

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Header de la card */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                            {statusInfo?.label || order.status}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                            {paymentInfo?.label || order.payment_status}
                          </span>
                        </div>
                      </div>

                      {/* Información del cliente */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {order.customer_name || (order.shipping_address as { name?: string })?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {order.customer_phone || (order.shipping_address as { phone?: string })?.phone || 'Sin teléfono'}
                          </span>
                        </div>
                        {order.delivery_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Entrega: {new Date(order.delivery_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                        <span className="text-sm font-medium text-gray-700">Total:</span>
                        <span className="text-lg font-bold text-pink-600">
                          S/ {Number(order.total || order.total_amount || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={isUpdating === order.id}
                          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        >
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            console.log('Abrir chat para pedido:', order.id);
                            alert('Funcionalidad de chat en desarrollo');
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Vista Desktop - Tabla */
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pedido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
                      const paymentInfo = paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig];

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'bg-pink-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => toggleOrderSelection(order.id)}
                              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.order_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.delivery_date && `Entrega: ${new Date(order.delivery_date).toLocaleDateString()}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer_name || (order.shipping_address as { name?: string })?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer_phone || (order.shipping_address as { phone?: string })?.phone || 'Sin teléfono'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              disabled={isUpdating === order.id}
                              className={`text-sm border-0 rounded-full px-3 py-1 font-medium ${statusInfo?.color || 'bg-gray-100 text-gray-800'} focus:ring-2 focus:ring-pink-500`}
                            >
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <option key={key} value={key}>
                                  {config.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                              {paymentInfo?.label || order.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div>S/ {Number(order.total || order.total_amount || 0).toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Precio final</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openOrderDetails(order)}
                                className="text-pink-600 hover:text-pink-900 p-1 hover:bg-pink-50 rounded"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  console.log('Abrir chat para pedido:', order.id);
                                  alert('Funcionalidad de chat en desarrollo');
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700 order-2 sm:order-1">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalOrders)} de {totalOrders} pedidos
            </div>
            <div className="flex items-center space-x-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Números de página */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 text-sm border rounded-lg ${
                        currentPage === pageNumber
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acciones de selección múltiple */}
      <AnimatePresence>
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedOrders.length} pedido(s) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedOrders([])}
                  className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      // Actualizar estado de pedidos seleccionados
                      selectedOrders.forEach(orderId => {
                        updateOrderStatus(orderId, e.target.value);
                      });
                      setSelectedOrders([]);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  defaultValue=""
                >
                  <option value="">Cambiar estado...</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    if (confirm(`¿Estás seguro de que quieres eliminar ${selectedOrders.length} pedido(s) seleccionado(s)?`)) {
                      try {
                        const response = await apiClient.deleteMultipleOrders(selectedOrders);
                        
                        if (response.success) {
                          alert(`✅ Se eliminaron ${response.data?.deleted_count || 0} pedidos exitosamente`);
                          setSelectedOrders([]);
                          fetchOrders(); // Refrescar la lista
                        } else {
                          console.error('❌ Error deleting multiple orders:', response.message);
                          alert('❌ Error al eliminar los pedidos: ' + (response.message || 'Error desconocido'));
                        }
                      } catch (error) {
                        console.error('❌ Error deleting multiple orders:', error);
                        alert('❌ Error al eliminar los pedidos seleccionados');
                      }
                    }
                  }}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1 inline" />
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalles del Pedido */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={closeOrderDetails}
        onStatusChange={handleOrderStatusUpdate}
      />
    </div>
  );
};
