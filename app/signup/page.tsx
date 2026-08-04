'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PasswordInput from '@/components/PasswordInput'
import { supabase } from '@/lib/supabase/client'
import { AFRICAN_AND_GLOBAL_COUNTRIES } from '@/lib/countries'
import { UserCheck, Building2 } from 'lucide-react'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [country, setCountry] = useState('Ghana')
  const [role, setRole] = useState<'job_seeker' | 'employer'>('job_seeker')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    // 1. Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone_number: phoneNumber,
          country,
        },
      },
    })

    if (authError) {
      setErrorMsg(authError.message)
      setLoading(false)
      return
    }

    // 2. Create/update profile row in database
    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: fullName,
        role,
        phone_number: phoneNumber,
      } as any)

      window.location.href = '/'
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Navbar />

      <div className="max-w-xl mx-auto pt-10 px-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-10 shadow-2xl">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Create Your Account</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Join AfricanRemoteJob to find global remote positions or hire African talents.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                I am joining as a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('job_seeker')}
                  className={`p-3.5 rounded-xl border text-center transition font-bold text-xs flex items-center justify-center gap-2 ${
                    role === 'job_seeker'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/50'
                      : 'border-slate-800 text-slate-400 bg-slate-950 hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" /> Candidate (Job Seeker)
                </button>

                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`p-3.5 rounded-xl border text-center transition font-bold text-xs flex items-center justify-center gap-2 ${
                    role === 'employer'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/50'
                      : 'border-slate-800 text-slate-400 bg-slate-950 hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Employer (Recruiter)
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kwame Mensah"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kwame@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Country Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Country / Location *
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-medium focus:border-amber-500"
              >
                {AFRICAN_AND_GLOBAL_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Password with Eye Toggle */}
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Account Password"
              placeholder="Min 6 characters"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-sm transition shadow-lg mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}