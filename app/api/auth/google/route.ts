import { type NextRequest, NextResponse } from "next/server"
import { Database } from "sqlite3"
import { promisify } from "util"
import * as jwt from "jsonwebtoken"
import * as path from "path"
import * as fs from "fs"

const JWT_SECRET = process.env.JWT_SECRET || "moto-clima-secret-key"

export async function POST(request: NextRequest) {
  try {
    // Simulate Google OAuth response
    // In a real implementation, you would verify the Google token here
    const mockGoogleUser = {
      id: "google_" + Date.now(),
      name: "Usuário Google",
      email: "usuario@gmail.com",
      picture: "https://via.placeholder.com/100",
    }

    // Ensure database directory exists
    const dbDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    const dbPath = path.join(dbDir, "moto_weather.db")
    const db = new Database(dbPath)

    // Promisify database methods
    const dbGet = promisify(db.get.bind(db))
    const dbRun = promisify(db.run.bind(db))
    const dbClose = promisify(db.close.bind(db))

    try {
      // Check if user already exists
      let user = (await dbGet("SELECT * FROM users WHERE email = ?", [mockGoogleUser.email])) as any

      if (!user) {
        // Create new user from Google data
        const result = (await dbRun(
          "INSERT INTO users (name, email, google_id, created_at) VALUES (?, ?, ?, datetime('now'))",
          [mockGoogleUser.name, mockGoogleUser.email, mockGoogleUser.id],
        )) as any

        user = {
          id: result.lastID,
          name: mockGoogleUser.name,
          email: mockGoogleUser.email,
          google_id: mockGoogleUser.id,
          created_at: new Date().toISOString(),
        }
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

      await dbClose()

      // Return user data
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
      }

      const response = NextResponse.json({
        success: true,
        user: userData,
        token,
      })

      // Set HTTP-only cookie
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return response
    } catch (dbError) {
      await dbClose()
      throw dbError
    }
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.json({ success: false, error: "Erro na autenticação com Google" }, { status: 500 })
  }
}
