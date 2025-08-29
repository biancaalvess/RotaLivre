"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, CloudRain, Sun, Users, Plus, User, LogOut } from "lucide-react"
import { WeatherMap } from "@/components/weather-map"
import { ReportModal } from "@/components/report-modal"
import { WeatherCard } from "@/components/weather-card"
import { AuthModal } from "@/components/auth-modal"
import { ThemeToggle } from "@/components/theme-toggle"

export default function MotoWeatherApp() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }
          setUserLocation(location)
          fetchWeatherData(location.lat, location.lon)
          fetchNearbyReports(location.lat, location.lon)
        },
        (error) => {
          console.error("Error getting location:", error)
          const defaultLocation = { lat: -23.5505, lon: -46.6333 }
          setUserLocation(defaultLocation)
          fetchWeatherData(defaultLocation.lat, defaultLocation.lon)
          fetchNearbyReports(defaultLocation.lat, defaultLocation.lon)
        },
      )
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error("Auth check error:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      const data = await response.json()
      setWeatherData(data)
    } catch (error) {
      console.error("Error fetching weather:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNearbyReports = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`/api/reports?lat=${lat}&lon=${lon}&radius=10`)

      if (!response.ok) {
        console.error("Reports API error:", response.status, response.statusText)
        setReports([])
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Reports API returned non-JSON response")
        setReports([])
        return
      }

      const data = await response.json()
      setReports(data.reports || [])
    } catch (error) {
      console.error("Error fetching reports:", error)
      setReports([])
    }
  }

  const handleNewReport = () => {
    if (userLocation) {
      fetchNearbyReports(userLocation.lat, userLocation.lon)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados meteorológicos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CloudRain className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-balance">MotoClima</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 w-8 p-0">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)} className="text-sm">
                <User className="w-4 h-4 mr-1" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Map Component */}
        <WeatherMap userLocation={userLocation} reports={reports} weatherData={weatherData} />

        {/* Weather Overview */}
        {weatherData && <WeatherCard weatherData={weatherData} location={userLocation} />}

        {/* Quick Report Button */}
        <Button
          onClick={() => setShowReportModal(true)}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Reportar Condição do Tempo
        </Button>

        {/* Community Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Relatórios da Comunidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.length > 0 ? (
              reports.slice(0, 5).map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      {report.weather_type === "rain" && <CloudRain className="w-4 h-4 text-accent-foreground" />}
                      {report.weather_type === "sun" && <Sun className="w-4 h-4 text-accent-foreground" />}
                      {report.weather_type === "cloud" && <Cloud className="w-4 h-4 text-accent-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {report.distance?.toFixed(1)}km
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum relatório próximo encontrado</p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userLocation={userLocation}
        onReportSubmitted={handleNewReport}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </div>
  )
}
