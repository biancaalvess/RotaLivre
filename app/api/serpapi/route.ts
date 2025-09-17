import { NextRequest, NextResponse } from 'next/server';

const SERPAPI_KEY = process.env.NEXT_PUBLIC_SERPAPI_KEY || 'your_serpapi_key_here';
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Verificar se a chave da API está configurada
  if (!SERPAPI_KEY || SERPAPI_KEY === 'your_serpapi_key_here') {
    return NextResponse.json({
      error: 'SerpAPI key not configured',
      mockData: true
    }, { status: 200 });
  }

  try {
    const apiParams = new URLSearchParams({
      api_key: SERPAPI_KEY,
      engine: 'google_maps',
      google_domain: 'google.com',
      hl: 'pt',
      gl: 'br',
      ...Object.fromEntries(searchParams)
    });

    const response = await fetch(`${SERPAPI_BASE_URL}?${apiParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 segundos no servidor
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json({
          error: 'Rate limit exceeded. Please try again later.',
          status: 429
        }, { status: 429 });
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('SerpAPI proxy error:', error);
    
    // Retornar dados mock em caso de erro
    const mockData = {
      search_metadata: {
        status: 'Success',
        created_at: new Date().toISOString()
      },
      search_parameters: {
        engine: 'google_maps',
        q: searchParams.get('q') || 'search',
        ll: searchParams.get('ll') || '@-23.5505,-46.6333,5km',
        type: searchParams.get('type') || 'search'
      },
      search_information: {
        query_displayed: searchParams.get('q') || 'search',
        total_results: 0
      },
      place_results: []
    };

    return NextResponse.json(mockData);
  }
}
