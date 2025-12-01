'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Minus,
  Truck,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Share2
} from 'lucide-react';
import { useCart, CartFlower } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import PaymentMethods from '@/components/PaymentMethods';
import WhatsAppChatPreview from '@/components/WhatsAppChatPreview';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Helper function to get correct image URL
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/img/placeholder-flower.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;
  return `${API_BASE.replace('/api/v1', '')}/storage/${imagePath}`;
};

export interface Product {
  id: number;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  image?: string;
  image_url?: string;
  images?: string[];
  category?: string | { name: string; slug?: string };
  color?: string;
  occasion?: string;
  rating?: number;
  average_rating?: number;
  reviews?: number;
  reviews_count?: number;
  description?: string;
  short_description?: string;
  new?: boolean;
  is_new?: boolean;
  popular?: boolean;
  is_featured?: boolean;
  discount?: number;
  discount_percentage?: number;
  sku?: string;
  stock?: number;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  allProducts?: Product[];
}

export default function ProductDetailModal({ isOpen, onClose, product, allProducts = [] }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showWhatsApp, setShowWhatsApp] = useState(true);
  const { addFlower, openCart } = useCart();
  const { showCartNotification } = useNotification();

  if (!isOpen || !product) return null;

  // Get product data - Ensure all values are numbers
  const discount = Number(product.discount || product.discount_percentage || 0);
  const originalPrice = Number(product.originalPrice || product.original_price || product.price);
  const basePrice = Number(product.price);
  const finalPrice = discount > 0 ? basePrice - (basePrice * discount / 100) : basePrice;
  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || '';
  const isNew = product.new || product.is_new;
  const isPopular = product.popular || product.is_featured;
  const rating = Number(product.rating || product.average_rating || 0);
  const reviewsCount = product.reviews || product.reviews_count || 0;

  // Get images
  const mainImage = product.image || product.image_url || (product.images?.[0]);
  const productImages = product.images?.length 
    ? product.images.map(img => getImageUrl(img))
    : [getImageUrl(mainImage)];

  const handleAddToCart = () => {
    const cartFlower: CartFlower = {
      id: product.id,
      name: product.name,
      price: basePrice,
      image_url: getImageUrl(mainImage),
      quantity: quantity,
      discount_percentage: discount,
      final_price: Number(finalPrice.toFixed(2)),
    };
    
    for (let i = 0; i < quantity; i++) {
      addFlower({...cartFlower, quantity: 1});
    }
    
    // Mostrar notificación y después abrir el carrito con animación
    showCartNotification(product.name, () => {
      onClose(); // Cerrar modal del producto
      openCart(); // Abrir carrito con animación
    });
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `¡Mira este hermoso arreglo! ${product.name} - S/ ${finalPrice.toFixed(2)}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  // Prevent body scroll when modal is open
  if (typeof window !== 'undefined') {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  return (
    <>
      {/* Modal Container */}
      <div className="fixed inset-0 z-[9000] overflow-hidden">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />

        {/* Modal - Full Screen */}
        <div
          className="fixed inset-4 md:inset-8 lg:inset-12 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Container */}
          <div className="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden">
            {/* Left Side - Image */}
            <div className="md:w-1/2 h-[50vh] md:h-full flex items-center justify-center p-4 md:p-6 relative">
              {/* Fondo de flores */}
              <div 
                className="absolute inset-0" 
                style={{ 
                  backgroundImage: 'url(/img/fondodeflores.png)', 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center'
                }}
              />
              
              <div className="relative w-full h-full max-w-2xl z-10 flex items-center justify-center">
                <Image
                  src={productImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />

                {/* Navegación de imágenes */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg z-20"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg z-20"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Indicadores */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(index); }}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === selectedImage ? 'bg-pink-600' : 'bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                  {isNew && (
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Nuevo
                    </span>
                  )}
                  {isPopular && (
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Popular
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="bg-gradient-to-r from-pink-500 to-rose-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      -{discount}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="md:w-1/2 md:h-full overflow-y-auto bg-white">
              <div className="p-6 md:p-8 lg:p-10">
                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                {rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(rating) ? 'fill-current' : 'fill-gray-200'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({reviewsCount} reseñas)</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-pink-600">
                    S/ {finalPrice.toFixed(2)}
                  </span>
                  {discount > 0 && originalPrice > finalPrice && (
                    <span className="text-xl text-gray-400 line-through">
                      S/ {originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-600 font-medium">
                    {product.stock && product.stock > 0 ? `${product.stock} en Stock` : 'En Stock'}
                  </span>
                </div>

                {/* Quantity and Buttons */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Contador de cantidad */}
                    <div className="flex items-center justify-center border border-gray-300 rounded-lg flex-shrink-0">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-6 py-2 font-semibold min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Botón Agregar al Carrito */}
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Agregar al Carrito</span>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex flex-wrap gap-4 text-sm">
                    {product.sku && (
                      <div>
                        <span className="text-gray-600">SKU: </span>
                        <span className="font-medium">{product.sku}</span>
                      </div>
                    )}
                    {categoryName && (
                      <div>
                        <span className="text-gray-600">Categoría: </span>
                        <span className="font-medium">{categoryName}</span>
                      </div>
                    )}
                    {product.occasion && (
                      <div>
                        <span className="text-gray-600">Ocasión: </span>
                        <span className="font-medium">{product.occasion}</span>
                      </div>
                    )}
                    {product.color && (
                      <div>
                        <span className="text-gray-600">Color: </span>
                        <span className="font-medium">{product.color}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {(product.description || product.short_description) && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3 text-lg">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description || product.short_description}
                    </p>
                  </div>
                )}

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-lg">
                    <Truck className="w-5 h-5" />
                    <span className="text-sm">Envío el mismo día</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-600 bg-blue-50 p-3 rounded-lg">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm">Garantía de frescura</span>
                  </div>
                  <div className="flex items-center gap-3 text-purple-600 bg-purple-50 p-3 rounded-lg">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">Atención 24/7</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <PaymentMethods variant="modal" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Chat Preview - Fuera del modal para tener z-index superior */}
      {showWhatsApp && (
        <WhatsAppChatPreview 
          productName={product.name}
          productPrice={finalPrice}
          productImage={getImageUrl(mainImage)}
          onClose={() => setShowWhatsApp(false)}
        />
      )}
    </>
  );
}
