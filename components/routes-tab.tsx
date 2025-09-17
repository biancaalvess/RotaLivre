"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Route, 
  Clock, 
  MapPin, 
  Navigation, 
  Calendar,
  TrendingUp,
  Repeat
} from "lucide-react"

const mockRoutes = [
  {
    id: 1,
    origin: "Casa",
    destination: "Trabalho",
    date: "2024-01-15",
    duration: "25 min",
    distance: "8.2 km",
    type: "car",
    status: "completed"
  },
  {
    id: 2,
    origin: "Trabalho",
    destination: "Academia",
    date: "2024-01-15",
    duration: "12 min",
    distance: "3.1 km",
    type: "bike",
    status: "completed"
  },
  {
    id: 3,
    origin: "Academia",
    destination: "Casa",
    date: "2024-01-15",
    duration: "18 min",
    distance: "5.8 km",
    type: "car",
    status: "completed"
  },
  {
    id: 4,
    origin: "Casa",
    destination: "Shopping",
    date: "2024-01-14",
    duration: "15 min",
    distance: "6.5 km",
    type: "car",
    status: "completed"
  }
]

export function RoutesTab() {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Minhas Rotas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Histórico de viagens e rotas favoritas</p>
        </div>
        <Button className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11">
          <Route className="w-4 h-4 mr-2" />
          Nova Rota
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Route className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold">24</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Rotas este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold">156 km</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Distância total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold">8h 23m</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Tempo total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Routes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            Rotas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRoutes.map((route) => (
              <div key={route.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted rounded-lg gap-3 sm:gap-0">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{route.origin} → {route.destination}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-0">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(route.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {route.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {route.distance}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <Badge variant={route.type === 'car' ? 'default' : 'secondary'} className="text-xs">
                    {route.type === 'car' ? 'Carro' : route.type === 'bike' ? 'Bicicleta' : 'Caminhada'}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Repeat className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Rotas Favoritas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Route className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-sm sm:text-base">Nenhuma rota favorita ainda</p>
            <p className="text-xs sm:text-sm mt-1">Marque suas rotas mais usadas como favoritas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
