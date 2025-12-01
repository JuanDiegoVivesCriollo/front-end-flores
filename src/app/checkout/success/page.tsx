'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Phone, Home, ArrowRight, Mail, XCircle, Loader2 } from 'lucide-react';
import { sendOrderConfirmationEmails, formatPaymentDate, type OrderEmailData } from '@/services/emailService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface EmailStatus {
  customerEmailSent: boolean;
  vendorEmailSent: boolean;
  emailsAttempted: boolean;
  isLoading: boolean;
}

interface OrderData {
  order_number: string;
  total: number | string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document?: string;
  shipping_address?: string;
  shipping_district?: string;
  delivery_date?: string;
  delivery_time?: string;
  notes?: string;
  shipping_type?: string;
  payment_method?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const paymentMethod = searchParams.get('method') || 'card';
  
  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    customerEmailSent: false,
    vendorEmailSent: false,
    emailsAttempted: false,
    isLoading: true
  });
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    const processOrder = async () => {
      if (!orderNumber) {
        setEmailStatus(prev => ({ ...prev, isLoading: false, emailsAttempted: true }));
        return;
      }

      try {
        // 1. Intentar obtener datos del localStorage (guardados durante checkout)
        const checkoutData = localStorage.getItem('checkout-order-data');
        let orderInfo: OrderData | null = null;

        if (checkoutData) {
          try {
            orderInfo = JSON.parse(checkoutData);
            console.log('📦 Datos del pedido obtenidos del localStorage:', orderInfo);
          } catch (e) {
            console.warn('⚠️ Error parseando datos del localStorage:', e);
          }
        }

        // 2. Si no hay datos en localStorage, intentar obtenerlos del API
        if (!orderInfo) {
          try {
            const response = await fetch(`${API_URL}/orders/direct/${orderNumber}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                orderInfo = data.data;
                console.log('📦 Datos del pedido obtenidos del API:', orderInfo);
              }
            }
          } catch (e) {
            console.warn('⚠️ Error obteniendo datos del API:', e);
          }
        }

        if (orderInfo) {
          setOrderData(orderInfo);
          
          // 3. Enviar correos de confirmación
          await sendConfirmationEmails(orderInfo, paymentMethod);
        } else {
          console.warn('⚠️ No se encontraron datos del pedido');
          setEmailStatus(prev => ({ ...prev, isLoading: false, emailsAttempted: true }));
        }

        // 4. Limpiar localStorage
        localStorage.removeItem('checkout-order-data');
        localStorage.removeItem('checkout-pending');
        localStorage.removeItem('cart');

      } catch (error) {
        console.error('❌ Error procesando orden:', error);
        setEmailStatus(prev => ({ ...prev, isLoading: false, emailsAttempted: true }));
      }
    };

    processOrder();
  }, [orderNumber, paymentMethod]);

  const sendConfirmationEmails = async (order: OrderData, method: string) => {
    try {
      console.log('📧 Preparando envío de correos...');

      // Preparar items del pedido
      const items = order.items || [];
      
      // Mapear método de pago
      const paymentMethodLabel = {
        'card': 'Tarjeta de crédito/débito',
        'yape': 'Yape',
        'plin': 'Plin'
      }[method] || method;

      const emailData: OrderEmailData = {
        orderId: order.order_number,
        customerName: order.customer_name || 'Cliente',
        customerEmail: order.customer_email || '',
        customerPhone: order.customer_phone || '',
        customerDNI: order.customer_document || '',
        customerAddress: order.shipping_address || '',
        customerCity: 'Lima',
        items: items,
        total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
        paymentMethod: paymentMethodLabel,
        paymentDate: formatPaymentDate(new Date()),
        deliveryAddress: order.shipping_address || 'No especificada',
        deliveryDate: order.delivery_date || '',
        deliveryTimeSlot: order.delivery_time || '',
        specialInstructions: order.notes || '',
        shippingType: order.shipping_type || 'delivery',
        district: order.shipping_district || 'Lima',
      };

      // Verificar que tenemos email del cliente
      if (!emailData.customerEmail) {
        console.warn('⚠️ No se encontró email del cliente, saltando envío de correos');
        setEmailStatus({
          customerEmailSent: false,
          vendorEmailSent: false,
          emailsAttempted: true,
          isLoading: false
        });
        return;
      }

      console.log('📧 Enviando correos con datos:', emailData);

      // Enviar correos
      const result = await sendOrderConfirmationEmails(emailData);

      setEmailStatus({
        customerEmailSent: result.customerEmailSent,
        vendorEmailSent: result.vendorEmailSent,
        emailsAttempted: true,
        isLoading: false
      });

      console.log('📧 Resultado envío de correos:', result);

    } catch (error) {
      console.error('❌ Error enviando correos:', error);
      setEmailStatus({
        customerEmailSent: false,
        vendorEmailSent: false,
        emailsAttempted: true,
        isLoading: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">¡Pago Exitoso!</h1>
            <p className="text-white/90">Tu pedido ha sido confirmado</p>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {/* Número de orden */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-center">
              <p className="text-sm text-gray-500 mb-1">Número de pedido</p>
              <p className="text-2xl font-bold text-gray-900 tracking-wider">
                {orderNumber || 'N/A'}
              </p>
              {orderData && (
                <p className="text-sm text-gray-500 mt-2">
                  Total: S/ {typeof orderData.total === 'string' ? parseFloat(orderData.total).toFixed(2) : orderData.total.toFixed(2)}
                </p>
              )}
            </div>

            {/* Estado de emails */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Notificaciones por correo</span>
              </div>
              
              {emailStatus.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando correos de confirmación...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Email al cliente */}
                  <div className="flex items-center gap-2 text-sm">
                    {emailStatus.customerEmailSent ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-700">Confirmación enviada a tu correo</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-gray-500">No se pudo enviar al cliente</span>
                      </>
                    )}
                  </div>
                  
                  {/* Email al vendedor */}
                  <div className="flex items-center gap-2 text-sm">
                    {emailStatus.vendorEmailSent ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-700">Notificación enviada a la tienda</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-gray-500">No se pudo notificar a la tienda</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Info del pedido */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Procesando tu pedido</h3>
                  <p className="text-sm text-gray-600">
                    {emailStatus.customerEmailSent 
                      ? 'Revisa tu correo para ver los detalles de tu pedido.'
                      : 'Recibirás una confirmación por WhatsApp con los detalles de tu entrega.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">¿Tienes alguna pregunta?</h3>
                  <p className="text-sm text-gray-600">
                    Contáctanos al <span className="font-medium">+51 999 999 999</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Home className="w-5 h-5" />
                Volver a la tienda
              </Link>
              
              <Link
                href="/ramos"
                className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
              >
                Ver más productos
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          ¡Gracias por comprar en Flores D&apos;Jazmin! 💐
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-pulse text-green-500">Cargando...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
