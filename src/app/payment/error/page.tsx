'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<{
    orderId?: string;
    errorCode?: string;
    errorMessage?: string;
  }>({});

  useEffect(() => {
    // Obtener parámetros de error de Izipay
    const orderId = searchParams.get('orderId') || 
                    searchParams.get('vads_order_id') || 
                    searchParams.get('order_id');
    const errorCode = searchParams.get('errorCode') || 
                     searchParams.get('vads_error_code');
    const errorMessage = searchParams.get('errorMessage') || 
                        searchParams.get('vads_error_message');

    setErrorDetails({
      orderId: orderId || undefined,
      errorCode: errorCode || undefined,
      errorMessage: errorMessage || undefined
    });
  }, [searchParams]);

  const getErrorMessage = () => {
    if (errorDetails.errorMessage) {
      return errorDetails.errorMessage;
    }

    // Mensajes específicos según códigos de error comunes
    switch (errorDetails.errorCode) {
      case 'ACQ_001':
        return 'El pago fue rechazado por tu banco. Verifica que tengas fondos suficientes o contacta a tu entidad financiera.';
      case 'PSP_999':
        return 'Error en el procesamiento del pago. Por favor, intenta nuevamente.';
      case 'INT_904':
        return 'Error de configuración del sistema. Por favor, contacta al soporte técnico.';
      case 'TIMEOUT':
        return 'El tiempo para completar el pago ha expirado. Por favor, intenta nuevamente.';
      default:
        return 'Hubo un problema procesando tu pago. Por favor, intenta nuevamente o contacta al soporte.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header de error */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
            <div className="mx-auto h-16 w-16 text-white mb-4 flex items-center justify-center">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Error en el Pago
            </h1>
            <p className="text-red-100 mt-2">
              No se pudo procesar tu transacción
            </p>
          </div>

          {/* Contenido del error */}
          <div className="px-6 py-8">
            <div className="space-y-6">
              {/* Mensaje de error */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-red-900 mb-2">
                  ¿Qué pasó?
                </h2>
                <p className="text-red-700">
                  {getErrorMessage()}
                </p>
              </div>

              {/* Información adicional si está disponible */}
              {errorDetails.orderId && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Información de la transacción:
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p>Número de orden: #{errorDetails.orderId}</p>
                    {errorDetails.errorCode && (
                      <p>Código de error: {errorDetails.errorCode}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Qué hacer ahora */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-3">
                  ¿Qué puedes hacer ahora?
                </h3>
                <div className="space-y-3 text-blue-700">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">1</span>
                    </div>
                    <p>
                      <strong>Verifica tu información:</strong> Asegúrate de que los datos de tu tarjeta sean correctos y que tengas fondos suficientes.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">2</span>
                    </div>
                    <p>
                      <strong>Intenta nuevamente:</strong> Puedes volver al carrito e intentar el proceso de compra otra vez.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-sm font-semibold">3</span>
                    </div>
                    <p>
                      <strong>Contacta al soporte:</strong> Si el problema persiste, no dudes en contactarnos para ayudarte.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/checkout"
                className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors text-center"
              >
                Intentar Nuevamente
              </Link>
              <Link
                href="/catalog"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Volver al Catálogo
              </Link>
              <Link
                href="/"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Ir al Inicio
              </Link>
            </div>

            {/* Información de contacto */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>
                ¿Necesitas ayuda? Contáctanos por WhatsApp o correo electrónico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
