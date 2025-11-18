# 🌸 Flores y Detalles Lima - Sistema Completo

Un sistema completo de e-commerce para florería con frontend en Next.js 15 y backend en Laravel 11, que incluye integración con pagos Izipay, sistema de correos EmailJS, y selector de ubicaciones con mapas interactivos.

## 📋 Descripción del Proyecto

**Flores y Detalles Lima** es una plataforma completa de comercio electrónico especializada en flores, ramos y detalles para diferentes ocasiones. El sistema permite a los usuarios:

- 🛒 Navegar y comprar productos por categorías y ocasiones
- 🗺️ Seleccionar ubicación de entrega con 3 métodos: mapa interactivo, búsqueda con sugerencias, y ubicación actual
- 💳 Procesar pagos seguros con Izipay
- 📧 Recibir confirmaciones automáticas por email
- 📱 Experiencia completamente responsive
- 🚚 Gestión de envíos a domicilio y recojo en tienda

## 🏗️ Arquitectura del Sistema

### Frontend (Next.js 15)
- **Framework**: Next.js 15 con App Router
- **Estilo**: Tailwind CSS
- **Mapas**: Leaflet con Nominatim API
- **Pagos**: Integración Izipay
- **Emails**: EmailJS para notificaciones
- **Estado**: React Hooks y Context API

### Backend (Laravel 11)
- **Framework**: Laravel 11
- **Base de datos**: MySQL
- **API**: RESTful APIs
- **Autenticación**: Laravel Sanctum
- **Storage**: Sistema de archivos local

## 🚀 Instalación y Configuración

### Pre-requisitos

- **Node.js**: v18 o superior
- **PHP**: v8.2 o superior
- **Composer**: Última versión
- **MySQL**: v8.0 o superior
- **Git**: Para clonar el repositorio

### 1. Clonar el Repositorio

```bash
# Clonar el frontend
git clone [URL_DEL_REPOSITORIO_FRONTEND] front-end-floresydetalles
cd front-end-floresydetalles

# Clonar el backend (en otra terminal)
git clone [URL_DEL_REPOSITORIO_BACKEND] backend-floresdjazmin
cd backend-floresdjazmin
```

### 2. Configuración del Frontend

```bash
cd front-end-floresydetalles

# Instalar dependencias
npm install
# o si prefieres Bun (más rápido)
bun install

# Crear archivo de variables de entorno
cp .env.example .env.local
```

#### Variables de entorno del Frontend (.env.local)

```env
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Configuración de Izipay
NEXT_PUBLIC_IZIPAY_PUBLIC_KEY=tu_clave_publica_izipay
NEXT_PUBLIC_IZIPAY_URL_SUCCESS=http://localhost:3000/payment/success
NEXT_PUBLIC_IZIPAY_URL_ERROR=http://localhost:3000/payment/error

# Configuración de EmailJS
NEXT_PUBLIC_EMAILJS_SERVICE_ID=tu_service_id_emailjs
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_CUSTOMER=tu_template_cliente_emailjs
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_VENDOR=tu_template_vendedor_emailjs
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=tu_public_key_emailjs

# URLs de producción (opcional)
NEXT_PUBLIC_PRODUCTION_API_URL=https://tu-dominio.com/api
```

### 3. Configuración del Backend

```bash
cd backend-floresdjazmin

# Instalar dependencias de PHP
composer install

# Crear archivo de variables de entorno
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate
```

#### Variables de entorno del Backend (.env)

```env
APP_NAME="Flores y Detalles Lima"
APP_ENV=local
APP_KEY=base64:tu_clave_generada
APP_DEBUG=true
APP_URL=http://localhost:8000

# Configuración de base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=flores_db
DB_USERNAME=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql

# Configuración de correo
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_password_email
MAIL_ENCRYPTION=tls

# Configuración de Izipay
IZIPAY_PUBLIC_KEY=tu_clave_publica_izipay
IZIPAY_PRIVATE_KEY=tu_clave_privada_izipay
IZIPAY_API_URL=https://api.izipay.pe

# URLs del frontend
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Configuración de la Base de Datos

```bash
# Crear la base de datos MySQL
mysql -u root -p
CREATE DATABASE flores_db;
exit;

# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders (datos de ejemplo)
php artisan db:seed
```

### 5. Configuración de Storage

```bash
# Crear enlaces simbólicos para archivos públicos
php artisan storage:link

# Crear directorios necesarios
mkdir -p storage/app/public/flowers
mkdir -p storage/app/public/categories
```

## 🏃‍♂️ Ejecutar el Proyecto

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend-floresdjazmin
php artisan serve
# El backend estará disponible en http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd front-end-floresydetalles
npm run dev
# o con Bun
bun dev
# El frontend estará disponible en http://localhost:3000
```

### Modo Producción

**Frontend:**
```bash
cd front-end-floresydetalles
npm run build
npm start
```

**Backend:**
```bash
cd backend-floresdjazmin
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan view:cache
php artisan route:cache
```

## 📁 Estructura del Proyecto

### Frontend
```
front-end-floresydetalles/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── (routes)/          # Rutas principales
│   │   ├── checkout/          # Proceso de compra
│   │   ├── payment/           # Páginas de pago
│   │   └── layout.tsx         # Layout principal
│   ├── components/            # Componentes reutilizables
│   │   ├── AddressSelector.tsx # Selector de ubicación con mapas
│   │   ├── ProductCard.tsx    # Tarjeta de producto
│   │   └── ...
│   ├── services/              # Servicios y APIs
│   │   ├── apiClient.ts       # Cliente API
│   │   ├── emailService.ts    # Servicio de emails
│   │   └── deliveryService.ts # Servicio de envíos
│   └── utils/                 # Utilidades
├── public/                    # Archivos públicos
└── package.json
```

### Backend
```
backend-floresdjazmin/
├── app/
│   ├── Http/Controllers/      # Controladores API
│   ├── Models/               # Modelos Eloquent
│   ├── Services/             # Servicios de negocio
│   └── ...
├── database/
│   ├── migrations/           # Migraciones de BD
│   └── seeders/             # Datos de ejemplo
├── routes/
│   ├── api.php              # Rutas API
│   └── web.php              # Rutas web
└── composer.json
```

## 🔧 Características Principales

### 1. Selector de Ubicaciones Avanzado
- **Mapa interactivo**: Click en el mapa para seleccionar ubicación
- **Búsqueda con sugerencias**: Autocompletado con Nominatim API
- **Ubicación actual**: Usa GPS del navegador
- **Auto-detección de distritos**: Calcula automáticamente el costo de envío

### 2. Sistema de Pagos
- **Integración Izipay**: Pasarela de pagos peruana
- **Formularios seguros**: Validación completa
- **Confirmaciones automáticas**: Emails al cliente y vendedor

### 3. Gestión de Productos
- **Categorías y ocasiones**: Organización flexible
- **Imágenes optimizadas**: Carga rápida
- **Filtros avanzados**: Búsqueda por múltiples criterios

### 4. Sistema de Correos
- **EmailJS**: Envío sin servidor backend de emails
- **Templates personalizados**: Para cliente y vendedor
- **Información completa**: Productos, delivery, notas especiales

## 🌐 APIs Integradas

- **Nominatim OSM**: Geocodificación y búsqueda de direcciones
- **Leaflet Maps**: Mapas interactivos
- **Izipay**: Procesamiento de pagos
- **EmailJS**: Envío de correos

## 🚀 Deploy en Producción

### Frontend (Vercel recomendado)
```bash
# Configurar variables de entorno en Vercel
# Deploy automático desde Git
vercel --prod
```

### Backend (Shared Hosting)
```bash
# Subir archivos via FTP/cPanel
# Configurar .htaccess para Laravel
# Configurar base de datos en hosting
```

## 📞 Soporte y Contacto

- **Desarrollador**: Diego Vives
- **Email**: [tu-email@ejemplo.com]
- **Teléfono**: [tu-teléfono]

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.

---

**Última actualización**: Septiembre 2025
**Versión**: 1.0.0