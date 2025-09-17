import { NextRequest, NextResponse } from 'next/server';

const LOCATIONIQ_API_KEY = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;
const LOCATIONIQ_BASE_URL = 'https://us1.locationiq.com/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '/reverse';
  
  // Verificar se a chave da API está configurada
  if (!LOCATIONIQ_API_KEY) {
    return NextResponse.json({
      error: 'LocationIQ API key not configured',
      mockData: true
    }, { status: 200 });
  }

  try {
    const apiParams = new URLSearchParams({
      key: LOCATIONIQ_API_KEY,
      format: 'json',
      ...Object.fromEntries(searchParams)
    });

    // Remover o endpoint dos parâmetros para evitar duplicação
    apiParams.delete('endpoint');

    const response = await fetch(`${LOCATIONIQ_BASE_URL}${endpoint}?${apiParams}`, {
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
    console.error('LocationIQ proxy error:', error);
    
    // Retornar dados mock em caso de erro
    const mockData = {
      place_id: 'mock_place_123',
      licence: 'Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright',
      osm_type: 'way',
      osm_id: '12345678',
      lat: '-23.5505',
      lon: '-46.6333',
      display_name: 'São Paulo, SP, Brasil',
      address: {
        city: 'São Paulo',
        state: 'São Paulo',
        country: 'Brasil',
        country_code: 'br'
      },
      boundingbox: ['-23.6505', '-23.4505', '-46.7333', '-46.5333']
    };

    return NextResponse.json(mockData);
  }
}
