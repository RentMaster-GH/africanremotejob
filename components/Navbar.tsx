'use client'

import Link from 'next/link'
import { Briefcase, Globe, PlusCircle } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Tagline */}
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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="text-slate-300 hover:text-white transition flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-amber-500" />
              Browse Remote Jobs
            </Link>
            
            <Link href="/post-job" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              Post a Remote Job
            </Link>
          </div>

        </div>
      </div>
    </nav>
  )
}