'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles 
} from 'lucide-react'

function ReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const reportedItemId = searchParams.get('item') || ''
  const reportedItemTitle = searchParams.get('title') || 'Listing / User'

  const [reporterEmail, setReporterEmail] = useState('')
  const [reason, setReason] = useState('Scam or Fraud')
  const [details, setDetails] = useState('')
  
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserEmail()
  }, [])

  const loadUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      setReporterEmail(user.email)
    }
  }

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error: insertError } = await supabase
        .from('user_reports')
        .insert([
          {
            reporter_id: user?.id || null,
            reporter_email: reporterEmail.trim(),
            reported_item_id: reportedItemId,
            reported_item_title: reportedItemTitle,
            reason,
            details: details.trim(),
            status: 'pending',
          },
        ])

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.back()
      }, 2000)
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to submit report.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-rose-500/30 text-rose-400 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg mb-4 backdrop-blur-md">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Community Protection System</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Report Misconduct or Scam</h1>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Reporting: <strong className="text-amber-400 font-bold">{reportedItemTitle}</strong>
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl p-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-base">Report Submitted to App Manager!</p>
            <p className="text-slate-300">Thank you for keeping African Remote Jobs safe. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl p-4 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="reporterEmail" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Your Email Address *
              </label>
              <input
                id="reporterEmail"
                name="reporterEmail"
                type="email"
                required
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Reason for Reporting *
              </label>
              <select
                id="reason"
                name="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer"
              >
                <option value="Scam or Fraud">Scam or Fraudulent Offer</option>
                <option value="Fake or Misleading Listing">Fake or Misleading Listing</option>
                <option value="Non-Payment / Salary Default">Non-Payment / Salary Default</option>
                <option value="Unresponsive / Abusive Behavior">Unresponsive / Abusive Behavior</option>
                <option value="Other Misconduct">Other Misconduct</option>
              </select>
            </div>

            <div>
              <label htmlFor="details" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Provide Specific Details *
              </label>
              <textarea
                id="details"
                name="details"
                rows={5}
                required
                placeholder="Describe what happened or why this listing/user violates community standards..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl p-4 outline-none font-medium transition leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-sm py-4 rounded-xl transition shadow-xl shadow-rose-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting Report...' : <>Submit Report to App Manager <Send className="w-4 h-4" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>
        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>
      </nav>
      <Suspense fallback={<div className="text-center py-20 text-slate-500 text-xs">Loading report form...</div>}>
        <ReportForm />
      </Suspense>
    </div>
  )
}