import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execPromise = promisify(exec)

export async function POST() {
  try {
    // Run the seed script
    const { stdout, stderr } = await execPromise("npx tsx scripts/seed.ts")

    if (stderr) {
      console.error("Seed script error:", stderr)
      return NextResponse.json({ success: false, message: "Database seeding failed", error: stderr }, { status: 500 })
    }

    console.log("Seed script output:", stdout)

    return NextResponse.json({ success: true, message: "Database seeded successfully" }, { status: 200 })
  } catch (error) {
    console.error("Database seeding error:", error)
    return NextResponse.json(
      { success: false, message: "Database seeding failed", error: String(error) },
      { status: 500 },
    )
  }
}
