"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Gauge,
  AlertTriangle,
  MapPin,
  Clock,
  Navigation,
  Shield,
  Zap,
  Snowflake,
  RefreshCw,
  Search,
  Loader2,
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { WeatherApiService } from "@/lib/weather-api";

const mockWeatherData = {
  current: {
    temp: 24,
    feels_like: 26,
    humidity: 65,
    wind_speed: 12,
    visibility: 10,
    pressure: 1013,
    description: "Parcialmente nublado",
    icon: "cloud",
    uv_index: 6,
    dew_point: 17,
  },
  hourly: [
    { time: "14:00", temp: 24, icon: "cloud", wind_speed: 12, rain_prob: 20 },
    { time: "15:00", temp: 25, icon: "sun", wind_speed: 15, rain_prob: 10 },
    { time: "16:00", temp: 26, icon: "sun", wind_speed: 18, rain_prob: 5 },
    { time: "17:00", temp: 25, icon: "cloud", wind_speed: 20, rain_prob: 30 },
    { time: "18:00", temp: 23, icon: "cloud", wind_speed: 22, rain_prob: 60 },
    { time: "19:00", temp: 21, icon: "rain", wind_speed: 25, rain_prob: 80 },
  ],
  daily: [
    {
      day: "Hoje",
      high: 26,
      low: 18,
      icon: "cloud",
      rain_prob: 30,
      wind_speed: 15,
    },
    {
      day: "Amanhã",
      high: 28,
      low: 19,
      icon: "sun",
      rain_prob: 10,
      wind_speed: 12,
    },
    {
      day: "Quinta",
      high: 27,
      low: 20,
      icon: "cloud",
      rain_prob: 40,
      wind_speed: 18,
    },
    {
      day: "Sexta",
      high: 29,
      low: 21,
      icon: "sun",
      rain_prob: 5,
      wind_speed: 10,
    },
    {
      day: "Sábado",
      high: 30,
      low: 22,
      icon: "sun",
      rain_prob: 15,
      wind_speed: 14,
    },
  ],
  motorcycle_alerts: [
    {
      type: "rain",
      severity: "medium",
      message: "Chuva prevista em 2 horas",
      time: "18:00",
    },
    {
      type: "wind",
      severity: "low",
      message: "Vento forte pode afetar estabilidade",
      time: "16:00",
    },
    {
      type: "visibility",
      severity: "low",
      message: "Visibilidade reduzida ao anoitecer",
      time: "19:00",
    },
  ],
};

const getWeatherIcon = (icon: string) => {
  // Mapear ícones do OpenWeatherMap para componentes Lucide
  if (icon.includes("01"))
    return <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
  if (icon.includes("02") || icon.includes("03"))
    return <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />;
  if (icon.includes("04"))
    return <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />;
  if (icon.includes("09") || icon.includes("10"))
    return <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />;
  if (icon.includes("11"))
    return <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />;
  if (icon.includes("13"))
    return <Snowflake className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />;
  if (icon.includes("50"))
    return <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
  return <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />;
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
};

