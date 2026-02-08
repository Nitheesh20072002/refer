'use client'

import { useAuthStore } from '@/lib/store'
import Link from 'next/link'

export default function Home() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Unlock Referrals. Get Hired Faster.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with employees from top IT companies who can refer you. <br />
            Get 5-10x more interview chances with referrals.
          </p>

          {!user ? (
            <div className="flex justify-center gap-4">
              <Link
                href="/auth/signup?role=job_seeker"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                I'm Looking for a Job
              </Link>
              <Link
                href="/auth/signup?role=referrer"
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                I Want to Refer
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-lg text-gray-700 mb-6">Welcome, {user.first_name}!</p>
              {user.role === 'job_seeker' && (
                <Link
                  href="/job-seeker/create-request"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Create a Referral Request
                </Link>
              )}
              {user.role === 'referrer' && (
                <Link
                  href="/referrer/available"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  View Available Requests
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit Request</h3>
              <p className="text-gray-600">
                Job seekers submit referral requests for their dream companies
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Referred</h3>
              <p className="text-gray-600">
                Employees from those companies refer candidates they trust
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
              <p className="text-gray-600">
                Referrers earn reward points for every confirmed referral
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
