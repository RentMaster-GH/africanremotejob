'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { 
  Search, 
  DollarSign, 
  Briefcase, 
  Globe, 
  ArrowUpRight, 
  Smartphone, 
  Sparkles, 
  Code2, 
  Palette, 
  Headphones, 
  TrendingUp, 
  Zap,
  CheckCircle2,
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
  is_verified?: boolean
  company_name?: string
  created_at: string
}

const CATEGORY_TILES = [
  { name: 'Software Engineering', icon: Code2, count: '120+ Jobs' },
  { name: 'Design & Creative', icon: Palette, count: '45+ Jobs' },
  { name: 'Virtual Assistance', icon: Headphones, count: '60+ Jobs' },
  { name: 'Product & Marketing', icon: TrendingUp, count: '35+ Jobs' },
]

const QUICK_CHIPS = [
  '⚡ Developer Roles',
  '💼 Virtual Assistant',
  '🇬🇭 GMT / WAT Overlap',
  '🌍 Worldwide Remote',
  '📱 MoMo Eligible'
]

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [jobTypeFilter, setJobTypeFilter] = useState('All')
  const [timezoneFilter, setTimezoneFilter] = useState('All')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase Query Error:', error)
      } else if (data) {
        setJobs(data as unknown as Job[])
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChipClick = (chip: string) => {
    // Reset other filters so quick tags don't conflict
    setSelectedCategory('All')
    setJobTypeFilter('All')
    setTimezoneFilter('All')

    if (chip.includes('Developer')) setSearchTerm('Developer')
    else if (chip.includes('Virtual Assistant')) setSearchTerm('Virtual Assistant')
    else if (chip.includes('GMT')) {
      setSearchTerm('')
      setTimezoneFilter('GMT')
    } else if (chip.includes('Worldwide')) {
      setSearchTerm('')
      setTimezoneFilter('Worldwide')
    } else {
      setSearchTerm('')
    }
  }

  const resetAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setJobTypeFilter('All')
    setTimezoneFilter('All')
  }

  const filteredJobs = jobs.filter((job) => {
    const searchLower = searchTerm.toLowerCase().trim()
    
    const matchesSearch =
      !searchLower ||
      job.title?.toLowerCase().includes(searchLower) ||
      job.category?.toLowerCase().includes(searchLower) ||
      job.company_name?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower)

    const matchesCategory =
      selectedCategory === 'All' || job.category === selectedCategory

    const matchesType =
      jobTypeFilter === 'All' || job.job_type === jobTypeFilter

    const matchesTimezone =
      timezoneFilter === 'All' ||
      (timezoneFilter === 'GMT' && (job.location_restriction?.includes('Africa') || job.location_restriction?.includes('GMT'))) ||
      (timezoneFilter === 'Worldwide' && job.location_restriction?.includes('Worldwide'))

    return matchesSearch && matchesCategory && matchesType && matchesTimezone
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Inline Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer">
            Sign In
          </Link>
          <Link href="/post-job" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer">
            + Post a Job ($50)
          </Link>
        </div>
      </nav>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/80 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-4 py-2 rounded-full shadow-lg mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>African Remote Talent • Global & Local Currencies</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Get Hired by Vetted Employers. <br className="hidden sm:block" />
            Paid Directly in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-200">MoMo & USD</span>.
          </h1>

          <p className="text-slate-400 text-base sm:text-lg mt-5 max-w-2xl mx-auto leading-relaxed font-medium">
            Connect with top global companies hiring African software developers, designers, virtual assistants, and remote specialists.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#search-toolbar"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-8 py-4 rounded-xl transition shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" /> Find Remote Jobs
            </a>
            <Link
              href="/post-job"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-sm px-8 py-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4 text-amber-400" /> Post a Job ($50)
            </Link>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div id="search-toolbar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Sleek Multi-Filter Search Toolbar */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-2xl backdrop-blur-xl mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            
            {/* Main Input */}
            <div className="lg:col-span-6 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-amber-500 transition">
              <Search className="w-5 h-5 text-amber-500 shrink-0 mr-3" />
              <input 
                id="search" 
                name="search"
                type="text"
                placeholder="Search job title, company, or tech stack (Developer, Assistant, Admin)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent w-full text-sm text-white outline-none placeholder-slate-500 font-medium"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="text-xs text-slate-500 hover:text-white font-bold ml-2 shrink-0 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter 1: Job Type */}
            <div className="lg:col-span-3">
              <select
                id="jobTypeFilter"
                name="jobTypeFilter"
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer focus:border-amber-500"
              >
                <option value="All">All Types (Full-time, Contract, Project, Milestone)</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Project-Based (Deadline)">Project-Based (Deadline / Deliverable)</option>
                <option value="Milestone-Based">Milestone / Task-Based</option>
              </select>
            </div>

            {/* Filter 2: Timezone */}
            <div className="lg:col-span-3">
              <select
                id="timezoneFilter"
                name="timezoneFilter"
                value={timezoneFilter}
                onChange={(e) => setTimezoneFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer focus:border-amber-500"
              >
                <option value="All">All Timezones (Worldwide & Africa)</option>
                <option value="GMT">🇬🇭 GMT / WAT Overlap (West Africa)</option>
                <option value="Worldwide">🌍 Worldwide Remote</option>
              </select>
            </div>

          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-slate-800/80">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick Tags:
            </span>
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="text-xs font-bold bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
            {(searchTerm || selectedCategory !== 'All' || jobTypeFilter !== 'All' || timezoneFilter !== 'All') && (
              <button
                onClick={resetAllFilters}
                className="text-xs font-bold text-amber-400 hover:underline ml-auto cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Popular Categories Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">Explore Popular Categories</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORY_TILES.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === cat.name
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(isSelected ? 'All' : cat.name)}
                  className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white ring-2 ring-amber-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center mb-3 border border-slate-800 text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white line-clamp-1">{cat.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{cat.count}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Job Feed List Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-500" /> Active Remote Listings ({filteredJobs.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">100% Vetted Employers</span>
        </div>

        {/* Job Listings Cards */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading active remote listings...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-sm">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No remote jobs match your filters</h3>
            <p className="text-slate-400 text-xs mt-1 mb-4">Try resetting your search terms or filters.</p>
            <button
              onClick={resetAllFilters}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`bg-slate-900/90 border rounded-2xl p-6 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-amber-500/50 shadow-xl ${
                  job.is_featured
                    ? 'border-amber-500/50 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30'
                    : 'border-slate-800/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Logo or Initials */}
                  <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center font-black text-amber-400 text-xl shrink-0 overflow-hidden shadow-inner">
                    {job.company_name?.charAt(0) || 'C'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {job.is_featured && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Featured Sponsor
                        </span>
                      )}
                      <span className="bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {job.category}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                        {job.is_verified ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Landlord / Employer
                          </span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {job.company_name || 'Verified Employer'}
                          </>
                        )}
                      </span>
                    </div>

                    <Link href={`/jobs/${job.id}`} className="text-lg font-bold text-white hover:text-amber-400 transition flex items-center gap-1.5">
                      {job.title}
                    </Link>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Globe className="w-3.5 h-3.5 text-amber-500" />
                        {job.location_restriction}
                      </span>

                      {(job.salary_min || job.salary_max) && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.currency} {job.salary_min?.toLocaleString()} {job.salary_max ? `- ${job.salary_max.toLocaleString()}` : ''} / yr
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-indigo-300 font-medium">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-400" /> MoMo / Wire Eligible
                      </span>

                      <span className="text-slate-500 font-medium">{job.job_type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800/80 pt-4 md:pt-0">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="w-full md:w-auto text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    View Role & Apply <ArrowUpRight className="w-4 h-4" />
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