"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Cloud,
  CloudRain,
  Sun,
  MapPin,
  Clock,
  ThumbsUp,
  MessageCircle,
  Plus,
  Filter,
  Search as SearchIcon,
  AlertTriangle,
  Route,
  Fuel,
  Bed,
  Coffee,
  Wrench,
  Shield,
  Camera,
  Star,
  Navigation,
  Eye,
} from "lucide-react";

const mockReports = [
  {
    id: 1,
    user: "João Silva",
    location: "Serra da Mantiqueira",
    weather_type: "rain",
    description:
      "Chuva forte na serra, pista escorregadia. Cuidado com derrapagens e use equipamentos impermeáveis.",
    created_at: "2024-01-15T14:30:00Z",
    distance: 0.5,
    likes: 12,
    comments: 3,
    verified: true,
    type: "weather",
    severity: "high",
  },
  {
    id: 2,
    user: "Maria Santos",
    location: "Rodovia dos Bandeirantes",
    weather_type: "sun",
    description:
      "Sol forte, ótimo para viagem. Posto de gasolina a 5km com preço bom. Recomendo parada para hidratação.",
    created_at: "2024-01-15T13:15:00Z",
    distance: 2.1,
    likes: 8,
    comments: 1,
    verified: false,
    type: "gas",
    severity: "low",
  },
  {
    id: 3,
    user: "Pedro Costa",
    location: "Vale do Paraíba",
    weather_type: "cloud",
    description:
      "Neblina na manhã, visibilidade reduzida. Use faróis e mantenha distância segura. Pousada familiar a 3km.",
    created_at: "2024-01-15T12:00:00Z",
    distance: 1.8,
    likes: 15,
    comments: 5,
    verified: true,
    type: "visibility",
    severity: "medium",
  },
  {
    id: 4,
    user: "Ana Oliveira",
    location: "Zona Industrial",
    weather_type: "rain",
    description:
      "Pista molhada, cuidado com derrapagens. Oficina mecânica próxima para emergências. Posto de gasolina a 2km.",
    created_at: "2024-01-15T11:45:00Z",
    distance: 3.2,
    likes: 20,
    comments: 7,
    verified: true,
    type: "road",
    severity: "high",
  },
];

const mockServices = [
  {
    id: 1,
    name: "Oficina MotoCenter",
    type: "mechanic",
    location: "Centro da Cidade",
    distance: 1.2,
    rating: 4.8,
    open: true,
    services: ["Troca de óleo", "Pneus", "Freios", "Elétrica"],
    phone: "(11) 99999-9999",
  },
  {
    id: 2,
    name: "Posto 24h Premium",
    type: "gas",
    location: "Rodovia Principal",
    distance: 3.5,
    rating: 4.5,
    open: true,
    services: ["Gasolina", "Etanol", "Ar", "Lavagem"],
    phone: "(11) 88888-8888",
  },
  {
    id: 3,
    name: "Pousada do Motociclista",
    type: "accommodation",
    location: "Serra",
    distance: 8.7,
    rating: 4.7,
    open: true,
    services: ["Quartos", "Estacionamento", "Café da manhã", "WiFi"],
    phone: "(11) 77777-7777",
  },
];

const getWeatherIcon = (type: string) => {
  switch (type) {
    case "sun":
      return <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />;
    case "cloud":
      return <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    case "rain":
      return <CloudRain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
    default:
      return <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
  }
};

const getReportTypeIcon = (type: string) => {
  switch (type) {
    case "weather":
      return <CloudRain className="w-4 h-4" />;
    case "gas":
      return <Fuel className="w-4 h-4" />;
    case "visibility":
      return <Eye className="w-4 h-4" />;
    case "road":
      return <Route className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

const getServiceTypeIcon = (type: string) => {
  switch (type) {
    case "mechanic":
      return <Wrench className="w-4 h-4" />;
    case "gas":
      return <Fuel className="w-4 h-4" />;
    case "accommodation":
      return <Bed className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

export function CommunityTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("reports");

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" || report.weather_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Comunidade Motociclista
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Relatórios, serviços e informações da comunidade
          </p>
        </div>
        <Button className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11">
          <Plus className="w-4 h-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports" className="text-xs sm:text-sm">
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="services" className="text-xs sm:text-sm">
            Serviços
          </TabsTrigger>
          <TabsTrigger value="tips" className="text-xs sm:text-sm">
            Dicas
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar relatórios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0"
              >
                Todos
              </Button>
              <Button
                variant={filterType === "sun" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("sun")}
                className="text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0"
              >
                <Sun className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Sol</span>
                <span className="sm:hidden">☀️</span>
              </Button>
              <Button
                variant={filterType === "cloud" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("cloud")}
                className="text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0"
              >
                <Cloud className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Nublado</span>
                <span className="sm:hidden">☁️</span>
              </Button>
              <Button
                variant={filterType === "rain" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("rain")}
                className="text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0"
              >
                <CloudRain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Chuva</span>
                <span className="sm:hidden">🌧️</span>
              </Button>
            </div>
          </div>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Relatórios Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 sm:p-4 bg-muted rounded-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-3">
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {getReportTypeIcon(report.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">
                            {report.user}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-0">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {report.location}
                              </span>
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>{report.distance}km</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {report.verified && (
                          <Badge variant="default" className="text-xs">
                            Verificado
                          </Badge>
                        )}
                        <Badge
                          variant={
                            report.severity === "high"
                              ? "destructive"
                              : report.severity === "medium"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {report.severity === "high"
                            ? "Alto"
                            : report.severity === "medium"
                            ? "Médio"
                            : "Baixo"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {new Date(report.created_at).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm mb-3">{report.description}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">
                            {report.likes}
                          </span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">
                            {report.comments}
                          </span>
                        </button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                      >
                        Responder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {mockServices.map((service) => (
              <Card key={service.id} className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getServiceTypeIcon(service.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-sm sm:text-base truncate">
                        {service.name}
                      </h3>
                      <Badge
                        variant={service.open ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {service.open ? "Aberto" : "Fechado"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {service.location} • {service.distance}km
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">
                          {service.rating}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {service.services.slice(0, 3).map((s, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs mr-1"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="text-xs h-7 flex-1">
                        <Navigation className="w-3 h-3 mr-1" />
                        Rota
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                Dicas de Segurança para Motociclistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Antes da Viagem</h4>
                  <ul className="text-xs space-y-1 text-blue-800">
                    <li>• Verifique pneus e pressão</li>
                    <li>• Teste freios e faróis</li>
                    <li>• Verifique combustível e óleo</li>
                    <li>• Use equipamentos de proteção</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Durante a Viagem</h4>
                  <ul className="text-xs space-y-1 text-green-800">
                    <li>• Mantenha distância segura</li>
                    <li>• Use sempre o capacete</li>
                    <li>• Sinalize suas intenções</li>
                    <li>• Evite distrações</li>
                  </ul>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">
                    Condições Climáticas
                  </h4>
                  <ul className="text-xs space-y-1 text-yellow-800">
                    <li>• Reduza velocidade na chuva</li>
                    <li>• Use equipamentos impermeáveis</li>
                    <li>• Mantenha distância em neblina</li>
                    <li>• Cuidado com ventos fortes</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Emergências</h4>
                  <ul className="text-xs space-y-1 text-purple-800">
                    <li>• Tenha contatos de emergência</li>
                    <li>• Conheça oficinas próximas</li>
                    <li>• Carregue kit básico de ferramentas</li>
                    <li>• Mantenha seguro atualizado</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
