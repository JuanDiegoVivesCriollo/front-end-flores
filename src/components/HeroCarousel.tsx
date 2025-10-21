'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const heroSlides = [
  {
    id: 1,
    imageDesktop: "/img/4_1.webp",
    imageMobile: "/img/MobileImagenesCarrusel/svdsoaes6s021sfizorj.webp",
  },
  {
    id: 2,
    imageDesktop: "/img/imgcarrusel6.webp",
    imageMobile: "/img/MobileImagenesCarrusel/imgCarrusel6Mobile.webp",
  },
  {
    id: 3,
    imageDesktop: "/img/imgcarrusel7.webp",
    imageMobile: "/img/MobileImagenesCarrusel/imgCarrusel7Mobile.webp",
  },
  {
    id: 4,
    imageDesktop: "/img/imgcarrusel8.webp",
    imageMobile: "/img/MobileImagenesCarrusel/imgCarrusel8Mobile.webp.webp",
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Precargar imágenes para evitar lag
  useEffect(() => {
    const preloadImages = () => {
      const imagePromises = heroSlides.map((slide) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // Resolver aunque falle
          img.src = isMobile ? slide.imageMobile : slide.imageDesktop;
        });
      });
      
      Promise.all(imagePromises).then(() => {
        setImagesLoaded(true);
      });
    };

    preloadImages();
  }, [isMobile]);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // Funciones de drag nativo
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    const threshold = 150; // Aún más threshold para ser menos sensible
    if (dragOffset > threshold) {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    } else if (dragOffset < -threshold) {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
    
    setIsDragging(false);
    setDragOffset(0);
    setIsAutoPlaying(true);
  }, [isDragging, dragOffset]);

  // Manejar mouse up global para cuando el usuario arrastra fuera del contenedor
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const currentX = e.clientX;
        const diff = currentX - dragStart;
        setDragOffset(diff);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, handleMouseUp]);

  // Pause auto-play on hover/touch
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setIsAutoPlaying(false);
    e.preventDefault();
  };

  // Touch events para móvil
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - dragStart;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 150; // Mismo threshold para touch
    if (dragOffset > threshold) {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    } else if (dragOffset < -threshold) {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }
    
    setIsDragging(false);
    setDragOffset(0);
    setIsAutoPlaying(true);
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-[85vh] md:h-[75vh] overflow-hidden bg-white w-full max-w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* H1 para SEO - visualmente oculto pero accesible */}
      <h1 className="sr-only">
        Flores y Detalles Lima - Florería Premium en San Juan de Lurigancho
      </h1>
      
      {/* Loading state mientras se cargan las imágenes */}
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      )}
      
      {/* Slides Container - Solo mostrar cuando las imágenes estén cargadas */}
      {imagesLoaded && (
        <div 
          className="flex w-full h-full transition-transform duration-700 ease-out cursor-grab active:cursor-grabbing select-none"
          style={{ 
            transform: `translateX(${-currentSlide * 100 + (isDragging ? Math.max(-30, Math.min(30, dragOffset / 12)) : 0)}%)`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transition: isDragging ? 'none' : 'transform 700ms ease-out',
           
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
        {/* Renderizar las slides principales */}
        {heroSlides.map((slide) => (
          <div
            key={slide.id}
            className="min-w-full h-full flex-shrink-0 relative"
            style={{
              backgroundImage: `url(${isMobile ? slide.imageMobile : slide.imageDesktop})`,
              backgroundColor: 'transparent',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Solo imagen de fondo */}
          </div>
        ))}
      </div>
      )}

      {/* Controles de navegación - Solo mostrar cuando las imágenes estén cargadas */}
      {imagesLoaded && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 hover:scale-110 active:scale-95 transition-all z-20"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 hover:scale-110 active:scale-95 transition-all z-20"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all hover:scale-125 active:scale-90 ${
                  index === currentSlide 
                    ? 'bg-pink-bright scale-125' 
                    : 'bg-gray-400 hover:bg-pink-light'
                }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
