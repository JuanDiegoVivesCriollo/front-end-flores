export const generateBreadcrumbSchema = (items: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://xn--floresdejazmnflorera-04bh.com${item.url}`
    }))
  };
};

export const commonBreadcrumbs = {
  home: { name: "Inicio", url: "/" },
  catalogo: { name: "Catálogo", url: "/catalogo" },
  flores: { name: "Flores", url: "/flores" },
  servicios: { name: "Servicios", url: "/servicios" },
  nosotros: { name: "Nosotros", url: "/nosotros" },
  contacto: { name: "Contacto", url: "/contacto" },
  ofertas: { name: "Ofertas", url: "/ofertas" },
  complementos: { name: "Complementos", url: "/complementos" }
};
