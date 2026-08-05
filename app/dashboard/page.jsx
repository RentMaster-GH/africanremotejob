'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase/client'

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-16 px-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
          <div className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white">Dashboard</h1>
              <p className="text-slate-400 text-xs mt-1">
                Manage your profile and job applications
              </p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Sign Out
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">
                Account Email
              </span>
              <p className="text-sm font-semibold text-amber-400">{user?.email}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-1">
                Status
              </span>
              <p className="text-sm text-green-400 font-semibold">Active User</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}