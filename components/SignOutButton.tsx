'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { backend } from '@/lib/backend'
import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  className?: string
  redirectTo?: string
}

export default function SignOutButton({
  className = 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer',
  redirectTo = '/login',
}: SignOutButtonProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await backend.logout()
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      router.push(redirectTo)
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className={className}
    >
      <LogOut className="w-3.5 h-3.5 text-rose-400" />
      <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
    </button>
  )
}
