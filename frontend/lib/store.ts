import { create } from 'zustand'

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'job_seeker' | 'referrer' | 'admin'
  is_verified: boolean
  company_id?: number
  reward_points?: number
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (email: string, password: string) => Promise<void>
  signup: (data: any) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    set({ token })
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error('Login failed')

      const data = await response.json()
      set({
        token: data.token,
        user: data.user,
        isLoading: false,
      })
      localStorage.setItem('token', data.token)
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  signup: async (formData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Signup failed')

      const data = await response.json()
      set({ isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Signup failed',
        isLoading: false,
      })
      throw error
    }
  },

  logout: () => {
    set({ user: null, token: null })
    localStorage.removeItem('token')
  },
}))
