'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

export default function PostJobPage() {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('Remote (Africa)')
  const [salary, setSalary] = useState('')
  const [description, setDescription] = useState('')
  const [applyUrl, setApplyUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const router = useRouter()

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('jobs').insert([
      {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salary.trim(),
        description: description.trim(),
        apply_url: applyUrl.trim(),
        user_id: session.user.id,
      },
    ])

    if (error) {
      setErrorMsg('Failed to post job: ' + error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="mb-8">
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Employer Portal
            </span>
            <h1 className="text-2xl font-black text-white mt-3">Post a Remote Job</h1>
            <p className="text-slate-400 text-xs mt-1">
              Reach exceptional remote talent across Africa and globally.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 text-xs rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePostJob} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior React Developer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. TechFlow Africa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location Scope</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote (GMT+1 to GMT+3)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Range (Optional)</label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $3,000 - $5,000 / mo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Application URL or Email</label>
                <input
                  type="text"
                  required
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  placeholder="https://company.com/apply or jobs@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description</label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe role responsibilities, tech stack, requirements, and benefits..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white outline-none focus:border-amber-500 transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition shadow-md"
            >
              {loading ? 'Publishing job...' : 'Publish Remote Job Listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}