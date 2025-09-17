"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  Navigation,
  Cloud,
  Users,
  Settings,
  Menu,
  X,
  Route,
  Clock,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: "map",
    label: "Mapa Principal",
    icon: Map,
    description: "Visualize rotas e navegação",
  },
  {
    id: "routes",
    label: "Minhas Rotas",
    icon: Route,
    description: "Histórico de rotas utilizadas",
  },
  {
    id: "weather",
    label: "Clima",
    icon: Cloud,
    description: "Condições meteorológicas",
  },
  {
    id: "community",
    label: "Comunidade",
    icon: Users,
    description: "Relatórios da comunidade",
  },
  {
    id: "analytics",
    label: "Estatísticas",
    icon: TrendingUp,
    description: "Análise de viagens",
  },
  {
    id: "settings",
    label: "Configurações",
    icon: Settings,
    description: "Preferências do usuário",
  },
];

export function Sidebar({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          "w-full sm:w-80", // Full width on mobile, 320px on small screens and up
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Navigation className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold">RotaLivre</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 sm:p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 sm:gap-3 h-auto p-2 sm:p-3 text-sm sm:text-base",
                  activeTab === item.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className="text-xs opacity-80 hidden sm:block">
                    {item.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>

        {/* Quick Stats - Hidden on very small screens */}
        <div className="hidden sm:block p-3 sm:p-4 border-t border-border">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Resumo da Semana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Viagens:</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Distância:</span>
                <Badge variant="secondary">156 km</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tempo:</span>
                <Badge variant="secondary">8h 23m</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed top-3 left-3 z-30 lg:hidden shadow-lg"
      >
        <Menu className="w-4 h-4" />
      </Button>
    </>
  );
}
