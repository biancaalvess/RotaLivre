"use client";

import React, { useState } from "react";
import { Filter, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface SearchFilters {
  maxDistance: number;
  minRating: number;
  priceRange: string[];
  openNow: boolean;
  categories: string[];
  sources: string[];
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  availableCategories: string[];
  className?: string;
}

export function SearchFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCategories,
  className = "",
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handlePriceRangeChange = (price: string, checked: boolean) => {
    const newPriceRange = checked
      ? [...filters.priceRange, price]
      : filters.priceRange.filter((p) => p !== price);

    updateFilter("priceRange", newPriceRange);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);

    updateFilter("categories", newCategories);
  };

  const handleSourceChange = (source: string, checked: boolean) => {
    const newSources = checked
      ? [...filters.sources, source]
      : filters.sources.filter((s) => s !== source);

    updateFilter("sources", newSources);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.maxDistance < 50) count++;
    if (filters.minRating > 0) count++;
    if (filters.priceRange.length > 0) count++;
    if (filters.openNow) count++;
    if (filters.categories.length > 0) count++;
    if (filters.sources.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros de Busca</CardTitle>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-xs"
                  >
                    Limpar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Distância Máxima */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Distância Máxima: {filters.maxDistance}km
              </Label>
              <Slider
                value={[filters.maxDistance]}
                onValueChange={([value]) => updateFilter("maxDistance", value)}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Avaliação Mínima */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Avaliação Mínima: {filters.minRating.toFixed(1)} ⭐
              </Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={([value]) => updateFilter("minRating", value)}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Faixa de Preço */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Faixa de Preço</Label>
              <div className="space-y-2">
                {[
                  { value: "free", label: "Gratuito" },
                  { value: "low", label: "Baixo ($)" },
                  { value: "medium", label: "Médio ($$)" },
                  { value: "high", label: "Alto ($$$)" },
                ].map((price) => (
                  <div
                    key={price.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`price-${price.value}`}
                      checked={filters.priceRange.includes(price.value)}
                      onCheckedChange={(checked) =>
                        handlePriceRangeChange(price.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`price-${price.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {price.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Aberto Agora */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="open-now"
                  checked={filters.openNow}
                  onCheckedChange={(checked) =>
                    updateFilter("openNow", checked as boolean)
                  }
                />
                <Label htmlFor="open-now" className="text-sm cursor-pointer">
                  Aberto agora
                </Label>
              </div>
            </div>

            {/* Categorias */}
            {availableCategories.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Categorias</Label>
                <div className="space-y-2">
                  {availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer capitalize"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fontes */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Fontes</Label>
              <div className="space-y-2">
                {[
                  { value: "openstreetmap", label: "OpenStreetMap" },
                  { value: "serpapi", label: "SerpAPI" },
                ].map((source) => (
                  <div
                    key={source.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`source-${source.value}`}
                      checked={filters.sources.includes(source.value)}
                      onCheckedChange={(checked) =>
                        handleSourceChange(source.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`source-${source.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {source.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
