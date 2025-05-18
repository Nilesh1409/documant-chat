"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="rounded-full bg-red-100 p-6 mb-6">
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
