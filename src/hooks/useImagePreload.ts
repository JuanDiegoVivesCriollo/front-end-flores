'use client';

import { useEffect, useState } from 'react';

interface UseImagePreloadOptions {
  priority?: boolean;
  quality?: number;
}

export const useImagePreload = (
  imageSrcs: string[],
  options: UseImagePreloadOptions = {}
) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { priority = false, quality = 75 } = options;

  useEffect(() => {
    if (!imageSrcs.length) {
      setIsLoading(false);
      return;
    }

    const preloadImages = async () => {
      const promises = imageSrcs.map((src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, src]));
            resolve(src);
          };
          
          img.onerror = () => {
            console.warn(`Failed to preload image: ${src}`);
            reject(src);
          };
          
          // Add quality parameter if it's a relative URL
          if (src.startsWith('/') && quality < 100) {
            img.src = src; // Next.js will handle optimization automatically
          } else {
            img.src = src;
          }
        });
      });

      try {
        await Promise.allSettled(promises);
      } catch (error) {
        console.warn('Some images failed to preload:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (priority) {
      preloadImages();
    } else {
      // Delay preloading for non-critical images
      const timer = setTimeout(preloadImages, 1000);
      return () => clearTimeout(timer);
    }
  }, [imageSrcs, priority, quality]);

  return {
    loadedImages,
    isLoading,
    isImageLoaded: (src: string) => loadedImages.has(src)
  };
};

// Hook para precargar imágenes del hero carousel
export const useHeroImagesPreload = () => {
  const heroImages = [
    '/img/desktopimgenesCarrusel/4_1.webp', // Nueva primera imagen
    '/img/desktopimgenesCarrusel/1_1.webp',
    '/img/desktopimgenesCarrusel/2_1.webp',
    '/img/desktopimgenesCarrusel/3_1.webp',
    '/img/MobileImagenesCarrusel/Especial.webp',
    '/img/MobileImagenesCarrusel/kqheuon7acbj7is20j7u.webp',
    '/img/MobileImagenesCarrusel/pljd2zpmndgmmqya8gip.webp',
    '/img/MobileImagenesCarrusel/svdsoaes6s021sfizorj.webp'
  ];

  return useImagePreload(heroImages, { priority: true, quality: 85 });
};

// Hook para precargar imágenes críticas de la página principal
export const useCriticalImagesPreload = () => {
  const criticalImages = [
    '/img/logojazmin2.webp', // Mantener el nombre del archivo pero actualizar alt en componentes
    '/img/desktopimgenesCarrusel/4_1.webp', // Primera imagen del carrusel (corregida)
    '/img/MobileImagenesCarrusel/Especial.webp', // Primera imagen móvil (nueva)
    '/img/placeholder.jpg'
  ];

  return useImagePreload(criticalImages, { priority: true, quality: 90 });
};
