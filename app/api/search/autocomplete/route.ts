import { NextRequest, NextResponse } from 'next/server';

const SEARCH_API_URL = process.env.SEARCH_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = searchParams.get('limit') || '5';

    if (!query) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Parâmetro obrigatório: query' 
        },
        { status: 400 }
      );
    }

    const autocompleteUrl = new URL(`${SEARCH_API_URL}/autocomplete`);
    autocompleteUrl.searchParams.set('query', query);
    autocompleteUrl.searchParams.set('limit', limit);

    const response = await fetch(autocompleteUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 segundos para autocomplete
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false,
          error: errorData.detail || `Erro no autocomplete: ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro no autocomplete:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}
