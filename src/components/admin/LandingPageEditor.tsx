'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save,
  Eye,
  Image as ImageIcon,
  Type,
  Settings,
  RefreshCw,
  Monitor,
  Smartphone
} from 'lucide-react';
import { apiClient } from '@/services/api';
import PhoneInput from '@/components/PhoneInput';

interface LandingPageContent {
  hero: {
    title: string;
    subtitle: string;
    background_image: string;
    cta_text: string;
    cta_link: string;
  };
  about: {
    title: string;
    description: string;
    image: string;
  };
  featured_section: {
    title: string;
    subtitle: string;
    show_featured_flowers: boolean;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
    business_hours: string;
  };
  footer: {
    description: string;
    social_links: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
}

export default function LandingPageEditor() {
  const [content, setContent] = useState<LandingPageContent>({
    hero: {
      title: 'Flores y Detalles Lima',
      subtitle: 'Los arreglos florales más hermosos para tus momentos especiales',
      background_image: '/img/heroimagen1.webp',
      cta_text: 'Ver Catálogo',
      cta_link: '/flores'
    },
    about: {
      title: 'Sobre Nosotros',
      description: 'Con más de 20 años de experiencia, creamos arreglos florales únicos que expresan tus sentimientos más profundos.',
      image: '/img/about.jpg'
    },
    featured_section: {
      title: 'Flores Destacadas',
      subtitle: 'Descubre nuestra selección especial',
      show_featured_flowers: true
    },
    contact: {
      phone: '+52 123 456 7890',
      email: 'info@floresydetalles.com',
      address: 'Av. Principal 123, Ciudad',
      whatsapp: '+52 123 456 7890',
      business_hours: 'Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00'
    },
    footer: {
      description: 'Flores y Detalles Lima - Tu florería de confianza',
      social_links: {
        facebook: 'https://facebook.com/floresydetalleslima',
        instagram: 'https://instagram.com/floresydetalleslima',
        twitter: 'https://twitter.com/floresydetalleslima'
      }
    }
  });

  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isWhatsappValid, setIsWhatsappValid] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getLandingPageContent();
        
