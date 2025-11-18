'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/services/api';
import type { DashboardStats } from '@/types';

import { LucideIcon } from 'lucide-react';

// Helper function para validar números
const safeNumberFormat = (value: unknown, defaultValue = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

const StatCard = ({ title, value, icon: Icon, color, trend }: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: { value: number; isPositive: boolean };
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend.value)}% vs mes anterior</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      console.log('🔄 Obteniendo estadísticas reales del dashboard...');
      
      // Obtener datos de múltiples endpoints para construir estadísticas completas
      const [flowersResponse, ordersResponse, usersResponse] = await Promise.all([
        apiClient.getFlowers({ per_page: 1000 }), // Obtener todas las flores para contar
        apiClient.getAllOrders({ per_page: 1000 }), // Obtener todos los pedidos
        apiClient.getUsers({ per_page: 1000 }) // Obtener todos los usuarios
      ]);

      console.log('📊 Respuestas obtenidas:', {
        flowers: flowersResponse.success ? flowersResponse.data?.data?.length : 'Error',
        orders: ordersResponse.success ? ordersResponse.data?.data?.length : 'Error',
        users: usersResponse.success ? usersResponse.data?.data?.length : 'Error'
      });

      // Procesar datos de flores
      const flowers = flowersResponse.success && flowersResponse.data?.data ? flowersResponse.data.data : [];
      const totalFlowers = flowers.length;
      const activeFlowers = flowers.filter(flower => flower.is_active).length;
      const lowStockFlowers = flowers.filter(flower => flower.stock <= 5);

      // Procesar datos de pedidos
      const orders = ordersResponse.success && ordersResponse.data?.data ? ordersResponse.data.data : [];
      const totalOrders = orders.length;
      
      // Pedidos de hoy
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= todayStart;
      }).length;

      // Pedidos del mes actual
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });

      // Calcular ingresos del mes con validación de tipos
      const monthRevenue = monthOrders.reduce((sum, order) => {
        const total = safeNumberFormat(order.total);
        return sum + total;
      }, 0);

      // Pedidos por estado
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
      const processingOrders = orders.filter(order => order.status === 'processing').length;

      // Procesar datos de usuarios
      const users = usersResponse.success && usersResponse.data?.data ? usersResponse.data.data : [];
      const totalCustomers = users.length;

      // Pedidos recientes (últimos 10)
      const recentOrders = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      // Crear estructura de datos para el dashboard
      const dashboardStats: DashboardStats = {
        overview: {
          total_orders: totalOrders,
          total_customers: totalCustomers,
          total_flowers: totalFlowers,
          active_flowers: activeFlowers,
          today_orders: todayOrders,
          today_revenue: 0, // Calculado en tiempo real
          month_orders: monthOrders.length,
          month_revenue: monthRevenue,
          last_month_orders: 0, // Se puede calcular si es necesario
          last_month_revenue: 0,
          orders_growth: 0, // Se puede calcular si es necesario
          revenue_growth: 0,
        },
        orders_by_status: {
          pending: pendingOrders,
          processing: processingOrders,
          completed: deliveredOrders,
          delivered: deliveredOrders,
          cancelled: orders.filter(order => order.status === 'cancelled').length
        },
        recent_orders: recentOrders,
        low_stock_flowers: lowStockFlowers,
        best_sellers: [], // Se puede implementar después
      };

      setDashboardData(dashboardStats);
      setLastUpdated(new Date());

      console.log('✅ Estadísticas actualizadas con datos reales:', {
        totalOrders,
        totalCustomers, 
        totalFlowers,
        activeFlowers,
        todayOrders,
        monthRevenue: monthRevenue.toFixed(2),
        pendingOrders,
        deliveredOrders,
        lowStockCount: lowStockFlowers.length
      });

    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      setError(`Error al cargar estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      
      // En caso de error total, mantener datos mínimos
      setDashboardData({
        overview: {
          total_orders: 0,
          total_customers: 0,
          total_flowers: 0,
          active_flowers: 0,
          today_orders: 0,
          today_revenue: 0,
          month_orders: 0,
          month_revenue: 0,
          last_month_orders: 0,
          last_month_revenue: 0,
          orders_growth: 0,
          revenue_growth: 0,
        },
        orders_by_status: {},
        recent_orders: [],
        low_stock_flowers: [],
        best_sellers: [],
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas del dashboard...</p>
        </div>
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el dashboard</h3>
          <p className="text-gray-600 mb-4">{error || 'No se pudieron cargar las estadísticas'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { overview } = dashboardData;

  return (
    <div className="p-6 space-y-6">
      {/* Header con botón de actualizar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resumen del Dashboard</h1>
          <p className="text-sm text-gray-500">
            Última actualización: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Mensaje de datos reales */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-sm text-green-700">
            ✅ Dashboard con datos reales del servidor - Última actualización: {lastUpdated.toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Pedidos"
          value={overview.total_orders}
          icon={ShoppingCart}
          color="bg-blue-500"
          trend={{ value: overview.orders_growth, isPositive: overview.orders_growth >= 0 }}
        />
        <StatCard
          title="Clientes Registrados"
          value={overview.total_customers}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Flores en Catálogo"
          value={overview.total_flowers}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Ingresos del Mes"
          value={`S/. ${overview.month_revenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="bg-yellow-500"
          trend={{ value: overview.revenue_growth, isPositive: overview.revenue_growth >= 0 }}
        />
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pedidos Hoy"
          value={overview.today_orders}
          icon={Clock}
          color="bg-indigo-500"
        />
        <StatCard
          title="Flores Activas"
          value={overview.active_flowers}
          icon={Package}
          color="bg-pink-500"
        />
        <StatCard
          title="Stock Bajo"
          value={dashboardData.low_stock_flowers.length}
          icon={AlertCircle}
          color="bg-red-500"
        />
      </div>

      {/* Resumen de estados de pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Pendientes</h3>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <span className="text-2xl font-bold text-gray-900">
              {dashboardData.orders_by_status.pending || 0}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Requieren procesamiento</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Entregados</h3>
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <span className="text-2xl font-bold text-gray-900">
              {dashboardData.orders_by_status.delivered || 0}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Completados exitosamente</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventario Crítico</h3>
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
            <span className="text-2xl font-bold text-gray-900">
              {dashboardData.low_stock_flowers.length}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Productos con stock bajo</p>
        </motion.div>
      </div>

      {/* Actividad reciente con datos reales */}
      {dashboardData.recent_orders.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente (Datos Reales)</h3>
          <div className="space-y-3">
            {dashboardData.recent_orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">Pedido #{order.order_number}</p>
                  <p className="text-xs text-gray-500">
                    Cliente: {order.customer_name || order.customer_email || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('es-ES')} - {new Date(order.created_at).toLocaleTimeString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    S/. {safeNumberFormat(order.total).toFixed(2)}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'delivered' ? 'Entregado' :
                     order.status === 'pending' ? 'Pendiente' :
                     order.status === 'confirmed' ? 'Confirmado' :
                     order.status === 'processing' ? 'Procesando' :
                     order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver todos los pedidos →
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay pedidos registrados aún</p>
            <p className="text-sm text-gray-400 mt-2">
              Los pedidos aparecerán aquí cuando se realicen compras con Izipay
            </p>
          </div>
        </motion.div>
      )}

      {/* Flores con stock bajo */}
      {dashboardData.low_stock_flowers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Flores con Stock Bajo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.low_stock_flowers.slice(0, 6).map((flower) => (
              <div key={flower.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{flower.name}</h4>
                <p className="text-sm text-red-600">Stock: {flower.stock} unidades</p>
                <p className="text-sm text-gray-500">Precio: S/. {safeNumberFormat(flower.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
