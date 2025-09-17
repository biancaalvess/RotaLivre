"""
Script de teste para a API de busca
"""
import asyncio
import aiohttp
import json
from typing import Dict, Any


class SearchAPITester:
    """Classe para testar a API de busca"""

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def test_health(self) -> bool:
        """Testa endpoint de health check"""
        try:
            async with self.session.get(f"{self.base_url}/health") as response:
                data = await response.json()
                print(f"✅ Health Check: {data['status']}")
                return data['status'] == 'healthy'
        except Exception as e:
            print(f"❌ Health Check falhou: {e}")
            return False

    async def test_search(self, query: str, lat: float, lng: float, radius: int = 5) -> Dict[str, Any]:
        """Testa endpoint de busca"""
        try:
            params = {
                'query': query,
                'lat': lat,
                'lng': lng,
                'radius': radius
            }

            async with self.session.get(f"{self.base_url}/search", params=params) as response:
                data = await response.json()

                if response.status == 200:
                    print(
                        f"✅ Busca '{query}': {len(data.get('data', []))} resultados")
                    return data
                else:
                    print(f"❌ Busca falhou: {data}")
                    return data

        except Exception as e:
            print(f"❌ Erro na busca: {e}")
            return {}

    async def test_autocomplete(self, query: str, limit: int = 5) -> Dict[str, Any]:
        """Testa endpoint de autocomplete"""
        try:
            params = {'query': query, 'limit': limit}

            async with self.session.get(f"{self.base_url}/autocomplete", params=params) as response:
                data = await response.json()

                if response.status == 200:
                    print(
                        f"✅ Autocomplete '{query}': {len(data.get('suggestions', []))} sugestões")
                    return data
                else:
                    print(f"❌ Autocomplete falhou: {data}")
                    return data

        except Exception as e:
            print(f"❌ Erro no autocomplete: {e}")
            return {}

    async def test_categories(self) -> Dict[str, Any]:
        """Testa endpoint de categorias"""
        try:
            async with self.session.get(f"{self.base_url}/categories") as response:
                data = await response.json()

                if response.status == 200:
                    categories = list(data.get('categories', {}).keys())
                    print(f"✅ Categorias: {len(categories)} disponíveis")
                    print(f"   Categorias: {', '.join(categories)}")
                    return data
                else:
                    print(f"❌ Categorias falharam: {data}")
                    return data

        except Exception as e:
            print(f"❌ Erro nas categorias: {e}")
            return {}

    async def test_category_search(self, category: str, lat: float, lng: float) -> Dict[str, Any]:
        """Testa busca por categoria"""
        try:
            params = {'lat': lat, 'lng': lng}

            async with self.session.get(f"{self.base_url}/search/category/{category}", params=params) as response:
                data = await response.json()

                if response.status == 200:
                    print(
                        f"✅ Busca por categoria '{category}': {len(data.get('data', []))} resultados")
                    return data
                else:
                    print(f"❌ Busca por categoria falhou: {data}")
                    return data

        except Exception as e:
            print(f"❌ Erro na busca por categoria: {e}")
            return {}

    async def test_stats(self) -> Dict[str, Any]:
        """Testa endpoint de estatísticas"""
        try:
            async with self.session.get(f"{self.base_url}/stats") as response:
                data = await response.json()

                if response.status == 200:
                    cache_stats = data.get('cache', {})
                    print(f"✅ Estatísticas:")
                    print(
                        f"   Cache: {cache_stats.get('total_entries', 0)} entradas")
                    print(f"   Ativas: {cache_stats.get('active_entries', 0)}")
                    return data
                else:
                    print(f"❌ Estatísticas falharam: {data}")
                    return data

        except Exception as e:
            print(f"❌ Erro nas estatísticas: {e}")
            return {}

    async def run_all_tests(self):
        """Executa todos os testes"""
        print("🧪 Iniciando testes da API de busca...")
        print("=" * 50)

        # Coordenadas de teste (São Paulo)
        test_lat = -23.5505
        test_lng = -46.6333

        # Teste 1: Health Check
        print("\n1. Testando Health Check...")
        health_ok = await self.test_health()

        if not health_ok:
            print("❌ API não está funcionando. Verifique se o servidor está rodando.")
            return

        # Teste 2: Categorias
        print("\n2. Testando Categorias...")
        await self.test_categories()

        # Teste 3: Busca geral
        print("\n3. Testando Busca Geral...")
        await self.test_search("posto de gasolina", test_lat, test_lng, 5)

        # Teste 4: Busca por categoria
        print("\n4. Testando Busca por Categoria...")
        await self.test_category_search("gasolina", test_lat, test_lng)
        await self.test_category_search("oficina", test_lat, test_lng)

        # Teste 5: Autocomplete
        print("\n5. Testando Autocomplete...")
        await self.test_autocomplete("posto", 3)
        await self.test_autocomplete("oficina", 3)

        # Teste 6: Estatísticas
        print("\n6. Testando Estatísticas...")
        await self.test_stats()

        print("\n" + "=" * 50)
        print("✅ Testes concluídos!")


async def main():
    """Função principal de teste"""
    async with SearchAPITester() as tester:
        await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
