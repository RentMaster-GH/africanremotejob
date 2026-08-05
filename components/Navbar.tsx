'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Briefcase, PlusCircle, LogOut, User as UserIcon } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsDropdownOpen(false)
    window.location.href = '/'
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl shadow-md">
              ARJ
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block leading-none">
                African<span className="text-amber-500">RemoteJob</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                🌍 Remote Opportunities for Global & African Talent
              </span>
            </div>
          </Link>

          {/* Navigation Links & Auth State */}
          <div className="flex items-center space-x-4 text-sm font-medium">
            <Link href="/" className="hidden md:flex text-slate-300 hover:text-white transition items-center gap-1.5 mr-2">
              <Briefcase className="w-4 h-4 text-amber-500" />
              Browse Remote Jobs
            </Link>

            <Link href="/post-job" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm text-xs sm:text-sm">
              <PlusCircle className="w-4 h-4" />
              Post a Remote Job
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 focus:outline-none p-1 rounded-full hover:bg-slate-800 transition border border-slate-800"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        {initials}
                      </div>
                    </button>

                    {isDropdownOpen && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl bg-slate-900 border border-slate-800 py-2 z-50"
                        onMouseLeave={() => setIsDropdownOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-slate-800">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Signed in as</p>
                          <p className="text-xs font-semibold text-white truncate mt-0.5">{user.email}</p>
                        </div>

                        <button
                          onClick={handleSignOut}
                          className="w-full text-left block px-4 py-2 text-xs font-bold text-red-400 hover:bg-slate-800 transition flex items-center gap-2 mt-1"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/login" className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition">
                      Sign In
                    </Link>
                    <Link href="/signup" className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl transition">
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}