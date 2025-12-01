'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

// Hero slides data with real Unsplash images
const heroSlides = [
  {
    id: 1,
    imageDesktop: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80',
    imageMobile: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80',
    title: 'Flores que Enamoran',
    subtitle: 'Descubre la magia en cada pétalo',
    cta: 'Ver Colección',
    ctaLink: '/ramos',
  },
  {
    id: 2,
    imageDesktop: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1920&q=80',
    imageMobile: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80',
    title: 'Ramos Únicos',
    subtitle: 'Diseñados con amor para ti',
    cta: 'Explorar',
    ctaLink: '/ramos',
  },
  {
    id: 3,
    imageDesktop: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1920&q=80',
    imageMobile: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80',
    title: 'Momentos Especiales',
    subtitle: 'Haz cada ocasión inolvidable',
    cta: 'Ver Ocasiones',
    ctaLink: '/ocasiones',
  },
  {
    id: 4,
    imageDesktop: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
    imageMobile: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    title: 'Desayunos Sorpresa',
    subtitle: 'Despierta sonrisas',
    cta: 'Ordenar Ahora',
    ctaLink: '/desayunos',
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  // Touch/Drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
    setIsAutoPlaying(false);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    setDragOffset(clientX - dragStart);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    const threshold = 100;
    if (dragOffset > threshold) prevSlide();
    else if (dragOffset < -threshold) nextSlide();
    setIsDragging(false);
    setDragOffset(0);
    setIsAutoPlaying(true);
  };

  return (
    <section 
      className="relative h-[85vh] md:h-[80vh] overflow-hidden bg-gradient-to-b from-primary-50 to-white"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* H1 for SEO */}
      <h1 className="sr-only">
        Flores D&apos;Jazmin - Florería Premium en Lima, Perú
      </h1>

      {/* Slides Container */}
      <div
        className="flex h-full transition-transform duration-700 ease-out cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
        }}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="relative w-full h-full flex-shrink-0"
          >
            {/* Background Image */}
            <Image
              src={isMobile ? slide.imageMobile : slide.imageDesktop}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
            
            {/* Overlay para mejor legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 z-10" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="container-wide">
                <div className={`max-w-2xl mx-auto text-center transition-all duration-700 ${
                  currentSlide === index 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}>
                  {/* Decorative Element */}
                  <div className="flex justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-white animate-pulse drop-shadow-lg" />
                  </div>

                  {/* Main Title */}
                  <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                    <span className="text-white drop-shadow-lg">{slide.title}</span>
                  </h2>

                  {/* Subtitle */}
                  <p className="font-script text-2xl md:text-3xl text-white/90 mb-8 drop-shadow-md">
                    {slide.subtitle}
                  </p>

                  {/* CTA Button */}
                  <a
                    href={slide.ctaLink}
                    className="bg-white text-pink-600 hover:bg-pink-50 text-lg px-8 py-4 inline-flex items-center gap-2 group rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    {slide.cta}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-primary-600 hover:bg-white hover:scale-110 transition-all"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-primary-600 hover:bg-white hover:scale-110 transition-all"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === index
                ? 'w-8 h-3 bg-primary-500'
                : 'w-3 h-3 bg-white/60 hover:bg-white'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
