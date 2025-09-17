import requests
import json
import sqlite3
from datetime import datetime, timedelta
import os

class WeatherAPI:
    def __init__(self):
        # You'll need to get a free API key from OpenWeatherMap
        self.weather_api_key = os.getenv('OPENWEATHER_API_KEY', 'your_openweather_api_key_here')
        self.weather_base_url = "http://api.openweathermap.org/data/2.5"
        
    def get_weather_data(self, lat, lon):
        """Get current weather and forecast data"""
        try:
            # Check cache first
            cached_data = self._get_cached_weather(lat, lon)
            if cached_data:
                return json.loads(cached_data)
            
            # Current weather
            current_url = f"{self.weather_base_url}/weather"
            current_params = {
                'lat': lat,
                'lon': lon,
                'appid': self.weather_api_key,
                'units': 'metric'
            }
            
            # Forecast data
            forecast_url = f"{self.weather_base_url}/forecast"
            forecast_params = {
                'lat': lat,
                'lon': lon,
                'appid': self.weather_api_key,
                'units': 'metric'
            }
            
            current_response = requests.get(current_url, params=current_params)
            forecast_response = requests.get(forecast_url, params=forecast_params)
            
            if current_response.status_code == 200 and forecast_response.status_code == 200:
                current_data = current_response.json()
                forecast_data = forecast_response.json()
                
                weather_info = {
                    'current': current_data,
                    'forecast': forecast_data,
                    'rain_probability': self._calculate_rain_probability(current_data, forecast_data),
                    'timestamp': datetime.now().isoformat()
                }
                
                # Cache the result
                self._cache_weather_data(lat, lon, json.dumps(weather_info))
                
                return weather_info
            else:
                return None
                
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            return None
    
    def _calculate_rain_probability(self, current, forecast):
        """Calculate rain probability from weather data"""
        rain_prob = 0
        
        # Check current conditions
        if 'rain' in current:
            rain_prob = max(rain_prob, 80)
        elif current['weather'][0]['main'] in ['Drizzle', 'Rain', 'Thunderstorm']:
            rain_prob = max(rain_prob, 70)
        elif current['clouds']['all'] > 80:
            rain_prob = max(rain_prob, 30)
        
        # Check forecast for next 3 hours
        for item in forecast['list'][:3]:
            if 'rain' in item:
                rain_prob = max(rain_prob, 60)
            elif item['weather'][0]['main'] in ['Rain', 'Drizzle']:
                rain_prob = max(rain_prob, 50)
        
        return rain_prob
    
    def _get_cached_weather(self, lat, lon):
        """Get cached weather data if still valid"""
        try:
            conn = sqlite3.connect('data/moto_weather.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT weather_data FROM weather_api_cache 
                WHERE latitude = ? AND longitude = ? 
                AND expires_at > CURRENT_TIMESTAMP
                ORDER BY cached_at DESC LIMIT 1
            ''', (lat, lon))
            
            result = cursor.fetchone()
            conn.close()
            
            return result[0] if result else None
        except:
            return None
    
    def _cache_weather_data(self, lat, lon, weather_data):
        """Cache weather data for 10 minutes"""
        try:
            conn = sqlite3.connect('data/moto_weather.db')
            cursor = conn.cursor()
            
            expires_at = datetime.now() + timedelta(minutes=10)
            
            cursor.execute('''
                INSERT INTO weather_api_cache (latitude, longitude, weather_data, expires_at)
                VALUES (?, ?, ?, ?)
            ''', (lat, lon, weather_data, expires_at))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error caching weather data: {e}")

# Test the weather API
if __name__ == "__main__":
    api = WeatherAPI()
    # Test with São Paulo coordinates
    weather = api.get_weather_data(-23.5505, -46.6333)
    if weather:
        print(f"Rain probability: {weather['rain_probability']}%")
        print(f"Current weather: {weather['current']['weather'][0]['description']}")
    else:
        print("Failed to fetch weather data")
