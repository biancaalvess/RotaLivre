import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const query = searchParams.get("query") || "gas station"

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude required" }, { status: 400 })
  }

  try {
    const radius = 5000 // 5km radius

    // Map query types to OSM amenity tags
    const queryMap: { [key: string]: string[] } = {
      "gas station": ["fuel"],
      posto: ["fuel"],
      oficina: ["motorcycle_repair", "car_repair"],
      hospital: ["hospital"],
      farmacia: ["pharmacy"],
      restaurante: ["restaurant", "fast_food"],
      hotel: ["hotel"],
      banco: ["bank", "atm"],
    }

    const amenities = queryMap[query.toLowerCase()] || ["fuel", "motorcycle_repair"]
    const amenityQuery = amenities.map((a) => `amenity="${a}"`).join(" or ")

    // Overpass API query for nearby places
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node[${amenityQuery}](around:${radius},${lat},${lon});
        way[${amenityQuery}](around:${radius},${lat},${lon});
        relation[${amenityQuery}](around:${radius},${lat},${lon});
      );
      out center meta;
    `

    const overpassUrl = "https://overpass-api.de/api/interpreter"
    const response = await fetch(overpassUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    })

    if (!response.ok) {
      throw new Error(`Overpass API request failed: ${response.status}`)
    }

    const data = await response.json()

    const processedResults = {
      places:
        data.elements
          ?.slice(0, 10)
          .map((place: any) => {
            const coords =
              place.lat && place.lon
                ? { lat: place.lat, lng: place.lon }
                : place.center
                  ? { lat: place.center.lat, lng: place.center.lon }
                  : null

            if (!coords) return null

            // Calculate distance
            const distance = calculateDistance(Number.parseFloat(lat), Number.parseFloat(lon), coords.lat, coords.lng)

            return {
              name: place.tags?.name || place.tags?.brand || `${place.tags?.amenity || "Local"}`,
              address:
                [place.tags?.["addr:street"], place.tags?.["addr:housenumber"], place.tags?.["addr:city"]]
                  .filter(Boolean)
                  .join(", ") || "Endereço não disponível",
              rating: place.tags?.rating ? Number.parseFloat(place.tags.rating) : null,
              type: place.tags?.amenity || "unknown",
              position: coords,
              distance: `${distance.toFixed(1)} km`,
              phone: place.tags?.phone,
              hours: place.tags?.opening_hours,
              motorcycle_friendly:
                ["fuel", "motorcycle_repair"].includes(place.tags?.amenity) ||
                place.tags?.name?.toLowerCase().includes("moto") ||
                place.tags?.name?.toLowerCase().includes("posto"),
            }
          })
          .filter(Boolean) || [],
      search_metadata: { provider: "OpenStreetMap Overpass API" },
      search_parameters: { query, lat, lon, radius: `${radius}m` },
    }

    return NextResponse.json(processedResults)
  } catch (error) {
    console.error("Maps API error:", error)

    const mockPlaces = {
      places: [
        {
          name: "Posto Shell",
          address: "Av. Paulista, 1000",
          rating: 4.2,
          type: "fuel",
          position: { lat: Number.parseFloat(lat) + 0.001, lng: Number.parseFloat(lon) + 0.001 },
          distance: "0.5 km",
          motorcycle_friendly: true,
        },
        {
          name: "Oficina Moto Peças",
          address: "Rua Augusta, 500",
          rating: 4.5,
          type: "motorcycle_repair",
          position: { lat: Number.parseFloat(lat) - 0.002, lng: Number.parseFloat(lon) + 0.002 },
          distance: "1.2 km",
          motorcycle_friendly: true,
        },
        {
          name: "Posto Ipiranga",
          address: "Rua da Consolação, 800",
          rating: 4.0,
          type: "fuel",
          position: { lat: Number.parseFloat(lat) + 0.003, lng: Number.parseFloat(lon) - 0.001 },
          distance: "0.8 km",
          motorcycle_friendly: true,
        },
        {
          name: "Borracharia 24h",
          address: "Av. Rebouças, 300",
          rating: 4.3,
          type: "car_repair",
          position: { lat: Number.parseFloat(lat) - 0.001, lng: Number.parseFloat(lon) - 0.003 },
          distance: "1.5 km",
          motorcycle_friendly: true,
        },
      ],
    }

    return NextResponse.json(mockPlaces)
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
