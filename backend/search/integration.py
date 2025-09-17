"""
Script de integração com o frontend Next.js
"""
import json
import os
from typing import Dict, Any


class FrontendIntegration:
    """Classe para integração com o frontend"""

    @staticmethod
    def generate_nextjs_api_routes():
        """Gera rotas de API para Next.js"""

        # Rota de busca
        search_route = '''
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SEARCH_API_URL = process.env.SEARCH_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '5';
    const category = searchParams.get('category');

    if (!query || !lat || !lng) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: query, lat, lng' },
        { status: 400 }
      );
    }

    const searchUrl = new URL(`${SEARCH_API_URL}/search`);
    searchUrl.searchParams.set('query', query);
    searchUrl.searchParams.set('lat', lat);
    searchUrl.searchParams.set('lng', lng);
    searchUrl.searchParams.set('radius', radius);
    if (category) searchUrl.searchParams.set('category', category);

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na busca:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
'''

        # Rota de autocomplete
        autocomplete_route = '''
// app/api/search/autocomplete/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SEARCH_API_URL = process.env.SEARCH_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = searchParams.get('limit') || '5';

    if (!query) {
      return NextResponse.json(
        { error: 'Parâmetro obrigatório: query' },
        { status: 400 }
      );
    }

    const autocompleteUrl = new URL(`${SEARCH_API_URL}/autocomplete`);
    autocompleteUrl.searchParams.set('query', query);
    autocompleteUrl.searchParams.set('limit', limit);

    const response = await fetch(autocompleteUrl.toString());
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no autocomplete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
'''

        # Rota de categorias
        categories_route = '''
// app/api/search/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SEARCH_API_URL = process.env.SEARCH_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${SEARCH_API_URL}/categories`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
'''

        return {
            'search': search_route,
            'autocomplete': autocomplete_route,
            'categories': categories_route
        }

    @staticmethod
    def generate_environment_vars():
        """Gera variáveis de ambiente para o frontend"""
        return '''
# Adicione ao seu .env.local
SEARCH_API_URL=http://localhost:8000
NEXT_PUBLIC_SEARCH_API_URL=http://localhost:8000
'''

    @staticmethod
    def generate_hook_example():
        """Gera exemplo de hook para o frontend"""
        return '''
// hooks/useSearch.ts
import { useState, useCallback } from 'react';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  rating?: number;
  phone?: string;
  website?: string;
  source: string;
}

interface UseSearchReturn {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string, lat: number, lng: number, radius?: number, category?: string) => Promise<void>;
  clearResults: () => void;
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    query: string,
    lat: number,
    lng: number,
    radius: number = 5,
    category?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        query,
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
      });

      if (category) {
        searchParams.set('category', category);
      }

      const response = await fetch(`/api/search?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || 'Erro na busca');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
}
'''

    @staticmethod
    def save_integration_files():
        """Salva arquivos de integração"""
        routes = FrontendIntegration.generate_nextjs_api_routes()

        # Criar diretório de integração
        integration_dir = Path("integration")
        integration_dir.mkdir(exist_ok=True)

        # Salvar rotas
        for route_name, content in routes.items():
            route_file = integration_dir / f"{route_name}_route.ts"
            with open(route_file, "w", encoding="utf-8") as f:
                f.write(content)

        # Salvar hook
        hook_file = integration_dir / "useSearch.ts"
        with open(hook_file, "w", encoding="utf-8") as f:
            f.write(FrontendIntegration.generate_hook_example())

        # Salvar variáveis de ambiente
        env_file = integration_dir / ".env.example"
        with open(env_file, "w", encoding="utf-8") as f:
            f.write(FrontendIntegration.generate_environment_vars())

        print("✅ Arquivos de integração salvos em integration/")
        return True


if __name__ == "__main__":
    from pathlib import Path
    FrontendIntegration.save_integration_files()
