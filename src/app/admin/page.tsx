'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { backend } from '@/lib/backend'
import Navbar from '@/components/Navbar'
import { Crown, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle } from 'lucide-react'

export default function AdminPortalPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')
  const router = useRouter()

  useEffect(() => {
    verifyAdminAndLoadJobs()
  }, [activeTab])

  const verifyAdminAndLoadJobs = async () => {
    setLoading(true)
    const user = await backend.getCurrentUser()

    if (!user) {
      router.push('/login')
      return
    }

    const userRole = user.role || user.custom_claims?.user_role
    if (userRole !== 'admin') {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    setIsAdmin(true)

    try {
      const targetStatus = activeTab === 'pending' ? 'paid_pending_approval' : 'approved'
      const allJobs = await backend.list('jobs')
      const filtered = allJobs
        .filter((job) => job.status === targetStatus)
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      setJobs(filtered)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (jobId: string) => {
    try {
      await backend.update('jobs', jobId, { status: 'approved', is_paid: true })
      alert('Job Approved & Published Live!')
      verifyAdminAndLoadJobs()
    } catch (error: any) {
      alert('Failed to approve job: ' + (error?.message || 'Unknown error'))
    }
  }

  const handleReject = async (jobId: string) => {
    try {
      await backend.update('jobs', jobId, { status: 'rejected' })
      alert('Job Rejected.')
      verifyAdminAndLoadJobs()
    } catch (error: any) {
      alert('Failed to reject job: ' + (error?.message || 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center pt-32 text-slate-400 text-sm gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
          <span>Loading App Manager Portal...</span>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-xs mb-6">
            You do not have App Manager (Admin) permissions to view this portal.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>App Manager Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Job Moderation Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">Review, approve, or reject paid remote job postings before they go live.</p>
          </div>

          <button
            onClick={verifyAdminAndLoadJobs}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('pending')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Approval ({activeTab === 'pending' ? jobs.length : '...'})
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'approved'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Published Live ({activeTab === 'approved' ? jobs.length : '...'})
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
            <p className="font-bold text-white text-sm mb-1">No jobs in this queue</p>
            <p>There are currently no job listings with status "{activeTab}".</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-lg transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-950 border border-slate-800 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                      {job.category || 'General'}
                    </span>
                    <span className="text-slate-500 text-xs">• {job.job_type}</span>
                    {job.is_paid && (
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Paid ✓
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white">{job.title}</h3>

                  <p className="text-xs text-slate-300 font-medium">
                    <strong className="text-amber-400">{job.company_name}</strong> • Location: {job.location_restriction || 'Remote'}
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-4">
                    <span>App URL/Email: <strong className="text-slate-300">{job.application_url_or_email}</strong></span>
                    {job.payment_ref && <span>Ref: <code className="text-amber-400">{job.payment_ref}</code></span>}
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  {activeTab === 'pending' && (
                    <button
                      onClick={() => handleApprove(job.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve & Publish
                    </button>
                  )}

                  <button
                    onClick={() => handleReject(job.id)}
                    className="bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
