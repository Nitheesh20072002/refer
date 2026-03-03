"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from './api-client'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'job_seeker' | 'referrer'
  company?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

interface SignupData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'job_seeker' | 'referrer'
  company?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage and validate token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        const token = apiClient.getToken()
        
        if (storedUser && token) {
          try {
            // Validate token by fetching profile
            const profile = await apiClient.getProfile()
            const validatedUser: User = {
              id: profile.id.toString(),
              email: profile.email,
              firstName: profile.first_name,
              lastName: profile.last_name,
              role: profile.role as 'job_seeker' | 'referrer',
            }
            setUser(validatedUser)
            localStorage.setItem('user', JSON.stringify(validatedUser))
          } catch (error) {
            // Token is invalid or expired - clear everything
            console.log('Token validation failed, clearing auth state')
            apiClient.setToken(null)
            localStorage.removeItem('user')
            setUser(null)
          }
        }
      } catch (error) {
        // Catch any localStorage errors (e.g., in private browsing mode)
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      
      // Store token
      apiClient.setToken(response.token)
      
      // Create user object
      const newUser: User = {
        id: response.user.id.toString(),
        email: response.user.email,
        firstName: response.user.first_name,
        lastName: response.user.last_name,
        role: response.user.role as 'job_seeker' | 'referrer',
      }

      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const signup = async (data: SignupData) => {
    try {
      const response = await apiClient.signup({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
      })

      // Show success message or redirect to verification page
      console.log('Signup successful:', response.message)
      
      // For now, redirect to login page
      // You might want to show a "Check your email" message instead
      router.push('/auth/login?message=Please check your email to verify your account')
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    apiClient.setToken(null)
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
