'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  Briefcase, 
  Globe, 
  DollarSign, 
  Smartphone, 
  Calendar, 
  ArrowLeft, 
  Share2, 
  CheckCircle2, 
  Building2, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'

interface Job {
  id: string
  title: string
  category: string
  job_type: string
  experience_level: string
  location_restriction: string
  salary_min: number | null
  salary_max: number | null
  currency: string
  description: string
  application_url_or_email: string
  is_featured: boolean
  company_name?: string
  created_at: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function JobDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const jobId = resolvedParams?.id
  const router = useRouter()

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId)
    }
  }, [jobId])

  const fetchJobDetails = async (idToFetch: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', idToFetch)
        .single()

      if (!error && data) {
        setJob(data as unknown as Job)
      }
    } catch (err) {
      console.error('Failed to fetch job details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleApply = () => {
    if (!job?.application_url_or_email) return
    if (job.application_url_or_email.includes('@')) {
      window.location.href = `mailto:${job.application_url_or_email}?subject=Application for ${job.title}`
    } else {
      let targetUrl = job.application_url_or_email
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`
      }
      // Redirects to application URL in the same window
      window.location.href = targetUrl
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center text-slate-500 text-sm">
        Loading job details...
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <Briefcase className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white">Job not found</h2>
        <p className="text-slate-400 text-xs mt-1 mb-6">This listing may have expired or been removed.</p>
        <Link
          href="/"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition cursor-pointer"
        >
          Back to Job Board
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer">
            ← All Listings
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back Link & Share */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Listings
          </button>
          
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            {copied ? 'Link Copied!' : 'Share Role'}
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8 relative overflow-hidden">
          {job.is_featured && (
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-4 py-1 rounded-bl-2xl flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Featured Role
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center font-black text-amber-400 text-3xl shrink-0 overflow-hidden shadow-inner">
              {job.company_name?.charAt(0) || 'C'}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="bg-slate-950 text-slate-300 border border-slate-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {job.category}
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {job.company_name || 'Verified Employer'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {job.title}
              </h1>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Globe className="w-4 h-4 text-amber-500" />
                  {job.location_restriction}
                </span>

                {(job.salary_min || job.salary_max) && (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <DollarSign className="w-4 h-4" />
                    {job.currency} {job.salary_min?.toLocaleString()} {job.salary_max ? `- ${job.salary_max.toLocaleString()}` : ''} / yr
                  </span>
                )}

                <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
                  <Smartphone className="w-4 h-4 text-indigo-400" /> MoMo / Wire Eligible
                </span>

                <span className="bg-slate-800/80 text-slate-300 px-2.5 py-0.5 rounded-md font-medium">
                  {job.job_type}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA Bar inside header */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              Posted on {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
            </div>

            <button
              onClick={handleApply}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-8 py-4 rounded-xl transition shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              Apply for this Role <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Description */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" /> Job Description
              </h3>
              
              <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium space-y-4">
                {job.description}
              </div>
            </div>

            {/* Bottom Apply Box */}
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-black text-white">Ready to join {job.company_name || 'this team'}?</h4>
                <p className="text-xs text-slate-400 mt-1">Make sure your resume highlights your remote project history.</p>
              </div>

              <button
                onClick={handleApply}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-8 py-4 rounded-xl transition shadow-lg shrink-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                Apply Now <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Company Profile Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-500" /> About the Employer
              </h4>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center font-black text-amber-400 text-xl shrink-0 overflow-hidden">
                  {job.company_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">{job.company_name || 'Verified Employer'}</h5>
                  <p className="text-xs text-slate-400">Global Remote</p>
                </div>
              </div>
            </div>

            {/* Trust Badge Card */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs">Vetted Payout Protection</h5>
                  <p className="text-[11px] text-slate-400">Direct MoMo & USD payroll verified</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Employers on this platform are verified for reliable cross-border payments matching local African financial rails.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}