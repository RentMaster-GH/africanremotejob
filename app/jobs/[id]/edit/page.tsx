'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  Briefcase, 
  Building2, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ArrowLeft
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditJobPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const jobId = resolvedParams?.id
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [category, setCategory] = useState('Software Engineering')
  const [jobType, setJobType] = useState('Full-time')
  const [experienceLevel, setExperienceLevel] = useState('Mid-level')
  const [locationRestriction, setLocationRestriction] = useState('Africa (GMT / WAT)')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [applicationUrlOrEmail, setApplicationUrlOrEmail] = useState('')
  const [description, setDescription] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)

  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (jobId) {
      fetchJobToEdit(jobId)
    }
  }, [jobId])

  const fetchJobToEdit = async (idToFetch: string) => {
    try {
      setFetching(true)
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', idToFetch)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setTitle(data.title || '')
        setCompanyName(data.company_name || '')
        setCategory(data.category || 'Software Engineering')
        setJobType(data.job_type || 'Full-time')
        setExperienceLevel(data.experience_level || 'Mid-level')
        setLocationRestriction(data.location_restriction || 'Africa (GMT / WAT)')
        setSalaryMin(data.salary_min ? String(data.salary_min) : '')
        setSalaryMax(data.salary_max ? String(data.salary_max) : '')
        setApplicationUrlOrEmail(data.application_url_or_email || '')
        setDescription(data.description || '')
        setIsFeatured(data.is_featured || false)
      }
    } catch (err: unknown) {
      console.error('Fetch Job Error:', err)
      setError('Failed to load job details for editing.')
    } finally {
      setFetching(false)
    }
  }

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          title: title.trim(),
          company_name: companyName.trim(),
          category,
          job_type: jobType,
          experience_level: experienceLevel,
          location_restriction: locationRestriction,
          salary_min: salaryMin ? Number(salaryMin) : null,
          salary_max: salaryMax ? Number(salaryMax) : null,
          application_url_or_email: applicationUrlOrEmail.trim(),
          description: description.trim(),
          is_featured: isFeatured,
        })
        .eq('id', jobId)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to update job listing.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Loading Job Details...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Nav */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Edit Job Listing</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            Update details for <span className="text-amber-400 font-bold">{title || 'this listing'}</span>
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl p-4 mb-8 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">Job Updated Successfully!</p>
                <p className="mt-0.5 text-emerald-300/80">Redirecting to your dashboard...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">Error Updating Job</p>
                <p className="mt-0.5 text-rose-300/80">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdateJob} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Company Name *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                />
              </div>

              <div>
                <label htmlFor="jobTitle" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Job Title *
                </label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Design & Creative">Design & Creative</option>
                  <option value="Virtual Assistance">Virtual Assistance</option>
                  <option value="Product & Marketing">Product & Marketing</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>

              <div>
                <label htmlFor="jobType" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Job Type *
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label htmlFor="experienceLevel" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Experience Level *
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer"
                >
                  <option value="Entry-level">Entry-level</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="locationRestriction" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Location / Timezone *
                </label>
                <select
                  id="locationRestriction"
                  name="locationRestriction"
                  value={locationRestriction}
                  onChange={(e) => setLocationRestriction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer"
                >
                  <option value="Africa (GMT / WAT)">Africa (GMT / WAT Overlap)</option>
                  <option value="Worldwide">Worldwide Remote</option>
                  <option value="West Africa Only">West Africa Only</option>
                  <option value="East Africa Only">East Africa Only</option>
                </select>
              </div>

              <div>
                <label htmlFor="salaryMin" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Min Salary (USD / yr)
                </label>
                <input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                />
              </div>

              <div>
                <label htmlFor="salaryMax" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Max Salary (USD / yr)
                </label>
                <input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="applicationUrlOrEmail" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Application URL or Email Address *
              </label>
              <input
                id="applicationUrlOrEmail"
                name="applicationUrlOrEmail"
                type="text"
                required
                value={applicationUrlOrEmail}
                onChange={(e) => setApplicationUrlOrEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl p-4 outline-none font-medium transition leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-amber-500/50 transition">
                <input
                  id="isFeatured"
                  name="isFeatured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Feature this listing on top of the job feed
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold px-6 py-4 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || success}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-8 py-4 rounded-xl transition shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  'Saving Changes...'
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save & Update Listing
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