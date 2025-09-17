const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  visibility: number;
  wind_speed: number;
  wind_direction: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  timestamp: string;
  uv_index?: number;
  rain?: {
    '1h': number;
  };
  snow?: {
    '1h': number;
  };
}

export interface WeatherForecast {
  date: string;
  temperature_min: number;
  temperature_max: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  rain_probability: number;
}

export class WeatherApiService {
  private static async makeRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    // Verificar se a chave da API está configurada
    if (!OPENWEATHER_API_KEY) {
      console.warn('OpenWeatherMap API key not configured. Using mock data.');
      return this.getMockWeatherData();
    }

    const searchParams = new URLSearchParams({
      appid: OPENWEATHER_API_KEY,
      units: 'metric',
      lang: 'pt_br',
      ...params
    });

    try {
      const response = await fetch(`${OPENWEATHER_BASE_URL}${endpoint}?${searchParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 segundos
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OpenWeatherMap request failed:', error);
      // Retornar dados mock em caso de erro
      return this.getMockWeatherData();
    }
  }

  // Dados mock para quando a API não estiver disponível
  private static getMockWeatherData(): any {
    return {
      main: {
        temp: 25,
        feels_like: 27,
        humidity: 65,
        pressure: 1013,
        visibility: 10000
      },
      wind: {
        speed: 3.5,
        deg: 180
      },
      weather: [{
        main: 'Clear',
        description: 'céu limpo',
        icon: '01d'
      }],
      name: 'São Paulo',
      sys: {
        country: 'BR'
      },
      dt: Math.floor(Date.now() / 1000)
    };
  }

  // Obter dados meteorológicos atuais por coordenadas
  static async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    const params = {
      lat: lat.toString(),
      lon: lng.toString()
    };

    try {
      const data = await this.makeRequest('/weather', params);
      
      return {
        temperature: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility ? Math.round(data.visibility / 1000) : 0, // Convert to km
        wind_speed: data.wind.speed,
        wind_direction: data.wind.deg,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name,
        country: data.sys.country,
        timestamp: new Date(data.dt * 1000).toISOString(),
        uv_index: data.uvi,
        rain: data.rain,
        snow: data.snow
      };
    } catch (error) {
      console.error('Failed to get current weather:', error);
      // Retornar dados mock em caso de erro
      const mockData = this.getMockWeatherData();
      return {
        temperature: Math.round(mockData.main.temp),
        feels_like: Math.round(mockData.main.feels_like),
        humidity: mockData.main.humidity,
        pressure: mockData.main.pressure,
        visibility: mockData.main.visibility ? Math.round(mockData.main.visibility / 1000) : 10,
        wind_speed: mockData.wind.speed,
        wind_direction: mockData.wind.deg,
        description: mockData.weather[0].description,
        icon: mockData.weather[0].icon,
        city: mockData.name,
        country: mockData.sys.country,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Obter previsão do tempo para 5 dias
  static async getWeatherForecast(lat: number, lng: number): Promise<WeatherForecast[]> {
    const params = {
      lat: lat.toString(),
      lon: lng.toString()
    };

    try {
      const data = await this.makeRequest('/forecast', params);
      
      // Agrupar dados por dia
      const dailyForecasts: { [key: string]: any[] } = {};
      
      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(item);
      });

      // Processar cada dia
      const forecasts: WeatherForecast[] = [];
      Object.keys(dailyForecasts).slice(0, 5).forEach(date => {
        const dayData = dailyForecasts[date];
        const temps = dayData.map(item => item.main.temp);
        const descriptions = dayData.map(item => item.weather[0].description);
        
        forecasts.push({
          date: new Date(date).toISOString().split('T')[0],
          temperature_min: Math.round(Math.min(...temps)),
          temperature_max: Math.round(Math.max(...temps)),
          description: descriptions[0],
          icon: dayData[0].weather[0].icon,
          humidity: Math.round(dayData.reduce((sum, item) => sum + item.main.humidity, 0) / dayData.length),
          wind_speed: Math.round(dayData.reduce((sum, item) => sum + item.wind.speed, 0) / dayData.length * 10) / 10,
          rain_probability: dayData[0].pop ? Math.round(dayData[0].pop * 100) : 0
        });
      });

      return forecasts;
    } catch (error) {
      console.error('Failed to get weather forecast:', error);
      // Retornar dados mock em caso de erro
      return this.getMockForecastData();
    }
  }

  // Dados mock para previsão
  private static getMockForecastData(): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      forecasts.push({
        date: date.toISOString().split('T')[0],
        temperature_min: 18 + Math.floor(Math.random() * 8),
        temperature_max: 25 + Math.floor(Math.random() * 8),
        description: ['céu limpo', 'parcialmente nublado', 'nublado', 'chuva leve'][Math.floor(Math.random() * 4)],
        icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)],
        humidity: 60 + Math.floor(Math.random() * 30),
        wind_speed: 2 + Math.floor(Math.random() * 6),
        rain_probability: Math.floor(Math.random() * 40)
      });
    }
    
    return forecasts;
  }

  // Buscar cidade por nome
  static async searchCity(cityName: string): Promise<{ lat: number; lng: number; name: string; country: string }[]> {
    if (!OPENWEATHER_API_KEY) {
      console.warn('OpenWeatherMap API key not configured.');
      return [];
    }

    const searchParams = new URLSearchParams({
      q: cityName,
      appid: OPENWEATHER_API_KEY,
      limit: '5'
    });

    try {
      const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?${searchParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.map((city: any) => ({
        lat: city.lat,
        lng: city.lon,
        name: city.name,
        country: city.country
      }));
    } catch (error) {
      console.error('Failed to search city:', error);
      return [];
    }
  }

  // Converter direção do vento em texto
  static getWindDirection(degrees: number): string {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  // Obter descrição do clima em português
  static getWeatherDescription(icon: string): string {
    const descriptions: { [key: string]: string } = {
      '01d': 'Sol',
      '01n': 'Lua',
      '02d': 'Poucas nuvens',
      '02n': 'Poucas nuvens',
      '03d': 'Nublado',
      '03n': 'Nublado',
      '04d': 'Muito nublado',
      '04n': 'Muito nublado',
      '09d': 'Chuva forte',
      '09n': 'Chuva forte',
      '10d': 'Chuva',
      '10n': 'Chuva',
      '11d': 'Tempestade',
      '11n': 'Tempestade',
      '13d': 'Neve',
      '13n': 'Neve',
      '50d': 'Neblina',
      '50n': 'Neblina'
    };
    return descriptions[icon] || 'Desconhecido';
  }
}