const getSeverityIcon = (type: string) => {
  switch (type) {
    case "rain":
      return <CloudRain className="w-4 h-4" />;
    case "wind":
      return <Wind className="w-4 h-4" />;
    case "visibility":
      return <Eye className="w-4 h-4" />;
    case "temperature":
      return <Thermometer className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

interface WeatherTabProps {
  userLocation?: { lat: number; lon: number } | null;
}

export function WeatherTab({ userLocation }: WeatherTabProps) {
  const [searchCity, setSearchCity] = useState("");
  const {
    currentWeather,
    forecast,
    loading,
    error,
    refreshWeather,
    searchCity: searchCityAPI,
  } = useWeather(userLocation);

  const handleSearchCity = async () => {
    if (searchCity.trim()) {
      await searchCityAPI(searchCity.trim());
    }
  };

  const handleRefresh = async () => {
    await refreshWeather();
  };

  // Gerar alertas baseados nos dados reais
  const generateMotorcycleAlerts = () => {
    if (!currentWeather) return [];

    const alerts = [];

    // Alerta de chuva
    if (
      currentWeather.description.toLowerCase().includes("chuva") ||
      currentWeather.description.toLowerCase().includes("rain")
    ) {
      alerts.push({
        type: "rain",
        severity: "medium",
        message: "Chuva detectada - Cuidado com a pista molhada",
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    // Alerta de vento forte
    if (currentWeather.wind_speed > 20) {
      alerts.push({
        type: "wind",
        severity: currentWeather.wind_speed > 30 ? "high" : "medium",
        message: `Vento forte (${currentWeather.wind_speed} km/h) - Reduza a velocidade`,
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    // Alerta de visibilidade
    if (currentWeather.visibility < 5) {
      alerts.push({
        type: "visibility",
        severity: "medium",
        message: "Visibilidade reduzida - Use faróis e mantenha distância",
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    // Alerta de UV alto
    if (currentWeather.uv_index && currentWeather.uv_index > 7) {
      alerts.push({
        type: "temperature",
        severity: "low",
        message: "Índice UV alto - Use protetor solar e óculos escuros",
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    return alerts;
  };

  const motorcycleAlerts = generateMotorcycleAlerts();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">
          Clima para Motociclistas
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Condições meteorológicas e alertas para sua viagem
        </p>
      </div>

      {/* Search City */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            Buscar Cidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome da cidade..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearchCity()}
              className="flex-1"
            />
            <Button
              onClick={handleSearchCity}
              disabled={loading || !searchCity.trim()}
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Carregando dados do tempo...</span>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 py-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Motorcycle Weather Alerts */}
      {motorcycleAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-orange-800">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              Alertas para Motociclistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {motorcycleAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200"
                >
                  <div className="text-orange-600">
                    {getSeverityIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800">
                      {alert.message}
                    </p>
                    <p className="text-xs text-orange-600">
                      Atualizado às {alert.time}
                    </p>
                  </div>
                  <Badge
                    variant={getSeverityColor(alert.severity)}
                    className="text-xs"
                  >
                    {alert.severity === "high"
                      ? "Alto"
                      : alert.severity === "medium"
                      ? "Médio"
                      : "Baixo"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Weather with Motorcycle Focus */}
      {currentWeather && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
              Clima Atual - {currentWeather.city}, {currentWeather.country}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-4xl sm:text-6xl font-bold text-primary mb-2 sm:mb-2">
                  {currentWeather.temperature}°C
                </div>
                <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4 capitalize">
                  {currentWeather.description}
                </p>
                <div className="flex justify-center mb-3 sm:mb-4">
                  {getWeatherIcon(currentWeather.icon)}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sensação térmica: {currentWeather.feels_like}°C
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Atualizado às{" "}
                  {new Date(currentWeather.timestamp).toLocaleTimeString(
                    "pt-BR",
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Motorcycle-specific weather info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted rounded-lg">
                    <Wind className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs sm:text-sm">Vento</span>
                      <p className="text-sm font-medium">
                        {currentWeather.wind_speed} km/h{" "}
                        {WeatherApiService.getWindDirection(
                          currentWeather.wind_direction
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted rounded-lg">
                    <Eye className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs sm:text-sm">Visibilidade</span>
                      <p className="text-sm font-medium">
                        {currentWeather.visibility} km
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted rounded-lg">
                    <Droplets className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs sm:text-sm">Umidade</span>
                      <p className="text-sm font-medium">
                        {currentWeather.humidity}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted rounded-lg">
                    <Gauge className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs sm:text-sm">Pressão</span>
                      <p className="text-sm font-medium">
                        {currentWeather.pressure} hPa
                      </p>
                    </div>
                  </div>
                  {currentWeather.uv_index && (
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted rounded-lg sm:col-span-2">
                      <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs sm:text-sm">Índice UV</span>
                        <p className="text-sm font-medium">
                          {currentWeather.uv_index}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Motorcycle safety tips */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Dica de Segurança
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    {currentWeather.wind_speed > 20
                      ? "Vento forte - Reduza a velocidade e mantenha distância segura"
                      : currentWeather.visibility < 5
                      ? "Visibilidade baixa - Use faróis e mantenha distância"
                      : "Condições favoráveis para viagem - Mantenha atenção na estrada"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hourly Forecast with Motorcycle Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Previsão por Hora - Planeje sua Viagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {mockWeatherData.hourly.map((hour, index) => (
              <div
                key={index}
                className="text-center min-w-[80px] sm:min-w-[100px] flex-shrink-0"
              >
                <p className="text-xs sm:text-sm font-medium">{hour.time}</p>
                <div className="my-2 flex justify-center">
                  {getWeatherIcon(hour.icon)}
                </div>
                <p className="text-base sm:text-lg font-bold">{hour.temp}°</p>
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {hour.wind_speed} km/h
                  </p>
                  <Badge
                    variant={
                      hour.rain_prob > 50
                        ? "destructive"
                        : hour.rain_prob > 20
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {hour.rain_prob}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Forecast */}
      {forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Previsão para 5 Dias - Planeje Rotas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {forecast.map((day, index) => {
                const date = new Date(day.date);
                const dayName =
                  index === 0
                    ? "Hoje"
                    : index === 1
                    ? "Amanhã"
                    : date.toLocaleDateString("pt-BR", { weekday: "long" });

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <span className="font-medium text-xs sm:text-sm min-w-[60px] sm:min-w-[80px] capitalize">
                        {dayName}
                      </span>
                      {getWeatherIcon(day.icon)}
                      <div className="flex items-center gap-2 text-xs">
                        <Wind className="w-3 h-3" />
                        <span>{day.wind_speed} km/h</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Min</p>
                        <p className="text-sm font-medium">
                          {day.temperature_min}°
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Max</p>
                        <p className="text-sm font-medium">
                          {day.temperature_max}°
                        </p>
                      </div>
                      <Badge
                        variant={
                          day.rain_probability > 50
                            ? "destructive"
                            : day.rain_probability > 20
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {day.rain_probability}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CloudRain className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            Alertas Meteorológicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 sm:py-6 text-muted-foreground">
            <CloudRain className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-sm sm:text-base">Nenhum alerta ativo</p>
            <p className="text-xs sm:text-sm mt-1">
              Condições climáticas normais para a região
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
