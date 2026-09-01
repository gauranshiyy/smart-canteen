import { API_URL } from './config';
import React, { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import StatusCard from './components/StatusCard'
import MetricRow from './components/MetricRow'
import MenuBrowse from './components/MenuBrowse'
import OrderModal from './components/OrderModal'
import OrderTracker from './components/OrderTracker'
import AdminPasswordGate from './components/admin/AdminPasswordGate'
import AdminDashboard from './components/admin/AdminDashboard'
import { ArrowRight, ShieldCheck, Shield, UtensilsCrossed, Bug } from 'lucide-react'

export default function App() {
  // Navigation State: 'student' | 'admin' | 'debug'
  const [currentView, setCurrentView] = useState(() => {
    if (window.location.pathname.startsWith('/admin')) return 'admin'
    if (window.location.pathname === '/debug') return 'debug'
    return 'student'
  })

  // Admin Auth State (cached in sessionStorage for convenient demoing)
  const [adminPassword, setAdminPassword] = useState(() => {
    return sessionStorage.getItem('smart_canteen_admin_pass') || null
  })

  // Student Ordering States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedItemForOrder, setSelectedItemForOrder] = useState(null)
  const [activeOrderIds, setActiveOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_canteen_orders')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Backend Health State (Used for hidden /debug route testing)
  const [backendStatus, setBackendStatus] = useState('checking')
  const [loading, setLoading] = useState(false)
  const [latency, setLatency] = useState(null)
  const [error, setError] = useState(null)
  const [responseData, setResponseData] = useState(null)

  // Sync with browser URL / PopState
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin')) {
        setCurrentView('admin')
      } else if (window.location.pathname === '/debug') {
        setCurrentView('debug')
      } else {
        setCurrentView('student')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleNavigate = (view) => {
    setCurrentView(view)
    let targetUrl = '/'
    if (view === 'admin') targetUrl = '/admin'
    if (view === 'debug') targetUrl = '/debug'

    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAdminLogin = (password) => {
    setAdminPassword(password)
    sessionStorage.setItem('smart_canteen_admin_pass', password)
  }

  const handleAdminLogout = () => {
    setAdminPassword(null)
    sessionStorage.removeItem('smart_canteen_admin_pass')
  }

  // Open Order Confirmation Modal
  const handleOpenOrderModal = (item) => {
    setSelectedItemForOrder(item)
    setIsOrderModalOpen(true)
  }

  // When order is successfully placed via POST /orders
  const handleOrderPlaced = (newOrder) => {
    setActiveOrderIds((prev) => {
      const updated = [newOrder.id, ...prev.filter((id) => id !== newOrder.id)]
      localStorage.setItem('smart_canteen_orders', JSON.stringify(updated))
      return updated
    })

    // Smooth scroll to order tracker after a short delay
    setTimeout(() => {
      const el = document.getElementById('order-tracker')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 400)
  }

  const handleDismissOrder = (orderId) => {
    setActiveOrderIds((prev) => {
      const updated = prev.filter((id) => id !== orderId)
      localStorage.setItem('smart_canteen_orders', JSON.stringify(updated))
      return updated
    })
  }

  const checkBackendHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    const startTime = performance.now()

    try {
      const res = await fetch('http://localhost:8000/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      const endTime = performance.now()
      const calculatedLatency = Math.round(endTime - startTime)
      setLatency(calculatedLatency)

      if (res.ok) {
        const data = await res.json()
        setResponseData(data)
        setBackendStatus('connected')
      } else {
        throw new Error(`Server returned HTTP ${res.status}`)
      }
    } catch (err) {
      console.error('Backend connection failed:', err)
      setError(err.message || 'Connection failed')
      setBackendStatus('error')
      setResponseData(null)
      setLatency(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentView === 'debug') {
      checkBackendHealth()
    }
  }, [currentView, checkBackendHealth])

  const scrollToMenu = () => {
    const el = document.getElementById('menu-browse')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F4EE] flex flex-col font-sans text-[#1C1F1B]">
      {/* Top Navigation (Only displays student / admin views, no debug link) */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main View Router */}
      {currentView === 'admin' ? (
        /* STAFF ADMIN VIEW */
        <main className="flex-1 w-full">
          {!adminPassword ? (
            <AdminPasswordGate
              onAuthenticated={handleAdminLogin}
              onCancel={() => handleNavigate('student')}
            />
          ) : (
            <AdminDashboard
              adminPassword={adminPassword}
              onLogout={handleAdminLogout}
              onSwitchToStudentView={() => handleNavigate('student')}
            />
          )}
        </main>
      ) : currentView === 'debug' ? (
        /* HIDDEN DIAGNOSTICS & DEBUG VIEW (/debug) */
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DA]">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
                <Bug className="w-5 h-5" />
              </span>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#1C1F1B]">
                  Hidden Diagnostics Panel
                </h1>
                <p className="text-xs text-[#7A8078]">
                  Accessible only via direct /debug route. Not linked in public navigation.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleNavigate('student')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-[#DCD6CA] bg-white hover:bg-[#F2EFE9] text-xs font-semibold text-[#1C1F1B] transition cursor-pointer"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Return to App</span>
            </button>
          </div>

          <StatusCard
            status={backendStatus}
            loading={loading}
            latency={latency}
            error={error}
            responseData={responseData}
            onRetry={checkBackendHealth}
          />
        </main>
      ) : (
        /* CLEAN STUDENT PORTAL VIEW (Diagnostics removed from UI) */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
          {/* Hero Section */}
          <section className="max-w-4xl space-y-6">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#6B726A]">
                HACKVERSE • TEAM NEOPHYTES
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#1C1F1B] leading-[1.1] tracking-tight">
              Decide what to eat{' '}
              <span className="text-[#2D5A43] italic">before you join the queue.</span>
            </h1>

            <p className="text-base sm:text-xl text-[#555C54] max-w-2xl leading-relaxed font-normal">
              Smart Canteen puts the campus counter online — live prices, ratings, availability and
              honest wait times — then narrows it to the two or three dishes that actually fit your
              budget, diet and appetite.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToMenu}
                className="bg-[#2D5A43] hover:bg-[#234735] text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all shadow-sm inline-flex items-center space-x-2 cursor-pointer"
              >
                <span>What should I eat?</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={scrollToMenu}
                className="bg-white border border-[#E3DFD5] hover:bg-[#F0ECE2] text-[#1C1F1B] px-7 py-3.5 rounded-full font-medium text-sm transition-all cursor-pointer"
              >
                Browse the menu
              </button>
            </div>
          </section>

          {/* Live Order Tracker (Appears when student places an active order) */}
          <OrderTracker
            activeOrderIds={activeOrderIds}
            onDismissOrder={handleDismissOrder}
          />

          {/* Live Counter Stats Preview */}
          <section>
            <MetricRow />
          </section>

          {/* Live Menu Browsing & Recommendation Engine UI */}
          <MenuBrowse onOrder={handleOpenOrderModal} />
        </main>
      )}

      {/* Student Order Placement Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        item={selectedItemForOrder}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Footer */}
      <footer className="border-t border-[#E8E4DA] py-8 text-xs text-[#7A8078] bg-[#F4F0E8]/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Smart Canteen • Live Campus Food Intel • React (Vite) + FastAPI (Python)</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleNavigate(currentView === 'admin' ? 'student' : 'admin')}
              className="hover:text-[#1C1F1B] underline transition flex items-center space-x-1"
            >
              <Shield className="w-3 h-3" />
              <span>{currentView === 'admin' ? 'Back to Student View' : 'Staff Admin Login'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
