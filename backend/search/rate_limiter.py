"""
Sistema de rate limiting para controlar uso das APIs
"""
import time
import sqlite3
from typing import Dict, Any
from collections import defaultdict, deque
from .config import SearchConfig


class RateLimiter:
    """Sistema de rate limiting baseado em janela deslizante"""

    def __init__(self, db_path: str = 'data/moto_weather.db'):
        self.db_path = db_path
        self.memory_cache = defaultdict(lambda: deque())
        self.init_rate_limit_table()

    def init_rate_limit_table(self):
        """Inicializa tabela de rate limiting"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rate_limits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX(client_id, endpoint, request_time)
            )
        ''')

        conn.commit()
        conn.close()

    def is_allowed(
        self,
        client_id: str,
        endpoint: str = 'search',
        window_minutes: int = 1
    ) -> Dict[str, Any]:
        """
        Verifica se a requisição é permitida
        """
        current_time = time.time()
        window_start = current_time - (window_minutes * 60)

        # Limpar cache de memória
        self._clean_memory_cache(current_time, window_minutes)

        # Verificar cache de memória primeiro
        cache_key = f"{client_id}:{endpoint}"
        if cache_key in self.memory_cache:
            recent_requests = self.memory_cache[cache_key]
            if len(recent_requests) >= SearchConfig.RATE_LIMIT_PER_MINUTE:
                return {
                    'allowed': False,
                    'retry_after': int(recent_requests[0] + 60 - current_time),
                    'limit': SearchConfig.RATE_LIMIT_PER_MINUTE,
                    'remaining': 0
                }

        # Verificar banco de dados para janela maior
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Contar requisições na última hora
        cursor.execute('''
            SELECT COUNT(*) FROM rate_limits 
            WHERE client_id = ? AND endpoint = ? 
            AND request_time > datetime(?, 'unixepoch')
        ''', (client_id, endpoint, current_time - 3600))

        hourly_count = cursor.fetchone()[0]

        if hourly_count >= SearchConfig.RATE_LIMIT_PER_HOUR:
            conn.close()
            return {
                'allowed': False,
                'retry_after': 3600,  # 1 hora
                'limit': SearchConfig.RATE_LIMIT_PER_HOUR,
                'remaining': 0
            }

        # Registrar requisição
        cursor.execute('''
            INSERT INTO rate_limits (client_id, endpoint, request_time)
            VALUES (?, ?, datetime(?, 'unixepoch'))
        ''', (client_id, endpoint, current_time))

        conn.commit()
        conn.close()

        # Atualizar cache de memória
        self.memory_cache[cache_key].append(current_time)

        return {
            'allowed': True,
            'retry_after': 0,
            'limit': SearchConfig.RATE_LIMIT_PER_MINUTE,
            'remaining': SearchConfig.RATE_LIMIT_PER_MINUTE - len(self.memory_cache[cache_key])
        }

    def _clean_memory_cache(self, current_time: float, window_minutes: int):
        """Limpa cache de memória removendo entradas antigas"""
        window_start = current_time - (window_minutes * 60)

        for cache_key in list(self.memory_cache.keys()):
            # Remover entradas antigas
            while (self.memory_cache[cache_key] and
                   self.memory_cache[cache_key][0] < window_start):
                self.memory_cache[cache_key].popleft()

            # Remover chaves vazias
            if not self.memory_cache[cache_key]:
                del self.memory_cache[cache_key]

    def get_client_stats(self, client_id: str) -> Dict[str, Any]:
        """Retorna estatísticas de um cliente específico"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        current_time = time.time()

        # Requisições na última hora
        cursor.execute('''
            SELECT COUNT(*) FROM rate_limits 
            WHERE client_id = ? AND request_time > datetime(?, 'unixepoch')
        ''', (client_id, current_time - 3600))
        hourly_requests = cursor.fetchone()[0]

        # Requisições no último minuto
        cursor.execute('''
            SELECT COUNT(*) FROM rate_limits 
            WHERE client_id = ? AND request_time > datetime(?, 'unixepoch')
        ''', (client_id, current_time - 60))
        minute_requests = cursor.fetchone()[0]

        # Requisições por endpoint
        cursor.execute('''
            SELECT endpoint, COUNT(*) as count 
            FROM rate_limits 
            WHERE client_id = ? AND request_time > datetime(?, 'unixepoch')
            GROUP BY endpoint
        ''', (client_id, current_time - 3600))
        endpoint_stats = dict(cursor.fetchall())

        conn.close()

        return {
            'client_id': client_id,
            'hourly_requests': hourly_requests,
            'minute_requests': minute_requests,
            'hourly_limit': SearchConfig.RATE_LIMIT_PER_HOUR,
            'minute_limit': SearchConfig.RATE_LIMIT_PER_MINUTE,
            'endpoint_stats': endpoint_stats,
            'hourly_remaining': max(0, SearchConfig.RATE_LIMIT_PER_HOUR - hourly_requests),
            'minute_remaining': max(0, SearchConfig.RATE_LIMIT_PER_MINUTE - minute_requests)
        }

    def cleanup_old_records(self, hours: int = 24) -> int:
        """Remove registros antigos do banco de dados"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cutoff_time = time.time() - (hours * 3600)
        cursor.execute('''
            DELETE FROM rate_limits 
            WHERE request_time < datetime(?, 'unixepoch')
        ''', (cutoff_time,))

        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()

        return deleted_count
