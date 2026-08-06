'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
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
  Clock,
  CheckCircle2,
  SlidersHorizontal
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
  created_at: string
  companies?: {
    name: string
    logo_url: string | null
    country: string
  }
}

const CATEGORY_TILES = [
  { name: 'Software Engineering', icon: Code2, count: '120+ Jobs' },
  { name: 'Design & Creative', icon: Palette, count: '45+ Jobs' },
  { name: 'Virtual Assistance', icon: Headphones, count: '60+ Jobs' },
  { name: 'Product & Marketing', icon: TrendingUp, count: '35+ Jobs' },
]

const QUICK_CHIPS = [
  '⚡ Python Developer',
  '🎨 UI/UX Designer',
  '💼 Virtual Assistant',
  '🇬🇭 GMT Overlap',
  '📱 MoMo Payout'
]

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [jobTypeFilter, setJobTypeFilter] = useState('All')
  const [timezoneFilter, setTimezoneFilter] = useState('All')
  const [payoutFilter, setPayoutFilter] = useState('All')

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

  const handleChipClick = (chip: string) => {
    if (chip.includes('Python')) setSearchTerm('Python')
    else if (chip.includes('UI/UX')) setSearchTerm('UI/UX')
    else if (chip.includes('Virtual Assistant')) setSearchTerm('Virtual Assistant')
    else if (chip.includes('GMT')) setTimezoneFilter('GMT')
    else if (chip.includes('MoMo')) setPayoutFilter('MoMo')
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.companies?.name && job.companies.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory =
      selectedCategory === 'All' || job.category === selectedCategory

    const matchesType =
      jobTypeFilter === 'All' || job.job_type === jobTypeFilter

    const matchesTimezone =
      timezoneFilter === 'All' ||
      (timezoneFilter === 'GMT' && job.location_restriction.includes('Africa')) ||
      (timezoneFilter === 'Worldwide' && job.location_restriction.includes('Worldwide'))

    return matchesSearch && matchesCategory && matchesType && matchesTimezone
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

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
            <div className="lg:col-span-5 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-amber-500 transition">
              <Search className="w-5 h-5 text-amber-500 shrink-0 mr-3" />
              <input 
                id="search" 
                name="search"
                type="text"
                placeholder="Search job title, company, or tech stack (Python, Figma, Virtual Assistant)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent w-full text-sm text-white outline-none placeholder-slate-500 font-medium"
              />
            </div>

            {/* Filter 1: Job Type */}
            <div className="lg:col-span-2">
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer focus:border-amber-500"
              >
                <option value="All">All Types (Full-time, Contract, Gig)</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* Filter 2: Timezone */}
            <div className="lg:col-span-3">
              <select
                value={timezoneFilter}
                onChange={(e) => setTimezoneFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer focus:border-amber-500"
              >
                <option value="All">All Timezones (Worldwide & Africa)</option>
                <option value="GMT">🇬🇭 GMT / WAT Overlap (West Africa)</option>
                <option value="Worldwide">🌍 Worldwide Remote</option>
              </select>
            </div>

            {/* Filter 3: Payout */}
            <div className="lg:col-span-2">
              <select
                value={payoutFilter}
                onChange={(e) => setPayoutFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer focus:border-amber-500"
              >
                <option value="All">All Payouts (MoMo, USD, Wire)</option>
                <option value="MoMo">📱 Mobile Money (MoMo)</option>
                <option value="USD">💵 USD Bank / Wise</option>
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
                className="text-xs font-bold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/50 px-3 py-1.5 rounded-lg transition"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Categories Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">Explore Popular Categories</h3>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                Reset Category Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORY_TILES.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === cat.name
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(isSelected ? 'All' : cat.name)}
                  className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500'
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
            <p className="text-slate-400 text-xs mt-1">Try clearing your search terms or posting a new remote listing.</p>
            <Link
              href="/post-job"
              className="inline-block mt-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition"
            >
              + Post a Remote Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`bg-slate-900/90 border rounded-2xl p-6 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 shadow-xl ${
                  job.is_featured
                    ? 'border-amber-500/50 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30'
                    : 'border-slate-800/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Logo or Initials */}
                  <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center font-black text-amber-400 text-xl shrink-0 overflow-hidden shadow-inner">
                    {job.companies?.logo_url ? (
                      <img src={job.companies.logo_url} alt={job.companies.name} className="w-full h-full object-cover" />
                    ) : (
                      job.companies?.name?.charAt(0) || 'C'
                    )}
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
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {job.companies?.name || 'Verified Employer'}
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
                    className="w-full md:w-auto text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
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