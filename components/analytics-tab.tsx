"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Clock, 
  Fuel,
  Target,
  Award,
  BarChart3
} from "lucide-react"

const mockStats = {
  monthly: {
    routes: 24,
    distance: 156,
    time: "8h 23m",
    fuel: 12.5,
    savings: 45.80
  },
  weekly: {
    routes: 6,
    distance: 38,
    time: "2h 15m",
    fuel: 3.2,
    savings: 12.40
  },
  achievements: [
    { name: "Primeira Viagem", description: "Completou sua primeira rota", earned: "2024-01-01" },
    { name: "Explorador", description: "Visitou 10 locais diferentes", earned: "2024-01-10" },
    { name: "Economia", description: "Economizou R$ 100 em combustível", earned: "2024-01-15" }
  ],
  topRoutes: [
    { origin: "Casa", destination: "Trabalho", count: 12, avgTime: "25 min" },
    { origin: "Trabalho", destination: "Academia", count: 8, avgTime: "12 min" },
    { origin: "Casa", destination: "Shopping", count: 6, avgTime: "15 min" }
  ]
}

export function AnalyticsTab() {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Estatísticas e Análise</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Acompanhe seu progresso e performance</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0">Hoje</Button>
        <Button variant="default" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0">Esta Semana</Button>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0">Este Mês</Button>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0">Este Ano</Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-2xl font-bold">{mockStats.weekly.routes}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Rotas esta semana</p>
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
                <p className="text-lg sm:text-2xl font-bold">{mockStats.weekly.distance} km</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Distância total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-2xl font-bold">{mockStats.weekly.time}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Tempo total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Fuel className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-2xl font-bold">{mockStats.weekly.fuel}L</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Combustível usado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              Comparação Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-muted rounded-lg">
              <span className="text-xs sm:text-sm">Rotas</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm sm:text-base">{mockStats.weekly.routes}</span>
                <Badge variant="secondary" className="text-xs">+20%</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-muted rounded-lg">
              <span className="text-xs sm:text-sm">Distância</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm sm:text-base">{mockStats.weekly.distance} km</span>
                <Badge variant="secondary" className="text-xs">+15%</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 sm:p-3 bg-muted rounded-lg">
              <span className="text-xs sm:text-sm">Economia</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm sm:text-base">R$ {mockStats.weekly.savings}</span>
                <Badge variant="secondary" className="text-xs">+25%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Metas e Objetivos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Rotas mensais</span>
                <span>{mockStats.monthly.routes}/30</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${(mockStats.monthly.routes/30)*100}%` }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Distância mensal</span>
                <span>{mockStats.monthly.distance}/200 km</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(mockStats.monthly.distance/200)*100}%` }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Economia mensal</span>
                <span>R$ {mockStats.monthly.savings}/100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(mockStats.monthly.savings/100)*100}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            Rotas Mais Utilizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {mockStats.topRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{route.origin} → {route.destination}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {route.count} viagens • Média: {route.avgTime}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs flex-shrink-0">{route.count}x</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {mockStats.achievements.map((achievement, index) => (
              <div key={index} className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="font-medium mb-1 text-sm sm:text-base">{achievement.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">{achievement.description}</p>
                <Badge variant="secondary" className="text-xs">
                  {new Date(achievement.earned).toLocaleDateString('pt-BR')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
