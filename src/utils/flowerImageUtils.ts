/**
 * Utilidades compartidas para el manejo de imágenes de flores
 */

import type { Flower } from '@/types';

/**
 * Extrae la URL de la imagen principal de una flor
 * Prioriza first_image del backend, luego image_urls, y finalmente images
 */
export function getFlowerImageUrl(flower: Flower): string {
  const fallbackImage = '/img/catalogo/placeholder.webp';
  
  // Prioridad 1: first_image (URL completa del backend)
  if (flower.first_image && flower.first_image.trim()) {
    return flower.first_image;
  }
  
  // Prioridad 2: image_urls (URLs completas del backend)
  if (flower.image_urls && Array.isArray(flower.image_urls) && flower.image_urls.length > 0) {
    const firstUrl = flower.image_urls[0];
    if (firstUrl && firstUrl.trim()) {
      return firstUrl;
    }
  }
  
  // Prioridad 3: images (pueden ser URLs relativas o JSON string)
  if (flower.images) {
    try {
      let images: string[] = [];
      
      if (Array.isArray(flower.images)) {
        images = flower.images;
      } else if (typeof flower.images === 'string') {
        images = JSON.parse(flower.images);
      }
      
      if (images.length > 0 && images[0]) {
        const imageUrl = images[0];
        
        // Si ya es una URL completa, usarla
        if (imageUrl.startsWith('http')) {
          return imageUrl;
        }
        
        // Si es una ruta relativa que no empieza con /, agregarle /img/
        if (!imageUrl.startsWith('/')) {
          return `/img/${imageUrl}`;
        }
        
        return imageUrl;
      }
    } catch (error) {
      console.warn('Error parsing flower images:', error);
    }
  }
  
  return fallbackImage;
}

/**
 * Extrae todas las URLs de imágenes de una flor
 */
export function getFlowerImageUrls(flower: Flower): string[] {
  const fallbackImages = ['/img/catalogo/placeholder.webp'];
  
  // Prioridad 1: image_urls (URLs completas del backend)
  if (flower.image_urls && Array.isArray(flower.image_urls) && flower.image_urls.length > 0) {
    return flower.image_urls;
  }
  
  // Prioridad 2: images
  if (flower.images) {
    try {
      let images: string[] = [];
      
      if (Array.isArray(flower.images)) {
        images = flower.images;
      } else if (typeof flower.images === 'string') {
        images = JSON.parse(flower.images);
      }
      
      if (images.length > 0) {
        return images.map(imageUrl => {
          // Si ya es una URL completa, usarla
          if (imageUrl.startsWith('http')) {
            return imageUrl;
          }
          
          // Si es una ruta relativa que no empieza con /, agregarle /img/
          if (!imageUrl.startsWith('/')) {
            return `/img/${imageUrl}`;
          }
          
          return imageUrl;
        });
      }
    } catch (error) {
      console.warn('Error parsing flower images:', error);
    }
  }
  
  return fallbackImages;
}

/**
 * Verifica si una flor tiene imágenes válidas
 */
export function hasValidImages(flower: Flower): boolean {
  return getFlowerImageUrl(flower) !== '/img/catalogo/placeholder.webp';
}

/**
 * Prepara los datos de una flor para el carrito
 */
export function prepareFlowerForCart(flower: Flower) {
  return {
    id: flower.id,
    name: flower.name,
    price: flower.price,
    originalPrice: flower.original_price,
    image: getFlowerImageUrl(flower),
    category: flower.category?.name || 'Flores',
    color: flower.color || 'Varios',
    occasion: flower.occasion || 'General',
    description: flower.short_description || flower.description,
    rating: parseFloat(flower.rating?.toString() || '0') || 0,
    reviews: flower.reviews_count || 0,
    stock: flower.stock || 0,
    discount: flower.discount_percentage || 0
  };
}
