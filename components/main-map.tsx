"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search as SearchIcon,
  Navigation,
  MapPin,
  Route,
  Clock,
  Car,
  Bike,
  User,
  Target,
  ArrowUp,
  AlertTriangle,
  Thermometer,
  Eye,
  CloudRain,
  Cloud,
  Fuel,
  Bed,
  X,
  ArrowUpDown,
  Crosshair,
  RefreshCw,
  Phone,
  Globe,
  Star,
  MapPin as MapPinIcon,
} from "lucide-react";
import { useMap } from "@/hooks/useMap";
import { useSerpApi } from "@/hooks/useSerpApi";
import { useLocation } from "@/hooks/useLocation";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import { SerpApiPlace } from "@/lib/serpapi";

interface MainMapProps {
  userLocation: { lat: number; lon: number } | null;
}

export function MainMap({ userLocation }: MainMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { mapRef } = useMap();

  // Usar o hook da API do SerpAPI (mantido para compatibilidade)
  const {
    gasStations,
    accommodations,
    mechanics,
    restaurants,
    pharmacies,
    loading,
    error,
    searchPlaces,
    refreshData,
  } = useSerpApi(userLocation);

  // Usar o novo hook de busca
  const {
    results: newSearchResults,
    loading: searchLoading,
    error: searchError,
    search: performSearch,
    searchByCategory: performCategorySearch,
  } = useSearch();

  // Usar o hook da API de localização
  const {
    locationDetails,
    loading: locationLoading,
    error: locationError,
    updateLocation,
    searchAddress,
  } = useLocation(userLocation);

  // Simulação de dados de rota
  useEffect(() => {
    if (destination) {
      setRouteInfo({
        distance: "2.3 km",
        duration: "8 min",
        cost: "$6-8",
        traffic: "Baixo",
        weather_alert: "Chuva leve em 30min",
        fuel_consumption: "1.2L/100km",
        alternatives: [
          { type: "car", duration: "6 min", cost: "$8-12" },
          { type: "bike", duration: "12 min" },
          { type: "walk", duration: "28 min", distance: "2.3 km" },
        ],
      });
    }
  }, [destination]);

  // Função para buscar lugares por categoria
  const handleSearchCategory = async (category: string) => {
    if (userLocation) {
      await performCategorySearch(
        category,
        userLocation.lat,
        userLocation.lon,
        5
      );
      setShowSearchResults(true);
    }
  };

  // Função para lidar com resultados de busca
  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Função para selecionar localização no mapa
  const handleLocationSelect = (lat: number, lng: number) => {
    // Aqui você pode adicionar lógica para centralizar o mapa na localização
    console.log("Localização selecionada:", lat, lng);
  };

  // Função para navegar para localização
  const handleNavigate = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  // Função para buscar endereços
  const handleAddressSearch = async () => {
    if (searchQuery.trim()) {
      // Primeiro tentar buscar como endereço
      const addressResults = await searchAddress(searchQuery.trim());
      if (addressResults.length > 0) {
        // Se encontrou endereços, usar o primeiro
        const firstResult = addressResults[0];
        await updateLocation(firstResult.lat, firstResult.lng);
        setSearchQuery(""); // Limpar o campo de busca
      } else {
        // Se não encontrou endereços, buscar como lugares
        await searchPlaces(
          searchQuery.trim(),
          userLocation?.lat || 0,
          userLocation?.lon || 0
        );
      }
    }
  };

  // Função para abrir no Google Maps
  const openInGoogleMaps = (place: SerpApiPlace) => {
    const { latitude, longitude } = place.gps_coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  // Função para fazer ligação
  const makePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  // Função para abrir website
  const openWebsite = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar - Mobile First */}
      <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <SearchBar
          onSearchResults={handleSearchResults}
          onLocationSelect={handleLocationSelect}
          userLocation={userLocation}
          className="w-full"
        />
      </div>

      {/* Main Content - Mobile First */}
      <div className="flex-1 flex flex-col">
        {/* Map Container - Google Maps Real */}
        <div className="flex-1 relative bg-gray-100">
          {/* Google Maps Embed */}
          <div className="absolute inset-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235203.81500692177!2d-43.58841988251077!3d-22.9111720903467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9bde559108a05b%3A0x50dc426c672fd24e!2sRio+de+Janeiro%2C+RJ!5e0!3m2!1spt-BR!2sbr!4v1476880758681"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps - RotaLivre"
            ></iframe>
          </div>

          {/* Search Results Overlay */}
          {showSearchResults &&
            (searchResults.length > 0 || newSearchResults.length > 0) && (
              <div className="absolute top-4 left-4 right-4 z-20 max-h-96 overflow-y-auto">
                <SearchResults
                  results={
                    searchResults.length > 0 ? searchResults : newSearchResults
                  }
                  onLocationSelect={handleLocationSelect}
                  onNavigate={handleNavigate}
                  className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg"
                />
              </div>
            )}

          {/* Current Location Badge */}
          {userLocation && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="secondary"
                size="sm"
                className="h-10 w-10 p-0 rounded-full shadow-lg bg-white border border-gray-200"
                onClick={() => refreshData()}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Crosshair className="w-5 h-5" />
                )}
              </Button>
            </div>
          )}

          {/* Location Information */}
          {locationDetails && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <Card className="bg-white/95 backdrop-blur-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {locationDetails.cityState}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {locationDetails.address}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Route Info Overlay - Mobile Style */}
          {routeInfo && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-4">
                  {/* Main Route Info */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Car className="w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">4 min</p>
                      <p className="text-xs text-gray-500">Carro</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Bike className="w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">7 min</p>
                      <p className="text-xs text-gray-500">Bicicleta</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">10 min</p>
                      <p className="text-xs text-gray-500">A pé</p>
                    </div>
                  </div>

                  {/* Selected Route - Purple Bar */}
                  <div className="bg-purple-600 rounded-lg p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5" />
                        <div>
                          <p className="font-medium">10 min</p>
                          <p className="text-xs text-purple-200">0.8 km</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-white hover:bg-purple-700"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Minimalist Info Section Below Map - Mobile First */}
        <div className="bg-white border-t border-gray-200">
          <div className="p-4">
            {/* Quick Stats Row - Apenas as 3 informações essenciais */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Thermometer className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">24°</p>
                <p className="text-xs text-gray-500">Temperatura</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">10km</p>
                <p className="text-xs text-gray-500">Visibilidade</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CloudRain className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">30%</p>
                <p className="text-xs text-gray-500">Chuva</p>
              </div>
            </div>

            {/* Error Display */}
            {(error || searchError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error || searchError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => handleSearchCategory("gasolina")}
                disabled={loading || searchLoading}
              >
                <Fuel className="w-4 h-4 mr-2" />
                {loading || searchLoading ? "Carregando..." : "Postos"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => handleSearchCategory("hospedagem")}
                disabled={loading || searchLoading}
              >
                <Bed className="w-4 h-4 mr-2" />
                {loading || searchLoading ? "Carregando..." : "Hospedagem"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => handleSearchCategory("oficina")}
                disabled={loading || searchLoading}
              >
                <Cloud className="w-4 h-4 mr-2" />
                {loading || searchLoading ? "Carregando..." : "Oficinas"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
