// app/shared-access/accept/page.tsx
"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

function AcceptContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')
  const [sharedDetails, setSharedDetails] = useState<{
    fromName: string
    fromEmail: string
    accessLevel: string
  } | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('No invitation token found in the URL')
      return
    }

    validateInvitationToken(token)
  }, [searchParams])

 const validateInvitationToken = async (token: string) => {
  try {
    const response = await fetch(`/api/shared/accept?token=${token}`)
    const data = await response.json()

    if (response.ok) {
      setStatus('success')
      setMessage(data.message)
      setSharedDetails(data.sharedDetails)
      
      // Check if user is logged in and accept invitation
      const userToken = localStorage.getItem('healthwallet-token')
      if (userToken) {
        // ✅ Automatically accept invitation if logged in
        try {
          const acceptResponse = await fetch('/api/shared/accept', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
          })
          
          const acceptData = await acceptResponse.json()
          
          if (acceptResponse.ok && acceptData.activated) {
            // Redirect immediately if activated
            setTimeout(() => {
              router.push('/shared')
            }, 1500)
          } else if (acceptResponse.ok) {
            // Show success but require login/email match
            setMessage('Invitation is valid. Please login with the email that received this invitation.')
          }
        } catch (acceptError) {
          console.error('Error accepting invitation:', acceptError)
        }
      }
    } else {
      setStatus('error')
      setMessage(data.error || 'Invalid invitation link')
    }
  } catch (error) {
    setStatus('error')
    setMessage('Failed to validate invitation. Please try again.')
    console.error('Error validating token:', error)
  }
}

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Shared Access Invitation</CardTitle>
        <CardDescription>
          Accept invitation to view shared health records
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600">Validating your invitation...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Invitation Valid!</h3>
              <p className="text-gray-600">{message}</p>
              
              {sharedDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-blue-900">Invitation Details:</p>
                  <p className="text-sm text-blue-700 mt-1">
                    From: <span className="font-medium">{sharedDetails.fromName}</span> ({sharedDetails.fromEmail})
                  </p>
                  <p className="text-sm text-blue-700">
                    Access Level: <span className="font-medium">{sharedDetails.accessLevel}</span>
                  </p>
                </div>
              )}
              
              <div className="space-y-2 pt-4">
                <p className="text-sm text-gray-500">
                  Please login or register to view the shared reports
                </p>
                <div className="flex gap-2 justify-center">
                  <Button asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="rounded-full bg-red-100 p-3 w-16 h-16 mx-auto">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-red-600">Invalid Invitation</h3>
              <p className="text-gray-600">{message}</p>
              <Button asChild className="mt-4">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function SharedAccessAcceptPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Shared Access Invitation</CardTitle>
            <CardDescription>
              Accept invitation to view shared health records
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600">Loading invitation...</p>
          </CardContent>
        </Card>
      }>
        <AcceptContent />
      </Suspense>
    </div>
  )
}