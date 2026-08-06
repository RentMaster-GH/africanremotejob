'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

export default function PostRemoteJobPage() {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('Remote')
  const [salary, setSalary] = useState('')
  const [description, setDescription] = useState('')
  const [applyUrl, setApplyUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    // Insert job into your Supabase database jobs table
    const { error } = await (supabase.from('jobs') as any).insert({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      salary: salary.trim(),
      description: description.trim(),
      apply_url: applyUrl.trim(),
      user_id: session.user.id,
    })

    if (error) {
      setErrorMsg('Failed to post job: ' + error.message)
      setLoading(false)
    } else {
      router.push('/jobs') // or wherever your job board listing is
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Post a Remote Job</h1>
          <p className="text-gray-500 text-xs mb-6">
            Fill out the form below to reach top remote talent across Africa and beyond.
          </p>

          {errorMsg && (
            <div className="mb-6 p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePostJob} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. TechCorp Africa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location Scope</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote (Africa Only)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Salary Range (Optional)</label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $2,000 - $4,000 / mo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Application URL or Email</label>
                <input
                  type="text"
                  required
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  placeholder="https://company.com/careers or hr@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Job Description</label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe responsibilities, requirements, and benefits..."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm"
            >
              {loading ? 'Publishing job...' : 'Publish Job Listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}