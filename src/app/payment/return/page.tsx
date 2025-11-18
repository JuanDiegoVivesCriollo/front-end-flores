'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface OrderData {
  orderId: number;
  orderNumber: string;
  total: number;
  paymentId: number;
}

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    // Obtener parámetros de la URL que vienen de Izipay
    const krAnswer = searchParams.get('kr-answer');
    const krHash = searchParams.get('kr-hash');
    
    if (krAnswer && krHash) {
      try {
        const answerData = JSON.parse(decodeURIComponent(krAnswer));
        console.log('Payment result from Izipay:', answerData);
        
        const orderStatus = answerData.orderStatus;
        
        // Recuperar datos del localStorage
        const pendingOrder = localStorage.getItem('checkout-pending');
        if (pendingOrder) {
          const orderInfo = JSON.parse(pendingOrder) as OrderData;
          setOrderData(orderInfo);
        }
        
        // Determinar el estado basado en la respuesta de Izipay
        switch (orderStatus) {
          case 'PAID':
            setPaymentStatus('success');
            // Limpiar datos del carrito y checkout
            localStorage.removeItem('checkout-pending');
            localStorage.removeItem('checkout-cart');
            localStorage.removeItem('checkout-total');
            break;
          case 'CANCELLED':
          case 'ABANDONED':
            setPaymentStatus('failed');
            break;
          case 'REFUSED':
            setPaymentStatus('failed');
            break;
          default:
            setPaymentStatus('pending');
        }
        
      } catch (error) {
        console.error('Error parsing payment result:', error);
        setPaymentStatus('failed');
      }
    } else {
      // Si no hay parámetros de Izipay, revisar si hay datos locales
      const pendingOrder = localStorage.getItem('checkout-pending');
      if (pendingOrder) {
        const orderInfo = JSON.parse(pendingOrder) as OrderData;
        setOrderData(orderInfo);
        setPaymentStatus('pending');
      } else {
        setPaymentStatus('failed');
      }
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-600" />;
      default:
        return <div className="animate-spin w-16 h-16 border-4 border-pink-bright border-t-transparent rounded-full" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return {
          title: '¡Pago Exitoso!',
          message: 'Tu pedido ha sido confirmado y será procesado pronto.',
          buttonText: 'Ver mis pedidos',
          buttonLink: '/mi-cuenta/pedidos',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'failed':
        return {
          title: 'Pago Fallido',
          message: 'Hubo un problema con tu pago. Puedes intentar nuevamente.',
          buttonText: 'Intentar nuevamente',
          buttonLink: '/carrito',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'pending':
        return {
          title: 'Pago Pendiente',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
          buttonText: 'Ver estado del pedido',
          buttonLink: '/mi-cuenta/pedidos',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      default:
        return {
          title: 'Procesando...',
          message: 'Estamos verificando el estado de tu pago.',
          buttonText: '',
          buttonLink: '',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className={`bg-white rounded-xl shadow-xl p-8 text-center ${statusInfo.borderColor} border-2`}>
          <div className={`${statusInfo.bgColor} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6`}>
            {getStatusIcon()}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {statusInfo.title}
          </h1>

          <p className="text-gray-600 mb-6">
            {statusInfo.message}
          </p>

          {orderData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Detalles del pedido:</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Número:</span> {orderData.orderNumber}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Total:</span> S/. {orderData.total?.toFixed(2)}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {statusInfo.buttonText && statusInfo.buttonLink && (
              <Link
                href={statusInfo.buttonLink}
                className="w-full bg-pink-bright hover:bg-pink-dark text-white font-bold py-3 px-4 rounded-lg transition-colors block"
              >
                {statusInfo.buttonText}
              </Link>
            )}

            <Link
              href="/"
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Ir al inicio
            </Link>
          </div>
        </div>

        {paymentStatus === 'loading' && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Verificando el estado de tu pago...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
