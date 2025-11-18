'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Calendar, MapPin, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { paymentService } from '@/services/payment';
import { apiClient } from '@/services/api';

interface OrderDetails {
  payment_status?: string;
  order_number: string;
  amount: number;
  paid_at?: string | null;
  order_id?: number;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async (paymentId: number) => {
      try {
        setLoading(true);
        const response = await paymentService.verifyPayment(paymentId);
        
        if (response.success && response.data) {
          const paymentData = response.data;
          
          // Create order details from payment verification
          setOrderDetails({
            payment_status: paymentData.payment_status,
            order_number: searchParams.get('order_number') || `PAY-${paymentId}`,
            amount: parseFloat(searchParams.get('amount') || '0'),
            paid_at: paymentData.paid_at
          });

          // Clear cart only on successful payment
          if (paymentData.payment_status === 'completed' || paymentData.payment_status === 'paid') {
            clearCart();
          }
        } else {
          setError(response.message || 'Error al verificar el pago');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError('Error al verificar el pago. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    const fetchOrderDetails = async (orderId: number) => {
      try {
        setLoading(true);
        const response = await apiClient.getOrder(orderId);
        
        if (response.success && response.data) {
          const order = response.data;
          setOrderDetails({
            order_number: order.order_number,
            amount: order.total_amount || 0,
            payment_status: 'completed',
            order_id: order.id
          });
          clearCart();
        } else {
          setError('No se pudo obtener la información de la orden');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Error al obtener los detalles de la orden');
      } finally {
        setLoading(false);
      }
    };

    const fetchOrderByNumber = async (orderNumber: string, retryCount = 0) => {
      try {
        setLoading(true);
        console.log('Fetching order by number:', orderNumber, 'retry:', retryCount);
        
        // Usar el endpoint público que maneja tanto drafts como órdenes reales
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/orders/${orderNumber}/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // No enviar Authorization header ya que es endpoint público
          },
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Response data:', data);
          
          if (data.success && data.data) {
            setOrderDetails({
              order_number: data.data.order_number,
              amount: data.data.total || 0,
              payment_status: data.data.payment_status || 'completed',
              order_id: data.data.order_id
            });
            clearCart();
          } else {
            setError(data.message || 'No se pudo obtener la información de la orden');
          }
        } else if (response.status === 402) {
          // Payment required - draft not converted yet
          if (retryCount < 5) {
            console.log('Draft not converted yet, retrying in 3 seconds...');
            setTimeout(() => {
              fetchOrderByNumber(orderNumber, retryCount + 1);
            }, 3000);
            return;
          } else {
            setError('El pago aún está siendo procesado. Por favor, verifica tu pedido más tarde en tu perfil.');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', errorData);
          setError(errorData.message || `No se encontró la orden especificada (${response.status})`);
        }
      } catch (error) {
        console.error('Error fetching order by number:', error);
        if (retryCount < 3) {
          console.log('Network error, retrying in 3 seconds...');
          setTimeout(() => {
            fetchOrderByNumber(orderNumber, retryCount + 1);
          }, 3000);
          return;
        }
        setError('Error de conexión al obtener los detalles de la orden');
      } finally {
        if (retryCount >= 5) {
          setLoading(false);
        }
      }
    };

    const paymentId = searchParams.get('payment_id');
    const orderId = searchParams.get('order_id');
    const orderNumber = searchParams.get('order_number');
    const order = searchParams.get('order'); // Parámetro principal usado en redirect

    console.log('PaymentSuccessPage - URL params:', {
      paymentId, orderId, orderNumber, order
    });

    if (paymentId) {
      verifyPayment(parseInt(paymentId));
    } else if (orderId) {
      fetchOrderDetails(parseInt(orderId));
    } else if (orderNumber) {
      // Create a basic order details object
      setOrderDetails({
        order_number: orderNumber,
        amount: parseFloat(searchParams.get('amount') || '0'),
        payment_status: 'completed'
      });
      setLoading(false);
      clearCart();
    } else if (order) {
      // Usar el parámetro 'order' que puede ser DRAFT-XXXX o ORD-XXXX
      console.log('Using order parameter:', order);
      
      // Intentar buscar la orden por order_number usando el endpoint correcto
      fetchOrderByNumber(order);
    } else {
      setError('No se encontró información de la orden');
      setTimeout(() => router.push('/'), 3000);
      setLoading(false);
    }
  }, [searchParams, router, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando el pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-xl text-gray-600">
            Tu orden ha sido procesada correctamente
          </p>
        </motion.div>

        {/* Order Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Detalles de tu Orden
            </h2>
            
            {orderDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Número de Orden</div>
                  <div className="font-semibold text-gray-900">
                    {orderDetails.order_number}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Pagado</div>
                  <div className="font-semibold text-gray-900">
                    S/ {orderDetails.amount?.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Estado del Pago</div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completado
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Fecha</div>
                  <div className="font-semibold text-gray-900">
                    {new Date().toLocaleDateString('es-PE')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Qué sigue ahora?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-pink-100 rounded-lg p-2">
                  <Package className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Preparación de tu orden</h4>
                  <p className="text-gray-600 text-sm">
                    Nuestro equipo comenzará a preparar tus flores frescas de inmediato
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Confirmación de entrega</h4>
                  <p className="text-gray-600 text-sm">
                    Te contactaremos para coordinar la fecha y hora de entrega
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 rounded-lg p-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Entrega</h4>
                  <p className="text-gray-600 text-sm">
                    Recibirás tus flores frescas en la dirección indicada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-pink-50 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Necesitas ayuda?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">WhatsApp</div>
              <div className="font-medium text-gray-900">+51 919 642 610</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Email</div>
              <div className="font-medium text-gray-900">floresydetalleslima1@gmail.com</div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 transition-colors"
          >
            Volver al Inicio
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          
          <Link
            href="/flores"
            className="inline-flex items-center justify-center px-6 py-3 border border-pink-600 text-base font-medium rounded-lg text-pink-600 bg-white hover:bg-pink-50 transition-colors"
          >
            Seguir Comprando
          </Link>
        </motion.div>

        {/* Email Confirmation Note */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            Hemos enviado un email de confirmación con todos los detalles de tu orden.
            <br />
            Si no lo encuentras, revisa tu carpeta de spam.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
