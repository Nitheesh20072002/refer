'use client'

import React from 'react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email. Please click the link to verify your account.
        </p>
        <p className="text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or{' '}
          <button className="text-blue-600 hover:underline font-semibold">
            resend verification link
          </button>
        </p>
      </div>
    </div>
  )
}
