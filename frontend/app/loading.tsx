import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
