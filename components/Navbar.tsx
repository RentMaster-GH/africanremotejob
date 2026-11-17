'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { backend } from '@/lib/backend'
import { Crown, PlusCircle, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkUserAndAdminRole()
  }, [])

  const checkUserAndAdminRole = async () => {
    try {
      const currentUser = await backend.getMe()
      setUser(currentUser)

      if (currentUser?.role === 'admin' || currentUser?.custom_claims?.role === 'admin') {
        setIsAdmin(true)
      }
    } catch {
      setUser(null)
      setIsAdmin(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await backend.logout()
    } catch {
      // Ignore logout network errors
    } finally {
      setUser(null)
      setIsAdmin(false)
      router.push('/')
      router.refresh()
    }
  }

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-3.5 px-4 sm:px-8 flex items-center justify-between">
      <Link href="/" className="font-black text-lg text-white tracking-tight flex items-center gap-2">
        <span className="bg-amber-500 text-slate-950 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black">A</span>
        <span>African Remote Jobs</span>
      </Link>

      <div className="flex items-center gap-3 sm:gap-4">
        {isAdmin && (
          <Link
            href="/admin"
            className="bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin Portal</span>
          </Link>
        )}

        <Link
          href="/post-job"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/10"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Post a Job</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs font-bold text-slate-400 hover:text-rose-400 px-2 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
