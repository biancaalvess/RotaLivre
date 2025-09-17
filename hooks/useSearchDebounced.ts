import { useState, useCallback, useEffect, useRef } from 'react';
import { SearchParams, AutocompleteSuggestion } from './useSearch';

export interface UseSearchDebouncedReturn {
  // Estados
  query: string;
  suggestions: AutocompleteSuggestion[];
  loading: boolean;
  error: string | null;
  
  // Funções
  setQuery: (query: string) => void;
  clearQuery: () => void;
  selectSuggestion: (suggestion: AutocompleteSuggestion) => void;
}

export function useSearchDebounced(
  onSearch: (params: SearchParams) => Promise<void>,
  getSuggestions: (query: string, limit?: number) => Promise<void>,
  suggestions: AutocompleteSuggestion[],
  debounceMs: number = 300
): UseSearchDebouncedReturn {
  const [query, setQueryState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Se query estiver vazia, limpar sugestões
    if (!newQuery.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Criar novo timeout para debounce
    timeoutRef.current = setTimeout(async () => {
      try {
        await getSuggestions(newQuery, 5);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar sugestões:', err);
        setLoading(false);
      }
    }, debounceMs);
  }, [getSuggestions, debounceMs]);

  const clearQuery = useCallback(() => {
    setQueryState('');
    setSuggestions([]);
    setLoading(false);
    setError(null);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const selectSuggestion = useCallback((suggestion: AutocompleteSuggestion) => {
    setQueryState(suggestion.display_name);
    setSuggestions([]);
    setLoading(false);
  }, []);

  // Não precisamos mais deste useEffect pois as sugestões vêm como parâmetro

  // Cleanup timeout no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    suggestions,
    loading,
    error,
    setQuery,
    clearQuery,
    selectSuggestion
  };
}
