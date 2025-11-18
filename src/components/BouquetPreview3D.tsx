'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react';

interface FlowerType {
  id: string;
  name: string;
  color: string;
  price: number;
}

interface WrapperType {
  id: string;
  name: string;
  color: string;
  price: number;
}

interface AddonType {
  id: string;
  name: string;
  type: string;
  price: number;
}

interface BouquetPreview3DProps {
  flowers: { flower: FlowerType; quantity: number }[];
  wrapper: WrapperType | null;
  addons: AddonType[];
}

export default function BouquetPreview3D({ flowers, wrapper, addons }: BouquetPreview3DProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  // Crear disposición de flores en 3D
  const renderFlowers = () => {
    interface FlowerElement extends FlowerType {
      position: { x: number; y: number; z: number };
      rotation: number;
      key: string;
    }
    
    const allFlowers: FlowerElement[] = [];
    
    flowers.forEach((item, flowerIndex) => {
      for (let i = 0; i < item.quantity; i++) {
        // Calcular posición en espiral 3D
        const angle = (flowerIndex * item.quantity + i) * 0.8;
        const radius = 20 + (i * 5);
        const height = Math.sin(angle * 0.3) * 10;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = height;
        
        allFlowers.push({
          ...item.flower,
          position: { x, y, z },
          rotation: angle * 30,
          key: `${item.flower.id}-${i}`
        });
      }
    });
    
    return allFlowers;
  };

  const flowerElements = renderFlowers();

  return (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Move3D className="w-5 h-5 text-purple-600" />
          Vista Previa 3D
        </h3>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setZoom(Math.min(2, zoom + 0.2))}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <ZoomIn className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <ZoomOut className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetView}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-80 bg-gradient-to-b from-sky-200 to-green-200 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ perspective: '1000px' }}
      >
        {/* Fondo con nubes */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 left-8 w-16 h-8 bg-white rounded-full blur-sm"></div>
          <div className="absolute top-8 right-12 w-20 h-10 bg-white rounded-full blur-sm"></div>
          <div className="absolute top-12 left-1/3 w-12 h-6 bg-white rounded-full blur-sm"></div>
        </div>

        {/* Contenedor 3D del ramo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d'
          }}
          animate={{
            rotateY: isDragging ? 0 : rotation.y + 360
          }}
          transition={{
            duration: isDragging ? 0 : 20,
            repeat: isDragging ? 0 : Infinity,
            ease: 'linear'
          }}
        >
          {/* Base del ramo (envoltura) */}
          {wrapper && (
            <motion.div
              className="absolute bottom-0"
              style={{
                transform: 'translateZ(-50px)',
                transformStyle: 'preserve-3d'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className={`w-24 h-32 rounded-t-full ${
                wrapper.color === 'brown' ? 'bg-amber-800' :
                wrapper.color === 'white' ? 'bg-white border-2 border-gray-200' :
                'bg-gray-200 opacity-80'
              } shadow-lg`}></div>
            </motion.div>
          )}

          {/* Flores en 3D */}
          {flowerElements.map((flower, index) => (
            <motion.div
              key={flower.key}
              className="absolute"
              style={{
                transform: `translate3d(${flower.position.x}px, ${flower.position.y}px, ${flower.position.z}px) rotateZ(${flower.rotation}deg)`,
                transformStyle: 'preserve-3d'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100
              }}
            >
              <div className="relative">
                {/* Sombra de la flor */}
                <div 
                  className="absolute -bottom-2 w-8 h-2 bg-black opacity-20 rounded-full blur-sm"
                  style={{ transform: 'rotateX(90deg) translateZ(-10px)' }}
                ></div>
                
                {/* Flor */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                  flower.color === 'red' ? 'bg-red-500' :
                  flower.color === 'white' ? 'bg-white border-2 border-gray-300' :
                  flower.color === 'yellow' ? 'bg-yellow-500' :
                  flower.color === 'purple' ? 'bg-purple-500' :
                  'bg-pink-500'
                }`}>
                  <div className={`w-4 h-4 rounded-full ${
                    flower.color === 'white' ? 'bg-yellow-300' : 'bg-white'
                  } opacity-80`}></div>
                </div>
                
                {/* Tallo */}
                <div 
                  className="absolute top-8 left-1/2 w-1 h-12 bg-green-600 rounded-full"
                  style={{ transform: 'translateX(-50%) rotateX(-90deg)' }}
                ></div>
              </div>
            </motion.div>
          ))}

          {/* Accesorios */}
          {addons.map((addon, index) => (
            <motion.div
              key={addon.id}
              className="absolute"
              style={{
                transform: `translate3d(${20 + index * 15}px, 40px, 10px)`,
                transformStyle: 'preserve-3d'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: (flowerElements.length * 0.1) + (index * 0.2),
                type: 'spring'
              }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                addon.type === 'lazo' ? 'bg-red-600' :
                addon.type === 'tarjeta' ? 'bg-white border-2 border-pink-300' :
                'bg-yellow-400'
              }`}>
                {addon.type === 'lazo' && <div className="w-3 h-3 bg-red-800 rounded-full"></div>}
                {addon.type === 'tarjeta' && <div className="w-2 h-2 bg-pink-500 rounded-full"></div>}
                {addon.type === 'adorno' && <div className="w-3 h-3 bg-orange-400 rounded-full"></div>}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Instrucciones de interacción */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white text-xs px-3 py-2 rounded-full">
          Arrastra para rotar • Usa los botones para zoom
        </div>
      </div>

      {/* Información del ramo */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {flowerElements.length} flores • {addons.length} accesorios
          {wrapper && ` • Envoltura ${wrapper.name}`}
        </p>
      </div>
    </div>
  );
}
