'use client'

import { useState } from 'react'
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
  Send
} from 'lucide-react'

export default function PostJobPage() {
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

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: insertError } = await supabase
        .from('jobs')
        .insert([
          {
            title: title.trim(),
            company_name: companyName.trim(),
            category,
            job_type: jobType,
            experience_level: experienceLevel,
            location_restriction: locationRestriction,
            salary_min: salaryMin ? Number(salaryMin) : null,
            salary_max: salaryMax ? Number(salaryMax) : null,
            currency: 'USD',
            application_url_or_email: applicationUrlOrEmail.trim(),
            description: description.trim(),
            is_featured: isFeatured,
          },
        ])

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1500)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish job listing.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>
        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition">
          ← Back to Listings
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Reach 50,000+ Vetted African Professionals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Post a Remote Job</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium max-w-lg mx-auto">
            Connect with top software developers, designers, virtual assistants, and marketers working in African timezones.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          {/* Success Banner */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl p-4 mb-8 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">Job Posted Successfully!</p>
                <p className="mt-0.5 text-emerald-300/80">Redirecting you to the homepage feed...</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">Error Submitting Job</p>
                <p className="mt-0.5 text-rose-300/80">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Company & Role Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Company & Role Details
              </h3>

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
                    placeholder="e.g. TechCorp Africa"
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
                    placeholder="e.g. Senior Full Stack Developer (React)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Category & Specifications */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Category & Specifications
              </h3>

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
            </div>

            {/* Section 3: Location & Salary */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" /> Location & Compensation
              </h3>

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
                    placeholder="30000"
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
                    placeholder="60000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Application URL or Email */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4" /> Application Link or Email
              </h3>

              <div>
                <label htmlFor="applicationUrlOrEmail" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Application URL or Email Address *
                </label>
                <input
                  id="applicationUrlOrEmail"
                  name="applicationUrlOrEmail"
                  type="text"
                  required
                  placeholder="e.g. https://forms.google.com/your-form OR hiring@company.com"
                  value={applicationUrlOrEmail}
                  onChange={(e) => setApplicationUrlOrEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Candidates will be sent directly to this URL or email when clicking "Apply for this role".
                </p>
              </div>
            </div>

            {/* Section 5: Description */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div>
                <label htmlFor="description" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  required
                  placeholder="Describe the role responsibilities, required tech stack, and benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl p-4 outline-none font-medium transition leading-relaxed"
                />
              </div>
            </div>

            {/* Section 6: Featured Sponsor Checkbox */}
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
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Highlighted with a gold badge and pinned for maximum applicant visibility.
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-4 rounded-xl transition shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  'Publishing Job...'
                ) : (
                  <>
                    Publish Remote Job Listing <Send className="w-4 h-4" />
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