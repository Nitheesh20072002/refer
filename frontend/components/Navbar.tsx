import React from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'

export default function Navbar() {
  const { user, logout } = useAuthStore()

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              xyz
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            {user && user.role === 'job_seeker' && (
              <Link href="/job-seeker/requests" className="text-gray-700 hover:text-blue-600">
                My Requests
              </Link>
            )}
            {user && user.role === 'referrer' && (
              <Link href="/referrer/available" className="text-gray-700 hover:text-blue-600">
                Available Requests
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700 hidden sm:inline">
                  {user.first_name} {user.last_name}
                </span>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
