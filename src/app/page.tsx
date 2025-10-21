import Image from "next/image";
import { Flower2, ShoppingCart, Heart, Phone, Mail, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="font-sans text-gray-800 bg-pink-50 min-h-screen flex flex-col">
      {/* HERO */}
      <header className="w-full bg-gradient-to-r from-pink-200 to-pink-100 py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-pink-700 mb-4">
            🌸 Flores d' Jazmin
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Flores frescas, colores vibrantes y detalles que enamoran.  
            Envía amor y alegría con cada ramo.
          </p>
          <a
            href="#productos"
            className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-3 rounded-full shadow-md transition"
          >
            Ver nuestra colección
          </a>
        </div>
      </header>

      {/* PRODUCTOS DESTACADOS */}
      <section id="productos" className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-pink-700 mb-12">
          Nuestros arreglos más populares
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            { nombre: "Ramo Primavera", desc: "Rosas, tulipanes y girasoles." },
            { nombre: "Encanto Rosa", desc: "Tonos rosados suaves y elegantes." },
            { nombre: "Amor Eterno", desc: "Rosas rojas para momentos inolvidables." },
          ].map((producto, index) => (
            <div
              key={index}
              className="bg-pink-100 hover:bg-pink-200 rounded-2xl p-6 text-center shadow-md transition"
            >
              <Flower2 className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-pink-800">
                {producto.nombre}
              </h3>
              <p className="text-gray-700 mb-4">{producto.desc}</p>
              <button className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium px-4 py-2 rounded-full mx-auto transition">
                <ShoppingCart size={18} /> Comprar
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE NOSOTROS */}
      <section className="py-20 px-6 bg-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-10 h-10 text-pink-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-pink-700 mb-6">Sobre Nosotros</h2>
          <p className="text-gray-700 leading-relaxed">
            En <span className="font-semibold text-pink-700">Flores d' Jazmin</span>, creemos
            que cada flor tiene una historia. Llevamos años compartiendo emociones a través de
            nuestros arreglos florales, diseñados con amor y dedicación.
          </p>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-pink-700 mb-10">
          Contáctanos
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 text-gray-700">
          <div className="flex items-center gap-3">
            <Phone className="text-pink-600" />
            <span>+51 999 888 777</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="text-pink-600" />
            <span>contacto@floresydetalleslima.com</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-pink-600" />
            <span>Av. Primavera 123, Lima - Perú</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-pink-200 text-center py-6 mt-auto text-gray-700">
        <p>© 2025 Flores d' Jazmin. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
