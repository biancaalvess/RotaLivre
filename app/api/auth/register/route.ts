import { type NextRequest, NextResponse } from "next/server"
import { Database } from "sqlite3"
import { promisify } from "util"
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import * as path from "path"
import * as fs from "fs"

const JWT_SECRET = process.env.JWT_SECRET || "moto-clima-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ success: false, error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 })
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
      const existingUser = (await dbGet("SELECT id FROM users WHERE email = ?", [email])) as any

      if (existingUser) {
        await dbClose()
        return NextResponse.json({ success: false, error: "Email já está em uso" }, { status: 409 })
      }

      // Hash password
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)

      // Insert new user
      const result = (await dbRun(
        "INSERT INTO users (name, email, phone, password_hash, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
        [name, email, phone, passwordHash],
      )) as any

      // Generate JWT token
      const token = jwt.sign({ userId: result.lastID, email }, JWT_SECRET, { expiresIn: "7d" })

      await dbClose()

      // Return user data (without password)
      const userData = {
        id: result.lastID,
        name,
        email,
        phone,
        created_at: new Date().toISOString(),
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
    console.error("Register error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
