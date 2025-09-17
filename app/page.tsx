"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { MainMap } from "@/components/main-map";
import { RoutesTab } from "@/components/routes-tab";
import { WeatherTab } from "@/components/weather-tab";
import { CommunityTab } from "@/components/community-tab";
import { AnalyticsTab } from "@/components/analytics-tab";
import { SettingsTab } from "@/components/settings-tab";
import { useErrorHandler } from "@/components/error-boundary";

export default function RotaLivreApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("map");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const handleError = useErrorHandler();

  useEffect(() => {
    // Configurar handler global para erros não tratados
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Promise rejeitada não tratada:", event.reason);
      handleError(event.reason);
      // Prevenir que o erro apareça no console
      event.preventDefault();
    };

    const handleErrorEvent = (event: ErrorEvent) => {
      console.error("Erro não tratado:", event.error);
      handleError(event.error);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleErrorEvent);

    // Obter localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          // Localização padrão (São Paulo)
          setUserLocation({ lat: -23.5505, lon: -46.6333 });
        }
      );
    } else {
      // Fallback se geolocation não estiver disponível
      setUserLocation({ lat: -23.5505, lon: -46.6333 });
    }

    // Cleanup
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleErrorEvent);
    };
  }, [handleError]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "map":
        return <MainMap userLocation={userLocation} />;
      case "routes":
        return <RoutesTab />;
      case "weather":
        return <WeatherTab userLocation={userLocation} />;
      case "community":
        return <CommunityTab />;
      case "analytics":
        return <AnalyticsTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <MainMap userLocation={userLocation} />;
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-80">{renderActiveTab()}</main>
    </div>
  );
}
