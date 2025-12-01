'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw, Phone, ArrowLeft, AlertTriangle } from 'lucide-react';

function FailedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const errorMessage = searchParams.get('error') || 'El pago no pudo ser procesado';

  const handleRetry = () => {
    if (orderNumber) {
      window.location.href = `/payment/process?order=${orderNumber}`;
    } else {
      window.location.href = '/checkout';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Pago no completado</h1>
            <p className="text-white/90">Hubo un problema con tu pago</p>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {/* Mensaje de error */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">¿Qué sucedió?</h3>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>

            {/* Número de orden si existe */}
            {orderNumber && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Número de orden</p>
                <p className="text-lg font-bold text-gray-900">{orderNumber}</p>
              </div>
            )}

            {/* Sugerencias */}
            <div className="bg-yellow-50 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-yellow-800 mb-2">Posibles soluciones:</h4>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  Verifica que tu tarjeta tenga fondos suficientes
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  Confirma que los datos de la tarjeta sean correctos
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  Si el problema persiste, contacta a tu banco
                </li>
              </ul>
            </div>

            {/* Info de contacto */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">¿Necesitas ayuda?</h3>
                <p className="text-sm text-gray-600">
                  Contáctanos al <span className="font-medium">+51 999 999 999</span>
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <RefreshCw className="w-5 h-5" />
                Intentar de nuevo
              </button>
              
              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al checkout
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Tu pedido no ha sido cobrado. Puedes intentar nuevamente.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
        <div className="animate-pulse text-red-500">Cargando...</div>
      </div>
    }>
      <FailedContent />
    </Suspense>
  );
}
