'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Check,
  Truck,
  Gift,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Zap
} from 'lucide-react';

// Example product for direct payment (would come from URL params in real app)
const sampleProduct = {
  id: 1,
  name: 'Ramo de Rosas Rojas Premium',
  description: '24 rosas rojas premium con eucalipto y papel kraft',
  price: 180,
  discount_percentage: 10,
  final_price: 162,
  image_url: '',
};

const districts = [
  { id: 1, name: 'Miraflores', price: 15 },
  { id: 2, name: 'San Isidro', price: 15 },
  { id: 3, name: 'Surco', price: 18 },
  { id: 4, name: 'La Molina', price: 20 },
  { id: 5, name: 'San Borja', price: 15 },
  { id: 6, name: 'Barranco', price: 12 },
  { id: 7, name: 'Jesús María', price: 12 },
  { id: 8, name: 'Magdalena', price: 12 },
  { id: 9, name: 'Pueblo Libre', price: 10 },
  { id: 10, name: 'San Miguel', price: 10 },
];

export default function PagoDirectoPage() {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Sender info
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    // Recipient info
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientDistrict: '',
    recipientReference: '',
    // Delivery options
    deliveryDate: '',
    deliveryTime: '',
    isAnonymous: false,
    dedicatoryMessage: '',
    giftWrap: false,
  });

  const subtotal = sampleProduct.final_price * quantity;
  const selectedDistrict = districts.find(d => d.name === formData.recipientDistrict);
  const shippingCost = selectedDistrict?.price || 0;
  const giftWrapCost = formData.giftWrap ? 10 : 0;
  const total = subtotal + shippingCost + giftWrapCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container-wide max-w-2xl">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-gray-600 mb-6">
              Tu pedido ha sido procesado exitosamente
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600">Número de orden</p>
              <p className="text-2xl font-bold text-primary-600">#FDJ-{Date.now().toString().slice(-6)}</p>
            </div>
            <p className="text-sm text-gray-600 mb-8">
              Te hemos enviado un correo con los detalles de tu pedido a <strong>{formData.senderEmail}</strong>
            </p>
            <Link href="/" className="btn-primary inline-block">
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container-wide">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </Link>
          <div className="flex items-center gap-2 text-primary-600">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Pago Directo</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-medium">Compra rápida sin registro</p>
              <p className="text-sm text-white/80">Completa tu pedido en un solo paso, sin necesidad de crear una cuenta</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Selection */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Producto Seleccionado
                </h2>
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-pink-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{sampleProduct.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{sampleProduct.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary-600">S/ {sampleProduct.final_price}</span>
                      {sampleProduct.discount_percentage > 0 && (
                        <>
                          <span className="text-sm text-gray-400 line-through">S/ {sampleProduct.price}</span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                            -{sampleProduct.discount_percentage}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sender Info */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-semibold text-xl text-gray-800 mb-4">Tus Datos</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                    <input
                      type="text"
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <input
                      type="tel"
                      name="senderPhone"
                      value={formData.senderPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                    <input
                      type="email"
                      name="senderEmail"
                      value={formData.senderEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Recipient Info */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Datos de Entrega
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del destinatario *</label>
                    <input
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono del destinatario *</label>
                    <input
                      type="tel"
                      name="recipientPhone"
                      value={formData.recipientPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección completa *</label>
                    <input
                      type="text"
                      name="recipientAddress"
                      value={formData.recipientAddress}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                      placeholder="Calle, número, interior, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distrito *</label>
                    <select
                      name="recipientDistrict"
                      value={formData.recipientDistrict}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                      required
                    >
                      <option value="">Seleccionar distrito</option>
                      {districts.map(district => (
                        <option key={district.id} value={district.name}>
                          {district.name} - S/ {district.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                    <input
                      type="text"
                      name="recipientReference"
                      value={formData.recipientReference}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                      placeholder="Cerca de..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de entrega *</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horario *</label>
                    <select
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="8-10">8:00 AM - 10:00 AM</option>
                      <option value="10-12">10:00 AM - 12:00 PM</option>
                      <option value="12-14">12:00 PM - 2:00 PM</option>
                      <option value="14-16">2:00 PM - 4:00 PM</option>
                      <option value="16-18">4:00 PM - 6:00 PM</option>
                      <option value="18-20">6:00 PM - 8:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Gift Options */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Opciones de Regalo
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600"
                    />
                    <span>Entrega anónima (no mostrar remitente)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="giftWrap"
                      checked={formData.giftWrap}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600"
                    />
                    <span>Empaque premium (+S/ 10)</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de dedicatoria</label>
                    <textarea
                      name="dedicatoryMessage"
                      value={formData.dedicatoryMessage}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none resize-none"
                      placeholder="Escribe tu mensaje especial..."
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 sticky top-24">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Resumen del Pedido</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({quantity} items)</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span>{shippingCost > 0 ? `S/ ${shippingCost.toFixed(2)}` : 'Selecciona distrito'}</span>
                  </div>
                  {formData.giftWrap && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Empaque premium</span>
                      <span>S/ {giftWrapCost.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary-600">S/ {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !formData.recipientDistrict}
                  className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pagar S/ {total.toFixed(2)}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  Pago seguro con Izipay
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
