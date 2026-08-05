'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase/client'
import { Globe, DollarSign, Briefcase, Building2, Send, CheckCircle, ArrowLeft } from 'lucide-react'

interface JobDetail {
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
  views_count: number
  created_at: string
  companies?: {
    name: string
    logo_url: string | null
    website_url: string | null
    country: string
  }
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const jobId = resolvedParams.id

  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // Candidate Application Modal State
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [appliedSuccess, setSubmittedSuccess] = useState(false)

  useEffect(() => {
    fetchJobDetail()
  }, [jobId])

  const fetchJobDetail = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          name,
          logo_url,
          website_url,
          country
        )
      `)
      .eq('id', jobId)
      .single()

    if (!error && data) {
      setJob(data as unknown as JobDetail)

      // Increment views count
      await supabase
        .from('jobs')
        .update({ views_count: (data.views_count || 0) + 1 } as any)
        .eq('id', jobId)
    }
    setLoading(false)
  }

  const handleCandidateApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase.from('applications').insert({
      job_id: jobId,
      candidate_name: candidateName,
      candidate_email: candidateEmail,
      resume_url: resumeUrl,
      cover_letter: coverLetter,
      status: 'submitted',
    } as any)

    if (error) {
      alert('Failed to submit application: ' + error.message)
    } else {
      setSubmittedSuccess(true)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="text-center py-20 text-slate-500 text-sm">Loading job listing details...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="max-w-3xl mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold text-white">Job Listing Not Found</h1>
          <p className="text-slate-400 mt-2 text-sm">This remote position may have expired or been removed.</p>
          <Link href="/" className="mt-6 inline-block text-amber-400 font-bold text-sm hover:underline">
            ← Return to Job Board
          </Link>
        </div>
      </div>
    )
  }

  // Generate Google Schema.org/JobPosting JSON-LD for SEO Indexing
  const jobPostingSchema = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: job.companies?.name || 'Employer',
      value: job.id,
    },
    datePosted: job.created_at,
    validThrough: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
    employmentType: job.job_type === 'Full-time' ? 'FULL_TIME' : 'CONTRACTOR',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.companies?.name || 'Employer',
      sameAs: job.companies?.website_url || undefined,
      logo: job.companies?.logo_url || undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'Africa',
      },
    },
    jobLocationType: 'TELECOMMUTE',
    applicantLocationRequirements: {
      '@type': 'Country',
      name: job.location_restriction,
    },
    baseSalary: (job.salary_min || job.salary_max) ? {
      '@type': 'MonetaryAmount',
      currency: job.currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min || undefined,
        maxValue: job.salary_max || undefined,
        unitText: 'YEAR',
      },
    } : undefined,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Navbar />

      {/* Google SEO Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Back Link */}
        <Link href="/" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to All Remote Jobs
        </Link>

        {/* Job Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center font-bold text-amber-400 text-2xl shrink-0 overflow-hidden">
                {job.companies?.logo_url ? (
                  <img src={job.companies.logo_url} alt={job.companies.name} className="w-full h-full object-cover" />
                ) : (
                  job.companies?.name.charAt(0) || 'C'
                )}
              </div>
              <div>
                <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {job.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{job.title}</h1>
                <p className="text-sm font-semibold text-slate-400 mt-0.5">
                  {job.companies?.name} {job.companies?.country ? `• ${job.companies.country}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (job.application_url_or_email.startsWith('http')) {
                  window.open(job.application_url_or_email, '_blank')
                } else {
                  setShowApplyModal(true)
                }
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-6 py-3.5 rounded-xl transition shadow-lg w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Apply for Position
            </button>
          </div>

          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-800 text-xs">
            <div>
              <p className="text-slate-500 font-medium uppercase">Location Requirement</p>
              <p className="font-bold text-white mt-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-amber-500" /> {job.location_restriction}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-medium uppercase">Salary Compensation</p>
              <p className="font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {job.salary_min || job.salary_max
                  ? `${job.currency} ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}`
                  : 'Competitive'}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-medium uppercase">Job Commitment</p>
              <p className="font-bold text-white mt-1">{job.job_type}</p>
            </div>

            <div>
              <p className="text-slate-500 font-medium uppercase">Seniority Level</p>
              <p className="font-bold text-white mt-1">{job.experience_level}</p>
            </div>
          </div>

          {/* Job Description */}
          <div className="pt-6">
            <h3 className="text-base font-bold text-white mb-4">Job Description & Responsibilities</h3>
            <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
              {job.description}
            </p>
          </div>

        </div>

      </div>

      {/* Candidate Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            
            {appliedSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">Application Submitted!</h3>
                <p className="text-slate-400 text-xs mt-1 mb-6">Your resume and application details have been sent to {job.companies?.name}.</p>
                <button
                  onClick={() => {
                    setShowApplyModal(false)
                    setSubmittedSuccess(false)
                  }}
                  className="bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-700 transition"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-white">Apply for {job.title}</h3>
                  <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
                </div>

                <form onSubmit={handleCandidateApply} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Name *</label>
                    <input id="applicant-name" name="applicant-name" ... />
                      type="text"
                      required
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. Kwame Mensah"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address *</label>
                    <input id="applicant-email" name="applicant-email" ... />
                      type="email"
                      required
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="kwame@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">CV / Resume Link (Google Drive / LinkedIn / PDF URL) *</label>
                    <input id="applicant-resume" name="applicant-resume" ... />
                      type="url"
                      required
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/kwame or https://drive.google.com/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Short Cover Note (Optional)</label>
                    <textarea
                      rows={3}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly state why you are a great fit for this remote position..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3 rounded-xl transition shadow-md"
                  >
                    {submitting ? 'Submitting Application...' : 'Send Application Now'}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}