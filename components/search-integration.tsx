"use client";

import React, { useState, useEffect } from "react";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import {
  SearchFiltersComponent,
  SearchFilters,
} from "@/components/search-filters";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Navigation } from "lucide-react";

interface SearchIntegrationProps {
  userLocation: { lat: number; lng: number } | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  onNavigate?: (lat: number, lng: number) => void;
  className?: string;
}

export function SearchIntegration({
  userLocation,
  onLocationSelect,
  onNavigate,
  className = "",
}: SearchIntegrationProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    maxDistance: 10,
    minRating: 0,
    priceRange: [],
    openNow: false,
    categories: [],
    sources: [],
  });

  const {
    results,
    loading,
    error,
    categories,
    search,
    searchByCategory,
    clearResults,
  } = useSearch();

  // Aplicar filtros aos resultados
  const applyFilters = (results: SearchResult[]): SearchResult[] => {
    return results.filter((result) => {
      // Filtro de distância
      if (result.distance > filters.maxDistance) return false;

      // Filtro de avaliação
      if (result.rating && result.rating < filters.minRating) return false;

      // Filtro de preço
      if (filters.priceRange.length > 0 && result.price) {
        const priceMatch = filters.priceRange.some((range) => {
          switch (range) {
            case "free":
              return result.price === "Free" || !result.price;
            case "low":
              return result.price === "$";
            case "medium":
              return result.price === "$$";
            case "high":
              return result.price === "$$$" || result.price === "$$$$";
            default:
              return false;
          }
        });
        if (!priceMatch) return false;
      }

      // Filtro de aberto agora
      if (filters.openNow && result.open_state) {
        if (!result.open_state.toLowerCase().includes("open")) return false;
      }

      // Filtro de categoria
      if (filters.categories.length > 0 && result.category) {
        if (!filters.categories.includes(result.category)) return false;
      }

      // Filtro de fonte
      if (filters.sources.length > 0) {
        if (!filters.sources.includes(result.source)) return false;
      }

      return true;
    });
  };

  // Atualizar resultados filtrados quando mudarem os resultados ou filtros
  useEffect(() => {
    if (results.length > 0) {
      const filteredResults = applyFilters(results);
      setSearchResults(filteredResults);
      setShowResults(true);
    }
  }, [results, filters]);

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
    setShowResults(true);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  const handleNavigate = (lat: number, lng: number) => {
    if (onNavigate) {
      onNavigate(lat, lng);
    }
  };

  const handleClearResults = () => {
    setSearchResults([]);
    setShowResults(false);
    clearResults();
  };

  const handleClearFilters = () => {
    setFilters({
      maxDistance: 10,
      minRating: 0,
      priceRange: [],
      openNow: false,
      categories: [],
      sources: [],
    });
  };

  const availableCategories = Object.keys(categories);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de Pesquisa */}
      <SearchBar
        onSearchResults={handleSearchResults}
        onLocationSelect={handleLocationSelect}
        userLocation={userLocation}
        className="w-full"
      />

      {/* Filtros e Controles */}
      <div className="flex items-center justify-between">
        <SearchFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
          availableCategories={availableCategories}
        />

        {showResults && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {searchResults.length} resultado
              {searchResults.length !== 1 ? "s" : ""}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleClearResults}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        )}
      </div>

      {/* Resultados da Busca */}
      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Resultados da Busca</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Buscando...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>Erro na busca: {error}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum resultado encontrado</p>
                <p className="text-sm">
                  Tente ajustar os filtros ou buscar por outros termos
                </p>
              </div>
            ) : (
              <SearchResults
                results={searchResults}
                onLocationSelect={handleLocationSelect}
                onNavigate={handleNavigate}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
