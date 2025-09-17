"""
Motor de busca principal que integra todas as APIs
"""
import asyncio
import json
from typing import Dict, List, Optional, Any
try:
    import aiohttp
except ImportError:
    aiohttp = None
from .config import SearchConfig
from .cache import SearchCache
from .geocoding import GeocodingService


class SearchEngine:
    """Motor de busca principal que integra múltiplas APIs"""

    def __init__(self):
        self.cache = SearchCache()
        self.geocoding = GeocodingService()

    async def search_places(
        self,
        query: str,
        lat: float,
        lng: float,
        radius: int = 5,
        category: str = '',
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Busca lugares usando múltiplas APIs
        """
        # Verificar cache primeiro
        if use_cache:
            cached_result = self.cache.get(query, lat, lng, radius, category)
            if cached_result:
                return {
                    'success': True,
                    'data': cached_result,
                    'cached': True,
                    'source': 'cache'
                }

        # Buscar em paralelo usando diferentes APIs
        tasks = []

        # Busca usando OpenStreetMap (sempre disponível)
        tasks.append(self._search_openstreetmap(query, lat, lng, radius))

        # Busca usando SerpAPI se disponível
        if SearchConfig.SERPAPI_KEY and aiohttp:
            tasks.append(self._search_serpapi(
                query, lat, lng, radius, category))

        # Executar buscas em paralelo
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Combinar e processar resultados
        combined_results = self._combine_results(results, lat, lng)

        # Salvar no cache
        if combined_results:
            self.cache.set(query, lat, lng, radius, combined_results, category)

        return {
            'success': True,
            'data': combined_results,
            'cached': False,
            'source': 'api'
        }

    async def _search_openstreetmap(
        self,
        query: str,
        lat: float,
        lng: float,
        radius: int
    ) -> List[Dict[str, Any]]:
        """Busca usando OpenStreetMap Overpass API"""
        try:
            places = self.geocoding.search_places_nearby(
                lat, lng, query, radius)

            # Adicionar distância e classificar
            for place in places:
                place['distance'] = self.geocoding.calculate_distance(
                    lat, lng,
                    place['coordinates']['lat'],
                    place['coordinates']['lon']
                )

            # Ordenar por distância
            places.sort(key=lambda x: x['distance'])

            return places

        except Exception as e:
            print(f"Erro na busca OpenStreetMap: {e}")
            return []

    async def _search_serpapi(
        self,
        query: str,
        lat: float,
        lng: float,
        radius: int,
        category: str
    ) -> List[Dict[str, Any]]:
        """Busca usando SerpAPI"""
        if not aiohttp:
            print("aiohttp não disponível, pulando SerpAPI")
            return []

        try:
            # Determinar query baseada na categoria
            search_query = query
            if category and category in SearchConfig.CATEGORIES:
                category_config = SearchConfig.get_category_config(category)
                search_query = category_config['keywords'][0]

            url = "https://serpapi.com/search.json"
            params = {
                'api_key': SearchConfig.SERPAPI_KEY,
                'engine': 'google_maps',
                'q': search_query,
                'll': f"@{lat},{lng},{radius}km",
                'type': 'search'
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._process_serpapi_results(data, lat, lng)
                    else:
                        print(f"SerpAPI error: {response.status}")
                        return []

        except Exception as e:
            print(f"Erro na busca SerpAPI: {e}")
            return []

    def _process_serpapi_results(
        self,
        data: Dict[str, Any],
        user_lat: float,
        user_lng: float
    ) -> List[Dict[str, Any]]:
        """Processa resultados da SerpAPI"""
        places = []

        for place_data in data.get('place_results', []):
            try:
                coords = place_data.get('gps_coordinates', {})
                if not coords:
                    continue

                place = {
                    'id': f"serpapi_{place_data.get('place_id', '')}",
                    'name': place_data.get('title', ''),
                    'address': place_data.get('address', ''),
                    'phone': place_data.get('phone', ''),
                    'website': place_data.get('website', ''),
                    'rating': place_data.get('rating', 0),
                    'reviews': place_data.get('reviews', 0),
                    'price': place_data.get('price', ''),
                    'open_state': place_data.get('open_state', ''),
                    'coordinates': {
                        'lat': coords.get('latitude', 0),
                        'lon': coords.get('longitude', 0)
                    },
                    'source': 'serpapi'
                }

                # Calcular distância
                place['distance'] = self.geocoding.calculate_distance(
                    user_lat, user_lng,
                    coords.get('latitude', 0),
                    coords.get('longitude', 0)
                )

                places.append(place)

            except Exception as e:
                print(f"Erro ao processar resultado SerpAPI: {e}")
                continue

        return places

    def _combine_results(
        self,
        results: List[Any],
        user_lat: float,
        user_lng: float
    ) -> List[Dict[str, Any]]:
        """Combina resultados de diferentes APIs"""
        all_places = []
        seen_ids = set()

        for result in results:
            if isinstance(result, Exception):
                print(f"Erro em uma das buscas: {result}")
                continue

            if isinstance(result, list):
                for place in result:
                    place_id = place.get('id', '')
                    if place_id and place_id not in seen_ids:
                        seen_ids.add(place_id)
                        all_places.append(place)

        # Ordenar por distância
        all_places.sort(key=lambda x: x.get('distance', float('inf')))

        # Limitar resultados
        return all_places[:SearchConfig.MAX_RESULTS]

    async def get_autocomplete_suggestions(
        self,
        query: str,
        limit: int = 5
    ) -> List[Dict[str, str]]:
        """Obtém sugestões de autocomplete"""
        try:
            suggestions = self.geocoding.get_place_suggestions(query, limit)
            return suggestions
        except Exception as e:
            print(f"Erro ao obter sugestões: {e}")
            return []

    async def search_by_category(
        self,
        category: str,
        lat: float,
        lng: float,
        radius: Optional[int] = None
    ) -> Dict[str, Any]:
        """Busca lugares por categoria específica"""
        if category not in SearchConfig.CATEGORIES:
            return {
                'success': False,
                'error': f'Categoria "{category}" não encontrada'
            }

        category_config = SearchConfig.get_category_config(category)
        search_radius = radius or category_config['radius']

        # Usar primeira palavra-chave da categoria
        query = category_config['keywords'][0]

        return await self.search_places(query, lat, lng, search_radius, category)

    def get_cache_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas do cache"""
        return self.cache.get_stats()

    def clear_cache(self, category: Optional[str] = None) -> int:
        """Limpa cache"""
        if category:
            return self.cache.clear_category(category)
        else:
            return self.cache.clear_expired()
