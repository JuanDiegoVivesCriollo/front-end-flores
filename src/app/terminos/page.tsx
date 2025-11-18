import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Flores y Detalles Lima',
  description: 'Conoce nuestros términos y condiciones de servicio para compras en línea en Flores y Detalles Lima. Políticas de entrega, devoluciones y garantías.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Términos y Condiciones de Servicio
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              Los presentes términos y condiciones aplican a los servicios y productos que oferta 
              <strong> Flores y Detalles Lima</strong> (en adelante &quot;Flores y Detalles Lima&quot;), empresa individual 
              de responsabilidad limitada constituida y vigente bajo las leyes peruanas, dedicada a 
              las actividades de floristería y arreglos florales, la misma que cuenta con todos los 
              permisos, autorizaciones, licencias, poderes y derechos requeridos para realizar sus 
              actividades y operaciones.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Datos de identificación</h2>
            <p className="text-gray-700 mb-4">
              Usted está visitando el portal{' '}
              <a href="https://floresydetalles.vercel.app/" className="text-pink-bright hover:text-pink-dark">
                https://floresydetalles.vercel.app/
              </a>{' '}
              (el &quot;Portal&quot;), titularidad de Flores y Detalles Lima.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p><strong>Denominación:</strong> Flores y Detalles Lima</p>
              <p><strong>Domicilio:</strong> Lima, Perú</p>
              <p><strong>Teléfono:</strong> +51 919 642 610</p>
              <p><strong>E-mail:</strong> floresydetalleslima1@gmail.com</p>
              <p><strong>WhatsApp:</strong> +51 919 642 610</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Acceso y aceptación del cliente</h2>
            <p className="text-gray-700 mb-4">
              Estos Términos y Condiciones regulan el acceso y utilización del Portal por parte del 
              cliente, así como la relación entre Flores y Detalles Lima y el cliente quien adquiere su 
              condición de tal por la mera navegación y/o utilización del portal.
            </p>
            <p className="text-gray-700 mb-6">
              El acceso y utilización del Portal por parte del cliente tiene carácter libre y gratuito, 
              asimismo, el acceso y utilización por parte del cliente del Portal implica la aceptación 
              sin reservas de todas las disposiciones incluidas en los presentes Términos y Condiciones.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Modificación de los Términos y Condiciones</h2>
            <p className="text-gray-700 mb-6">
              Flores y Detalles Lima se reserva expresamente el derecho a modificar, actualizar o ampliar 
              en cualquier momento los presentes Términos y Condiciones. Cualquier modificación será 
              inmediatamente publicada siendo responsabilidad del cliente revisar los términos vigentes.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Reserva y Aceptación del Pedido</h2>
            <p className="text-gray-700 mb-4">
              A través del Portal de Flores y Detalles Lima se realizan ofertas de productos y servicios 
              florales. La aceptación de las transacciones se dan bajo las siguientes condiciones:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Validación del medio de pago por la entidad bancaria (Izipay)</li>
              <li>Verificación del stock disponible del producto solicitado</li>
              <li>Coincidencia entre los datos registrados por el cliente con los datos de la transacción</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Política de Envíos</h2>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
              <p className="text-green-800 font-semibold mb-2">
                ✅ <strong>Envío GRATUITO</strong> solo en Canto Rey
              </p>
              <p className="text-gray-700">
                📞 Para otros distritos de Lima y Callao, las <strong>tarifas de envío se consultan por WhatsApp</strong>
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Devoluciones y Reembolsos</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <p className="text-yellow-800 font-semibold mb-2">⚠️ Política importante:</p>
              <p className="text-gray-700">
                No se aceptan devoluciones por desistimiento debido a la naturaleza perecedera 
                de las flores frescas. Los reclamos deben realizarse dentro de las 
                <strong> 12 horas posteriores</strong> a la recepción del producto.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Garantía de Frescura</h2>
            <p className="text-gray-700 mb-6">
              Todos nuestros productos cuentan con garantía de frescura. En caso de daños imputables 
              a Flores y Detalles Lima durante la elaboración, transporte o entrega, realizaremos la 
              reposición gratuita dentro de las 12 horas siguientes a la coordinación con el cliente.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Campañas Especiales</h2>
            <p className="text-gray-700 mb-6">
              Durante fechas especiales como San Valentín, Día de la Madre, Navidad, etc., 
              se priorizarán los productos del catálogo específico. Debido a la alta demanda, 
              pueden presentarse demoras que no constituyen afectación al servicio.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Contacto</h2>
            <div className="bg-pink-50 border border-pink-200 p-6 rounded-lg mb-8">
              <h3 className="font-bold text-lg mb-4">Canales de comunicación oficiales:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-800">📧 Email:</p>
                  <p className="text-gray-700">floresydetalleslima1@gmail.com</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">📱 WhatsApp:</p>
                  <p className="text-gray-700">+51 919 642 610</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">📞 Teléfono:</p>
                  <p className="text-gray-700">+51 919 642 610</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">📍 Ubicación:</p>
                  <p className="text-gray-700">Lima, Perú</p>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-600 text-sm mt-12 pt-8 border-t border-gray-200">
              <p className="mb-2">
                <strong>Fecha de última actualización:</strong> Diciembre de 2024
              </p>
              <p className="font-semibold">
                Flores y Detalles Lima - Más de 20 años creando momentos especiales
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
