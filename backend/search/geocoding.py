"""
Serviços de geocodificação e busca por localização
"""
import requests
import json
from typing import Dict, List, Optional, Tuple
from .config import SearchConfig


class GeocodingService:
    """Serviço de geocodificação usando APIs gratuitas"""

    @staticmethod
    def geocode_address(address: str) -> Optional[Tuple[float, float]]:
        """
        Converte endereço em coordenadas usando OpenStreetMap Nominatim
        """
        try:
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': address,
                'format': 'json',
                'limit': 1,
                'countrycodes': 'br',  # Priorizar Brasil
                'addressdetails': 1
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            if data and len(data) > 0:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                return (lat, lon)

            return None

        except Exception as e:
            print(f"Erro na geocodificação: {e}")
            return None

    @staticmethod
    def reverse_geocode(lat: float, lng: float) -> Optional[Dict[str, str]]:
        """
        Converte coordenadas em endereço usando OpenStreetMap Nominatim
        """
        try:
            url = "https://nominatim.openstreetmap.org/reverse"
            params = {
                'lat': lat,
                'lon': lng,
                'format': 'json',
                'addressdetails': 1,
                'accept-language': 'pt-BR'
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            if 'address' in data:
                address = data['address']
                return {
                    'display_name': data.get('display_name', ''),
                    'city': address.get('city', address.get('town', address.get('village', ''))),
                    'state': address.get('state', ''),
                    'country': address.get('country', ''),
                    'postcode': address.get('postcode', ''),
                    'road': address.get('road', ''),
                    'house_number': address.get('house_number', '')
                }

            return None

        except Exception as e:
            print(f"Erro na geocodificação reversa: {e}")
            return None

    @staticmethod
    def search_places_nearby(lat: float, lng: float, query: str, radius: int = 5) -> List[Dict[str, any]]:
        """
        Busca lugares próximos usando Overpass API (OpenStreetMap)
        """
        try:
            # Query Overpass para buscar lugares
            overpass_query = f"""
            [out:json][timeout:25];
            (
              node["amenity"~"^(restaurant|fuel|pharmacy|hospital|police|hotel)$"](around:{radius*1000},{lat},{lng});
              way["amenity"~"^(restaurant|fuel|pharmacy|hospital|police|hotel)$"](around:{radius*1000},{lat},{lng});
              relation["amenity"~"^(restaurant|fuel|pharmacy|hospital|police|hotel)$"](around:{radius*1000},{lat},{lng});
            );
            out center;
            """

            response = requests.post(
                SearchConfig.OPENSTREETMAP_URL,
                data=overpass_query,
                headers={'Content-Type': 'text/plain'},
                timeout=30
            )
            response.raise_for_status()

            data = response.json()
            places = []

            for element in data.get('elements', []):
                if 'tags' in element:
                    tags = element['tags']

                    # Obter coordenadas
                    if element['type'] == 'node':
                        coords = {'lat': element['lat'], 'lon': element['lon']}
                    elif 'center' in element:
                        coords = {
                            'lat': element['center']['lat'], 'lon': element['center']['lon']}
                    else:
                        continue

                    # Filtrar por query se especificada
                    if query and query.lower() not in tags.get('name', '').lower():
                        continue

                    place = {
                        'id': f"osm_{element['id']}",
                        'name': tags.get('name', 'Sem nome'),
                        'amenity': tags.get('amenity', ''),
                        'address': tags.get('addr:full', ''),
                        'phone': tags.get('phone', ''),
                        'website': tags.get('website', ''),
                        'opening_hours': tags.get('opening_hours', ''),
                        'coordinates': coords,
                        'source': 'openstreetmap'
                    }

                    places.append(place)

            return places

        except Exception as e:
            print(f"Erro na busca Overpass: {e}")
            return []

    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calcula distância entre dois pontos usando fórmula de Haversine
        """
        import math

        R = 6371  # Raio da Terra em km

        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)

        a = (math.sin(dlat/2) * math.sin(dlat/2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon/2) * math.sin(dlon/2))

        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c

        return round(distance, 2)

    @staticmethod
    def get_place_suggestions(query: str, limit: int = 5) -> List[Dict[str, str]]:
        """
        Obtém sugestões de lugares baseado na query
        """
        try:
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': query,
                'format': 'json',
                'limit': limit,
                'countrycodes': 'br',
                'addressdetails': 1
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            suggestions = []

            for item in data:
                suggestion = {
                    'display_name': item.get('display_name', ''),
                    'lat': float(item['lat']),
                    'lon': float(item['lon']),
                    'type': item.get('type', ''),
                    'importance': item.get('importance', 0)
                }
                suggestions.append(suggestion)

            return suggestions

        except Exception as e:
            print(f"Erro ao obter sugestões: {e}")
            return []
