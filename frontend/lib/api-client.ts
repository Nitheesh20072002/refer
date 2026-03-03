
// API client for backend communication

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface ApiError {
  error: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'An error occurred',
      }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async signup(data: {
    email: string
    password: string
    first_name: string
    last_name: string
    role: string
    company_id?: number
  }) {
    return this.request<{
      message: string
      user: {
        id: number
        email: string
        first_name: string
        last_name: string
        role: string
        company_id?: number
      }
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(email: string, password: string) {
    return this.request<{
      token: string
      user: {
        id: number
        email: string
        first_name: string
        last_name: string
        role: string
        company_id?: number
      }
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async verifyEmail(token: string) {
    return this.request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  async resendVerification(email: string) {
    return this.request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  // User endpoints
  async getProfile() {
    return this.request<{
      id: number
      email: string
      first_name: string
      last_name: string
      role: string
      company_id?: number
    }>('/users/profile', {
      method: 'GET',
    })
  }

  async updateProfile(data: {
    first_name?: string
    last_name?: string
    company_id?: number
  }) {
    return this.request<{
      id: number
      email: string
      first_name: string
      last_name: string
      role: string
      company_id?: number
    }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getCompanies() {
    return this.request<
      Array<{
        id: number
        name: string
        domain: string
      }>
    >('/users/companies', {
      method: 'GET',
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_URL)
