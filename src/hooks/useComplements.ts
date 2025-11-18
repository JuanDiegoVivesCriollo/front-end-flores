'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import type { Complement, ComplementType } from '@/types';

// Hook para obtener tipos de complementos
export function useComplementTypes() {
  const [types, setTypes] = useState<ComplementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplementTypes();

      if (response.success && response.data) {
        setTypes(response.data);
      } else {
        setError(response.message || 'Failed to fetch complement types');
      }
    } catch (err) {
      setError('Error fetching complement types');
      console.error('Error fetching complement types:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return { types, loading, error, refetch: fetchTypes };
}

// Hook para obtener complementos
export function useComplements(params?: {
  type?: string;
  featured?: boolean;
  on_sale?: boolean;
  in_stock?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
  color?: string;
  size?: string;
  brand?: string;
  sort_by?: 'price' | 'name' | 'created_at' | 'sort_order' | 'rating';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}) {
  const [complements, setComplements] = useState<Complement[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplements(params);

      if (response.success && response.data) {
        setComplements(response.data.data);
        setPagination({
          total: response.data.total,
          per_page: response.data.per_page,
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          from: response.data.from,
          to: response.data.to
        });
      } else {
        setError(response.message || 'Failed to fetch complements');
      }
    } catch (err) {
      setError('Error fetching complements');
      console.error('Error fetching complements:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchComplements();
  }, [fetchComplements]);

  return { complements, pagination, loading, error, refetch: fetchComplements };
}

// Hook para obtener complementos destacados
export function useFeaturedComplements(limit?: number) {
  const [complements, setComplements] = useState<Complement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedComplements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFeaturedComplements(limit);

      if (response.success && response.data) {
        setComplements(response.data);
      } else {
        setError(response.message || 'Failed to fetch featured complements');
      }
    } catch (err) {
      setError('Error fetching featured complements');
      console.error('Error fetching featured complements:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeaturedComplements();
  }, [fetchFeaturedComplements]);

  return { complements, loading, error, refetch: fetchFeaturedComplements };
}

// Hook para obtener complementos en oferta
export function useComplementsOnSale(limit?: number) {
  const [complements, setComplements] = useState<Complement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplementsOnSale = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplementsOnSale(limit);

      if (response.success && response.data) {
        setComplements(response.data);
      } else {
        setError(response.message || 'Failed to fetch complements on sale');
      }
    } catch (err) {
      setError('Error fetching complements on sale');
      console.error('Error fetching complements on sale:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchComplementsOnSale();
  }, [fetchComplementsOnSale]);

  return { complements, loading, error, refetch: fetchComplementsOnSale };
}

// Hook para obtener un complemento específico
export function useComplement(id: number) {
  const [complement, setComplement] = useState<Complement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplement = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplement(id);

      if (response.success && response.data) {
        setComplement(response.data);
      } else {
        setError(response.message || 'Failed to fetch complement');
      }
    } catch (err) {
      setError('Error fetching complement');
      console.error('Error fetching complement:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchComplement();
    }
  }, [id, fetchComplement]);

  return { complement, loading, error, refetch: fetchComplement };
}

// Hook para obtener complementos por tipo
export function useComplementsByType(type: string, params?: {
  sort_by?: string;
  sort_direction?: string;
  per_page?: number;
  page?: number;
  featured?: boolean;
  on_sale?: boolean;
  in_stock?: boolean;
  search?: string;
}) {
  const [data, setData] = useState<{
    type: string | null;
    complements: Complement[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
      from: number;
      to: number;
    } | null;
  }>({
    type: null,
    complements: [],
    pagination: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplementsByType = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplementsByType(type, params);

      if (response.success && response.data) {
        setData({
          type: response.data.type,
          complements: response.data.complements.data,
          pagination: {
            total: response.data.complements.total,
            per_page: response.data.complements.per_page,
            current_page: response.data.complements.current_page,
            last_page: response.data.complements.last_page,
            from: response.data.complements.from,
            to: response.data.complements.to
          }
        });
      } else {
        setError(response.message || 'Failed to fetch complements by type');
      }
    } catch (err) {
      setError('Error fetching complements by type');
      console.error('Error fetching complements by type:', err);
    } finally {
      setLoading(false);
    }
  }, [type, params]);

  useEffect(() => {
    if (type) {
      fetchComplementsByType();
    }
  }, [type, fetchComplementsByType]);

  return { 
    type: data.type, 
    complements: data.complements, 
    pagination: data.pagination, 
    loading, 
    error, 
    refetch: fetchComplementsByType 
  };
}

const complementHooks = {
  useComplementTypes,
  useComplements,
  useFeaturedComplements,
  useComplementsOnSale,
  useComplement,
  useComplementsByType
};

export default complementHooks;
