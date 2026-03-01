"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In a real app, you would validate credentials with your backend
    // For now, we'll create a mock user
    const mockUser: User = {
      id: '1',
      email,
      firstName: email.split('@')[0],
      lastName: 'User',
      role: 'job_seeker',
    }

    setUser(mockUser)
    localStorage.setItem('user', JSON.stringify(mockUser))
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  const signup = async (data: SignupData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In a real app, you would send this to your backend
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      company: data.company,
    }

    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  const logout = () => {
    setUser(null)
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
