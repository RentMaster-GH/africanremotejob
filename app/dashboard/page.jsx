'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient' // adjust path to your supabase client
import { useRouter } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [router])

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-6">
        <h1 className="text-2xl font-bold text-gray-800">African Remote Jobs - Dashboard</h1>
        <SignOutButton />
      </header>

      <main className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Welcome back!</h2>
        <p className="text-gray-600">Logged in as: <span className="font-medium text-black">{user?.email}</span></p>
      </main>
    </div>
  )
}