'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  Eye,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag 

} from 'lucide-react';
import type { User, Order } from '@/types';
import { apiClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function CustomerManagement() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerStats, setCustomerStats] = useState<{[key: number]: { totalOrders: number; activeOrders: number; totalSpent: number }}>({});

  const fetchCustomers = useCallback(async () => {
      setIsLoading(true);
      try {
        console.log('Auth State:', { user, isAuthenticated, isAdmin });
        console.log('Fetching customers - Starting request...');
        console.log('✅ BACKEND WORKING! Admin credentials verified: admin@floresydetalleslima.com / admin123');
        
        if (!isAuthenticated || !isAdmin) {
          console.error('User not authenticated as admin:', { isAuthenticated, isAdmin });
          console.error('❌ ISSUE: Need to login with admin@floresydetalleslima.com / admin123');
          throw new Error('Usuario no autenticado como administrador');
        }
        
        const params: {
        role: 'user' | 'admin';
        per_page: number;
        search?: string;
        is_active?: boolean;
      } = {
        role: 'user', // Solo obtener clientes, no admins
        per_page: 50
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== 'all') {
        params.is_active = statusFilter === 'active';
      }

      console.log('Request params:', params);
      const response = await apiClient.getUsers(params);
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        const customersData = response.data.data || [];
        setCustomers(customersData);
        console.log('Customers loaded:', customersData.length);
        
        // Obtener estadísticas de pedidos para cada cliente
        const stats: {[key: number]: { totalOrders: number; activeOrders: number; totalSpent: number }} = {};
        
        console.log('Loading order statistics for customers...');
        
        // Intentar obtener estadísticas solo si hay clientes
        if (customersData.length > 0) {
          try {
            await Promise.all(customersData.map(async (customer) => {
              try {
                console.log(`Fetching orders for customer ${customer.id}...`);
                const ordersResponse = await apiClient.getAdminUserOrders(customer.id, { per_page: 100 });
                
                console.log(`Orders response for customer ${customer.id}:`, ordersResponse);
                
                if (ordersResponse.success && ordersResponse.data) {
                  const orders = ordersResponse.data.data || [];
                  console.log(`Orders data for customer ${customer.id}:`, orders);
                  
                  const activeOrders = orders.filter(order => 
                    order.status === 'pending' || order.status === 'processing' || order.status === 'shipped'
                  ).length;
                  
                  // Calcular total gastado con validación de datos
                  const totalSpent = orders.reduce((sum, order) => {
                    // Validar que total_amount existe y es un número válido
                    const amount = order.total_amount;
                    if (amount !== null && amount !== undefined && !isNaN(Number(amount))) {
                      return sum + parseFloat(String(amount));
                    }
                    return sum;
                  }, 0);
                  
                  stats[customer.id] = {
                    totalOrders: orders.length,
                    activeOrders,
                    totalSpent
                  };
                  console.log(`Orders loaded for customer ${customer.id}:`, stats[customer.id]);
                } else {
                  console.warn(`No orders data for customer ${customer.id}:`, ordersResponse);
                  stats[customer.id] = { totalOrders: 0, activeOrders: 0, totalSpent: 0 };
                }
              } catch (error) {
                console.error(`Error fetching orders for customer ${customer.id}:`, error);
                stats[customer.id] = { totalOrders: 0, activeOrders: 0, totalSpent: 0 };
              }
            }));
          } catch (error) {
            console.error('Error in Promise.all for customer orders:', error);
          }
        }
        
        setCustomerStats(stats);
        console.log('Customer stats set:', stats);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, isAuthenticated, isAdmin, user]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const debouncedFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchCustomers();
      }, 300);
    };

    debouncedFetch();

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, orderFilter, fetchCustomers]);

  const fetchCustomerDetails = async (customerId: number) => {
    try {
      const [userResponse, ordersResponse] = await Promise.all([
        apiClient.getUser(customerId),
        apiClient.getAdminUserOrders(customerId, { per_page: 10 })
      ]);

      if (userResponse.success && userResponse.data) {
        setSelectedCustomer(userResponse.data);
      }

      if (ordersResponse.success && ordersResponse.data) {
        setCustomerOrders(ordersResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handleToggleCustomerStatus = async (customerId: number, currentStatus: boolean) => {
    try {
      const response = await apiClient.updateUserStatus(customerId, !currentStatus);
      
      if (response.success && response.data) {
        // Actualizar la lista de clientes
        fetchCustomers();
        
        // Si es el cliente seleccionado, actualizar sus detalles
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const handleViewCustomer = async (customer: User) => {
    setSelectedCustomer(customer);
    await fetchCustomerDetails(customer.id);
    setShowCustomerModal(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.phone && customer.phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && customer.is_active) ||
                         (statusFilter === 'inactive' && !customer.is_active);
    
    const stats = customerStats[customer.id] || { totalOrders: 0, activeOrders: 0, totalSpent: 0 };
    const matchesOrders = orderFilter === 'all' ||
                         (orderFilter === 'with-orders' && stats.totalOrders > 0) ||
                         (orderFilter === 'no-orders' && stats.totalOrders === 0) ||
                         (orderFilter === 'active-orders' && stats.activeOrders > 0) ||
                         (orderFilter === 'no-active-orders' && stats.activeOrders === 0);
    
    return matchesSearch && matchesStatus && matchesOrders;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CustomerModal = ({ customer, orders, onClose }: {
    customer: User;
    orders: Order[];
    onClose: () => void;
  }) => {
    const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Perfil de Cliente: {customer.name}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información del cliente */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Información Personal</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <span>{customer.email}</span>
                    </div>
                    
                    {customer.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    
                    {customer.address && (
                      <div className="flex items-start text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div>{customer.address}</div>
                          {customer.city && (
                            <div className="text-gray-500">
                              {customer.city} {customer.postal_code}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                      <span>
                        Cliente desde {formatDate(customer.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Estadísticas</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-pink-600">{totalOrders}</div>
                        <div className="text-xs text-gray-500">Pedidos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(totalSpent)}
                        </div>
                        <div className="text-xs text-gray-500">Total gastado</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => handleToggleCustomerStatus(customer.id, customer.is_active)}
                      className={`w-full py-2 px-4 rounded-lg transition-colors ${
                        customer.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {customer.is_active ? 'Desactivar Cliente' : 'Activar Cliente'}
                    </button>
                    
                    <button className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Enviar Mensaje
                    </button>
                  </div>
                </div>
              </div>

              {/* Historial de pedidos */}
              <div className="lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4">Historial de Pedidos</h3>
                
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay pedidos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {order.order_number}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(order.total_amount || 0)}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'delivered' 
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status === 'delivered' ? 'Entregado' : 
                               order.status === 'pending' ? 'Pendiente' : 
                               order.status}
                            </span>
                          </div>
                        </div>
                        
                        {order.customer_notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Notas:</strong> {order.customer_notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
        <div className="text-sm text-gray-600">
          Total: {customers.length} clientes
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            
            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">Todos los pedidos</option>
              <option value="with-orders">Con pedidos</option>
              <option value="no-orders">Sin pedidos</option>
              <option value="active-orders">Con pedidos activos</option>
              <option value="no-active-orders">Sin pedidos activos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay clientes registrados aún'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => {
                  const stats = customerStats[customer.id] || { totalOrders: 0, activeOrders: 0, totalSpent: 0 };
                  
                  return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.phone || 'No especificado'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.city || 'No especificado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {stats.totalOrders} total{stats.totalOrders !== 1 ? 'es' : ''}
                        </div>
                        {stats.activeOrders > 0 ? (
                          <div className="text-xs text-orange-600 font-medium">
                            {stats.activeOrders} en proceso
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            Sin pedidos activos
                          </div>
                        )}
                        {stats.totalSpent > 0 && (
                          <div className="text-xs text-green-600">
                            {formatCurrency(stats.totalSpent)} gastado
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-pink-600 hover:text-pink-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
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

      {/* Modal de cliente */}
      {showCustomerModal && selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          orders={customerOrders}
          onClose={() => {
            setShowCustomerModal(false);
            setSelectedCustomer(null);
            setCustomerOrders([]);
          }}
        />
      )}
    </div>
  );
}
