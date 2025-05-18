import { NextResponse } from "next/server"
import { runMigrations, checkDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection()

    if (!isConnected) {
      return NextResponse.json({ success: false, message: "Database connection failed" }, { status: 500 })
    }

    // Run migrations
    await runMigrations()

    return NextResponse.json({ success: true, message: "Database setup completed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json(
      { success: false, message: "Database setup failed", error: String(error) },
      { status: 500 },
    )
  }
}
