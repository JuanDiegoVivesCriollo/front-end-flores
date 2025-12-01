import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import ShoppingCartSidebar from "@/components/ShoppingCartSidebar";
import FloatingCartButton from "@/components/FloatingCartButton";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AuthModal from "@/components/AuthModal";
import WelcomeToast from "@/components/WelcomeToast";

export const metadata: Metadata = {
  title: "Flores D'Jazmin | Florería Premium en Lima",
  description: "Florería Flores D'Jazmin - Ramos únicos, arreglos florales personalizados y desayunos sorpresa. Entrega a domicilio en Lima. Flores frescas para toda ocasión: cumpleaños, aniversarios, amor y más.",
  keywords: "florería lima, flores a domicilio, ramos de flores, arreglos florales, flores para cumpleaños, flores para aniversario, desayunos sorpresa, flores premium, flores djazmin",
  authors: [{ name: "Flores D'Jazmin" }],
  creator: "Flores D'Jazmin",
  publisher: "Flores D'Jazmin",
  robots: "index, follow",
  openGraph: {
    title: "Flores D'Jazmin | Florería Premium en Lima",
    description: "Ramos únicos y arreglos florales personalizados. Entrega a domicilio en Lima.",
    url: process.env.NEXT_PUBLIC_FRONTEND_URL,
    siteName: "Flores D'Jazmin",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flores D'Jazmin | Florería Premium",
    description: "Ramos únicos y arreglos florales personalizados. Entrega en Lima.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-PE" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#fffbfc] antialiased">
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              {/* Navbar */}
              <Navbar />
              
              {/* Main Content */}
              <main className="min-h-screen">
                {children}
              </main>
              
              {/* Footer */}
              <Footer />
              
              {/* Shopping Cart Sidebar */}
              <ShoppingCartSidebar />
              
              {/* Floating Cart Button */}
              <FloatingCartButton />
              
              {/* WhatsApp Floating Button */}
              <FloatingWhatsApp />

              {/* Auth Modal */}
              <AuthModal />

              {/* Welcome Toast */}
              <WelcomeToast />
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
