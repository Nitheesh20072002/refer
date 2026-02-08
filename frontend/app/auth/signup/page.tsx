'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'

interface SignupForm {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'job_seeker' | 'referrer'
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signup, isLoading, error } = useAuthStore()
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<SignupForm>({
    defaultValues: {
      role: (searchParams.get('role') as 'job_seeker' | 'referrer') || 'job_seeker',
    },
  })

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'job_seeker' || roleParam === 'referrer') {
      setValue('role', roleParam)
    }
  }, [searchParams, setValue])

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup(data)
      router.push('/auth/verify-email')
    } catch (err) {
      // Error is handled by store
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a...
            </label>
            <select
              {...register('role')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
            >
              <option value="job_seeker">Job Seeker (Looking for referrals)</option>
              <option value="referrer">Employee (Want to refer)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                {...register('first_name', { required: 'First name is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
                placeholder="John"
              />
              {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...register('last_name', { required: 'Last name is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
                placeholder="Doe"
              />
              {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
