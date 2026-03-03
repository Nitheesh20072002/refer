"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, CheckCircle2, ArrowRight, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
      verifyEmail(tokenParam)
    } else {
      setError("Invalid or missing verification token")
      setIsLoading(false)
    }
  }, [searchParams])

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true)
    setError("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
      await fetch(`${apiUrl}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: verificationToken,
        }),
      }).then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to verify email")
        }
        return data
      })

      setIsSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    // This would require the user's email, which we don't have here
    // For now, just redirect to login
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">R</span>
                </div>
                <span className="text-2xl font-heading font-bold text-foreground">ReferLoop</span>
              </div>
            </Link>
          </div>

          {/* Loading Card */}
          <Card className="shadow-lg border-border">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-heading">Verifying your email...</CardTitle>
              <CardDescription>
                Please wait while we verify your email address
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">R</span>
                </div>
                <span className="text-2xl font-heading font-bold text-foreground">ReferLoop</span>
              </div>
            </Link>
          </div>

          {/* Success Card */}
          <Card className="shadow-lg border-border">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-heading">Email verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You can now log in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Redirecting to login in 3 seconds...
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/auth/login" className="w-full">
                <Button className="w-full" size="lg">
                  Continue to login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground underline underline-offset-4">
              Terms
            </Link>
            {" · "}
            <Link href="/privacy" className="hover:text-foreground underline underline-offset-4">
              Privacy
            </Link>
            {" · "}
            <Link href="/help" className="hover:text-foreground underline underline-offset-4">
              Help
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">R</span>
              </div>
              <span className="text-2xl font-heading font-bold text-foreground">ReferLoop</span>
            </div>
          </Link>
        </div>

        {/* Error Card */}
        <Card className="shadow-lg border-border">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-heading">Verification failed</CardTitle>
            <CardDescription>
              We couldn't verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                This could happen if:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>The verification link has expired (links expire after 24 hours)</li>
                <li>The link has already been used</li>
                <li>The link is invalid or incomplete</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full" size="lg">
                Go to login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/signup" className="w-full">
              <Button variant="outline" className="w-full">
                Create new account
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground underline underline-offset-4">
            Terms
          </Link>
          {" · "}
          <Link href="/privacy" className="hover:text-foreground underline underline-offset-4">
            Privacy
          </Link>
          {" · "}
          <Link href="/help" className="hover:text-foreground underline underline-offset-4">
            Help
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