        if (response.success && response.data) {
          // Convertir la estructura de la API a nuestro formato local
          const apiData = response.data;
          
          const convertedContent: LandingPageContent = {
            hero: {
              title: apiData.hero?.title?.value || 'Flores y Detalles Lima - Belleza Natural',
              subtitle: apiData.hero?.subtitle?.value || 'Los arreglos florales más hermosos para cada ocasión especial',
              background_image: apiData.hero?.background_image?.value || '/img/heroimagen1.webp',
              cta_text: apiData.hero?.cta_text?.value || 'Ver Catálogo',
              cta_link: apiData.hero?.cta_link?.value || '/flores'
            },
            about: {
              title: apiData.about?.title?.value || 'Nuestra Historia',
              description: apiData.about?.description?.value || 'Con más de dos décadas de experiencia, somos especialistas en crear arreglos florales únicos...',
              image: apiData.about?.image?.value || '/img/imagenhero2.webp'
            },
            featured_section: {
              title: apiData.featured_section?.title?.value || 'Flores Destacadas',
              subtitle: apiData.featured_section?.subtitle?.value || 'Descubre nuestra selección especial de flores frescas',
              show_featured_flowers: apiData.featured_section?.show_featured_flowers?.value === 'true' || true
            },
            contact: {
              phone: apiData.contact?.phone?.value || '+51 987 654 321',
              email: apiData.contact?.email?.value || 'floresydetalleslima1@gmail.com',
              address: apiData.contact?.address?.value || 'Av. Flores 123, Lima, Perú',
              whatsapp: apiData.contact?.whatsapp?.value || '+51 987 654 321',
              business_hours: apiData.contact?.business_hours?.value || 'Lun - Dom: 8:00 AM - 8:00 PM'
            },
            footer: {
              description: apiData.footer?.description?.value || 'Flores & Detalles Lima - Tu florería de confianza',
              social_links: {
                facebook: apiData.footer?.facebook_link?.value || 'https://facebook.com/floresydetalleslima',
                instagram: apiData.footer?.instagram_link?.value || 'https://instagram.com/floresydetalleslima',
                twitter: apiData.footer?.twitter_link?.value || 'https://twitter.com/floresydetalleslima'
              }
            }
          };
          
          setContent(convertedContent);
        }
      } catch (error) {
        console.error('Error fetching landing page content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Convertir nuestro formato local al formato de la API
      const contentToSave = [
        // Hero section
        { section: 'hero', key: 'title', value: content.hero.title, type: 'text' as const },
        { section: 'hero', key: 'subtitle', value: content.hero.subtitle, type: 'text' as const },
        { section: 'hero', key: 'background_image', value: content.hero.background_image, type: 'image' as const },
        { section: 'hero', key: 'cta_text', value: content.hero.cta_text, type: 'text' as const },
        { section: 'hero', key: 'cta_link', value: content.hero.cta_link, type: 'text' as const },
        
        // About section
        { section: 'about', key: 'title', value: content.about.title, type: 'text' as const },
        { section: 'about', key: 'description', value: content.about.description, type: 'html' as const },
        { section: 'about', key: 'image', value: content.about.image, type: 'image' as const },
        
        // Featured section
        { section: 'featured_section', key: 'title', value: content.featured_section.title, type: 'text' as const },
        { section: 'featured_section', key: 'subtitle', value: content.featured_section.subtitle, type: 'text' as const },
        { section: 'featured_section', key: 'show_featured_flowers', value: content.featured_section.show_featured_flowers.toString(), type: 'text' as const },
        
        // Contact section
        { section: 'contact', key: 'phone', value: content.contact.phone, type: 'text' as const },
        { section: 'contact', key: 'email', value: content.contact.email, type: 'text' as const },
        { section: 'contact', key: 'address', value: content.contact.address, type: 'text' as const },
        { section: 'contact', key: 'whatsapp', value: content.contact.whatsapp, type: 'text' as const },
        { section: 'contact', key: 'business_hours', value: content.contact.business_hours, type: 'text' as const },
        
        // Footer section
        { section: 'footer', key: 'description', value: content.footer.description, type: 'text' as const },
        { section: 'footer', key: 'facebook_link', value: content.footer.social_links.facebook || '', type: 'text' as const },
        { section: 'footer', key: 'instagram_link', value: content.footer.social_links.instagram || '', type: 'text' as const },
        { section: 'footer', key: 'twitter_link', value: content.footer.social_links.twitter || '', type: 'text' as const }
      ];

      await apiClient.updateBulkLandingPageContent(contentToSave);
      
      alert('Contenido guardado exitosamente');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error al guardar el contenido');
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = (section: keyof LandingPageContent, field: string, value: string | boolean) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedContent = (section: keyof LandingPageContent, nestedField: string, field: string, value: string) => {
    if (section === 'footer' && nestedField === 'social_links') {
      setContent(prev => ({
        ...prev,
        footer: {
          ...prev.footer,
          social_links: {
            ...prev.footer.social_links,
            [field]: value
          }
        }
      }));
    }
  };

  const sections = [
    { id: 'hero', label: 'Sección Hero', icon: ImageIcon },
    { id: 'about', label: 'Sobre Nosotros', icon: Type },
    { id: 'featured', label: 'Productos Destacados', icon: Settings },
    { id: 'contact', label: 'Contacto', icon: Settings },
    { id: 'footer', label: 'Footer', icon: Settings }
  ];

  const renderSectionEditor = () => {
    switch (activeSection) {
      case 'hero':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Sección Hero</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Principal
              </label>
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) => updateContent('hero', 'title', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítulo
              </label>
              <textarea
                value={content.hero.subtitle}
                onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de Fondo (URL)
              </label>
              <input
                type="url"
                value={content.hero.background_image}
                onChange={(e) => updateContent('hero', 'background_image', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto del Botón
                </label>
                <input
                  type="text"
                  value={content.hero.cta_text}
                  onChange={(e) => updateContent('hero', 'cta_text', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enlace del Botón
                </label>
                <input
                  type="text"
                  value={content.hero.cta_link}
                  onChange={(e) => updateContent('hero', 'cta_link', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Sección Sobre Nosotros</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={content.about.title}
                onChange={(e) => updateContent('about', 'title', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={content.about.description}
                onChange={(e) => updateContent('about', 'description', e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen (URL)
              </label>
              <input
                type="url"
                value={content.about.image}
                onChange={(e) => updateContent('about', 'image', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        );

      case 'featured':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Sección Productos Destacados</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={content.featured_section.title}
                onChange={(e) => updateContent('featured_section', 'title', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítulo
              </label>
              <input
                type="text"
                value={content.featured_section.subtitle}
                onChange={(e) => updateContent('featured_section', 'subtitle', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={content.featured_section.show_featured_flowers}
                  onChange={(e) => updateContent('featured_section', 'show_featured_flowers', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Mostrar flores destacadas automáticamente
                </span>
              </label>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <PhoneInput
                  value={content.contact.phone}
                  onChange={(phone, isValid) => {
                    updateContent('contact', 'phone', phone);
                    setIsPhoneValid(isValid);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <PhoneInput
                  value={content.contact.whatsapp}
                  onChange={(whatsapp, isValid) => {
                    updateContent('contact', 'whatsapp', whatsapp);
                    setIsWhatsappValid(isValid);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(e) => updateContent('contact', 'email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={content.contact.address}
                  onChange={(e) => updateContent('contact', 'address', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horarios de Atención
              </label>
              <input
                type="text"
                value={content.contact.business_hours}
                onChange={(e) => updateContent('contact', 'business_hours', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Footer</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={content.footer.description}
                onChange={(e) => updateContent('footer', 'description', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Redes Sociales</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={content.footer.social_links.facebook || ''}
                    onChange={(e) => updateNestedContent('footer', 'social_links', 'facebook', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={content.footer.social_links.instagram || ''}
                    onChange={(e) => updateNestedContent('footer', 'social_links', 'instagram', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={content.footer.social_links.twitter || ''}
                    onChange={(e) => updateNestedContent('footer', 'social_links', 'twitter', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editor de Página Principal</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Ocultar' : 'Vista Previa'}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de secciones */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Secciones</h3>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Editor de contenido */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {renderSectionEditor()}
          </div>
        </div>
      </div>

      {/* Vista previa */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full h-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="font-semibold text-gray-900">Vista Previa</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                      previewMode === 'desktop'
                        ? 'bg-white text-gray-900 shadow'
                        : 'text-gray-600'
                    }`}
                  >
                    <Monitor className="h-4 w-4 mr-1" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                      previewMode === 'mobile'
                        ? 'bg-white text-gray-900 shadow'
                        : 'text-gray-600'
                    }`}
                  >
                    <Smartphone className="h-4 w-4 mr-1" />
                    Mobile
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="h-full overflow-auto bg-gray-100 p-4">
              <div className={`mx-auto bg-white ${
                previewMode === 'desktop' ? 'max-w-6xl' : 'max-w-sm'
              }`}>
                {/* Aquí renderizarías la vista previa de la landing page */}
                <div className="text-center p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Vista Previa del Contenido
                  </h2>
                  <p className="text-gray-600">
                    Aquí se mostraría cómo se ve la página con el contenido editado
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
