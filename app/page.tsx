'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase/client'
import { Search, MapPin, DollarSign, Briefcase, Globe, ArrowUpRight } from 'lucide-react'

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
  created_at: string
  companies?: {
    name: string
    logo_url: string | null
    country: string
  }
}

const CATEGORIES = [
  'All Categories',
  'Software Engineering',
  'Design & Creative',
  'DevOps & Cloud',
  'Data & AI',
  'Product & Marketing',
  'Customer Support',
  'Sales & Business'
]

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [locationFilter, setLocationFilter] = useState('All')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          name,
          logo_url,
          country
        )
      `)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setJobs(data as unknown as Job[])
    }
    setLoading(false)
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companies?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === 'All Categories' || job.category === selectedCategory

    const matchesLocation =
      locationFilter === 'All' ||
      (locationFilter === 'Africa Only' && job.location_restriction.includes('Africa')) ||
      (locationFilter === 'Worldwide' && job.location_restriction.includes('Worldwide'))

    return matchesSearch && matchesCategory && matchesLocation
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-block mb-4">
            🌍 The #1 Remote Career Hub for Africa
          </span>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Find Top Remote Jobs from <span className="text-amber-500">Global Companies</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            Discover verified remote software engineering, design, marketing, and support roles hiring African talents worldwide.
          </p>

          {/* Main Search Toolbar */}
          <div className="mt-8 max-w-3xl mx-auto bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5">
              <Search className="w-5 h-5 text-slate-500 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Search job title, tech stack (React, Python), or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent w-full text-sm text-white outline-none placeholder-slate-500"
              />
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-xl px-4 py-2.5 outline-none font-medium"
            >
              <option value="All">All Locations</option>
              <option value="Worldwide">🌍 Worldwide Remote</option>
              <option value="Africa Only">🌍 Africa Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Category Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Job Listings List */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading active remote listings...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-sm">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No remote jobs match your criteria</h3>
            <p className="text-slate-400 text-xs mt-1">Try resetting your filters or search terms.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`bg-slate-900 border rounded-2xl p-6 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 ${
                  job.is_featured
                    ? 'border-amber-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 shadow-md'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo or Initials */}
                  <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center font-bold text-amber-400 text-xl shrink-0 overflow-hidden">
                    {job.companies?.logo_url ? (
                      <img src={job.companies.logo_url} alt={job.companies.name} className="w-full h-full object-cover" />
                    ) : (
                      job.companies?.name.charAt(0) || 'C'
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {job.is_featured && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                          ⭐ Featured
                        </span>
                      )}
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {job.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {job.companies?.name || 'Top Employer'}
                      </span>
                    </div>

                    <Link href={`/jobs/${job.id}`} className="text-lg font-bold text-white hover:text-amber-400 transition flex items-center gap-1.5">
                      {job.title}
                    </Link>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-amber-500" />
                        {job.location_restriction}
                      </span>

                      {(job.salary_min || job.salary_max) && (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.currency} {job.salary_min?.toLocaleString()} {job.salary_max ? `- ${job.salary_max.toLocaleString()}` : ''} / yr
                        </span>
                      )}

                      <span className="text-slate-500">{job.job_type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="w-full md:w-auto text-center bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-5 py-3 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    View & Apply <ArrowUpRight className="w-4 h-4 text-amber-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}