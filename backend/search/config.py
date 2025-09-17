"""
Configurações do sistema de busca
"""
import os
from typing import Dict, Any


class SearchConfig:
    """Configurações para o sistema de busca"""

    # Configurações de API
    SERPAPI_KEY = os.getenv('SERPAPI_KEY', '')
    GOOGLE_MAPS_KEY = os.getenv('GOOGLE_MAPS_KEY', '')
    OPENSTREETMAP_URL = 'https://overpass-api.de/api/interpreter'

    # Configurações de cache
    CACHE_TTL = 3600  # 1 hora em segundos
    CACHE_PREFIX = 'search:'

    # Configurações de rate limiting
    RATE_LIMIT_PER_MINUTE = 60
    RATE_LIMIT_PER_HOUR = 1000

    # Configurações de busca
    DEFAULT_RADIUS = 5  # km
    MAX_RADIUS = 50  # km
    MAX_RESULTS = 20

    # Categorias de busca
    CATEGORIES = {
        'gasolina': {
            'keywords': ['posto de gasolina', 'gasolina', 'combustível'],
            'radius': 5,
            'priority': 1
        },
        'hospedagem': {
            'keywords': ['hotel', 'pousada', 'camping', 'hospedagem'],
            'radius': 10,
            'priority': 2
        },
        'oficina': {
            'keywords': ['oficina mecânica', 'mecânica', 'oficina moto'],
            'radius': 5,
            'priority': 1
        },
        'restaurante': {
            'keywords': ['restaurante', 'lanchonete', 'comida'],
            'radius': 3,
            'priority': 3
        },
        'farmacia': {
            'keywords': ['farmácia', 'drogaria', 'medicamento'],
            'radius': 3,
            'priority': 2
        },
        'hospital': {
            'keywords': ['hospital', 'pronto socorro', 'emergência'],
            'radius': 10,
            'priority': 1
        },
        'policia': {
            'keywords': ['polícia', 'delegacia', 'segurança'],
            'radius': 10,
            'priority': 1
        }
    }

    # Configurações de banco de dados
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///data/moto_weather.db')

    @classmethod
    def get_category_config(cls, category: str) -> Dict[str, Any]:
        """Retorna configuração de uma categoria específica"""
        return cls.CATEGORIES.get(category.lower(), {
            'keywords': [category],
            'radius': cls.DEFAULT_RADIUS,
            'priority': 5
        })

    @classmethod
    def get_all_categories(cls) -> Dict[str, Dict[str, Any]]:
        """Retorna todas as categorias disponíveis"""
        return cls.CATEGORIES
