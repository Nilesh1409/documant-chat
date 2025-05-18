"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const seedDatabase = async () => {
    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(data.message || "An error occurred during database seeding")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to connect to the seed API")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Seeding</CardTitle>
          <CardDescription>Populate your database with sample data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            This utility will populate your database with sample users, documents, and permissions for testing purposes.
          </p>

          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Warning</AlertTitle>
            <AlertDescription className="text-amber-700">
              This will delete all existing data in your database and replace it with sample data. Do not use in
              production environments.
            </AlertDescription>
          </Alert>

          {status !== "idle" && (
            <Alert variant={status === "success" ? "default" : "destructive"}>
              {status === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{status === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={seedDatabase} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Database...
              </>
            ) : (
              "Seed Database"
            )}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
