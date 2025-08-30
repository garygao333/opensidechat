//root layout component

'use client'

import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/discover')
    } else {
      router.push('/login')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark-50 to-gray-800 flex items-center justify-center">
      <div className="text-white text-lg">Loading...</div>
    </div>
  )
}
