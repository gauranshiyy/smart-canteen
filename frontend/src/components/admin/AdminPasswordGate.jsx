import React, { useState } from 'react'
import { Lock, ArrowRight, ShieldAlert, KeyRound, Sparkles } from 'lucide-react'

export default function AdminPasswordGate({ onAuthenticated, onCancel }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter the admin password.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:8000/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        onAuthenticated(password)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.detail || 'Incorrect admin password. Try: admin123')
      }
    } catch (err) {
      setError('Could not connect to backend server. Make sure FastAPI is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8E4DA] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-6">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#E8EFEA] text-[#2D5A43] flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#7A8078]">
            STAFF ACCESS ONLY
          </span>
          <h2 className="font-serif text-3xl text-[#1C1F1B]">Admin Portal</h2>
          <p className="text-xs sm:text-sm text-[#6B726A] leading-relaxed">
            Enter the canteen management security password to update live prices, availability, and menu items.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#DC2626]" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-pass" className="text-xs font-semibold text-[#1C1F1B] block">
              Admin Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8C928B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-pass"
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full pl-11 pr-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DCD6CA] text-sm text-[#1C1F1B] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition"
              />
            </div>
          </div>

          {/* Quick Demo Hint Pill */}
          <div className="p-3 bg-[#F6F4EE] rounded-xl border border-[#E8E4DA] text-[11px] text-[#555C54] flex items-center justify-between">
            <span>Demo Password:</span>
            <button
              type="button"
              onClick={() => setPassword('admin123')}
              className="font-mono font-bold text-[#2D5A43] hover:underline"
            >
              admin123 (click to autofill)
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-[#2D5A43] hover:bg-[#234735] text-white font-medium text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Verifying...' : 'Unlock Admin Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#7A8078] hover:text-[#1C1F1B] transition underline"
          >
            ← Return to Student View
          </button>
        </div>
      </div>
    </div>
  )
}
