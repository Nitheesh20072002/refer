'use client'

import { useAuthStore } from '@/lib/store'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode
  requiredRole?: string
}) {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    } else if (requiredRole && user.role !== requiredRole) {
      router.push('/')
    }
  }, [user, requiredRole, router])

  if (!user) return <div>Loading...</div>
  if (requiredRole && user.role !== requiredRole) return <div>Unauthorized</div>

  return <>{children}</>
}
