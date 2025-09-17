"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Filter, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  useSearch,
  SearchResult,
  AutocompleteSuggestion,
} from "@/hooks/useSearch";
import { useSearchInput } from "@/hooks/useSearchInput";

interface SearchBarProps {
  onSearchResults?: (results: SearchResult[]) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
}

export function SearchBar({
  onSearchResults,
  onLocationSelect,
  userLocation,
  className = "",
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchRadius, setSearchRadius] = useState(5);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    results,
    loading,
    error,
    categories,
    search,
    searchByCategory,
    clearResults,
    getSuggestions,
    suggestions,
  } = useSearch();

  const {
    query,
    setQuery,
    clearQuery,
    selectSuggestion,
  } = useSearchInput();

  // Estado para controlar loading das sugestões
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Debounce para buscar sugestões
  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const timeout = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        await getSuggestions(query, 5);
      } catch (err) {
        console.error('Erro ao buscar sugestões:', err);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, getSuggestions]);

  // Notificar resultados para o componente pai
  useEffect(() => {
    if (onSearchResults && results.length > 0) {
      onSearchResults(results);
    }
  }, [results, onSearchResults]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!query.trim() || !userLocation) return;

    try {
      if (selectedCategory) {
        await searchByCategory(
          selectedCategory,
          userLocation.lat,
          userLocation.lng,
          searchRadius
        );
      } else {
        await search({
          query: query.trim(),
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: searchRadius,
          category: selectedCategory || undefined,
        });
      }
      setIsOpen(false);
    } catch (err) {
      console.error("Erro na busca:", err);
    }
  };

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    selectSuggestion(suggestion);
    if (onLocationSelect) {
      onLocationSelect(suggestion.coordinates.lat, suggestion.coordinates.lng);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
  };

  const handleClear = () => {
    clearQuery();
    clearResults();
    setSelectedCategory("");
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const categoryList = Object.keys(categories);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-2xl mx-auto ${className}`}
    >
      {/* Barra de pesquisa principal */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar postos, oficinas, hospedagem..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyPress}
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || !userLocation || loading}
            className="px-6"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Dropdown de sugestões e categorias */}
        {isOpen && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
            <CardContent className="p-4">
              {/* Categorias */}
              {categoryList.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Categorias</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoryList.map((category) => (
                      <Badge
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugestões de autocomplete */}
              {suggestions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Sugestões</span>
                    {suggestionsLoading && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {suggestion.display_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Controles de raio */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Raio:</span>
                <div className="flex space-x-1">
                  {[1, 3, 5, 10, 20].map((radius) => (
                    <Button
                      key={radius}
                      variant={searchRadius === radius ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSearchRadius(radius)}
                      className="h-8 px-2"
                    >
                      {radius}km
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Resultados da busca */}
      {results.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {results.length} resultado{results.length !== 1 ? "s" : ""}{" "}
              encontrado{results.length !== 1 ? "s" : ""}
            </span>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Limpar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
