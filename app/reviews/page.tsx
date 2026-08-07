'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  Star, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  User, 
  Building2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react'

interface Review {
  id: string
  reviewer_name: string
  recipient_name: string
  rating: number
  review_type: 'employer_to_seeker' | 'seeker_to_employer'
  title: string
  comment: string
  created_at: string
}

export default function ReviewsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form States
  const [activeTab, setActiveTab] = useState<'view' | 'leave'>('view')
  const [reviewType, setReviewType] = useState<'seeker_to_employer' | 'employer_to_seeker'>('seeker_to_employer')
  const [recipientName, setRecipientName] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [comment, setComment] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
      }

      // Fetch all reviews from Supabase
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (!reviewsError && reviewsData) {
        setReviews(reviewsData as unknown as Review[])
      }
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!user) {
      router.push('/login?next=/reviews')
      return
    }

    setSubmitting(true)

    try {
      const reviewerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'

      const { error: insertError } = await supabase
        .from('reviews')
        .insert([
          {
            reviewer_id: user.id,
            reviewer_name: reviewerName,
            recipient_name: recipientName.trim(),
            rating,
            review_type: reviewType,
            title: reviewTitle.trim(),
            comment: comment.trim(),
          },
        ])

      if (insertError) throw insertError

      setSuccess('Review submitted successfully! Thank you for building trust on our platform.')
      setRecipientName('')
      setReviewTitle('')
      setComment('')
      setRating(5)
      
      // Reload review feed
      loadData()
      setTimeout(() => setActiveTab('view'), 1500)
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to submit review.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate Average Rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Loading Ratings & Reviews...
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>2-Way Reputation & Feedback System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Ratings & Feedback Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium max-w-lg mx-auto">
            Employers and job seekers build trust by rating their experience, communication, and payment reliability.
          </p>
        </div>

        {/* Overall Rating Summary Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center shrink-0">
              <span className="text-3xl font-black text-amber-400">{averageRating}</span>
              <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Community Trust Score</h3>
              <p className="text-xs text-slate-400 mt-0.5">Based on {reviews.length} verified ratings across the platform</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified 2-Way Reviews
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('leave')}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <MessageSquare className="w-4 h-4" /> Leave Feedback
          </button>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('view')}
            className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'view' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Read Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'leave' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            + Leave a Review
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'leave' ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" /> Submit Rating & Feedback
            </h3>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl p-4 mb-6 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl p-4 mb-6 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-6">
              
              {/* Review Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  I am rating a:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewType('seeker_to_employer')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      reviewType === 'seeker_to_employer'
                        ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">An Employer / Company</p>
                      <p className="text-[10px] text-slate-500">Rate payroll, comms, & workload</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewType('employer_to_seeker')}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      reviewType === 'employer_to_seeker'
                        ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">A Job Seeker / Freelancer</p>
                      <p className="text-[10px] text-slate-500">Rate deliverable quality & deadline</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recipient Name */}
              <div>
                <label htmlFor="recipientName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {reviewType === 'seeker_to_employer' ? 'Employer or Company Name *' : 'Job Seeker Name *'}
                </label>
                <input
                  id="recipientName"
                  name="recipientName"
                  type="text"
                  required
                  placeholder={reviewType === 'seeker_to_employer' ? 'e.g. TechCorp Africa' : 'e.g. Kwame Mensah'}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                />
              </div>

              {/* Interactive Star Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Star Rating * ({rating} / 5 Stars)
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-4 rounded-xl w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition transform hover:scale-125"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Headline */}
              <div>
                <label htmlFor="reviewTitle" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Review Title / Headline *
                </label>
                <input
                  id="reviewTitle"
                  name="reviewTitle"
                  type="text"
                  required
                  placeholder="e.g. Excellent communication & prompt MoMo payout"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                />
              </div>

              {/* Feedback Details */}
              <div>
                <label htmlFor="comment" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Detailed Feedback / Comments *
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={5}
                  required
                  placeholder="Describe your working experience, deadline management, and professionalism..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl p-4 outline-none font-medium transition leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-4 rounded-xl transition shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    'Submitting Review...'
                  ) : (
                    <>
                      Submit Verified Review <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Review Feed List */
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No reviews submitted yet</h3>
                <p className="text-slate-400 text-xs mt-1 mb-6">Be the first to leave feedback for an employer or job seeker.</p>
                <button
                  onClick={() => setActiveTab('leave')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition cursor-pointer"
                >
                  + Submit First Review
                </button>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center font-black text-amber-400 text-sm">
                        {rev.reviewer_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm">{rev.reviewer_name}</p>
                          <span className="bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {rev.review_type === 'seeker_to_employer' ? 'Reviewed Employer' : 'Reviewed Job Seeker'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">For {rev.recipient_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-white ml-1">{rev.rating}.0</span>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-white text-base">{rev.title}</h4>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line font-medium">
                    {rev.comment}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Posted on {new Date(rev.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

    </div>
  )
}