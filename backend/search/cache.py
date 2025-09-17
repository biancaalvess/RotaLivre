"""
Sistema de cache para otimizar buscas
"""
import json
import time
import hashlib
from typing import Any, Optional, Dict
import sqlite3
import os


class SearchCache:
    """Sistema de cache para resultados de busca"""

    def __init__(self, db_path: str = 'data/moto_weather.db'):
        self.db_path = db_path
        self.init_cache_table()

    def init_cache_table(self):
        """Inicializa tabela de cache se não existir"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS search_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cache_key TEXT UNIQUE NOT NULL,
                data TEXT NOT NULL,
                category TEXT,
                location TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        ''')

        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_cache_key ON search_cache (cache_key)
        ''')

        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_cache_expires ON search_cache (expires_at)
        ''')

        conn.commit()
        conn.close()

    def _generate_key(self, query: str, lat: float, lng: float, radius: int, category: str = '') -> str:
        """Gera chave única para o cache"""
        key_string = f"{query}:{lat}:{lng}:{radius}:{category}"
        return hashlib.md5(key_string.encode()).hexdigest()

    def get(self, query: str, lat: float, lng: float, radius: int, category: str = '') -> Optional[Dict[str, Any]]:
        """Recupera dados do cache"""
        cache_key = self._generate_key(query, lat, lng, radius, category)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT data FROM search_cache 
            WHERE cache_key = ? AND expires_at > datetime('now')
        ''', (cache_key,))

        result = cursor.fetchone()
        conn.close()

        if result:
            return json.loads(result[0])
        return None

    def set(self, query: str, lat: float, lng: float, radius: int,
            data: Dict[str, Any], category: str = '', ttl: int = 3600) -> bool:
        """Armazena dados no cache"""
        cache_key = self._generate_key(query, lat, lng, radius, category)
        expires_at = time.time() + ttl

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            cursor.execute('''
                INSERT OR REPLACE INTO search_cache 
                (cache_key, data, category, location, expires_at)
                VALUES (?, ?, ?, ?, datetime(?, 'unixepoch'))
            ''', (cache_key, json.dumps(data), category, f"{lat},{lng}", expires_at))

            conn.commit()
            return True
        except Exception as e:
            print(f"Erro ao salvar no cache: {e}")
            return False
        finally:
            conn.close()

    def clear_expired(self) -> int:
        """Remove entradas expiradas do cache"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            DELETE FROM search_cache WHERE expires_at <= datetime('now')
        ''')

        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()

        return deleted_count

    def clear_category(self, category: str) -> int:
        """Remove cache de uma categoria específica"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            DELETE FROM search_cache WHERE category = ?
        ''', (category,))

        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()

        return deleted_count

    def get_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas do cache"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Total de entradas
        cursor.execute('SELECT COUNT(*) FROM search_cache')
        total_entries = cursor.fetchone()[0]

        # Entradas por categoria
        cursor.execute('''
            SELECT category, COUNT(*) as count 
            FROM search_cache 
            GROUP BY category
        ''')
        category_stats = dict(cursor.fetchall())

        # Entradas expiradas
        cursor.execute('''
            SELECT COUNT(*) FROM search_cache 
            WHERE expires_at <= datetime('now')
        ''')
        expired_entries = cursor.fetchone()[0]

        conn.close()

        return {
            'total_entries': total_entries,
            'category_stats': category_stats,
            'expired_entries': expired_entries,
            'active_entries': total_entries - expired_entries
        }
