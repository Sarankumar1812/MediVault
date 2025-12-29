"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-linear-to-b from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full text-center space-y-8">

            {/* Illustration/Icon */}
            <div className="h-32 w-32 bg-linear-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="h-16 w-16 text-red-600" />
            </div>

            {/* Message */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Something went wrong
              </h1>

              <div className="space-y-3">
                <p className="text-lg text-gray-600">
                  An unexpected error occurred. Please try again.
                </p>
                <p className="text-sm text-gray-500">
                  Error: {error.message || "Unknown error"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 px-6 py-6 text-lg"
                size="lg"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </Button>

              <Button
                asChild
                variant="outline"
                className="border-2 px-6 py-6 text-lg hover:border-blue-600 hover:text-blue-600"
                size="lg"
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Go Home
                </Link>
              </Button>
            </div>

            {/* Debug Info (dev only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
                <p className="font-medium text-gray-700 mb-2">
                  Debug Information:
                </p>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {error.stack}
                </pre>
              </div>
            )}

          </div>
        </div>
      </body>
    </html>
  )
}
