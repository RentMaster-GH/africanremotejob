'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  User, 
  Briefcase, 
  Plus, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Mail,
  AlertCircle,
  Settings,
  Pencil,
  Trash2
} from 'lucide-react'

interface Job {
  id: string
  title: string
  category: string
  job_type: string
  company_name?: string
  created_at: string
  is_featured: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [postedJobs, setPostedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: authError } = await supabase.auth.getUser()

      if (authError || !data?.user) {
        router.push('/login')
        return
      }

      setUser(data.user)

      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      if (!jobsError && jobsData) {
        setPostedJobs(jobsData as unknown as Job[])
      }
    } catch (err: unknown) {
      console.error('Dashboard Load Exception:', err)
      setError('Failed to load dashboard metrics. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      const { error: deleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

      if (deleteError) throw deleteError

      // Update UI list immediately
      setPostedJobs((prev) => prev.filter((j) => j.id !== jobId))
    } catch (err: unknown) {
      console.error('Delete Job Error:', err)
      alert('Failed to delete job listing.')
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      router.push('/')
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Loading Your Dashboard...
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const rawRole = user?.user_metadata?.user_role
  const userRole = typeof rawRole === 'string' ? rawRole : 'Job Seeker'
  const displayRole = userRole.replace(/_/g, ' ')
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Nav */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>

        <div className="flex items-center gap-3">
          <Link 
            href="/settings" 
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" /> Settings
          </Link>

          <Link 
            href="/post-job" 
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Post a Job
          </Link>

          <button
            onClick={handleSignOut}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl p-4 mb-6 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500/10 border-b border-l border-amber-500/30 text-amber-400 text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Account Active
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-amber-400 text-2xl font-black shrink-0 shadow-inner">
              {fullName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full capitalize">
                  {displayRole}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, {fullName}!
              </h1>

              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
              <span>Active Listings</span>
              <Briefcase className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-white">{postedJobs.length}</p>
            <p className="text-[10px] text-slate-500 mt-1">Live remote job opportunities</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
              <span>Account Type</span>
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white capitalize">{displayRole}</p>
            <p className="text-[10px] text-slate-500 mt-1">Full access granted</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
              <span>Payout Protection</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">Verified</p>
            <p className="text-[10px] text-slate-500 mt-1">MoMo & USD rails supported</p>
          </div>
        </div>

        {/* Recent Jobs Management Feed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-500" /> Manage Job Listings ({postedJobs.length})
            </h2>
            <Link href="/" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
              View Full Feed <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {postedJobs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl p-6">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-bold text-sm">No listings found</p>
              <p className="text-slate-500 text-xs mt-1 mb-4">Post your first remote role to start receiving applications.</p>
              <Link
                href="/post-job"
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-amber-500/10"
              >
                <Plus className="w-4 h-4" /> Post a Remote Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {postedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {job.category}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base">{job.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{job.company_name || 'Verified Employer'}</p>
                  </div>

                  {/* Actions: View, Edit, Delete */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1"
                    >
                      View <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                    </Link>

                    <Link
                      href={`/jobs/${job.id}/edit`}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Link>

                    <button
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}