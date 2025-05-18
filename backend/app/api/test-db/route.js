import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import User from "@/models/User"

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase()

    // Test database connection with a simple query
    const userCount = await User.countDocuments()

    return NextResponse.json(
      {
        success: true,
        message: "MongoDB connection successful",
        data: { userCount },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({ success: false, message: "Database test failed", error: String(error) }, { status: 500 })
  }
}
