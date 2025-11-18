'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import type { Category, Flower } from '@/types';

// Hook para obtener categorías
export function useCategories(options?: {
  includeFlowerCount?: boolean;
  includeFlowers?: boolean;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCategories({
        include_flower_count: options?.includeFlowerCount,
        include_flowers: options?.includeFlowers
      });

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Error fetching categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [options?.includeFlowerCount, options?.includeFlowers]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

// Hook para obtener flores
export function useFlowers(params?: {
  category_id?: number;
  featured?: boolean;
  on_sale?: boolean;
  in_stock?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price' | 'name' | 'created_at' | 'sort_order';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  occasion?: string; // ✅ AGREGADO PARÁMETRO FALTANTE
  tipo_condolencia?: string;
}) {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 12,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlowers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFlowers(params);

      if (response.success && response.data) {
        setFlowers(response.data.data);
        setPagination({
          total: response.data.total,
          per_page: response.data.per_page,
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          from: response.data.from,
          to: response.data.to
        });
      } else {
        setError(response.message || 'Failed to fetch flowers');
      }
    } catch (err) {
      setError('Error fetching flowers');
      console.error('Error fetching flowers:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchFlowers();
  }, [fetchFlowers]);

  return { flowers, pagination, loading, error, refetch: fetchFlowers };
}

// Hook para obtener flores destacadas
export function useFeaturedFlowers(limit?: number) {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedFlowers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFeaturedFlowers(limit);

      if (response.success && response.data) {
        setFlowers(response.data);
      } else {
        setError(response.message || 'Failed to fetch featured flowers');
      }
    } catch (err) {
      setError('Error fetching featured flowers');
      console.error('Error fetching featured flowers:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeaturedFlowers();
  }, [fetchFeaturedFlowers]);

  return { flowers, loading, error, refetch: fetchFeaturedFlowers };
}

// Hook para obtener flores en oferta
export function useFlowersOnSale(limit?: number) {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlowersOnSale = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFlowersOnSale(limit);

      if (response.success && response.data) {
        setFlowers(response.data);
      } else {
        setError(response.message || 'Failed to fetch flowers on sale');
      }
    } catch (err) {
      setError('Error fetching flowers on sale');
      console.error('Error fetching flowers on sale:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFlowersOnSale();
  }, [fetchFlowersOnSale]);

  return { flowers, loading, error, refetch: fetchFlowersOnSale };
}

// Hook para obtener una flor específica
export function useFlower(id: number) {
  const [flower, setFlower] = useState<Flower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlower = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFlower(id);

      if (response.success && response.data) {
        setFlower(response.data);
      } else {
        setError(response.message || 'Failed to fetch flower');
      }
    } catch (err) {
      setError('Error fetching flower');
      console.error('Error fetching flower:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchFlower();
    }
  }, [id, fetchFlower]);

  return { flower, loading, error, refetch: fetchFlower };
}

// Hook para obtener flores por categoría
export function useFlowersByCategory(categoryId: number, params?: {
  sort_by?: string;
  sort_direction?: string;
  per_page?: number;
  page?: number;
}) {
  const [data, setData] = useState<{
    category: Category | null;
    flowers: Flower[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
      from: number;
      to: number;
    } | null;
  }>({
    category: null,
    flowers: [],
    pagination: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlowersByCategory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFlowersByCategory(categoryId, params);

      if (response.success && response.data) {
        setData({
          category: response.data.category,
          flowers: response.data.flowers.data,
          pagination: {
            total: response.data.flowers.total,
            per_page: response.data.flowers.per_page,
            current_page: response.data.flowers.current_page,
            last_page: response.data.flowers.last_page,
            from: response.data.flowers.from,
            to: response.data.flowers.to
          }
        });
      } else {
        setError(response.message || 'Failed to fetch flowers by category');
      }
    } catch (err) {
      setError('Error fetching flowers by category');
      console.error('Error fetching flowers by category:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, params]);

  useEffect(() => {
    if (categoryId) {
      fetchFlowersByCategory();
    }
  }, [categoryId, fetchFlowersByCategory]);

  return { 
    category: data.category, 
    flowers: data.flowers, 
    pagination: data.pagination, 
    loading, 
    error, 
    refetch: fetchFlowersByCategory 
  };
}

const catalogHooks = {
  useCategories,
  useFlowers,
  useFeaturedFlowers,
  useFlowersOnSale,
  useFlower,
  useFlowersByCategory
};

export default catalogHooks;
