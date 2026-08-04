'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient' // adjust path to your supabase client
import { useRouter } from 'next/navigation'

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    // 1. Password Match Validation
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please try again.')
      return
    }

    // 2. Minimum Password Length Check
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    // 3. Supabase Sign Up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('Sign-up successful! Please check your email to confirm your account.')
    }
  }

  return (
    <form onSubmit={handleSignUp} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Create an Account</h2>

      {errorMsg && <div className="p-3 bg-red-100 text-red-700 text-sm rounded">{errorMsg}</div>}
      {successMsg && <div className="p-3 bg-green-100 text-green-700 text-sm rounded">{successMsg}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
          placeholder="••••••••"
        />
      </div>

      {/* CONFIRM PASSWORD FIELD */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 rounded transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
    </form>
  )
}