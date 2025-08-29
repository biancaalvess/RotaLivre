"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CloudRain, Sun, Cloud, Wind, AlertTriangle } from "lucide-react"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  userLocation: { lat: number; lon: number } | null
  onReportSubmitted: () => void
}

const weatherTypes = [
  { id: "rain", label: "Chuva", icon: CloudRain, color: "bg-blue-500" },
  { id: "sun", label: "Sol", icon: Sun, color: "bg-yellow-500" },
  { id: "cloud", label: "Nublado", icon: Cloud, color: "bg-gray-500" },
  { id: "wind", label: "Vento Forte", icon: Wind, color: "bg-green-500" },
  { id: "danger", label: "Perigo na Via", icon: AlertTriangle, color: "bg-red-500" },
]

export function ReportModal({ isOpen, onClose, userLocation, onReportSubmitted }: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [intensity, setIntensity] = useState<number>(1)
  const [description, setDescription] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedType || !userLocation) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: userLocation.lat,
          longitude: userLocation.lon,
          weather_type: selectedType,
          intensity,
          description: description || `Relatório de ${weatherTypes.find((t) => t.id === selectedType)?.label}`,
        }),
      })

      if (response.ok) {
        onReportSubmitted()
        onClose()
        // Reset form
        setSelectedType("")
        setIntensity(1)
        setDescription("")
      }
    } catch (error) {
      console.error("Error submitting report:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Reportar Condição</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Weather Type Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Condição</label>
            <div className="grid grid-cols-2 gap-2">
              {weatherTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedType === type.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-8 h-8 ${type.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Intensity Selection */}
          {selectedType && (
            <div>
              <label className="text-sm font-medium mb-2 block">Intensidade</label>
              <div className="flex gap-2">
                {[1, 2, 3].map((level) => (
                  <Button
                    key={level}
                    variant={intensity === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIntensity(level)}
                    className="flex-1"
                  >
                    {level === 1 ? "Leve" : level === 2 ? "Moderado" : "Forte"}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Descrição (opcional)</label>
            <Textarea
              placeholder="Adicione detalhes sobre a condição..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedType || submitting}
              className="flex-1 bg-secondary hover:bg-secondary/90"
            >
              {submitting ? "Enviando..." : "Reportar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
