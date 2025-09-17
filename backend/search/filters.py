"""
Sistema de filtros para busca de lugares
"""
from typing import List, Dict, Any, Optional, Callable
from .models import Place
from .config import SearchConfig


class SearchFilters:
    """Sistema de filtros para busca"""

    def __init__(self):
        self.filters = {}
        self._register_default_filters()

    def _register_default_filters(self):
        """Registra filtros padrão"""
        self.filters.update({
            'distance': self._filter_by_distance,
            'rating': self._filter_by_rating,
            'price': self._filter_by_price,
            'open_now': self._filter_by_open_status,
            'category': self._filter_by_category,
            'source': self._filter_by_source
        })

    def apply_filters(self, places: List[Place], filter_params: Dict[str, Any]) -> List[Place]:
        """Aplica filtros à lista de lugares"""
        filtered_places = places.copy()

        for filter_name, filter_value in filter_params.items():
            if filter_name in self.filters and filter_value is not None:
                filtered_places = self.filters[filter_name](
                    filtered_places, filter_value)

        return filtered_places

    def _filter_by_distance(self, places: List[Place], max_distance: float) -> List[Place]:
        """Filtra por distância máxima"""
        return [place for place in places if place.distance <= max_distance]

    def _filter_by_rating(self, places: List[Place], min_rating: float) -> List[Place]:
        """Filtra por avaliação mínima"""
        return [place for place in places if place.rating and place.rating >= min_rating]

    def _filter_by_price(self, places: List[Place], price_range: str) -> List[Place]:
        """Filtra por faixa de preço"""
        if price_range == 'free':
            return [place for place in places if not place.price or place.price == 'Free']
        elif price_range == 'low':
            return [place for place in places if place.price and place.price in ['$', 'Free']]
        elif price_range == 'medium':
            return [place for place in places if place.price and place.price in ['$$', '$']]
        elif price_range == 'high':
            return [place for place in places if place.price and place.price in ['$$$', '$$$$']]

        return places

    def _filter_by_open_status(self, places: List[Place], open_now: bool) -> List[Place]:
        """Filtra por status de funcionamento"""
        if not open_now:
            return places

        return [place for place in places if place.open_state and 'open' in place.open_state.lower()]

    def _filter_by_category(self, places: List[Place], category: str) -> List[Place]:
        """Filtra por categoria"""
        if not category:
            return places

        category_keywords = SearchConfig.get_category_config(
            category).get('keywords', [])

        filtered_places = []
        for place in places:
            # Verificar se o lugar corresponde à categoria
            place_name_lower = place.name.lower()
            place_address_lower = place.address.lower()

            for keyword in category_keywords:
                if (keyword.lower() in place_name_lower or
                        keyword.lower() in place_address_lower):
                    filtered_places.append(place)
                    break

        return filtered_places

    def _filter_by_source(self, places: List[Place], sources: List[str]) -> List[Place]:
        """Filtra por fonte dos dados"""
        return [place for place in places if place.source in sources]

    def add_custom_filter(self, name: str, filter_func: Callable[[List[Place], Any], List[Place]]):
        """Adiciona filtro personalizado"""
        self.filters[name] = filter_func

    def get_available_filters(self) -> List[str]:
        """Retorna lista de filtros disponíveis"""
        return list(self.filters.keys())


class SearchSorting:
    """Sistema de ordenação para busca"""

    @staticmethod
    def sort_by_distance(places: List[Place], reverse: bool = False) -> List[Place]:
        """Ordena por distância"""
        return sorted(places, key=lambda x: x.distance, reverse=reverse)

    @staticmethod
    def sort_by_rating(places: List[Place], reverse: bool = True) -> List[Place]:
        """Ordena por avaliação"""
        return sorted(places, key=lambda x: x.rating or 0, reverse=reverse)

    @staticmethod
    def sort_by_reviews(places: List[Place], reverse: bool = True) -> List[Place]:
        """Ordena por número de avaliações"""
        return sorted(places, key=lambda x: x.reviews or 0, reverse=reverse)

    @staticmethod
    def sort_by_name(places: List[Place], reverse: bool = False) -> List[Place]:
        """Ordena por nome"""
        return sorted(places, key=lambda x: x.name.lower(), reverse=reverse)

    @staticmethod
    def sort_by_priority(places: List[Place], category_priorities: Dict[str, int]) -> List[Place]:
        """Ordena por prioridade da categoria"""
        def get_priority(place: Place) -> int:
            if place.category and place.category in category_priorities:
                return category_priorities[place.category]
            return 999  # Prioridade baixa para categorias não definidas

        return sorted(places, key=get_priority)

    @staticmethod
    def multi_sort(places: List[Place], sort_criteria: List[tuple]) -> List[Place]:
        """Ordenação múltipla"""
        def sort_key(place: Place):
            key_values = []
            for field, reverse in sort_criteria:
                if field == 'distance':
                    key_values.append(place.distance)
                elif field == 'rating':
                    key_values.append(place.rating or 0)
                elif field == 'reviews':
                    key_values.append(place.reviews or 0)
                elif field == 'name':
                    key_values.append(place.name.lower())

            return key_values

        return sorted(places, key=sort_key)


class SearchAggregator:
    """Sistema de agregação de resultados"""

    @staticmethod
    def group_by_category(places: List[Place]) -> Dict[str, List[Place]]:
        """Agrupa lugares por categoria"""
        grouped = {}
        for place in places:
            category = place.category or 'outros'
            if category not in grouped:
                grouped[category] = []
            grouped[category].append(place)
        return grouped

    @staticmethod
    def group_by_distance_range(places: List[Place], ranges: List[tuple]) -> Dict[str, List[Place]]:
        """Agrupa lugares por faixas de distância"""
        grouped = {}

        for place in places:
            distance = place.distance
            range_name = 'muito longe'

            for min_dist, max_dist, name in ranges:
                if min_dist <= distance <= max_dist:
                    range_name = name
                    break

            if range_name not in grouped:
                grouped[range_name] = []
            grouped[range_name].append(place)

        return grouped

    @staticmethod
    def get_statistics(places: List[Place]) -> Dict[str, Any]:
        """Retorna estatísticas dos lugares"""
        if not places:
            return {
                'total': 0,
                'avg_distance': 0,
                'avg_rating': 0,
                'categories': {},
                'sources': {}
            }

        total = len(places)
        distances = [p.distance for p in places]
        ratings = [p.rating for p in places if p.rating]

        categories = {}
        sources = {}

        for place in places:
            # Contar categorias
            category = place.category or 'outros'
            categories[category] = categories.get(category, 0) + 1

            # Contar fontes
            sources[place.source] = sources.get(place.source, 0) + 1

        return {
            'total': total,
            'avg_distance': sum(distances) / len(distances) if distances else 0,
            'avg_rating': sum(ratings) / len(ratings) if ratings else 0,
            'min_distance': min(distances) if distances else 0,
            'max_distance': max(distances) if distances else 0,
            'categories': categories,
            'sources': sources
        }
