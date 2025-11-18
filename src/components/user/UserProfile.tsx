'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Heart,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Package,
  Clock,
  CheckCircle,
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services/api';
import SecuritySettings from '@/components/SecuritySettings';
import PhoneInput from '@/components/PhoneInput';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  memberSince: string;
  totalOrders: number;
  favoriteFlowers: number;
}

interface SimpleOrder {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  items: number;
}

interface BackendOrder {
  id: number;
  order_number?: string;
  created_at: string;
  total?: string | number;
  total_amount?: string | number; // Alias para compatibilidad
  subtotal?: string | number; // Para calcular si hay envío
  shipping_cost?: string | number; // Costo de envío
  status: string;
  order_items?: Array<{
    id: number;
    flower_id?: number;
    quantity: number;
    price: number;
  }>;
  orderItems?: Array<{
    id: number;
    flower_id?: number;
    quantity: number;
    price: number;
  }>;
}

type TabType = 'profile' | 'orders' | 'favorites' | 'security';

export default function UserProfile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  
  // Estados para los datos del perfil
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    country: 'México',
    birthDate: '',
    memberSince: user?.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
    totalOrders: 0,
    favoriteFlowers: 0
  });

  // Estados para edición
  const [editedProfile, setEditedProfile] = useState(profile);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Órdenes del usuario
  const [orders, setOrders] = useState<SimpleOrder[]>([]);

  // Función para determinar el mensaje del precio
  const getMessageForPrice = () => {
    return 'Consultar envío por WhatsApp';
  };

  // Función para obtener órdenes del usuario
  const fetchUserOrders = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.getUserOrders();
      
      if (response.success && response.data) {
        // Transformar las órdenes del backend al formato simple
        const transformedOrders: SimpleOrder[] = (response.data.data || []).map((order: BackendOrder) => {
          
          return {
            id: order.order_number || order.id.toString(),
            date: order.created_at || new Date().toISOString(),
            total: parseFloat(order.total?.toString() || order.total_amount?.toString() || '0') || 0,
            status: order.status === 'delivered' ? 'delivered' : 
                    order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready' ? 'confirmed' :
                    order.status === 'cancelled' ? 'cancelled' : 'pending',
            items: order.order_items?.length || order.orderItems?.length || 1
          };
        });
        
        setOrders(transformedOrders);
        setProfile(prev => ({ ...prev, totalOrders: transformedOrders.length }));
      } else {
        // No hay órdenes o error en la respuesta
        setOrders([]);
        setProfile(prev => ({ ...prev, totalOrders: 0 }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // En caso de error, no mostrar datos mock, sino limpiar
      setOrders([]);
      setProfile(prev => ({ ...prev, totalOrders: 0 }));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      const updatedProfile = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: 'México',
        birthDate: '',
        memberSince: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
        totalOrders: 0,
        favoriteFlowers: 0
      };
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      fetchUserOrders();
    }
  }, [user, fetchUserOrders]);

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      // Aquí iría la llamada a la API para actualizar el perfil
      console.log('Actualizando perfil:', editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: SimpleOrder['status']) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusIcon = (status: SimpleOrder['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'confirmed':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8"
        >
          <div className="px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">{profile.email}</p>
                {profile.memberSince && (
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Miembro desde {new Date(profile.memberSince).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-pink-600">{profile.totalOrders}</div>
                <div className="text-sm text-gray-500">Órdenes totales</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', label: 'Perfil', icon: User },
                { id: 'orders', label: 'Mis Órdenes', icon: ShoppingBag },
                { id: 'favorites', label: 'Favoritos', icon: Heart },
                { id: 'security', label: 'Seguridad', icon: Shield }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as TabType)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Perfil */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                      disabled={isLoading}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Editar</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4" />
                        <span>{isLoading ? 'Guardando...' : 'Guardar'}</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{profile.name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      {isEditing ? (
                        <PhoneInput
                          value={editedProfile.phone || ''}
                          onChange={(value, isValid) => {
                            setEditedProfile({ ...editedProfile, phone: value });
                            setIsPhoneValid(isValid);
                          }}
                          label=""
                          placeholder="987 654 321"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{profile.phone || 'No especificado'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información de ubicación */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.address}
                          onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Ej: Calle Principal 123"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{profile.address || 'No especificada'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.city}
                          onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Ej: Ciudad de México"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{profile.city || 'No especificada'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de nacimiento
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedProfile.birthDate}
                          onChange={(e) => setEditedProfile({ ...editedProfile, birthDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {profile.birthDate 
                              ? new Date(profile.birthDate).toLocaleDateString() 
                              : 'No especificada'
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cambio de contraseña */}
                {isEditing && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nueva contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="Dejar vacío para no cambiar"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar contraseña
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Confirmar nueva contraseña"
                        />
                      </div>
                    </div>
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-red-600 text-sm mt-2">Las contraseñas no coinciden</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: Órdenes */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Mis Órdenes</h2>
                  <button
                    onClick={fetchUserOrders}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                  Orden {order.id}
                                  {getStatusIcon(order.status)}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.date).toLocaleDateString()} • {order.items} artículo{order.items > 1 ? 's' : ''}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">S/ {order.total.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">
                              {getMessageForPrice()}
                            </div>
                            <button className="text-sm text-pink-600 hover:text-pink-700 transition-colors">
                              Ver detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aún no tienes órdenes</p>
                    <button
                      onClick={() => router.push('/catalogo')}
                      className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      Explorar Catálogo
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: Favoritos */}
            {activeTab === 'favorites' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900">Mis Favoritos</h2>
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aún no tienes flores favoritas</p>
                  <button
                    onClick={() => router.push('/flores')}
                    className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Explorar Flores
                  </button>
                </div>
              </motion.div>
            )}

            {/* Tab: Seguridad */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <SecuritySettings />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
