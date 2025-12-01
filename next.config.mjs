/** @type {import('next').NextConfig} */
const nextConfig = {
  // === PRODUCCIÓN: Activo para generar build estático ===
  output: 'export',
  trailingSlash: true,
  
  images: {
    // === DESARROLLO - Comentado para producción ===
    // remotePatterns: [
    //   {
    //     protocol: 'http',
    //     hostname: 'localhost',
    //     port: '8000',
    //     pathname: '/storage/**',
    //   },
    //   {
    //     protocol: 'https',
    //     hostname: '**',
    //   },
    // ],
    // === PRODUCCIÓN: Activo para build estático ===
    unoptimized: true,
  },
  
  // === DESARROLLO: rewrites solo funcionan en modo servidor ===
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
