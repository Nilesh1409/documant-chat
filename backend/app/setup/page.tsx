"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const setupDatabase = async () => {
    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/setup-db")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(data.message || "An error occurred during database setup")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to connect to the setup API")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabase = async () => {
    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(`Database connection successful. User count: ${data.data.userCount}`)
      } else {
        setStatus("error")
        setMessage(data.message || "Database test failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to connect to the test API")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Set up and test your document management system database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            This utility will help you set up your PostgreSQL database for the document management application. Make
            sure your database connection string is properly configured in your environment variables.
          </p>

          {status !== "idle" && (
            <Alert variant={status === "success" ? "default" : "destructive"}>
              {status === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{status === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={setupDatabase} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Setup Database"
            )}
          </Button>
          <Button className="w-full" variant="outline" onClick={testDatabase} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
