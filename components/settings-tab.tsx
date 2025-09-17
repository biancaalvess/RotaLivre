"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  User,
  Bell,
  Map,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Car,
  Bike,
} from "lucide-react";

export function SettingsTab() {
  const [notifications, setNotifications] = useState({
    weather: true,
    traffic: true,
    community: false,
    achievements: true,
  });

  const [preferences, setPreferences] = useState({
    language: "pt-BR",
    theme: "system",
    units: "metric",
    defaultTransport: "car",
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Configurações</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Personalize sua experiência no RotaLivre
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            Perfil do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="name" className="text-xs sm:text-sm">
                Nome Completo
              </Label>
              <Input
                id="name"
                defaultValue="João Silva"
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs sm:text-sm">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue="joao@email.com"
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs sm:text-sm">
                Telefone
              </Label>
              <Input
                id="phone"
                defaultValue="(11) 99999-9999"
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-xs sm:text-sm">
                Cidade
              </Label>
              <Input
                id="city"
                defaultValue="São Paulo"
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
          </div>
          <Button className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10">
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs sm:text-sm">Alertas de Clima</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Receba notificações sobre mudanças climáticas
              </p>
            </div>
            <Switch
              checked={notifications.weather}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, weather: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs sm:text-sm">Alertas de Trânsito</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Notificações sobre congestionamentos e acidentes
              </p>
            </div>
            <Switch
              checked={notifications.traffic}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, traffic: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs sm:text-sm">
                Atualizações da Comunidade
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Relatórios e informações de outros usuários
              </p>
            </div>
            <Switch
              checked={notifications.community}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, community: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs sm:text-sm">Conquistas</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Notificações sobre metas atingidas
              </p>
            </div>
            <Switch
              checked={notifications.achievements}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, achievements: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Map className="w-4 h-4 sm:w-5 sm:h-5" />
            Preferências de Navegação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div>
            <Label className="text-xs sm:text-sm">
              Meio de Transporte Padrão
            </Label>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                variant={
                  preferences.defaultTransport === "car" ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setPreferences({ ...preferences, defaultTransport: "car" })
                }
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                <Car className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Carro
              </Button>
              <Button
                variant={
                  preferences.defaultTransport === "bike"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  setPreferences({ ...preferences, defaultTransport: "bike" })
                }
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                <Bike className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Bicicleta
              </Button>
              <Button
                variant={
                  preferences.defaultTransport === "walk"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  setPreferences({ ...preferences, defaultTransport: "walk" })
                }
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Caminhada
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs sm:text-sm">Evitar</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                Pedágios
              </Badge>
              <Badge variant="outline" className="text-xs">
                Vias Expressas
              </Badge>
              <Badge variant="outline" className="text-xs">
                Ferries
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div>
            <Label className="text-xs sm:text-sm">Tema</Label>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                Claro
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                Sistema
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                Escuro
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs sm:text-sm">Unidades</Label>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                variant="default"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                Métrico (km)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                Imperial (mi)
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs sm:text-sm">Idioma</Label>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                variant="default"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                Português
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                English
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                Español
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            Privacidade e Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs sm:text-sm">
                Compartilhar Localização
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Permitir que outros usuários vejam sua localização
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs sm:text-sm">Histórico de Rotas</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Salvar histórico de navegação
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs sm:text-sm">Análise de Dados</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Compartilhar dados anônimos para melhorias
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Ações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start text-sm sm:text-base h-9 sm:h-10"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Conectar Dispositivo
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-sm sm:text-base h-9 sm:h-10"
          >
            <Globe className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start text-sm sm:text-base h-9 sm:h-10"
          >
            Excluir Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
