"use client";

import React from "react";
import { MapPin, Star, Phone, Globe, Clock, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchResult } from "@/hooks/useSearch";

interface SearchResultsProps {
  results: SearchResult[];
  onLocationSelect?: (lat: number, lng: number) => void;
  onNavigate?: (lat: number, lng: number) => void;
  className?: string;
}

export function SearchResults({
  results,
  onLocationSelect,
  onNavigate,
  className = "",
}: SearchResultsProps) {
  if (results.length === 0) {
    return null;
  }

  const handleLocationClick = (result: SearchResult) => {
    if (onLocationSelect) {
      onLocationSelect(result.coordinates.lat, result.coordinates.lng);
    }
  };

  const handleNavigateClick = (result: SearchResult) => {
    if (onNavigate) {
      onNavigate(result.coordinates.lat, result.coordinates.lng);
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return "text-muted-foreground";
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-yellow-600";
    if (rating >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  const getOpenStateColor = (openState?: string) => {
    if (!openState) return "text-muted-foreground";
    if (openState.toLowerCase().includes("open")) return "text-green-600";
    if (openState.toLowerCase().includes("closed")) return "text-red-600";
    return "text-yellow-600";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {results.map((result) => (
        <Card key={result.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold truncate">
                  {result.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground truncate">
                    {result.address}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1 ml-2">
                <Badge variant="outline" className="text-xs">
                  {formatDistance(result.distance)}
                </Badge>
                {result.source && (
                  <Badge variant="secondary" className="text-xs">
                    {result.source}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Rating e Reviews */}
              {(result.rating || result.reviews) && (
                <div className="flex items-center space-x-2">
                  {result.rating && (
                    <div className="flex items-center space-x-1">
                      <Star
                        className={`h-4 w-4 ${getRatingColor(result.rating)}`}
                      />
                      <span
                        className={`text-sm font-medium ${getRatingColor(
                          result.rating
                        )}`}
                      >
                        {result.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {result.reviews && (
                    <span className="text-sm text-muted-foreground">
                      ({result.reviews} avaliações)
                    </span>
                  )}
                </div>
              )}

              {/* Preço e Status */}
              <div className="flex items-center space-x-4">
                {result.price && (
                  <Badge variant="outline" className="text-xs">
                    {result.price}
                  </Badge>
                )}
                {result.open_state && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={`text-sm ${getOpenStateColor(
                        result.open_state
                      )}`}
                    >
                      {result.open_state}
                    </span>
                  </div>
                )}
              </div>

              {/* Contatos */}
              {(result.phone || result.website) && (
                <div className="flex items-center space-x-4">
                  {result.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${result.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {result.phone}
                      </a>
                    </div>
                  )}
                  {result.website && (
                    <div className="flex items-center space-x-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={result.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLocationClick(result)}
                  className="flex-1"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Ver no Mapa
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleNavigateClick(result)}
                  className="flex-1"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navegar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
