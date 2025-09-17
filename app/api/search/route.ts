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
    const use_cache = searchParams.get('use_cache') || 'true';

    if (!query || !lat || !lng) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Parâmetros obrigatórios: query, lat, lng' 
        },
        { status: 400 }
      );
    }

    // Validar coordenadas
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Coordenadas e raio devem ser números válidos' 
        },
        { status: 400 }
      );
    }

    const searchUrl = new URL(`${SEARCH_API_URL}/search`);
    searchUrl.searchParams.set('query', query);
    searchUrl.searchParams.set('lat', latitude.toString());
    searchUrl.searchParams.set('lng', longitude.toString());
    searchUrl.searchParams.set('radius', searchRadius.toString());
    searchUrl.searchParams.set('use_cache', use_cache);
    
    if (category) {
      searchUrl.searchParams.set('category', category);
    }

    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Timeout de 30 segundos
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false,
          error: errorData.detail || `Erro na API de busca: ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro na busca:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}
