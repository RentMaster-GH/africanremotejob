'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Settings,
  Star,
} from 'lucide-react';
import { backend } from '@/lib/backend';

interface JobRecord {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  job_type?: string;
  category?: string;
  status?: string;
  employer_id?: string;
  employer_email?: string;
  created_at?: string;
  is_verified?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const me = await backend.getMe();
        if (!me) {
          router.replace('/login');
          return;
        }

        if (!active) return;
        setUser(me);

        const allJobs = await backend.list('jobs');
        if (!active) return;

        const userId = me.sub || me.id;
        const userEmail = (me.email || '').toLowerCase();
        const role = me.custom_claims?.account_role || me.role || 'job_seeker';

        const visibleJobs =
          role === 'admin'
            ? allJobs
            : allJobs.filter(
                (j: JobRecord) =>
                  j.employer_id === userId ||
                  (j.employer_email && j.employer_email.toLowerCase() === userEmail)
              );

        setJobs(visibleJobs);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Unable to load dashboard.');
        router.replace('/login');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [router]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    setDeletingId(jobId);
    try {
      await backend.remove('jobs', jobId);
      setJobs((prev) => prev.filter((item) => item.id !== jobId));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete job.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    await backend.logout();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const accountRole = user?.custom_claims?.account_role || user?.role || 'job_seeker';
  const fullName = user?.custom_claims?.full_name || user?.email?.split('@')[0] || 'Member';
  const approvedCount = jobs.filter((j) => j.status === 'approved').length;
  const pendingCount = jobs.filter((j) => j.status !== 'approved').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 capitalize">
                <UserIcon className="w-3.5 h-3.5" />
                {accountRole.replace('_', ' ')}
              </span>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Portal
                </Link>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {fullName}</h1>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
            >
              <Settings className="w-4 h-4" />
              Profile &amp; CV
            </Link>
            <Link
              href="/post-job"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              Post a Job
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total Listings</p>
            <p className="text-3xl font-bold text-white mt-1">{jobs.length}</p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Live &amp; Approved</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{approvedCount}</p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Pending Review</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition space-y-1"
          >
            <div className="flex items-center justify-between text-amber-400">
              <Briefcase className="w-5 h-5" />
              <ExternalLink className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white pt-1">Browse Remote Jobs</h3>
            <p className="text-xs text-slate-400">Explore verified global roles open to African talent.</p>
          </Link>

          <Link
            href="/kyc"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition space-y-1"
          >
            <div className="flex items-center justify-between text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <ExternalLink className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white pt-1">Employer Verification</h3>
            <p className="text-xs text-slate-400">Submit KYC documents to earn the verified badge.</p>
          </Link>

          <Link
            href="/reviews"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition space-y-1"
          >
            <div className="flex items-center justify-between text-sky-400">
              <Star className="w-5 h-5" />
              <ExternalLink className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white pt-1">Ratings &amp; Reviews</h3>
            <p className="text-xs text-slate-400">View and share verified employer &amp; talent feedback.</p>
          </Link>
        </div>

        {/* Job Listings Management */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-lg text-white">Your Job Listings</h2>
            <span className="text-xs text-slate-400">{jobs.length} record(s)</span>
          </div>

          {jobs.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-medium">No job listings yet</p>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Post a remote role to hire across Africa, or browse the main job board to apply for open positions.
              </p>
              <div className="pt-2">
                <Link
                  href="/post-job"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition"
                >
                  <Plus className="w-4 h-4" />
                  Create First Listing
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{job.title || 'Untitled Role'}</h3>
                      {job.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          {job.status || 'Pending'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {job.company || 'Company'} • {job.location || 'Remote'}
                      {job.salary ? ` • ${job.salary}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                    >
                      View
                    </Link>
                    <Link
                      href={`/jobs/${job.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={deletingId === job.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === job.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
