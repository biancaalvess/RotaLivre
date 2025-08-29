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
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email e senha são obrigatórios" }, { status: 400 })
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
    const dbClose = promisify(db.close.bind(db))

    try {
      // Find user by email
      const user = (await dbGet("SELECT * FROM users WHERE email = ?", [email])) as any

      if (!user) {
        await dbClose()
        return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 401 })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)

      if (!isValidPassword) {
        await dbClose()
        return NextResponse.json({ success: false, error: "Senha incorreta" }, { status: 401 })
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

      await dbClose()

      // Return user data (without password)
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
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
