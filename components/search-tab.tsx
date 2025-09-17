"use client";

import React from "react";
import { SearchIntegration } from "@/components/search-integration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Filter, Zap } from "lucide-react";

interface SearchTabProps {
  userLocation: { lat: number; lng: number } | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  onNavigate?: (lat: number, lng: number) => void;
}

export function SearchTab({
  userLocation,
  onLocationSelect,
  onNavigate,
}: SearchTabProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Busca Inteligente
            </h2>
            <p className="text-sm text-gray-600">
              Encontre postos, oficinas, hospedagem e muito mais
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center space-x-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Busca Rápida
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Filter className="h-3 w-3 mr-1" />
            Filtros Avançados
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Localização Atual
          </Badge>
        </div>
      </div>

      {/* Search Integration */}
      <div className="flex-1 p-4 overflow-y-auto">
        <SearchIntegration
          userLocation={userLocation}
          onLocationSelect={onLocationSelect}
          onNavigate={onNavigate}
          className="h-full"
        />
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t bg-gray-50">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {userLocation
                  ? `Localização: ${userLocation.lat.toFixed(
                      4
                    )}, ${userLocation.lng.toFixed(4)}`
                  : "Localização não disponível"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Dica: Use filtros para refinar sua busca e encontrar exatamente
              o que precisa
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
