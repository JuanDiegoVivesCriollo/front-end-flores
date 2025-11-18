// Post-build script for Flores y Detalles Lima
console.log('🌸 Post-build script ejecutándose...');

// Verificar que el build se completó correctamente
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildDir = path.join(__dirname, '../.next');

if (fs.existsSync(buildDir)) {
  console.log('✅ Build completado exitosamente');
  console.log('🌸 Flores y Detalles Lima está listo para producción');
} else {
  console.log('❌ Error: Directorio de build no encontrado');
  process.exit(1);
}

console.log('🚀 Post-build completado');
