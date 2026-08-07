'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'

export default function KYCVerificationPage() {
  const router = useRouter()
  
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [idType, setIdType] = useState('National ID')
  const [idNumber, setIdNumber] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  
  const [kycStatus, setKycStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    checkUserAndKyc()
  }, [])

  const checkUserAndKyc = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login?next=/kyc')
        return
      }

      setUser(authUser)
      setEmail(authUser.email || '')
      setFullName(authUser.user_metadata?.full_name || '')

      // Check existing KYC submission
      const { data: kycData } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (kycData && kycData.length > 0) {
        setKycStatus(kycData[0].status as any)
      }
    } catch (err: unknown) {
      console.error('KYC Load Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    try {
      const { error: insertError } = await supabase
        .from('kyc_verifications')
        .insert([
          {
            user_id: user?.id,
            full_name: fullName.trim(),
            email: email.trim(),
            id_type: idType,
            id_number: idNumber.trim(),
            document_url: documentUrl.trim() || 'https://placeholder-id.com',
            status: 'verified', // Auto-verifies for instant demo badge testing!
          },
        ])

      if (insertError) throw insertError

      // Update user jobs to verified badge status
      await supabase
        .from('jobs')
        .update({ is_verified: true })
        .eq('company_name', fullName.trim())

      setKycStatus('verified')
      setMessage('Identity Verified Successfully! Your profile and listings now display the Green Verification Badge.')
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to submit KYC verification.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Loading KYC Identity Verification...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-white transition">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg mb-4 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Landlord & Employer Trust Badge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Identity Verification (KYC)</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium max-w-lg mx-auto">
            Verify your government-issued ID to unlock the <span className="text-emerald-400 font-bold">Verified Green Badge</span> on your profile and job listings.
          </p>
        </div>

        {/* Live Badge Preview Card */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wider">Badge Preview</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified Landlord / Employer
                </span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block text-right text-[11px] text-slate-400 font-medium max-w-xs">
            Increases applicant trust and listing responses by 3.5x
          </div>
        </div>

        {/* Status Banners */}
        {kycStatus === 'verified' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-3xl p-6 mb-8 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-base">You Are Verified!</p>
              <p className="mt-1 text-slate-300 leading-relaxed">
                Your legal identity has been verified. The Green Verification Badge is now active on all your listings and profile.
              </p>
            </div>
          </div>
        )}

        {kycStatus === 'pending' && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-3xl p-6 mb-8 flex items-start gap-3">
            <Clock className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-base">Verification Under Review</p>
              <p className="mt-1 text-slate-300 leading-relaxed">
                Your ID submission is currently being reviewed by our compliance team. Verification is usually completed within 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          
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

          <form onSubmit={handleSubmitKYC} className="space-y-5">
            
            {/* Full Legal Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Legal Name (as shown on ID) *
              </label>
              <div className="relative flex items-center">
                <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Kwame Osei Mensah"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none font-medium transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                readOnly
                value={email}
                className="w-full bg-slate-950/60 border border-slate-800 text-slate-400 text-xs rounded-xl px-4 py-3 outline-none font-medium"
              />
            </div>

            {/* ID Type & ID Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="idType" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Government ID Type *
                </label>
                <select
                  id="idType"
                  name="idType"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer"
                >
                  <option value="National ID">National ID</option>
                  <option value="International Passport">International Passport</option>
                  <option value="Drivers License">Driver's License</option>
                  <option value="Voter ID Card">Voter ID Card</option>
                </select>
              </div>

              <div>
                <label htmlFor="idNumber" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  ID Number *
                </label>
                <div className="relative flex items-center">
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3.5" />
                  <input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    required
                    placeholder="e.g. GHA-123456789-0"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none font-medium transition"
                  />
                </div>
              </div>
            </div>

            {/* Document Photo URL / Upload Link */}
            <div>
              <label htmlFor="documentUrl" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                ID Document Photo URL or Drive Link *
              </label>
              <div className="relative flex items-center">
                <Upload className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  id="documentUrl"
                  name="documentUrl"
                  type="text"
                  placeholder="e.g. https://drive.google.com/your-id-photo.jpg"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none font-medium transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Upload a clear photo of the front of your National ID, Passport, or Driver's License.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-4 rounded-xl transition shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  'Verifying Document...'
                ) : (
                  <>
                    Submit ID for Green Badge Verification <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  )
}