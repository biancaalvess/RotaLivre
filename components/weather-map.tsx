"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, CloudRain, Sun, Cloud, Wind, AlertTriangle, Fuel, Wrench } from "lucide-react"

interface WeatherMapProps {
  userLocation: { lat: number; lon: number } | null
  reports: any[]
  weatherData: any
}

const getWeatherIcon = (type: string) => {
  switch (type) {
    case "rain":
      return CloudRain
    case "sun":
      return Sun
    case "cloud":
      return Cloud
    case "wind":
      return Wind
    case "danger":
      return AlertTriangle
    default:
      return Cloud
  }
}

const getWeatherColor = (type: string) => {
  switch (type) {
    case "rain":
      return "text-blue-500"
    case "sun":
      return "text-yellow-500"
    case "cloud":
      return "text-gray-500"
    case "wind":
      return "text-green-500"
    case "danger":
      return "text-red-500"
    default:
      return "text-gray-500"
  }
}

export function WeatherMap({ userLocation, reports, weatherData }: WeatherMapProps) {
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([])
  const [showPlaces, setShowPlaces] = useState(false)
  const [loadingPlaces, setLoadingPlaces] = useState(false)

  const fetchNearbyPlaces = async (query = "posto de gasolina") => {
    if (!userLocation) return

    setLoadingPlaces(true)
    try {
      const response = await fetch(
        `/api/maps?lat=${userLocation.lat}&lon=${userLocation.lon}&query=${encodeURIComponent(query)}`,
      )
      const data = await response.json()
      setNearbyPlaces(data.places || [])
      setShowPlaces(true)
    } catch (error) {
      console.error("Error fetching places:", error)
    } finally {
      setLoadingPlaces(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5" />
          Mapa da Região
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchNearbyPlaces("posto de gasolina")}
            disabled={loadingPlaces}
            className="text-xs"
          >
            <Fuel className="w-3 h-3 mr-1" />
            Postos
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchNearbyPlaces("oficina moto")}
            disabled={loadingPlaces}
            className="text-xs"
          >
            <Wrench className="w-3 h-3 mr-1" />
            Oficinas
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowPlaces(false)} className="text-xs">
            Limpar
          </Button>
        </div>

        {/* Simplified Map Representation */}
        <div className="bg-muted rounded-lg p-4 min-h-[200px] relative overflow-hidden">
          {/* Background pattern to simulate map */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-8 h-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-foreground/20"></div>
              ))}
            </div>
          </div>

          {/* User Location */}
          {userLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg animate-pulse"></div>
              <Badge className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs">Você</Badge>
            </div>
          )}

          {showPlaces &&
            nearbyPlaces.slice(0, 6).map((place, index) => {
              const positions = [
                { top: "25%", left: "25%" },
                { top: "35%", left: "75%" },
                { top: "65%", left: "30%" },
                { top: "75%", left: "70%" },
                { top: "45%", left: "20%" },
                { top: "30%", left: "80%" },
              ]

              const position = positions[index % positions.length]
              const Icon = place.motorcycle_friendly ? Fuel : MapPin

              return (
                <div
                  key={`place-${index}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ top: position.top, left: position.left }}
                >
                  <div className="w-6 h-6 bg-secondary rounded-full border border-border flex items-center justify-center shadow-sm">
                    <Icon className="w-3 h-3 text-secondary-foreground" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-20">
                    <Badge variant="secondary" className="text-xs truncate w-full text-center">
                      {place.name}
                    </Badge>
                  </div>
                </div>
              )
            })}

          {/* Weather Reports */}
          {reports.slice(0, 8).map((report, index) => {
            const Icon = getWeatherIcon(report.weather_type)
            const colorClass = getWeatherColor(report.weather_type)

            // Simple positioning around the center
            const positions = [
              { top: "20%", left: "30%" },
              { top: "30%", left: "70%" },
              { top: "60%", left: "20%" },
              { top: "70%", left: "80%" },
              { top: "40%", left: "15%" },
              { top: "25%", left: "85%" },
              { top: "80%", left: "40%" },
              { top: "15%", left: "60%" },
            ]

            const position = positions[index % positions.length]

            return (
              <div
                key={report.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ top: position.top, left: position.left }}
              >
                <div className="w-6 h-6 bg-card rounded-full border border-border flex items-center justify-center shadow-sm">
                  <Icon className={`w-3 h-3 ${colorClass}`} />
                </div>
              </div>
            )
          })}

          {/* Rain Probability Overlay */}
          {weatherData && weatherData.rain_probability > 40 && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="text-xs">
                {weatherData.rain_probability}% chuva
              </Badge>
            </div>
          )}
        </div>

        {showPlaces && nearbyPlaces.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Locais Próximos:</h4>
            {nearbyPlaces.slice(0, 3).map((place, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                    {place.motorcycle_friendly ? (
                      <Fuel className="w-3 h-3 text-secondary-foreground" />
                    ) : (
                      <MapPin className="w-3 h-3 text-secondary-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{place.name}</p>
                    <p className="text-xs text-muted-foreground">{place.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {place.distance}
                  </Badge>
                  {place.rating && <p className="text-xs text-muted-foreground mt-1">★ {place.rating}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {showPlaces
            ? "Mapa com locais próximos e relatórios da comunidade"
            : "Mapa simplificado - Pontos mostram relatórios da comunidade"}
        </p>
      </CardContent>
    </Card>
  )
}
