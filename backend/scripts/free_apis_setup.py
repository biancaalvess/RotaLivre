#!/usr/bin/env python3
"""
Setup script for free APIs integration
No API keys required - using Open-Meteo and OpenStreetMap
"""

import json
import os

def setup_free_apis():
    """Configure the app to use completely free APIs"""
    
    print("🌤️  Configurando APIs gratuitas...")
    
    # Open-Meteo API info
    print("\n📊 Open-Meteo Weather API:")
    print("- URL: https://api.open-meteo.com")
    print("- Limite: Ilimitado para uso não comercial")
    print("- Dados: Temperatura, umidade, probabilidade de chuva")
    print("- Cobertura: Mundial")
    
    # OpenStreetMap/Overpass API info
    print("\n🗺️  OpenStreetMap Overpass API:")
    print("- URL: https://overpass-api.de/api/interpreter")
    print("- Limite: Uso justo (não abuse)")
    print("- Dados: Postos, oficinas, hospitais, farmácias")
    print("- Cobertura: Mundial")
    
    # Create config file
    config = {
        "weather_api": {
            "provider": "open-meteo",
            "base_url": "https://api.open-meteo.com/v1",
            "free": True,
            "rate_limit": "10000 requests/day"
        },
        "maps_api": {
            "provider": "openstreetmap-overpass",
            "base_url": "https://overpass-api.de/api/interpreter",
            "free": True,
            "rate_limit": "fair_use"
        }
    }
    
    with open("free_apis_config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    print("\n✅ Configuração concluída!")
    print("📄 Arquivo de configuração criado: free_apis_config.json")
    print("\n🚀 Agora você pode usar o app sem nenhuma API key!")
    print("💡 Todas as APIs são completamente gratuitas")

if __name__ == "__main__":
    setup_free_apis()
