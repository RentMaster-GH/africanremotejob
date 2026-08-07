'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Mail,
  User,
  Sparkles
} from 'lucide-react'

export default function CustomerSupportPage() {
  const router = useRouter()
  
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [category, setCategory] = useState('General Inquiry')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserEmail(user.email || '')
      setUserName(user.user_metadata?.full_name || '')
    }
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error: insertError } = await supabase
        .from('support_tickets')
        .insert([
          {
            user_id: user?.id || null,
            user_email: userEmail.trim(),
            user_name: userName.trim(),
            category,
            subject: subject.trim(),
            message: message.trim(),
            status: 'open',
          },
        ])

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to submit support ticket.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>24/7 Dedicated Help Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Customer Support Service</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium max-w-lg mx-auto">
            Need help with MoMo payouts, identity verification, or account settings? Our team is here to assist.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-base">Support Ticket Created!</p>
              <p className="text-slate-300">The App Manager will review your inquiry shortly. Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-5">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl p-4 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="userName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Kwame Mensah"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>

                <div>
                  <label htmlFor="userEmail" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="userEmail"
                    name="userEmail"
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Inquiry Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="KYC & Identity Verification">KYC & Identity Verification</option>
                  <option value="MoMo & USD Payout Issue">MoMo & USD Payout Issue</option>
                  <option value="Technical Bug">Technical Bug</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  placeholder="e.g. Issue updating MoMo payout account"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Message Details *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Describe how we can assist you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl p-4 outline-none font-medium transition leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-4 rounded-xl transition shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting Ticket...' : <>Send Ticket to Manager <Send className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  )
}