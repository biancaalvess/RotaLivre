import { Card, CardContent } from "@/components/ui/card"
import { Droplets, Wind, AlertTriangle } from "lucide-react"

interface WeatherCardProps {
  weatherData: any
  location: { lat: number; lon: number } | null
}

export function WeatherCard({ weatherData, location }: WeatherCardProps) {
  if (!weatherData) return null

  const { current, rain_probability } = weatherData
  const temp = Math.round(current.main.temp)
  const description = current.weather[0].description
  const humidity = current.main.humidity
  const windSpeed = current.wind.speed

  const getRainAlert = (probability: number) => {
    if (probability >= 70) return { level: "high", text: "Alto risco de chuva", color: "bg-destructive" }
    if (probability >= 40) return { level: "medium", text: "Possibilidade de chuva", color: "bg-accent" }
    return { level: "low", text: "Baixo risco de chuva", color: "bg-primary" }
  }

  const rainAlert = getRainAlert(rain_probability)

  return (
    <Card className="bg-gradient-to-br from-card to-muted">
      <CardContent className="p-6">
        {/* Rain Probability Alert */}
        <div className={`${rainAlert.color} text-white rounded-lg p-4 mb-4`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Probabilidade de Chuva</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{rain_probability}%</span>
            <span className="text-sm opacity-90">{rainAlert.text}</span>
          </div>
        </div>

        {/* Current Weather */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-1">{temp}°C</div>
            <div className="text-sm text-muted-foreground capitalize">{description}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="w-4 h-4 text-primary" />
              <span>{humidity}% umidade</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wind className="w-4 h-4 text-primary" />
              <span>{windSpeed} m/s vento</span>
            </div>
          </div>
        </div>

        {/* Weather Tips for Motorcyclists */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Dica para Motociclistas:</h4>
          <p className="text-xs text-muted-foreground">
            {rain_probability >= 70
              ? "Evite viajar ou use equipamentos impermeáveis completos."
              : rain_probability >= 40
                ? "Leve capa de chuva e reduza a velocidade se necessário."
                : "Condições favoráveis para pilotagem, mas mantenha atenção."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
