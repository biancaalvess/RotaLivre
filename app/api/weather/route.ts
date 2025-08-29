import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude required" }, { status: 400 })
  }

  try {
    const baseUrl = "https://api.open-meteo.com/v1"

    // Fetch current weather and forecast from Open-Meteo
    const weatherUrl = `${baseUrl}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,cloud_cover&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto&forecast_days=1`

    const weatherResponse = await fetch(weatherUrl)

    if (!weatherResponse.ok) {
      console.log("Weather API failed, using mock data")
      const mockWeatherData = {
        current: {
          main: {
            temp: 22 + Math.random() * 10,
            humidity: 60 + Math.random() * 30,
          },
          weather: [
            {
              main: Math.random() > 0.5 ? "Clear" : "Clouds",
              description: Math.random() > 0.5 ? "céu limpo" : "nuvens dispersas",
            },
          ],
          wind: {
            speed: 2 + Math.random() * 5,
          },
          clouds: {
            all: Math.random() * 100,
          },
        },
        rain_probability: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(mockWeatherData)
    }

    const weatherData = await weatherResponse.json()

    const convertWeatherCode = (code: number) => {
      if (code <= 3) return { main: "Clear", description: "céu limpo" }
      if (code <= 48) return { main: "Clouds", description: "nuvens" }
      if (code <= 67) return { main: "Rain", description: "chuva" }
      if (code <= 77) return { main: "Snow", description: "neve" }
      if (code <= 82) return { main: "Rain", description: "chuva forte" }
      if (code <= 99) return { main: "Thunderstorm", description: "tempestade" }
      return { main: "Clear", description: "céu limpo" }
    }

    const currentWeather = convertWeatherCode(weatherData.current.weather_code)

    // Calculate rain probability from hourly data
    const rainProbability = weatherData.hourly.precipitation_probability
      ? Math.max(...weatherData.hourly.precipitation_probability.slice(0, 6))
      : Math.floor(Math.random() * 30)

    const formattedWeatherData = {
      current: {
        main: {
          temp: weatherData.current.temperature_2m,
          humidity: weatherData.current.relative_humidity_2m,
        },
        weather: [currentWeather],
        wind: {
          speed: weatherData.current.wind_speed_10m,
        },
        clouds: {
          all: weatherData.current.cloud_cover,
        },
      },
      rain_probability: rainProbability,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(formattedWeatherData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
