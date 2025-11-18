'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorDetails, setErrorDetails] = useState<{
    message?: string;
    code?: string;
    orderId?: string;
  }>({});

  useEffect(() => {
    // Get error details from URL parameters
    const errorMessage = searchParams.get('error');
    const errorCode = searchParams.get('code');
    const orderId = searchParams.get('order_id');
    
    setErrorDetails({
      message: errorMessage || 'El pago no pudo ser procesado',
      code: errorCode || 'PAYMENT_FAILED',
      orderId: orderId || undefined
    });
  }, [searchParams]);

  const handleRetryPayment = () => {
    if (errorDetails.orderId) {
      router.push(`/checkout?order_id=${errorDetails.orderId}`);
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Error Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pago No Procesado
          </h1>
          <p className="text-xl text-gray-600">
            Hubo un problema al procesar tu pago
          </p>
        </motion.div>

        {/* Error Details Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              ¿Qué pasó?
            </h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="text-red-800 font-medium">
                    {errorDetails.message}
                  </p>
                  {errorDetails.code && (
                    <p className="text-red-600 text-sm mt-1">
                      Código de error: {errorDetails.code}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {errorDetails.orderId && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Número de Orden</div>
                <div className="font-semibold text-gray-900">
                  {errorDetails.orderId}
                </div>
              </div>
            )}
          </div>

          {/* Common Reasons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Posibles causas:
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  Fondos insuficientes en tu tarjeta
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  Datos de la tarjeta incorrectos
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  Tu banco rechazó la transacción por seguridad
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  Problemas temporales de conectividad
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Solutions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Qué puedes hacer?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Reintentar el pago</p>
                <p className="text-gray-600 text-sm">
                  Verifica los datos de tu tarjeta e intenta nuevamente
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Contactar a tu banco</p>
                <p className="text-gray-600 text-sm">
                  Pregunta si hay restricciones en tu tarjeta para compras online
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Usar otro método de pago</p>
                <p className="text-gray-600 text-sm">
                  Prueba con una tarjeta diferente o contacta con nosotros
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-pink-50 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Necesitas ayuda?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">WhatsApp</div>
              <div className="font-medium text-gray-900">+51 919 642 610</div>
              <p className="text-xs text-gray-500">Estamos aquí para ayudarte</p>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Email</div>
              <div className="font-medium text-gray-900">floresydetalleslima1@gmail.com</div>
              <p className="text-xs text-gray-500">Respuesta en 24 horas</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleRetryPayment}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700 transition-colors"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Reintentar Pago
          </button>
          
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Volver al Checkout
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Ir al Inicio
          </Link>
        </motion.div>

        {/* Help Note */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            Tu orden no ha sido procesada y no se ha realizado ningún cargo.
            <br />
            Puedes intentar el pago nuevamente cuando gustes.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
