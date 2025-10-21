import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Florería Online | Flores frescas y elegantes",
  description: "Descubre la mejor selección de flores para regalar o decorar, con entrega rápida y estilo moderno.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} antialiased bg-pink-50 text-gray-800`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
