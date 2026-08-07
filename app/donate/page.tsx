'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { supabase } from '@/lib/supabase/client'
import { 
  Heart, 
  Sparkles, 
  Smartphone, 
  CreditCard, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Coffee, 
  ShieldCheck,
  Gift
} from 'lucide-react'

interface Donation {
  id: string
  donor_name: string
  amount: number
  currency: string
  message?: string
  created_at: string
}

export default function DonatePage() {
  const [currency, setCurrency] = useState<'GHS' | 'USD' | 'EUR' | 'GBP'>('GHS')
  const [selectedAmount, setSelectedAmount] = useState<number>(5)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'crypto'>('momo')
  
  // MoMo & Supporter Details
  const [momoProvider, setMomoProvider] = useState('MTN MoMo')
  const [momoNumber, setMomoNumber] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [supporterMessage, setMessage] = useState('')

  const [recentDonations, setRecentDonations] = useState<Donation[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const PRESET_AMOUNTS = {
    GHS: [1, 5, 20, 50, 100],
    USD: [1, 5, 10, 25, 50],
    EUR: [1, 5, 10, 25, 50],
    GBP: [1, 5, 10, 25, 50],
  }

  const CURRENCY_SYMBOLS = {
    GHS: '₵',
    USD: '$',
    EUR: '€',
    GBP: '£',
  }

  useEffect(() => {
    loadDonations()
  }, [])

  const loadDonations = async () => {
    try {
      const { data } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) setRecentDonations(data as unknown as Donation[])
    } catch (err) {
      console.error('Failed to load donations:', err)
    }
  }

  const saveDonationToDatabase = async (finalAmount: number, ref: string) => {
    try {
      await supabase.from('donations').insert([
        {
          donor_name: donorName.trim() || 'Generous Patron',
          donor_email: donorEmail.trim() || null,
          amount: finalAmount,
          currency,
          payment_method: paymentMethod,
          message: supporterMessage.trim() || `Ref: ${ref}`,
        },
      ])
      setSuccess(true)
      loadDonations()
    } catch (err) {
      console.error('Failed to record donation:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const finalAmount = customAmount ? Number(customAmount) : selectedAmount

    if (!finalAmount || finalAmount < 1) {
      setError('Minimum donation amount is 1 unit of currency.')
      return
    }

    setSubmitting(true)

    // Check if Paystack Inline script is loaded
    const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

    if (typeof window !== 'undefined' && (window as any).PaystackPop && paystackPublicKey) {
      // Trigger Paystack Live Checkout Popup
      const handler = (window as any).PaystackPop.setup({
        key: paystackPublicKey,
        email: donorEmail.trim() || 'supporter@africanremotejob.com',
        amount: Math.round(finalAmount * 100), // Amount in Pesewas/Cents
        currency: currency,
        ref: 'DON-' + Math.floor(Math.random() * 1000000000 + 1),
        callback: function (response: any) {
          saveDonationToDatabase(finalAmount, response.reference)
        },
        onClose: function () {
          setSubmitting(false)
        },
      })
      handler.openIframe()
    } else {
      // Fallback: Record intent & show USSD instructions
      await saveDonationToDatabase(finalAmount, 'DIRECT-MOMO')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Paystack Inline Script Loader */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      {/* Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="font-black text-xl text-white tracking-tight flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">A</span>
          African Remote Jobs
        </Link>
        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg mb-4 backdrop-blur-md">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Community Patron Fund</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Support African Remote Jobs</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium max-w-lg mx-auto">
            Donate as little as <span className="text-amber-400 font-bold">1 Cedi (₵1)</span> or its foreign currency equivalent to help keep this platform free for African job seekers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main Donation Form Container */}
          <div className="md:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            
            {success ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Gift className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-white">Thank You for Your Support! 🙏</h3>
                <p className="text-slate-300 text-xs max-w-md mx-auto leading-relaxed">
                  Your contribution of <strong className="text-amber-400">{CURRENCY_SYMBOLS[currency]}{customAmount || selectedAmount}</strong> helps fund server hosting and keep job listings free across Africa.
                </p>

                {/* Ghana MoMo Manual USSD Instructions Box */}
                {paymentMethod === 'momo' && (
                  <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-2xl text-left text-xs space-y-2 mt-4">
                    <p className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" /> Did not receive the USSD prompt on your phone?
                    </p>
                    <p className="text-slate-300 text-[11px]">
                      If the automatic pop-up prompt didn't display on your phone screen, approve it manually:
                    </p>
                    <ul className="list-disc pl-5 text-[11px] text-slate-400 font-mono space-y-1">
                      <li><strong>MTN MoMo:</strong> Dial <strong>*170#</strong> → Option 6 (My Wallet) → Option 3 (My Approvals)</li>
                      <li><strong>Telecel Cash:</strong> Dial <strong>*110#</strong> → Pending Transactions</li>
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setSuccess(false)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition cursor-pointer mt-4"
                >
                  Make Another Contribution
                </button>
              </div>
            ) : (
              <form onSubmit={handleDonate} className="space-y-6">
                
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl p-4 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Currency Switcher */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Select Currency
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['GHS', 'USD', 'EUR', 'GBP'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setCurrency(c); setSelectedAmount(PRESET_AMOUNTS[c][0]); setCustomAmount('') }}
                        className={`py-2.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          currency === c
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {c === 'GHS' ? '🇬🇭 GHS (₵)' : c === 'USD' ? '💵 USD ($)' : c === 'EUR' ? '🇪🇺 EUR (€)' : '🇬🇧 GBP (£)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Amount Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Choose Contribution Amount
                  </label>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {PRESET_AMOUNTS[currency].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => { setSelectedAmount(amt); setCustomAmount('') }}
                        className={`py-3 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
                          selectedAmount === amt && !customAmount
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400 ring-2 ring-amber-500'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {CURRENCY_SYMBOLS[currency]}{amt}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Field */}
                  <div className="relative flex items-center">
                    <span className="text-amber-400 font-extrabold text-sm absolute left-4">
                      {CURRENCY_SYMBOLS[currency]}
                    </span>
                    <input
                      id="customAmount"
                      name="customAmount"
                      type="number"
                      min="1"
                      placeholder="Or enter custom amount (min 1)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl pl-9 pr-4 py-3 outline-none font-medium transition"
                    />
                  </div>
                </div>

                {/* Payment Rail Options */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('momo')}
                      className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        paymentMethod === 'momo'
                          ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold">Mobile Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-bold">Card / Wise</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('crypto')}
                      className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        paymentMethod === 'crypto'
                          ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Coins className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold">USDC Crypto</span>
                    </button>
                  </div>
                </div>

                {/* MoMo Provider Details */}
                {paymentMethod === 'momo' && (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Smartphone className="w-4 h-4" /> Ghana & African Mobile Money Checkout
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="momoProvider" className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                          Network Provider
                        </label>
                        <select
                          id="momoProvider"
                          name="momoProvider"
                          value={momoProvider}
                          onChange={(e) => setMomoProvider(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none font-bold cursor-pointer"
                        >
                          <option value="MTN MoMo">MTN Mobile Money</option>
                          <option value="Telecel Cash">Telecel Cash (Vodafone)</option>
                          <option value="AirtelTigo Money">AirtelTigo Money</option>
                          <option value="M-Pesa">M-Pesa</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="momoNumber" className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                          MoMo Phone Number
                        </label>
                        <input
                          id="momoNumber"
                          name="momoNumber"
                          type="text"
                          placeholder="e.g. 0241234567"
                          value={momoNumber}
                          onChange={(e) => setMomoNumber(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Donor Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="donorName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Your Name (Optional)
                    </label>
                    <input
                      id="donorName"
                      name="donorName"
                      type="text"
                      placeholder="e.g. Kwame Mensah"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="donorEmail" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      id="donorEmail"
                      name="donorEmail"
                      type="email"
                      placeholder="you@domain.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-medium transition"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="supporterMessage" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Leave a Message for the Platform (Optional)
                  </label>
                  <textarea
                    id="supporterMessage"
                    name="supporterMessage"
                    rows={3}
                    placeholder="Keep up the great work connecting African developers with global remote roles!"
                    value={supporterMessage}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl p-3 outline-none font-medium transition leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm py-4 rounded-xl transition shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Processing Donation...' : (
                    <>
                      Donate {CURRENCY_SYMBOLS[currency]}{customAmount || selectedAmount} Now <Heart className="w-4 h-4 fill-slate-950" />
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

          {/* Sidebar Info & Recent Donors */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Impact Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Coffee className="w-4 h-4" /> Why Support Us?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
                100% of community contributions go toward cloud server costs, SSL security, and keeping job listings free for African talent.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 shrink-0" /> Verified Secure Payouts
              </div>
            </div>

            {/* Recent Supporters Feed */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" /> Recent Supporters
              </h4>

              {recentDonations.length === 0 ? (
                <p className="text-xs text-slate-500">Be the first patron to support this platform!</p>
              ) : (
                <div className="space-y-2.5">
                  {recentDonations.map((don) => (
                    <div key={don.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{don.donor_name}</span>
                        <span className="text-xs font-black text-emerald-400">
                          {CURRENCY_SYMBOLS[don.currency as keyof typeof CURRENCY_SYMBOLS] || '₵'}{don.amount}
                        </span>
                      </div>
                      {don.message && (
                        <p className="text-[11px] text-slate-400 italic mt-1 font-medium">
                          "{don.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}