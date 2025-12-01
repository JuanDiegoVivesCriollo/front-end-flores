'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { useCart, CartComplement } from '@/context/CartContext';
import LoadingOverlay from './LoadingOverlay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Helper to get full image URL
const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}/storage${cleanPath}`;
};

interface Complement {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  image?: string;
  images?: string[];
  type: string;
  is_active: boolean;
}

export default function ShoppingCartSidebar() {
  const router = useRouter();
  const { 
    isCartOpen, 
    closeCart, 
    flowers, 
    complements, 
    breakfasts,
    updateFlowerQuantity,
    updateComplementQuantity,
    updateBreakfastQuantity,
    removeFlower,
    removeComplement,
    removeBreakfast,
    addComplement,
    getItemCount,
    getSubtotal,
    clearCart
  } = useCart();

  const [showComplements, setShowComplements] = useState(false);
  const [availableComplements, setAvailableComplements] = useState<Complement[]>([]);
  const [loadingComplements, setLoadingComplements] = useState(false);
  const [navigatingToCheckout, setNavigatingToCheckout] = useState(false);
  const complementsRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  // Fetch complements when section opens - always refresh to get latest data
  useEffect(() => {
    if (showComplements) {
      fetchComplements();
    }
  }, [showComplements]);

  const fetchComplements = async () => {
    setLoadingComplements(true);
    try {
      const response = await fetch(`${API_URL}/catalog/complements`, {
        cache: 'no-store'
      });
      const data = await response.json();
      if (data.success) {
        setAvailableComplements(data.data);
      }
    } catch (error) {
      console.error('Error fetching complements:', error);
    } finally {
      setLoadingComplements(false);
    }
  };

  const handleAddComplement = (complement: Complement) => {
    const imageUrl = complement.images?.[0] || complement.image || '';
    const cartComplement: CartComplement = {
      id: complement.id,
      name: complement.name,
      price: Number(complement.price),
      image_url: getImageUrl(imageUrl),
      quantity: 1
    };
    addComplement(cartComplement);
  };

  const scrollComplements = (direction: 'left' | 'right') => {
    if (complementsRef.current) {
      const scrollAmount = 200;
      complementsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCheckout = () => {
    setNavigatingToCheckout(true);
    // Small delay to show loading animation
    setTimeout(() => {
      closeCart();
      router.push('/checkout');
    }, 300);
  };

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const hasItems = itemCount > 0;

  if (!isCartOpen) return null;

  return (
    <>
      {/* Loading overlay for checkout navigation */}
      <LoadingOverlay 
        isLoading={navigatingToCheckout}
        message="Preparando tu pedido"
        subMessage="Te llevamos al checkout..."
        showProgress
      />

      {/* Backdrop con animación fade */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={closeCart}
      />

      {/* Sidebar con animación slide desde la derecha */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary-600" />
            <h2 className="font-semibold text-lg">Mi Carrito</h2>
            {hasItems && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-sm rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button 
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-primary-400" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-500 mb-6">
                Añade algunos productos para comenzar
              </p>
              <button 
                onClick={closeCart}
                className="btn-primary"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Flowers */}
              {flowers.map((flower) => {
                // Ensure we use the correct price - final_price for discounted items
                const displayPrice = flower.final_price !== undefined 
                  ? Number(flower.final_price) 
                  : Number(flower.price);
                const hasDiscount = flower.discount_percentage && flower.discount_percentage > 0;
                
                return (
                  <CartItem
                    key={`flower-${flower.id}`}
                    item={{
                      id: flower.id,
                      name: flower.name,
                      price: displayPrice,
                      originalPrice: hasDiscount ? Number(flower.price) : undefined,
                      image_url: flower.image_url,
                      quantity: flower.quantity,
                    }}
                    onUpdateQuantity={(qty) => updateFlowerQuantity(flower.id, qty)}
                    onRemove={() => removeFlower(flower.id)}
                  />
                );
              })}

              {/* Complements */}
              {complements.map((complement) => (
                <CartItem
                  key={`complement-${complement.id}`}
                  item={{
                    id: complement.id,
                    name: complement.name,
                    price: complement.price,
                    image_url: complement.image_url,
                    quantity: complement.quantity,
                  }}
                  onUpdateQuantity={(qty) => updateComplementQuantity(complement.id, qty)}
                  onRemove={() => removeComplement(complement.id)}
                />
              ))}

              {/* Breakfasts */}
              {breakfasts.map((breakfast) => (
                <CartItem
                  key={`breakfast-${breakfast.id}`}
                  item={{
                    id: breakfast.id,
                    name: breakfast.name,
                    price: breakfast.price,
                    image_url: breakfast.image_url,
                    quantity: breakfast.quantity,
                  }}
                  onUpdateQuantity={(qty) => updateBreakfastQuantity(breakfast.id, qty)}
                  onRemove={() => removeBreakfast(breakfast.id)}
                />
              ))}

              {/* Add Complements Section */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowComplements(!showComplements)}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:from-pink-100 hover:to-purple-100 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-gray-700">Agregar complementos</span>
                  </div>
                  <Plus className={`w-5 h-5 text-primary-600 transition-transform ${showComplements ? 'rotate-45' : ''}`} />
                </button>

                {/* Horizontal Complements Carousel */}
                {showComplements && (
                  <div className="mt-4 relative">
                    {loadingComplements ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : availableComplements.length > 0 ? (
                      <>
                        {/* Scroll buttons */}
                        <button
                          onClick={() => scrollComplements('left')}
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-100"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => scrollComplements('right')}
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-100"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Scrollable container */}
                        <div
                          ref={complementsRef}
                          className="flex gap-3 overflow-x-auto pb-2 px-6 scrollbar-hide"
                          style={{ scrollBehavior: 'smooth' }}
                        >
                          {availableComplements.map((complement) => {
                            const isInCart = complements.some(c => c.id === complement.id);
                            const imageUrl = complement.images?.[0] || complement.image || '';
                            
                            return (
                              <div
                                key={complement.id}
                                className="flex-shrink-0 w-32 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="w-full h-24 bg-gray-100 overflow-hidden">
                                  {imageUrl ? (
                                    <img
                                      src={getImageUrl(imageUrl)}
                                      alt={complement.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Gift className="w-8 h-8 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="p-2">
                                  <p className="text-xs font-medium text-gray-800 line-clamp-2 h-8">
                                    {complement.name}
                                  </p>
                                  <p className="text-sm font-bold text-primary-600 mt-1">
                                    S/ {Number(complement.price).toFixed(2)}
                                  </p>
                                  <button
                                    onClick={() => handleAddComplement(complement)}
                                    disabled={isInCart}
                                    className={`w-full mt-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                      isInCart
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary-500 text-white hover:bg-primary-600'
                                    }`}
                                  >
                                    {isInCart ? 'Agregado' : 'Agregar'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No hay complementos disponibles</p>
                    )}
                  </div>
                )}
              </div>

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Vaciar carrito
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasItems && (
          <div className="p-4 border-t bg-gray-50">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-xl font-bold text-gray-800">S/ {subtotal.toFixed(2)}</span>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              El costo de envío se calculará en el checkout
            </p>

            {/* Single Pay Button */}
            <button
              onClick={handleCheckout}
              className="btn-primary w-full justify-center text-center flex items-center gap-2 py-4"
            >
              Pagar
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Cart Item Component
interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image_url: string;
    quantity: number;
  };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const itemPrice = Number(item.price);
  const itemOriginalPrice = item.originalPrice ? Number(item.originalPrice) : undefined;
  const itemTotal = itemPrice * item.quantity;
  
  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-800 line-clamp-2 mb-1">
          {item.name}
        </h4>
        
        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-primary-600">
            S/ {itemPrice.toFixed(2)}
          </span>
          {itemOriginalPrice && itemOriginalPrice > itemPrice && (
            <span className="text-xs text-gray-400 line-through">
              S/ {itemOriginalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Item Total */}
        {item.quantity > 1 && (
          <p className="text-xs text-gray-500 mt-1">
            Total: S/ {itemTotal.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}
