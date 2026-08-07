'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  CheckSquare, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink, 
  Plus, 
  FileText, 
  Zap,
  TrendingUp,
  Edit3
} from 'lucide-react'

interface Task {
  id: string
  job_title: string
  employer_name: string
  assignee_name: string
  assignee_email: string
  task_title: string
  task_description?: string
  status: 'todo' | 'in_progress' | 'submitted' | 'approved' | 'revision_requested'
  progress_percent: number
  deliverable_link?: string
  deliverable_notes?: string
  due_date?: string
  created_at: string
}

export default function TaskTrackerPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'create'>('tasks')

  // Form States for New Task
  const [jobTitle, setJobTitle] = useState('')
  const [employerName, setEmployerName] = useState('')
  const [assigneeName, setAssigneeName] = useState('')
  const [assigneeEmail, setAssigneeEmail] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  // Form States for Deliverable Update Modal
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [updateProgress, setUpdateProgress] = useState(50)
  const [updateStatus, setUpdateStatus] = useState<string>('in_progress')
  const [deliverableLink, setDeliverableLink] = useState('')
  const [deliverableNotes, setDeliverableNotes] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadTrackerData()
  }, [])

  const loadTrackerData = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        setAssigneeEmail(authUser.email || '')
        setAssigneeName(authUser.user_metadata?.full_name || '')
      }

      // Fetch all project tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (!tasksError && tasksData) {
        setTasks(tasksData as unknown as Task[])
      }
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    try {
      const { error: insertError } = await supabase
        .from('project_tasks')
        .insert([
          {
            job_title: jobTitle.trim(),
            employer_name: employerName.trim(),
            assignee_name: assigneeName.trim(),
            assignee_email: assigneeEmail.trim(),
            task_title: taskTitle.trim(),
            task_description: taskDescription.trim(),
            status: 'in_progress',
            progress_percent: 10,
            due_date: dueDate || null,
          },
        ])

      if (insertError) throw insertError

      setSuccess('New milestone task created successfully!')
      setTaskTitle('')
      setTaskDescription('')
      loadTrackerData()
      setTimeout(() => setActiveTab('tasks'), 1200)
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to create task.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateDeliverable = async (taskId: string) => {
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    try {
      const { error: updateError } = await supabase
        .from('project_tasks')
        .update({
          progress_percent: Number(updateProgress),
          status: updateStatus,
          deliverable_link: deliverableLink.trim(),
          deliverable_notes: deliverableNotes.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)

      if (updateError) throw updateError

      setSuccess('Task progress & deliverable update sent to employer!')
      setEditingTaskId(null)
      loadTrackerData()
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to update deliverable.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate Progress Metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'approved').length
  const overallCompletion = totalTasks > 0
    ? Math.round((tasks.reduce((acc, t) => acc + (t.progress_percent || 0), 0)) / totalTasks)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Loading Task Tracking Dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header Nav */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg mb-4 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Real-Time Work Progress & Milestone Tracker</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Job Task & Progress Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium max-w-lg mx-auto">
            Job-seekers update employers on deliverables, submit GitHub/Drive links, and track milestone completions.
          </p>
        </div>

        {/* Overall Progress Summary Bar */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" /> Overall Project Progress
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {completedTasks} of {totalTasks} milestones approved by employers
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-amber-400">{overallCompletion}%</span>
              <span className="text-xs text-slate-500 block">Completed</span>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallCompletion}%` }}
            />
          </div>
        </div>

        {/* Banners */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl p-4 mb-6 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl p-4 mb-6 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'tasks' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Active Tasks ({tasks.length})
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'create' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" /> + New Task Milestone
          </button>
        </div>

        {/* Tab 1: Active Tasks List */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center">
                <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No active task milestones</h3>
                <p className="text-slate-400 text-xs mt-1 mb-6">Create your first task milestone to start updating your employer on progress.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition cursor-pointer"
                >
                  + Create First Task
                </button>
              </div>
            ) : (
              tasks.map((task) => {
                const isEditingThisTask = editingTaskId === task.id

                return (
                  <div key={task.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    
                    {/* Task Card Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="bg-slate-950 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                            {task.job_title}
                          </span>
                          {task.due_date && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-amber-500" /> Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-extrabold text-white">{task.task_title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                          task.status === 'approved' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : task.status === 'submitted'
                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                            : task.status === 'revision_requested'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Task Description */}
                    {task.task_description && (
                      <p className="text-slate-300 text-xs leading-relaxed font-medium">
                        {task.task_description}
                      </p>
                    )}

                    {/* Progress Bar & Deliverables Info */}
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Milestone Progress:</span>
                        <span className="text-amber-400 font-black">{task.progress_percent}%</span>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${task.progress_percent}%` }}
                        />
                      </div>

                      {task.deliverable_link && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-amber-400" /> Submitted Deliverable Link:
                          </span>
                          <a
                            href={task.deliverable_link.startsWith('http') ? task.deliverable_link : `https://${task.deliverable_link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl"
                          >
                            View Work Link <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {task.deliverable_notes && (
                        <p className="text-[11px] text-slate-400 italic">
                          <strong className="text-slate-300">Job-Taker Notes:</strong> "{task.deliverable_notes}"
                        </p>
                      )}
                    </div>

                    {/* Update Form Controls */}
                    {isEditingThisTask ? (
                      <div className="bg-slate-950 border border-amber-500/40 p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4" /> Send Update & Deliverables To Employer
                        </h4>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Set Progress Percentage ({updateProgress}%)
                          </label>
                          <input
                            id="updateProgress"
                            name="updateProgress"
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={updateProgress}
                            onChange={(e) => setUpdateProgress(Number(e.target.value))}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="updateStatus" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Task Status
                            </label>
                            <select
                              id="updateStatus"
                              name="updateStatus"
                              value={updateStatus}
                              onChange={(e) => setUpdateStatus(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none font-bold cursor-pointer"
                            >
                              <option value="in_progress">In Progress ⚡</option>
                              <option value="submitted">Submitted for Employer Review 🔍</option>
                              <option value="approved">Approved & Completed ✅</option>
                              <option value="revision_requested">Revision Requested 🔁</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="deliverableLink" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Deliverable URL (GitHub / Figma / Drive)
                            </label>
                            <input
                              id="deliverableLink"
                              name="deliverableLink"
                              type="text"
                              placeholder="e.g. https://github.com/your-repo"
                              value={deliverableLink}
                              onChange={(e) => setDeliverableLink(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 outline-none font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="deliverableNotes" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            Update Notes for Employer
                          </label>
                          <textarea
                            id="deliverableNotes"
                            name="deliverableNotes"
                            rows={3}
                            placeholder="Describe the work completed, changes made, or next steps..."
                            value={deliverableNotes}
                            onChange={(e) => setDeliverableNotes(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 outline-none font-medium leading-relaxed"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingTaskId(null)}
                            className="bg-slate-900 text-slate-400 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleUpdateDeliverable(task.id)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" /> Submit Progress Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div className="text-[11px] text-slate-500">
                          Employer: <strong className="text-slate-300">{task.employer_name}</strong> | Assignee: <strong className="text-slate-300">{task.assignee_name}</strong>
                        </div>
                        <button
                          onClick={() => {
                            setEditingTaskId(task.id)
                            setUpdateProgress(task.progress_percent || 50)
                            setUpdateStatus(task.status || 'in_progress')
                            setDeliverableLink(task.deliverable_link || '')
                            setDeliverableNotes(task.deliverable_notes || '')
                          }}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Update Work Progress
                        </button>
                      </div>
                    )}

                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Tab 2: Create New Task Milestone */}
        {activeTab === 'create' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" /> Assign New Task Milestone
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="jobTitle" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Job / Project Name *
                  </label>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    type="text"
                    required
                    placeholder="e.g. Senior React Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>

                <div>
                  <label htmlFor="employerName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Employer / Company Name *
                  </label>
                  <input
                    id="employerName"
                    name="employerName"
                    type="text"
                    required
                    placeholder="e.g. TechCorp Africa"
                    value={employerName}
                    onChange={(e) => setEmployerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assigneeName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Job-Taker / Freelancer Name *
                  </label>
                  <input
                    id="assigneeName"
                    name="assigneeName"
                    type="text"
                    required
                    placeholder="e.g. Kwame Mensah"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>

                <div>
                  <label htmlFor="assigneeEmail" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Job-Taker Email *
                  </label>
                  <input
                    id="assigneeEmail"
                    name="assigneeEmail"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={assigneeEmail}
                    onChange={(e) => setAssigneeEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="taskTitle" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Task Milestone Title *
                </label>
                <input
                  id="taskTitle"
                  name="taskTitle"
                  type="text"
                  required
                  placeholder="e.g. Complete Figma UI Wireframes & User Flows"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dueDate" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Milestone Deadline / Due Date
                  </label>
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-300 text-xs rounded-xl px-4 py-3 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="taskDescription" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Milestone Instructions & Deliverables *
                </label>
                <textarea
                  id="taskDescription"
                  name="taskDescription"
                  rows={4}
                  required
                  placeholder="Describe what deliverables need to be completed for this milestone..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl p-4 outline-none font-medium transition leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-4 rounded-xl transition shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Creating Milestone...' : <>Assign Milestone Task <Send className="w-4 h-4" /></>}
              </button>

            </form>
          </div>
        )}

      </div>

    </div>
  )
}