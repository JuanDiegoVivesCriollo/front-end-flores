'use client';

import { useState, useEffect } from 'react';

interface UseLoadingStateProps {
  initialLoading?: boolean;
  minimumLoadingTime?: number;
}

export function useLoadingState({ 
  initialLoading = true, 
  minimumLoadingTime = 1000 
}: UseLoadingStateProps = {}) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [startTime] = useState(Date.now());

  const setLoading = (loading: boolean) => {
    if (!loading) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    } else {
      setIsLoading(true);
    }
  };

  return { isLoading, setLoading };
}

// Hook específico para carga de imágenes
export function useImageLoading(imageUrls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const isImageLoaded = (url: string) => loadedImages.has(url);
  const isImageFailed = (url: string) => failedImages.has(url);
  const allImagesProcessed = imageUrls.length > 0 && 
    (loadedImages.size + failedImages.size) === imageUrls.length;

  useEffect(() => {
    const preloadImage = (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(url));
          resolve();
        };
        img.onerror = () => {
          setFailedImages(prev => new Set(prev).add(url));
          reject();
        };
        img.src = url;
      });
    };

    const preloadImages = async (urls: string[]) => {
      const promises = urls.map(url => 
        preloadImage(url).catch(() => {}) // Ignore individual failures
      );
      await Promise.allSettled(promises);
    };

    if (imageUrls.length > 0) {
      preloadImages(imageUrls);
    }
  }, [imageUrls]);

  return {
    loadedImages,
    failedImages,
    isImageLoaded,
    isImageFailed,
    allImagesProcessed
  };
}
