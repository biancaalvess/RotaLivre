import { NextRequest, NextResponse } from 'next/server';

const SEARCH_API_URL = process.env.SEARCH_API_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

    if (!lat || !lng) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Parâmetros obrigatórios: lat, lng' 
        },
        { status: 400 }
      );
    }

    // Validar coordenadas
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Coordenadas devem ser números válidos' 
        },
        { status: 400 }
      );
    }

    const categoryUrl = new URL(`${SEARCH_API_URL}/search/category/${params.category}`);
    categoryUrl.searchParams.set('lat', latitude.toString());
    categoryUrl.searchParams.set('lng', longitude.toString());
    
    if (radius) {
      const searchRadius = parseInt(radius);
      if (!isNaN(searchRadius)) {
        categoryUrl.searchParams.set('radius', searchRadius.toString());
      }
    }

    const response = await fetch(categoryUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000) // 30 segundos para busca por categoria
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false,
          error: errorData.detail || `Erro na busca por categoria: ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro na busca por categoria:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}
