import { type NextRequest, NextResponse } from "next/server"
import { Database } from "sqlite3"
import { promisify } from "util"
import * as jwt from "jsonwebtoken"
import * as path from "path"

const JWT_SECRET = process.env.JWT_SECRET || "moto-clima-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const dbPath = path.join(process.cwd(), "data", "moto_weather.db")
    const db = new Database(dbPath)

    const dbGet = promisify(db.get.bind(db))
    const dbClose = promisify(db.close.bind(db))

    try {
      const user = (await dbGet("SELECT id, name, email, phone, created_at FROM users WHERE id = ?", [
        decoded.userId,
      ])) as any

      await dbClose()

      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        user,
      })
    } catch (dbError) {
      await dbClose()
      throw dbError
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
  }
}
