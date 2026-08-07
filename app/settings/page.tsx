'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  User, 
  Building2, 
  Smartphone, 
  Bell, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ArrowLeft, 
  Eye, 
  EyeOff
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'payout' | 'notifications' | 'security'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Profile Form States
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [website, setWebsite] = useState('')

  // Company Form States
  const [companyName, setCompanyName] = useState('')
  const [companyLogoUrl, setCompanyLogoUrl] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')

  // Payout Form States
  const [payoutMethod, setPayoutMethod] = useState('momo')
  const [momoProvider, setMomoProvider] = useState('MTN MoMo')
  const [momoNumber, setMomoNumber] = useState('')

  // Notification States
  const [emailJobAlerts, setEmailJobAlerts] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // Security Form States
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        router.push('/login?next=/settings')
        return
      }

      // Load user metadata
      const meta = authUser.user_metadata || {}
      setFullName(meta.full_name || '')
      setHeadline(meta.headline || '')
      setPhoneNumber(meta.phone_number || '')
      setWebsite(meta.website || '')

      setCompanyName(meta.company_name || '')
      setCompanyLogoUrl(meta.company_logo_url || '')
      setCompanyDescription(meta.company_description || '')

      setPayoutMethod(meta.payout_method || 'momo')
      setMomoProvider(meta.momo_provider || 'MTN MoMo')
      setMomoNumber(meta.momo_number || '')

      setEmailJobAlerts(meta.email_job_alerts ?? true)
      setMarketingEmails(meta.marketing_emails ?? false)
    } catch (err: unknown) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSaving(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          headline: headline.trim(),
          phone_number: phoneNumber.trim(),
          website: website.trim(),
          company_name: companyName.trim(),
          company_logo_url: companyLogoUrl.trim(),
          company_description: companyDescription.trim(),
          payout_method: payoutMethod,
          momo_provider: momoProvider,
          momo_number: momoNumber.trim(),
          email_job_alerts: emailJobAlerts,
          marketing_emails: marketingEmails,
        },
      })

      if (updateError) throw updateError

      setMessage('Settings updated successfully!')
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to update settings.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.')
      return
    }

    setSaving(true)

    try {
      const { error: passError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (passError) throw passError

      setMessage('Password changed successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to update password.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Loading User Settings...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header */}
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
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Manage your personal profile, company details, payout rails, and security preferences.
          </p>
        </div>

        {/* Banners */}
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl p-4 mb-6 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl p-4 mb-6 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Settings Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar Tabs */}
          <div className="md:col-span-4 space-y-1.5">
            <button
              onClick={() => { setActiveTab('profile'); setMessage(null); setError(null) }}
              className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-3 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <User className="w-4 h-4" /> Profile Details
            </button>

            <button
              onClick={() => { setActiveTab('company'); setMessage(null); setError(null) }}
              className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-3 cursor-pointer ${
                activeTab === 'company'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" /> Company & Employer
            </button>

            <button
              onClick={() => { setActiveTab('payout'); setMessage(null); setError(null) }}
              className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-3 cursor-pointer ${
                activeTab === 'payout'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Payout & Mobile Money
            </button>

            <button
              onClick={() => { setActiveTab('notifications'); setMessage(null); setError(null) }}
              className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-3 cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>

            <button
              onClick={() => { setActiveTab('security'); setMessage(null); setError(null) }}
              className={`w-full p-3.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-3 cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Lock className="w-4 h-4" /> Security & Password
            </button>

            {/* KYC Shortcut Banner */}
            <div className="pt-4">
              <Link
                href="/kyc"
                className="block bg-gradient-to-r from-emerald-500/10 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 hover:border-emerald-500/50 transition"
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Identity Verification
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">
                  Submit government ID to unlock the Green Verification Badge.
                </p>
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-8">
            
            {/* Tab 1: Profile Settings */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> Personal Profile
                </h3>

                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Kwame Mensah"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>

                <div>
                  <label htmlFor="headline" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Professional Headline / Bio
                  </label>
                  <input
                    id="headline"
                    name="headline"
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Senior React Developer | UI/UX Designer | Virtual Assistant"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+233 24 123 4567"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Portfolio / LinkedIn URL
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://linkedin.com/in/yourname"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Settings'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Company Settings */}
            {activeTab === 'company' && (
              <form onSubmit={handleSaveProfile} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Employer Company Profile
                </h3>

                <div>
                  <label htmlFor="companyName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="TechCorp Africa"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>

                <div>
                  <label htmlFor="companyLogoUrl" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Company Logo Image URL
                  </label>
                  <input
                    id="companyLogoUrl"
                    name="companyLogoUrl"
                    type="text"
                    value={companyLogoUrl}
                    onChange={(e) => setCompanyLogoUrl(e.target.value)}
                    placeholder="https://yourcompany.com/logo.png"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                  />
                </div>

                <div>
                  <label htmlFor="companyDescription" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    About the Company
                  </label>
                  <textarea
                    id="companyDescription"
                    name="companyDescription"
                    rows={4}
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Brief overview of your company mission and culture..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl p-4 outline-none font-medium transition leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Company Settings'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Payout Settings */}
            {activeTab === 'payout' && (
              <form onSubmit={handleSaveProfile} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> Payout & Local Financial Rails
                </h3>

                <div>
                  <label htmlFor="payoutMethod" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Preferred Compensation Rail
                  </label>
                  <select
                    id="payoutMethod"
                    name="payoutMethod"
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer"
                  >
                    <option value="momo">📱 Mobile Money (MTN MoMo / Telecel / AirtelTigo)</option>
                    <option value="usd_bank">💵 USD Direct Wire / Wise / Payoneer</option>
                    <option value="crypto">⚡ USDC / Crypto Stablecoin</option>
                  </select>
                </div>

                {payoutMethod === 'momo' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <label htmlFor="momoProvider" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        MoMo Network Provider
                      </label>
                      <select
                        id="momoProvider"
                        name="momoProvider"
                        value={momoProvider}
                        onChange={(e) => setMomoProvider(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-300 text-xs rounded-xl px-3.5 py-3 outline-none font-bold cursor-pointer"
                      >
                        <option value="MTN MoMo">MTN Mobile Money</option>
                        <option value="Telecel Cash">Telecel Cash (Vodafone)</option>
                        <option value="AirtelTigo Money">AirtelTigo Money</option>
                        <option value="M-Pesa">M-Pesa (East Africa)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="momoNumber" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        MoMo Account Phone Number
                      </label>
                      <input
                        id="momoNumber"
                        name="momoNumber"
                        type="text"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        placeholder="024 123 4567"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Payout Rails'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 4: Notifications */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSaveProfile} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Email & Alert Preferences
                </h3>

                <label className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-slate-700 transition">
                  <div>
                    <p className="text-xs font-bold text-white">New Job Matches & Daily Alerts</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receive emails when new remote roles match your tech stack.
                    </p>
                  </div>
                  <input
                    id="emailJobAlerts"
                    name="emailJobAlerts"
                    type="checkbox"
                    checked={emailJobAlerts}
                    onChange={(e) => setEmailJobAlerts(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-slate-700 transition">
                  <div>
                    <p className="text-xs font-bold text-white">Product Updates & Employer News</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Occasional updates on African remote hiring trends and platform features.
                    </p>
                  </div>
                  <input
                    id="marketingEmails"
                    name="marketingEmails"
                    type="checkbox"
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Notification Preferences'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 5: Security Settings */}
            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password & Security
                </h3>

                <div>
                  <label htmlFor="newPassword" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl pl-10 pr-10 py-3 outline-none font-medium transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl pl-10 pr-10 py-3 outline-none font-medium transition"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}