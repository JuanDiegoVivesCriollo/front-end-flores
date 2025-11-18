import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import ShoppingCartSidebar from "@/components/ShoppingCartSidebar";
import FloatingCartButton from "@/components/FloatingCartButton";
import BrowserExtensionHandler from "@/components/BrowserExtensionHandler";
import ClientOnly from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Flores y Detalles Lima | Florería en San Juan de Lurigancho",
  description: "🌹 Florería #1 en San Juan de Lurigancho. Flores frescas premium: rosas, tulipanes, arreglos florales para bodas y eventos. Delivery gratuito en Canto Rey. ¡Ordena ya!",
  keywords: "florería san juan de lurigancho, flores san juan de lurigancho, floristería san juan de lurigancho, rosas rojas, tulipanes, girasoles, orquídeas, liliums, flores frescas, arreglos florales, ramos de flores, flores para bodas, flores cumpleaños, flores san valentín, flores día de la madre, delivery flores san juan de lurigancho, florería canto rey, florería peruana, flores naturales, bouquet flores, corona flores, centro de mesa, decoración floral, floristería profesional, flores premium, flores económicas, venta flores san juan de lurigancho",
  authors: [{ name: "Flores y Detalles Lima", url: "https://xn--floresdejazmnflorera-04bh.com" }],
  creator: "Flores y Detalles Lima - Florería Premium",
  publisher: "Flores y Detalles Lima",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://xn--floresdejazmnflorera-04bh.com'),
  alternates: {
    canonical: 'https://xn--floresdejazmnflorera-04bh.com',
    languages: {
      'es-PE': 'https://xn--floresdejazmnflorera-04bh.com',
      'es': 'https://xn--floresdejazmnflorera-04bh.com/es'
    }
  },
  openGraph: {
    title: "Flores y Detalles Lima - Florería Premium | Rosas, Tulipanes, Arreglos Florales",
    description: "🌹 La florería más confiable de Lima. Flores frescas premium: rosas rojas, tulipanes, girasoles, orquídeas. Arreglos florales únicos para bodas, cumpleaños y eventos especiales. Delivery gratuito en Canto Rey.",
    url: "https://xn--floresdejazmnflorera-04bh.com",
    siteName: "Flores y Detalles Lima - Florería Premium",
    images: [
      {
        url: "/img/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Flores y Detalles Lima - Florería Premium Lima Rosas Tulipanes Arreglos Florales"
      },
      {
        url: "/img/og-logo.jpg",
        width: 800,
        height: 600,
        alt: "Logo Flores y Detalles Lima Florería"
      }
    ],
    locale: "es_PE",
    type: "website",
    emails: ["floresydetalleslima1@gmail.com"],
    phoneNumbers: ["+51919642610"],
    countryName: "Perú",
    ttl: 604800, // 1 semana
  },
  category: "Florería y Decoración",
  classification: "Florería, Flores, Arreglos Florales, Rosas, Decoración",
  other: {
    "business:contact_data:street_address": "San Juan de Lurigancho, Lima",
    "business:contact_data:locality": "Lima",
    "business:contact_data:region": "Lima",
    "business:contact_data:postal_code": "15434",
    "business:contact_data:country_name": "Perú",
    "business:contact_data:phone_number": "+51919642610",
    "business:contact_data:website": "https://xn--floresdejazmnflorera-04bh.com",
    "og:business:hours:day": "monday,tuesday,wednesday,thursday,friday,saturday,sunday",
    "og:business:hours:start": "09:00",
    "og:business:hours:end": "20:00"
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FC879C" },
    { media: "(prefers-color-scheme: dark)", color: "#FC879C" }
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152" }
    ],
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon-precomposed.png"
    }
  },
  appleWebApp: {
    title: "Flores y Detalles Lima",
    statusBarStyle: "default",
    capable: true
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true
  },
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-PE" itemScope itemType="https://schema.org/Florist" suppressHydrationWarning={true}>
      <head>
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="EUNF3OMEe0yMKQUBiTixO9wnzSFlLQv5a14Yi0zW5cQ" />
        
        {/* DNS Prefetch para CDNs externos - Reduce latencia */}
        <link rel="dns-prefetch" href="https://static.micuentaweb.pe" />
        <link rel="dns-prefetch" href="https://unpkg.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Preconnect a CDNs críticos - Establece conexión temprana */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload imagen LCP (Largest Contentful Paint) - Primera imagen del carrusel */}
        <link 
          rel="preload" 
          as="image" 
          href="/img/desktopimgenesCarrusel/1_1.webp"
          fetchPriority="high"
          media="(min-width: 768px)"
        />
        <link 
          rel="preload" 
          as="image" 
          href="/img/MobileImagenesCarrusel/1_1.webp"
          fetchPriority="high"
          media="(max-width: 767px)"
        />
        
        {/* Preload fuentes críticas - Evita FOIT (Flash of Invisible Text) */}
        <link 
          rel="preload" 
          href="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous"
        />
        
        {/* Google Fonts con display=swap para evitar bloqueo de render */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" 
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link 
            rel="stylesheet" 
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          />
        </noscript>
        
        {/* Hreflang for international SEO */}
        <link rel="alternate" hrefLang="es-pe" href="https://xn--floresdejazmnflorera-04bh.com/" />
        <link rel="alternate" hrefLang="es" href="https://xn--floresdejazmnflorera-04bh.com/" />
        <link rel="alternate" hrefLang="x-default" href="https://xn--floresdejazmnflorera-04bh.com/" />
        
        {/* IziPay CSS - Carga diferida para no bloquear render */}
        <link 
          rel="preload" 
          href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic-reset.css" 
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link rel="stylesheet" href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic-reset.css" />
        </noscript>

        {/* Leaflet CSS - Carga diferida para mapas */}
        <link 
          rel="preload" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
          crossOrigin=""
        />
        <noscript>
          <link 
            rel="stylesheet" 
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
            crossOrigin="" 
          />
        </noscript>

        {/* Geographic meta tags */}
        <meta name="geo.region" content="PE-LIM" />
        <meta name="geo.placename" content="Lima, Perú" />
        <meta name="geo.position" content="-11.975443;-77.001510" />
        <meta name="ICBM" content="-11.975443, -77.001510" />
        
        {/* Business information */}
        <meta name="DC.title" content="Flores y Detalles Lima - Florería Premium" />
        <meta name="DC.creator" content="Flores y Detalles Lima" />
        <meta name="DC.subject" content="Florería, Flores, Rosas, Tulipanes, Arreglos Florales" />
        <meta name="DC.description" content="Florería premium en Lima con las mejores flores frescas y arreglos florales profesionales" />
        <meta name="DC.language" content="es-PE" />
        <meta name="DC.coverage" content="Lima, Perú" />
        
        {/* Rich Snippets - Business Schema */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Florist", "LocalBusiness", "Store"],
              "name": "Flores y Detalles Lima",
              "alternateName": ["Florería Lima", "Flores Lima", "Floristería Lima"],
              "description": "Florería premium en Lima especializada en flores frescas, rosas, tulipanes, girasoles, orquídeas y arreglos florales profesionales para bodas, cumpleaños y eventos especiales.",
              "url": "https://floresydetalleslima.com",
              "logo": "https://floresydetalleslima.com/img/logo.png",
              "image": [
                "https://floresydetalleslima.com/img/og-image.jpg",
                "https://floresydetalleslima.com/img/floreria-lima.jpg"
              ],
              "telephone": "+51919642610",
              "email": "floresydetalleslima1@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "San Juan de Lurigancho",
                "addressLocality": "Lima",
                "addressRegion": "Lima",
                "postalCode": "15434",
                "addressCountry": "PE"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -11.975443,
                "longitude": -77.001510
              },
              "openingHours": [
                "Mo-Su 09:00-20:00"
              ],
              "priceRange": "$$",
              "currenciesAccepted": "PEN",
              "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
              "areaServed": {
                "@type": "City",
                "name": "Lima",
                "addressCountry": "PE"
              },
              "serviceType": "Florería y Arreglos Florales",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Catálogo de Flores",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Rosas Rojas Premium",
                      "category": "Flores",
                      "brand": "Flores y Detalles Lima",
                      "offers": {
                        "@type": "Offer",
                        "priceCurrency": "PEN",
                        "price": "45.00",
                        "priceValidUntil": "2025-12-31",
                        "availability": "https://schema.org/InStock",
                        "seller": {
                          "@type": "Organization",
                          "name": "Flores y Detalles Lima"
                        }
                      },
                      "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.8",
                        "reviewCount": "25",
                        "bestRating": "5",
                        "worstRating": "1"
                      }
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Tulipanes Frescos",
                      "category": "Flores",
                      "brand": "Flores y Detalles Lima",
                      "offers": {
                        "@type": "Offer",
                        "priceCurrency": "PEN",
                        "price": "35.00",
                        "priceValidUntil": "2025-12-31",
                        "availability": "https://schema.org/InStock",
                        "seller": {
                          "@type": "Organization",
                          "name": "Flores y Detalles Lima"
                        }
                      },
                      "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.7",
                        "reviewCount": "18",
                        "bestRating": "5",
                        "worstRating": "1"
                      }
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product", 
                      "name": "Arreglos Florales para Bodas",
                      "category": "Arreglos Florales",
                      "brand": "Flores y Detalles Lima",
                      "offers": {
                        "@type": "Offer",
                        "priceCurrency": "PEN",
                        "price": "150.00",
                        "priceValidUntil": "2025-12-31",
                        "availability": "https://schema.org/InStock",
                        "seller": {
                          "@type": "Organization",
                          "name": "Flores y Detalles Lima"
                        }
                      },
                      "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.9",
                        "reviewCount": "32",
                        "bestRating": "5",
                        "worstRating": "1"
                      }
                    }
                  }
                ]
              },
              "sameAs": [
                "https://floresydetalleslima.com"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "150",
                "bestRating": "5",
                "worstRating": "1"
              },
              "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock",
                "priceCurrency": "PEN",
                "deliveryLeadTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 2,
                  "maxValue": 24,
                  "unitCode": "HUR"
                }
              }
            })
          }}
        />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/img/logo.webp" as="image" type="image/webp" />
        <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossOrigin="" />
        
        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Additional SEO meta tags */}
        <meta name="rating" content="General" />
        <meta name="distribution" content="Global" />
        <meta name="revisit-after" content="7 days" />
        <meta name="expires" content="never" />
        <meta name="language" content="Spanish" />
        <meta name="web_author" content="Flores y Detalles Lima" />
        <meta name="reply-to" content="floresydetalleslima1@gmail.com" />
        <meta name="owner" content="Flores y Detalles Lima" />
        <meta name="copyright" content="© 2025 Flores y Detalles Lima. Todos los derechos reservados." />
        
        {/* Mobile optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Flores y Detalles Lima" />
        
        {/* Script inline para carga diferida de CSS - Mejora LCP */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Cargar CSS diferido de manera eficiente
              (function() {
                function loadDeferredStyles() {
                  var links = document.querySelectorAll('link[rel="preload"][as="style"]');
                  links.forEach(function(link) {
                    if (link.onload === null) {
                      link.onload = function() {
                        this.onload = null;
                        this.rel = 'stylesheet';
                      };
                    }
                  });
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', loadDeferredStyles);
                } else {
                  loadDeferredStyles();
                }
              })();
            `
          }}
        />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevenir modificaciones de extensiones del navegador durante la hidratación
              (function() {
                var originalSetAttribute = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(name, value) {
                  // Bloquear atributos de Grammarly durante la hidratación inicial
                  if (
                    (name.includes('data-gr-') || 
                     name.includes('data-new-gr-') ||
                     name.includes('grammarly')) &&
                    !window.__HYDRATION_COMPLETE__
                  ) {
                    return;
                  }
                  return originalSetAttribute.call(this, name, value);
                };
                
                // Marcar hidratación como completa después de que React se monte
                setTimeout(function() {
                  window.__HYDRATION_COMPLETE__ = true;
                }, 1000);
              })();
            `
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FloristShop",
              "name": "Flores y Detalles Lima",
              "description": "Florería en Lima especializada en rosas rojas, tulipanes, girasoles, orquídeas y todo tipo de flores frescas. Arreglos florales para bodas, cumpleaños y ocasiones especiales.",
              "url": "https://floresydetalles.pe",
              "telephone": "+51919642610",
              "email": "floresydetalleslima1@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Lima 123",
                "addressLocality": "Lima",
                "addressRegion": "Lima",
                "postalCode": "15001",
                "addressCountry": "PE"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -11.975443,
                "longitude": -77.001510
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                ],
                "opens": "08:00",
                "closes": "22:00"
              },
              "priceRange": "$$",
              "servedCuisine": [],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Catálogo de Flores",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Rosas Rojas Premium",
                      "description": "Hermosas rosas rojas frescas, perfectas para expresar amor",
                      "offers": {
                        "@type": "Offer",
                        "url": "https://floresydetalles.com/catalogo",
                        "priceCurrency": "PEN",
                        "price": "45.00",
                        "priceValidUntil": "2025-12-31",
                        "itemCondition": "https://schema.org/NewCondition",
                        "availability": "https://schema.org/InStock",
                        "seller": {
                          "@type": "FloristShop",
                          "name": "Flores y Detalles Lima"
                        }
                      },
                      "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.8",
                        "reviewCount": "127"
                      }
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className="antialiased bg-white text-gray-900 overflow-x-hidden" suppressHydrationWarning={true}>
        <BrowserExtensionHandler />
        
        {/* IziPay JavaScript Library */}
        <Script 
          src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.js"
          strategy="beforeInteractive"
        />
        
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <ClientOnly>
                <Navbar />
                <div className="pt-0">
                  {children}
                </div>
                <Footer />
                <ShoppingCartSidebar />
                <FloatingCartButton />
              </ClientOnly>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
