'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Search, 
  X, 
  ChevronDown, 
  Palette,
  Tag,
  DollarSign,
  Sparkles,
  SortAsc
} from 'lucide-react';
import { occasionNames, getOccasionByLabel } from '@/config/occasions';

const flowerColors = [
  { value: "Todos", label: "Todos los colores", color: "bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400" },
  { value: "Rojo", label: "Rojo", color: "bg-red-500" },
  { value: "Blanco", label: "Blanco", color: "bg-white border-2 border-gray-300" },
  { value: "Rosa", label: "Rosa", color: "bg-pink-500" },
  { value: "Amarillo", label: "Amarillo", color: "bg-yellow-500" },
  { value: "Morado", label: "Morado", color: "bg-purple-500" },
  { value: "Naranja", label: "Naranja", color: "bg-orange-500" },
  { value: "Azul", label: "Azul", color: "bg-blue-500" },
  { value: "Multicolor", label: "Multicolor", color: "bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400" }
];

const sortOptions = [
  { label: "Más populares", value: "popular", icon: Sparkles },
  { label: "Precio: menor a mayor", value: "price-asc", icon: SortAsc },
  { label: "Precio: mayor a menor", value: "price-desc", icon: SortAsc },
  { label: "Mejor calificado", value: "rating", icon: Sparkles },
  { label: "Más reciente", value: "newest", icon: Sparkles }
];

interface FiltersProps {
  categories: string[];
  selectedCategory: string;
  selectedColor: string;
  selectedOccasion: string;
  selectedSubfilter: string;
  priceRange: [number, number];
  sortBy: string;
  searchTerm: string;
  onCategoryChange: (category: string) => void;
  onColorChange: (color: string) => void;
  onOccasionChange: (occasion: string) => void;
  onSubfilterChange: (subfilter: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (search: string) => void;
}

export default function ModernFilters({
  categories,
  selectedCategory,
  selectedColor,
  selectedOccasion,
  selectedSubfilter,
  priceRange,
  sortBy,
  searchTerm,
  onCategoryChange,
  onColorChange,
  onOccasionChange,
  onSubfilterChange,
  onPriceRangeChange,
  onSortChange,
  onSearchChange
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const activeFiltersCount = [
    selectedCategory !== "Todas" ? 1 : 0,
    selectedColor !== "Todos" ? 1 : 0,
    selectedOccasion !== "Todas" ? 1 : 0,
    selectedSubfilter !== "Todos" ? 1 : 0,
    priceRange[0] > 0 || priceRange[1] < 2500 ? 1 : 0,
    searchTerm.length > 0 ? 1 : 0
  ].reduce((sum, val) => sum + val, 0);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const clearAllFilters = () => {
    onCategoryChange("Todas");
    onColorChange("Todos");
    onOccasionChange("Todas");
    onSubfilterChange("Todos");
    onPriceRangeChange([0, 2500]);
    onSearchChange("");
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-pink-bright" />
            <span className="font-medium text-gray-900">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-pink-bright text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Filters Container */}
      <motion.div
        className={`
          md:relative md:translate-x-0 md:bg-transparent md:shadow-none md:z-auto
          ${isOpen ? 'fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform translate-x-0' : 'fixed top-0 right-0 h-full w-80 transform translate-x-full'}
          transition-transform duration-300 ease-in-out md:transition-none
        `}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-0 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)] md:max-h-none">
          {/* Search Bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Search className="w-4 h-4 text-pink-bright" />
              <span>Buscar flores</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-pink-bright transition-colors"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <SortAsc className="w-4 h-4 text-pink-bright" />
              <span>Ordenar por</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-bright focus:border-pink-bright bg-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('categories')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-pink-bright transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-pink-bright" />
                <span>Categorías</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'categories' ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {(openSection === 'categories' || !openSection) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {categories.map(category => (
                    <label
                      key={category}
                      className={`
                        flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all hover:bg-gray-50
                        ${selectedCategory === category ? 'bg-pink-50 border border-pink-200' : ''}
                      `}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="text-pink-bright focus:ring-pink-bright"
                      />
                      <span className={`text-sm ${selectedCategory === category ? 'font-medium text-pink-bright' : 'text-gray-700'}`}>
                        {category}
                      </span>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('colors')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-pink-bright transition-colors"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-bright" />
                <span>Colores</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'colors' ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {(openSection === 'colors' || !openSection) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-2 gap-2 overflow-hidden"
                >
                  {flowerColors.map(color => (
                    <motion.button
                      key={color.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onColorChange(color.value)}
                      className={`
                        flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left
                        ${selectedColor === color.value 
                          ? 'border-pink-bright bg-pink-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className={`w-4 h-4 rounded-full ${color.color} flex-shrink-0`} />
                      <span className={`text-xs ${selectedColor === color.value ? 'font-medium text-pink-bright' : 'text-gray-600'}`}>
                        {color.label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Occasions */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('occasions')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-pink-bright transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-bright" />
                <span>Ocasiones</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'occasions' ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {(openSection === 'occasions' || !openSection) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 max-h-60 overflow-y-auto overflow-hidden"
                >
                  {occasionNames.map(occasion => (
                    <label
                      key={occasion}
                      className={`
                        flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all hover:bg-gray-50
                        ${selectedOccasion === occasion ? 'bg-pink-50 border border-pink-200' : ''}
                      `}
                    >
                      <input
                        type="radio"
                        name="occasion"
                        value={occasion}
                        checked={selectedOccasion === occasion}
                        onChange={(e) => onOccasionChange(e.target.value)}
                        className="text-pink-bright focus:ring-pink-bright"
                      />
                      <span className={`text-sm ${selectedOccasion === occasion ? 'font-medium text-pink-bright' : 'text-gray-700'}`}>
                        {occasion}
                      </span>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-pink-bright transition-colors"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-pink-bright" />
                <span>Precio</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'price' ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {(openSection === 'price' || !openSection) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>S/ {priceRange[0]}</span>
                    <span>S/ {priceRange[1]}</span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2500"
                      value={priceRange[1]}
                      onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={priceRange[0]}
                        onChange={(e) => onPriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="flex-1 p-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-pink-bright focus:border-pink-bright"
                      />
                      <input
                        type="number"
                        placeholder="Máx"
                        value={priceRange[1]}
                        onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value) || 2500])}
                        className="flex-1 p-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-pink-bright focus:border-pink-bright"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearAllFilters}
              className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar filtros ({activeFiltersCount})
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Desktop Backdrop */}
      <style jsx global>{`
        .slider {
          background: linear-gradient(to right, #fc46ab 0%, #fc46ab ${(priceRange[1]/2500)*100}%, #e5e7eb ${(priceRange[1]/2500)*100}%, #e5e7eb 100%);
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fc46ab;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fc46ab;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </>
  );
}
