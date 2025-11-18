'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  Package,
  Truck,
  FileText,
  Heart,
  Gift,
  Tag,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { Order } from '@/types';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: number, newStatus: string) => Promise<void>;
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
  preparing: { label: 'Preparando', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Package },
  ready: { label: 'Listo', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  in_transit: { label: 'En camino', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle },
};

const paymentStatusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800 border-green-200' },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800 border-red-200' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-800 border-green-200' },
};

// Type guards para verificar que las propiedades existen
const isString = (value: unknown): value is string => typeof value === 'string';
const isObject = (value: unknown): value is Record<string, unknown> => 
  typeof value === 'object' && value !== null && !Array.isArray(value);

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose, onStatusChange }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(order.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!order) return null;

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
  const paymentInfo = paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig];
  const StatusIcon = statusInfo?.icon || Clock;

  // Extraer datos de shipping_address de manera segura
  const shippingAddress = isObject(order.shipping_address) ? order.shipping_address : null;
  
  // Buscar información adicional en las notas
  let additionalInfo: Record<string, unknown> = {};
  try {
    if (order.notes && isString(order.notes)) {
      additionalInfo = JSON.parse(order.notes);
    }
  } catch {
    // Si no es JSON válido, mantener como vacío
  }

  // Funciones helper para extraer datos de manera segura
  const getStringValue = (obj: Record<string, unknown> | null, key: string): string => {
    if (!obj || !isString(obj[key])) return '';
    return obj[key];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {order.order_number}
                    </h2>
                    <p className="text-pink-100">
                      Pedido realizado el {new Date(order.created_at).toLocaleDateString('es-PE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="p-6 space-y-8">
                {/* Estado y Pago */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-pink-600" />
                      Estado del Pedido
                    </h3>
                    <div className="space-y-3">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${statusInfo?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        <StatusIcon className="h-4 w-4 mr-2" />
                        {statusInfo?.label || order.status}
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isUpdatingStatus}
                        className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:opacity-50"
                      >
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-pink-600" />
                      Estado del Pago
                    </h3>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${paymentInfo?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {paymentInfo?.label || order.payment_status}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Método de pago:</span>
                        <span className="font-medium">{order.payment_method || 'IziPay'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">S/ {Number(order.subtotal || 0).toFixed(2)}</span>
                      </div>
                      {order.shipping_cost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Envío:</span>
                          <span className="font-medium">S/ {Number(order.shipping_cost || 0).toFixed(2)}</span>
                        </div>
                      )}
                      {order.discount_amount && order.discount_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Descuento:</span>
                          <span className="font-medium text-green-600">-S/ {Number(order.discount_amount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-pink-600 text-lg">
                            S/ {Number(order.total || order.total_amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Cliente */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-pink-600" />
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Nombre:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {order.customer_name || getStringValue(shippingAddress, 'name') || 'No especificado'}
                          </span>
                          <button
                            onClick={() => copyToClipboard(
                              order.customer_name || getStringValue(shippingAddress, 'name') || '',
                              'name'
                            )}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {copiedField === 'name' ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> : 
                              <Copy className="h-4 w-4 text-gray-400" />
                            }
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Teléfono:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {order.customer_phone || getStringValue(shippingAddress, 'phone') || 'No especificado'}
                          </span>
                          <button
                            onClick={() => copyToClipboard(
                              order.customer_phone || getStringValue(shippingAddress, 'phone') || '',
                              'phone'
                            )}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {copiedField === 'phone' ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> : 
                              <Copy className="h-4 w-4 text-gray-400" />
                            }
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Email:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {order.customer_email || 'No especificado'}
                          </span>
                          <button
                            onClick={() => copyToClipboard(
                              order.customer_email || '',
                              'email'
                            )}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {copiedField === 'email' ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> : 
                              <Copy className="h-4 w-4 text-gray-400" />
                            }
                          </button>
                        </div>
                      </div>

                      {(getStringValue(additionalInfo, 'identity_number') || getStringValue(additionalInfo, 'identity_type')) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Documento:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {getStringValue(additionalInfo, 'identity_type')?.toUpperCase()} {getStringValue(additionalInfo, 'identity_number')}
                            </span>
                            <button
                              onClick={() => copyToClipboard(
                                `${getStringValue(additionalInfo, 'identity_type')?.toUpperCase()} ${getStringValue(additionalInfo, 'identity_number')}`,
                                'identity'
                              )}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {copiedField === 'identity' ? 
                                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                <Copy className="h-4 w-4 text-gray-400" />
                              }
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información de Entrega */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-pink-600" />
                    Información de Entrega
                  </h3>
                  <div className="space-y-4">
                    {order.delivery_date && (
                      <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-pink-600" />
                          <span className="text-sm text-gray-600">Fecha de entrega:</span>
                        </div>
                        <span className="font-medium text-pink-700">
                          {new Date(order.delivery_date).toLocaleDateString('es-PE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    {order.delivery_time_slot && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Hora de entrega:</span>
                        </div>
                        <span className="font-medium">{order.delivery_time_slot}</span>
                      </div>
                    )}

                    {shippingAddress && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div className="flex-1">
                            <span className="text-sm text-gray-600">Dirección de entrega:</span>
                            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium">{getStringValue(shippingAddress, 'address') || 'No especificada'}</div>
                              {getStringValue(shippingAddress, 'reference') && (
                                <div className="text-sm text-gray-600 mt-1">
                                  Referencia: {getStringValue(shippingAddress, 'reference')}
                                </div>
                              )}
                              <div className="text-sm text-gray-600 mt-1">
                                {getStringValue(shippingAddress, 'district') || 'Distrito no especificado'}, {getStringValue(shippingAddress, 'province') || 'Lima'}, {getStringValue(shippingAddress, 'department') || 'Lima'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(
                              `${getStringValue(shippingAddress, 'address')}, ${getStringValue(shippingAddress, 'district')}, ${getStringValue(shippingAddress, 'province') || 'Lima'}, ${getStringValue(shippingAddress, 'department') || 'Lima'}${getStringValue(shippingAddress, 'reference') ? ` (Ref: ${getStringValue(shippingAddress, 'reference')})` : ''}`,
                              'address'
                            )}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {copiedField === 'address' ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> : 
                              <Copy className="h-4 w-4 text-gray-400" />
                            }
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Productos del Pedido */}
                {(order.items || order.order_items) && (order.items || order.order_items)!.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Gift className="h-5 w-5 text-pink-600" />
                      Productos del Pedido
                      <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {(order.items || order.order_items)!.length} {(order.items || order.order_items)!.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {(order.items || order.order_items)!.map((item, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          {(item.flower?.first_image || item.complement?.first_image) && (
                            <Image 
                              src={item.flower?.first_image || item.complement?.first_image || '/placeholder-flower.jpg'} 
                              alt={item.flower?.name || item.complement?.name || 'Producto'}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-flower.jpg';
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.flower?.name || item.complement?.name || item.product_name || 'Producto'}</h4>
                            {(item.flower?.description || item.complement?.description) && (
                              <p className="text-sm text-gray-600 mt-1">{item.flower?.description || item.complement?.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-gray-600">Cantidad: {item.quantity || 1}</span>
                              <span className="text-gray-600">
                                Precio: S/ {Number(item.price || 0).toFixed(2)}
                              </span>
                              <span className="font-medium text-pink-600">
                                Subtotal: S/ {Number(item.subtotal || (item.quantity || 1) * (item.price || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mensaje Personalizado */}
                {(order.notes && isString(order.notes) && !order.notes.startsWith('{')) && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-600" />
                      Notas del Pedido
                    </h3>
                    <div className="p-4 bg-pink-50 rounded-lg">
                      <p className="text-gray-700 italic">&ldquo;{order.notes}&rdquo;</p>
                    </div>
                  </div>
                )}

                {/* Información Técnica */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-pink-600" />
                    Información Técnica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID del pedido:</span>
                        <span className="font-mono">{order.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Número de pedido:</span>
                        <span className="font-mono">{order.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de creación:</span>
                        <span>{new Date(order.created_at).toLocaleString('es-PE')}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Última actualización:</span>
                        <span>{new Date(order.updated_at).toLocaleString('es-PE')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo de envío:</span>
                        <span className="capitalize">{order.shipping_type === 'delivery' ? 'Delivery' : 'Recojo en tienda'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
