'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { sendOrderConfirmationEmails, formatPaymentDate, type OrderEmailData } from '@/services/emailService';

interface OrderDetails {
  order_number: string;
  total: string | number;
  status: string;
  payment_status: string;
  created_at: string;
  customer_info?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  delivery_address?: string;
  delivery_date?: string;
  delivery_time_slot?: string;
  special_instructions?: string;
  shipping_type?: string;
  shipping_address?: object;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface EmailStatus {
  customerEmailSent: boolean;
  vendorEmailSent: boolean;
  emailsAttempted: boolean;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(''); // Para mostrar en el UI
  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    customerEmailSent: false,
    vendorEmailSent: false,
    emailsAttempted: false
  });

  // Obtener parámetros de la URL (compatibles con Izipay)
  const orderId = searchParams.get('order') ||           // PARÁMETRO CORRECTO desde payment/process
                  searchParams.get('orderId') || 
                  searchParams.get('vads_order_id') || 
                  searchParams.get('order_id');
  const amount = searchParams.get('amount') || searchParams.get('vads_amount');
  const transactionId = searchParams.get('transactionId') || searchParams.get('vads_trans_id');
  const paymentStatus = searchParams.get('status') || searchParams.get('vads_result');

  // Función para enviar correos de confirmación
  const sendConfirmationEmails = async (orderData: OrderDetails) => {
    try {
      console.log('📧 Iniciando envío de correos de confirmación...');
      console.log('📋 Datos del pedido recibidos:', orderData);
      console.log('👤 Customer info completa:', orderData.customer_info);
      
      // Función helper para extraer string de forma segura
      const getString = (value: unknown): string => typeof value === 'string' ? value : '';
      
      // Extraer email del cliente de diferentes posibles ubicaciones
      let customerEmail = '';
      let customerName = '';
      let customerPhone = '';
      let customerDNI = '';
      let customerAddress = '';
      let customerCity = '';
      
      if (orderData.customer_info) {
        let custInfo: Record<string, unknown>;
        
        // Si customer_info es un string JSON, parsearlo
        if (typeof orderData.customer_info === 'string') {
          try {
            custInfo = JSON.parse(orderData.customer_info);
            console.log('🔧 Customer info parseado desde JSON string:', custInfo);
          } catch (e) {
            console.error('❌ Error parseando customer_info JSON:', e);
            custInfo = {};
          }
        } else {
          // Si ya es un objeto, usarlo directamente
          custInfo = orderData.customer_info as Record<string, unknown>;
        }
        
        // CORRECCIÓN: usar los nombres exactos que llegan del backend
        customerEmail = getString(custInfo.email); // ✅ Correcto: "email" está en el JSON
        
        // Intentar diferentes formatos de nombre
        customerName = `${getString(custInfo.firstName)} ${getString(custInfo.lastName)}`.trim();
        
        // Si no hay nombre formateado, intentar nombre completo
        if (!customerName) {
          customerName = getString(custInfo.name) || getString(custInfo.customer_name) || 'Cliente';
        }
        
        // CORRECCIÓN: Buscar en ambos campos phoneNumber y phone
        customerPhone = getString(custInfo.phoneNumber) || getString(custInfo.phone) || 'No proporcionado';
        
        // CORRECCIÓN: Buscar DNI en identityCode (que es como se envía desde checkout)
        customerDNI = getString(custInfo.identityCode) || 'No proporcionado';
        
        // CORRECCIÓN: Buscar dirección en address
        customerAddress = getString(custInfo.address) || 'No especificada';
        
        // CORRECCIÓN: Buscar ciudad en city
        customerCity = getString(custInfo.city) || 'No especificada';
      }
      
      console.log('🔍 Datos extraídos para email:', {
        customerEmail,
        customerName,
        customerPhone,
        customerDNI,
        customerAddress,
        customerCity,
        shippingType: orderData.shipping_type,
        shippingTypeOriginal: orderData.shipping_type,
        shippingTypeType: typeof orderData.shipping_type
      });
      
      // Extraer dirección de entrega y coordenadas del shipping_address
      let deliveryAddress = 'No especificada';
      let deliveryCoordinates: { lat: number; lng: number } | null = null;
      if (orderData.shipping_address) {
        let shippingAddr: Record<string, unknown>;
        
        // Si shipping_address es un string JSON, parsearlo
        if (typeof orderData.shipping_address === 'string') {
          try {
            shippingAddr = JSON.parse(orderData.shipping_address);
          } catch (e) {
            console.error('❌ Error parseando shipping_address JSON:', e);
            shippingAddr = {};
          }
        } else {
          // Si ya es un objeto, usarlo directamente
          shippingAddr = orderData.shipping_address as Record<string, unknown>;
        }
        
        // Extraer la dirección completa
        const addressFromShipping = getString(shippingAddr.address);
        if (addressFromShipping && addressFromShipping !== 'Recojo en tienda') {
          deliveryAddress = addressFromShipping;
          setDeliveryAddress(addressFromShipping); // Actualizar el estado para el UI
        }

        // Extraer coordenadas si existen
        if (shippingAddr.coordinates && typeof shippingAddr.coordinates === 'object') {
          const coords = shippingAddr.coordinates as Record<string, unknown>;
          const lat = typeof coords.lat === 'number' ? coords.lat : null;
          const lng = typeof coords.lng === 'number' ? coords.lng : null;
          
          if (lat !== null && lng !== null) {
            deliveryCoordinates = { lat, lng };
          }
        }
      }
      
      console.log('🔍 DEBUG shipping_address y delivery_address:', {
        shipping_address: orderData.shipping_address,
        delivery_address_extracted: deliveryAddress,
        delivery_coordinates: deliveryCoordinates,
        delivery_address_original: orderData.delivery_address,
        delivery_date_original: orderData.delivery_date,
        customer_info_complete: orderData.customer_info
      });

      // Extraer fecha de entrega - buscar en múltiples ubicaciones
      let deliveryDate = 'Por confirmar';
      
      // 1. Intentar desde delivery_date directo
      if (orderData.delivery_date) {
        deliveryDate = orderData.delivery_date;
      }
      // 2. Si no hay, intentar extraer desde customer_info
      else if (orderData.customer_info) {
        let custInfo: Record<string, unknown>;
        
        if (typeof orderData.customer_info === 'string') {
          try {
            custInfo = JSON.parse(orderData.customer_info);
          } catch {
            custInfo = {};
          }
        } else {
          custInfo = orderData.customer_info as Record<string, unknown>;
        }
        
        // Buscar deliveryDate en customer_info
        const deliveryDateFromCustomer = getString(custInfo.deliveryDate);
        if (deliveryDateFromCustomer) {
          deliveryDate = deliveryDateFromCustomer;
        }
      }
      
      console.log('🔍 DEBUG delivery_date extraction:', {
        delivery_date_from_order: orderData.delivery_date,
        delivery_date_final: deliveryDate,
        customer_info_parsed: typeof orderData.customer_info === 'string' ? 'parsed as JSON' : 'direct object'
      });

      // Extraer horario de entrega
      let deliveryTimeSlot = 'Por confirmar';
      
      // 1. Intentar desde delivery_time_slot directo
      if (orderData.delivery_time_slot) {
        deliveryTimeSlot = orderData.delivery_time_slot;
      }
      // 2. Si no hay, intentar extraer desde customer_info
      else if (orderData.customer_info) {
        let custInfo: Record<string, unknown>;
        
        if (typeof orderData.customer_info === 'string') {
          try {
            custInfo = JSON.parse(orderData.customer_info);
          } catch {
            custInfo = {};
          }
        } else {
          custInfo = orderData.customer_info as Record<string, unknown>;
        }
        
        // Buscar deliveryTimeSlot en customer_info
        const deliveryTimeSlotFromCustomer = getString(custInfo.deliveryTimeSlot);
        if (deliveryTimeSlotFromCustomer) {
          deliveryTimeSlot = deliveryTimeSlotFromCustomer;
        }
      }

      console.log('🔍 DEBUG delivery_time_slot extraction:', {
        delivery_time_slot_from_order: orderData.delivery_time_slot,
        delivery_time_slot_final: deliveryTimeSlot
      });

      // Extraer notas de dedicatoria/instrucciones especiales
      let specialInstructions = 'Ninguna';
      
      // 1. Buscar en special_instructions directamente
      if (orderData.special_instructions) {
        specialInstructions = getString(orderData.special_instructions);
      }
      // 2. Si no hay, buscar en customer_info.notes
      else if (orderData.customer_info) {
        let custInfo: Record<string, unknown>;
        
        if (typeof orderData.customer_info === 'string') {
          try {
            custInfo = JSON.parse(orderData.customer_info);
          } catch {
            custInfo = {};
          }
        } else {
          custInfo = orderData.customer_info as Record<string, unknown>;
        }
        
        // Buscar notes en customer_info (aquí es donde se guardan las notas del checkout)
        const notesFromCustomer = getString(custInfo.notes);
        if (notesFromCustomer) {
          specialInstructions = notesFromCustomer;
        }
      }

      console.log('🔍 DEBUG special instructions extraction:', {
        special_instructions_direct: orderData.special_instructions,
        notes_from_customer_info: specialInstructions,
        final_instructions: specialInstructions
      });

      // Preparar datos para el correo
      const emailData: OrderEmailData = {
        orderId: orderData.order_number,
        customerName: customerName || 'Cliente',
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerDNI: customerDNI,
        customerAddress: customerAddress,
        customerCity: customerCity,
        items: orderData.items || [],
        total: typeof orderData.total === 'string' ? parseFloat(orderData.total) : orderData.total,
        paymentDate: formatPaymentDate(new Date(orderData.created_at)),
        deliveryAddress: deliveryAddress, // ✅ Usar la dirección extraída de shipping_address
        deliveryDate: deliveryDate, // ✅ Usar la fecha extraída
        deliveryTimeSlot: deliveryTimeSlot, // ✅ Usar el horario extraído
        specialInstructions: specialInstructions, // ✅ Ahora incluye las notas del checkout
        shippingType: orderData.shipping_type
      };

      // Solo enviar si tenemos email del cliente
      if (!emailData.customerEmail) {
        console.warn('⚠️ No se encontró email del cliente, no se pueden enviar correos');
        setEmailStatus(prev => ({ ...prev, emailsAttempted: true }));
        return;
      }

      // Enviar correos
      const result = await sendOrderConfirmationEmails(emailData);
      
      setEmailStatus({
        customerEmailSent: result.customerEmailSent,
        vendorEmailSent: result.vendorEmailSent,
        emailsAttempted: true
      });

      console.log('📧 Resultado final del envío de correos:', result);
    } catch (error) {
      console.error('❌ Error en el envío de correos:', error);
      setEmailStatus(prev => ({ ...prev, emailsAttempted: true }));
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      console.log('🔍 PaymentSuccess: Starting order details fetch', {
        orderId,
        searchParams: Object.fromEntries(searchParams.entries()),
        url: `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`
      });

      if (!orderId) {
        console.error('❌ PaymentSuccess: No orderId found in URL parameters');
        setError('No se encontró información de la orden');
        setLoading(false);
        return;
      }

      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`;
        console.log('🌐 PaymentSuccess: Fetching from URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 PaymentSuccess: Response received', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ PaymentSuccess: Response data:', data);
          
          if (data.success) {
            console.log('🔍 PaymentSuccess: Order details received:', data.data);
            console.log('👤 PaymentSuccess: Customer info structure:', data.data.customer_info);
            console.log('📧 PaymentSuccess: Customer email found:', data.data.customer_info?.email);
            
            setOrderDetails(data.data);
            
            // 📧 Enviar correos de confirmación después de obtener los detalles
            console.log('🎉 Pedido confirmado, enviando correos de confirmación...');
            await sendConfirmationEmails(data.data);
          } else {
            console.error('❌ PaymentSuccess: API returned success=false', data);
            setError('No se pudo obtener información de la orden');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ PaymentSuccess: API request failed', {
            status: response.status,
            statusText: response.statusText,
            errorText
          });
          setError('Error al consultar el estado de la orden');
        }
      } catch (err) {
        console.error('❌ PaymentSuccess: Connection error:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              Verificando el estado de tu pago...
            </h2>
            <p className="text-gray-600 mt-2">
              Por favor espera mientras confirmamos tu transacción.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              Error al verificar el pago
            </h2>
            <p className="text-gray-600 mt-2 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Link href="/flores" className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors inline-block text-center">
                Volver al catálogo
              </Link>
              <Link href="/" className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block text-center">
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header de éxito */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
            <div className="mx-auto h-16 w-16 text-white mb-4 flex items-center justify-center">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">
              ¡Pago Exitoso!
            </h1>
            <p className="text-green-100 mt-2">
              Tu pedido ha sido procesado correctamente
            </p>
          </div>

          {/* Detalles de la orden */}
          <div className="px-6 py-8">
            {orderDetails && (
              <div className="space-y-6">
                {/* Información del pedido */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Detalles del Pedido
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Número de Orden
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        #{orderDetails.order_number}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Total Pagado
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        S/ {parseFloat(String(orderDetails.total)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estado del Pedido
                      </label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {orderDetails.status === 'confirmed' ? 'Confirmado' : orderDetails.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estado del Pago
                      </label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {orderDetails.payment_status === 'completed' ? 'Completado' : orderDetails.payment_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estado del envío de correos */}
                {emailStatus.emailsAttempted && (
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Estado de Notificaciones
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          emailStatus.customerEmailSent ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {emailStatus.customerEmailSent ? (
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${emailStatus.customerEmailSent ? 'text-green-700' : 'text-red-700'}`}>
                          Correo de confirmación al cliente: {emailStatus.customerEmailSent ? 'Enviado' : 'No enviado'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          emailStatus.vendorEmailSent ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {emailStatus.vendorEmailSent ? (
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${emailStatus.vendorEmailSent ? 'text-green-700' : 'text-red-700'}`}>
                          Notificación al vendedor: {emailStatus.vendorEmailSent ? 'Enviada' : 'No enviada'}
                        </span>
                      </div>
                      {(!emailStatus.customerEmailSent || !emailStatus.vendorEmailSent) && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Nota:</strong> Los correos no se enviaron porque la configuración de EmailJS no está completa. 
                            Una vez configurado, los correos se enviarán automáticamente.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Información adicional */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    ¿Qué sigue ahora?
                  </h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-pink-600 text-sm font-semibold">1</span>
                      </div>
                      <p>
                        <strong>Confirmación por correo:</strong> Recibirás un correo electrónico confirmando tu pedido y pago.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-pink-600 text-sm font-semibold">2</span>
                      </div>
                      <p>
                        <strong>Preparación:</strong> Comenzaremos a preparar tu pedido inmediatamente.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-pink-600 text-sm font-semibold">3</span>
                      </div>
                      <div>
                        <p>
                          <strong>Entrega:</strong> Te contactaremos para coordinar la entrega de tus flores.
                        </p>
                        {deliveryAddress && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Dirección de entrega:</strong> {deliveryAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parámetros de la transacción (solo para debug en desarrollo) */}
                {process.env.NODE_ENV === 'development' && (orderId || transactionId) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Información de la transacción:
                    </h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      {orderId && <p>Order ID: {orderId}</p>}
                      {transactionId && <p>Transaction ID: {transactionId}</p>}
                      {paymentStatus && <p>Payment Status: {paymentStatus}</p>}
                      {amount && <p>Amount: {amount}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/flores"
                className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors text-center flex items-center justify-center space-x-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <span>Seguir Comprando</span>
              </Link>
              <Link
                href="/"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center flex items-center justify-center space-x-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span>Ir al Inicio</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}