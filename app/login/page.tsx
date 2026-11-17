'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { backend } from '@/lib/backend'
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Building2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'

export default function AuthPage({ initialIsSignUp = false }: { initialIsSignUp?: boolean }) {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp)
  const [role, setRole] = useState<'job_seeker' | 'employer'>('job_seeker')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.')
      return
    }

    setLoading(true)

    try {
      if (isSignUp) {
        await backend.register(email.trim(), password, 'user', {
          full_name: fullName.trim(),
          user_role: role,
        })

        setMessage('Account created successfully! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1000)
      } else {
        await backend.login(email.trim(), password)

        setMessage('Signed in successfully! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 800)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during authentication.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>
        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition">
          ← Back to Job Board
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isSignUp ? 'Join African Remote Talent' : 'Welcome Back'}</span>
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {isSignUp
                ? 'Connect with vetted global employers paying in USD & MoMo'
                : 'Manage job applications, saved roles, and listings'}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(null); setMessage(null) }}
                className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  !isSignUp ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(null); setMessage(null) }}
                className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  isSignUp ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl p-4 mb-6 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl p-4 mb-6 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    I am a:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('job_seeker')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                        role === 'job_seeker'
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Job Seeker</p>
                        <p className="text-[10px] text-slate-500">Find remote jobs</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('employer')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                        role === 'employer'
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Employer</p>
                        <p className="text-[10px] text-slate-500">Post remote roles</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {isSignUp && (
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required={isSignUp}
                      placeholder="e.g. Kwame Mensah"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none font-medium transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none font-medium transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  {!isSignUp && (
                    <Link href="/forgot-password" className="text-[11px] font-bold text-amber-400 hover:underline">
                      Forgot?
                    </Link>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl pl-10 pr-10 py-3 outline-none font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required={isSignUp}
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl pl-10 pr-10 py-3 outline-none font-medium transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 rounded-xl transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    {isSignUp ? 'Create Free Account' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-slate-500 text-[11px] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protected by Custom EdDSA JWT SSL Encryption</span>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-medium">
        © {new Date().getFullYear()} African Remote Jobs. Connecting African talent with global opportunities.
      </footer>
    </div>
  )
}
