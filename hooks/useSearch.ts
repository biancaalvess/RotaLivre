import { useState, useCallback, useEffect } from 'react';

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  rating?: number;
  reviews?: number;
  phone?: string;
  website?: string;
  price?: string;
  open_state?: string;
  source: string;
  category?: string;
}

export interface SearchParams {
  query: string;
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
  use_cache?: boolean;
}

export interface AutocompleteSuggestion {
  display_name: string;
  coordinates: { lat: number; lng: number };
  type: string;
  importance: number;
}

export interface UseSearchReturn {
  // Estados
  results: SearchResult[];
  suggestions: AutocompleteSuggestion[];
  loading: boolean;
  error: string | null;
  categories: Record<string, any>;
  
  // Funções
  search: (params: SearchParams) => Promise<void>;
  searchByCategory: (category: string, lat: number, lng: number, radius?: number) => Promise<void>;
  getSuggestions: (query: string, limit?: number) => Promise<void>;
  getCategories: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, any>>({});

  const search = useCallback(async ({
    query,
    lat,
    lng,
    radius = 5,
    category,
    use_cache = true
  }: SearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        query,
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        use_cache: use_cache.toString(),
      });

      if (category) {
        searchParams.set('category', category);
      }

      const response = await fetch(`/api/search?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
      } else {
        setError(data.error || 'Erro na busca');
        setResults([]);
      }
    } catch (err) {
      setError('Erro de conexão');
      setResults([]);
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByCategory = useCallback(async (
    category: string,
    lat: number,
    lng: number,
    radius: number = 5
  ) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
      });

      const response = await fetch(`/api/search/category/${category}?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
      } else {
        setError(data.error || 'Erro na busca por categoria');
        setResults([]);
      }
    } catch (err) {
      setError('Erro de conexão');
      setResults([]);
      console.error('Erro na busca por categoria:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (query: string, limit: number = 5) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const searchParams = new URLSearchParams({
        query: query.trim(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/search/autocomplete?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setSuggestions(data.suggestions || []);
      } else {
        console.warn('Erro no autocomplete:', data.error);
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Erro no autocomplete:', err);
      setSuggestions([]);
    }
  }, []);

  const getCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/search/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || {});
      } else {
        console.warn('Erro ao buscar categorias:', data.error);
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar categorias na inicialização
  useEffect(() => {
    getCategories();
  }, [getCategories]);

  return {
    results,
    suggestions,
    loading,
    error,
    categories,
    search,
    searchByCategory,
    getSuggestions,
    getCategories,
    clearResults,
    clearError
  };
}
