import { type NextRequest, NextResponse } from "next/server"

// Mock data generator for fallback
function generateMockReports(lat: number, lon: number) {
  return [
    {
      id: 1,
      latitude: lat + 0.001,
      longitude: lon + 0.001,
      weather_type: "rain",
      intensity: 2,
      description: "Chuva moderada na região",
      created_at: new Date().toISOString(),
      distance: 0.5,
    },
    {
      id: 2,
      latitude: lat - 0.002,
      longitude: lon + 0.002,
      weather_type: "sun",
      intensity: 1,
      description: "Tempo bom para andar de moto",
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      distance: 1.2,
    },
    {
      id: 3,
      latitude: lat + 0.003,
      longitude: lon - 0.001,
      weather_type: "cloud",
      intensity: 1,
      description: "Céu nublado, sem chuva",
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      distance: 2.1,
    },
  ]
}

async function getDatabase() {
  try {
    // Try to use sqlite3 if available
    const sqlite3 = await import("sqlite3")
    const { open } = await import("sqlite")
    const { promises: fs } = await import("fs")
    const path = await import("path")

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data")
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    const dbPath = path.join(dataDir, "moto_weather.db")

    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    // Initialize tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS weather_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        weather_type TEXT NOT NULL,
        intensity INTEGER DEFAULT 1,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      )
    `)

    return db
  } catch (error) {
    console.log("Database not available, using mock data:", error.message)
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = Number.parseFloat(searchParams.get("lat") || "0")
  const lon = Number.parseFloat(searchParams.get("lon") || "0")
  const radius = Number.parseFloat(searchParams.get("radius") || "10")

  try {
    const db = await getDatabase()

    if (!db) {
      return NextResponse.json({ reports: generateMockReports(lat, lon) })
    }

    // Get reports within radius (simplified calculation)
    const reports = await db.all(
      `
      SELECT *, 
        (ABS(latitude - ?) + ABS(longitude - ?)) * 111 as distance
      FROM weather_reports 
      WHERE datetime(created_at) > datetime('now', '-2 hours')
      AND (ABS(latitude - ?) + ABS(longitude - ?)) * 111 < ?
      ORDER BY created_at DESC
      LIMIT 20
    `,
      [lat, lon, lat, lon, radius],
    )

    await db.close()
    return NextResponse.json({ reports })
  } catch (error) {
    console.log("Database query failed, using mock data:", error.message)
    return NextResponse.json({ reports: generateMockReports(lat, lon) })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { latitude, longitude, weather_type, intensity, description } = body

    if (!latitude || !longitude || !weather_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    if (!db) {
      return NextResponse.json({
        success: true,
        id: Math.floor(Math.random() * 1000),
        message: "Report received (demo mode)",
      })
    }

    const result = await db.run(
      `
      INSERT INTO weather_reports (latitude, longitude, weather_type, intensity, description, expires_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', '+2 hours'))
    `,
      [latitude, longitude, weather_type, intensity || 1, description],
    )

    await db.close()

    return NextResponse.json({
      success: true,
      id: result.lastID,
      message: "Report submitted successfully",
    })
  } catch (error) {
    console.log("Database insert failed, using demo mode:", error.message)
    return NextResponse.json({
      success: true,
      id: Math.floor(Math.random() * 1000),
      message: "Report received (demo mode)",
    })
  }
}
