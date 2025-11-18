'use client';

import { useEffect } from 'react';

export default function BrowserExtensionHandler() {
  useEffect(() => {
    // Función para limpiar atributos de extensiones del navegador
    const cleanBrowserExtensionAttributes = () => {
      // Limpiar atributos de Grammarly
      const bodyElement = document.body;
      if (bodyElement) {
        bodyElement.removeAttribute('data-new-gr-c-s-check-loaded');
        bodyElement.removeAttribute('data-gr-ext-installed');
        bodyElement.removeAttribute('data-gr-ext-disabled');
        bodyElement.removeAttribute('data-grammarly-extension-installed');
      }

      // Limpiar atributos del html
      const htmlElement = document.documentElement;
      if (htmlElement) {
        htmlElement.removeAttribute('data-new-gr-c-s-check-loaded');
        htmlElement.removeAttribute('data-gr-ext-installed');
      }

      // Remover elementos inyectados por extensiones
      const grammarlyElements = document.querySelectorAll('[data-grammarly-extension]');
      grammarlyElements.forEach(element => {
        element.remove();
      });
    };

    // Ejecutar limpieza inicial
    cleanBrowserExtensionAttributes();

    // Observer para detectar cambios en atributos
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          if (
            target === document.body || 
            target === document.documentElement
          ) {
            // Si se detectan atributos de extensiones, limpiarlos
            const attributeName = mutation.attributeName;
            if (
              attributeName && 
              (attributeName.includes('data-gr-') || 
               attributeName.includes('data-new-gr-') ||
               attributeName.includes('grammarly'))
            ) {
              setTimeout(cleanBrowserExtensionAttributes, 0);
            }
          }
        }
      });
    });

    // Observar cambios en body y html
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-gr-ext-disabled',
        'data-grammarly-extension-installed'
      ]
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed'
      ]
    });

    // Limpiar observer al desmontar
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
