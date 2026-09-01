import React, { useState, useEffect } from 'react'
import {
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', desc: 'Received at counter', icon: ShoppingBag },
  { key: 'preparing', label: 'Preparing', desc: 'Cooking in kitchen', icon: ChefHat },
  { key: 'ready', label: 'Ready for Pickup', desc: 'Collect at counter!', icon: BellRing },
  { key: 'completed', label: 'Completed', desc: 'Enjoy your meal!', icon: CheckCircle2 },
]

export default function OrderTracker({ activeOrderIds, onDismissOrder }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    try {
      const res = await fetch(API_URL + '/orders')
      if (!res.ok) return
      const data = await res.json()

      // Filter to only orders the student has placed in this session/localStorage
      if (activeOrderIds && activeOrderIds.length > 0) {
        const myOrders = data.filter((o) => activeOrderIds.includes(o.id))
        setOrders(myOrders)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Error polling order status:', err)
    }
  }

  // Poll orders every 3.5 seconds
  useEffect(() => {
    if (activeOrderIds && activeOrderIds.length > 0) {
      fetchOrders()
      const interval = setInterval(fetchOrders, 3500)
      return () => clearInterval(interval)
    } else {
      setOrders([])
    }
  }, [activeOrderIds])

  if (!orders || orders.length === 0) return null

  const getStepIndex = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return 0
      case 'preparing':
        return 1
      case 'ready':
        return 2
      case 'completed':
        return 3
      default:
        return 0
    }
  }

  return (
    <section id="order-tracker" className="space-y-6 pt-4 animate-fadeIn scroll-mt-24">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFECE6] pb-5 mb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8EFEA] text-[#2D5A43] border border-[#D1E0D7]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Live Kitchen Tracker</span>
              </span>
            </div>
            <h3 className="font-serif text-3xl text-[#1C1F1B]">Track My Order</h3>
            <p className="text-xs sm:text-sm text-[#6B726A]">
              Live updates syncing in real time with the campus canteen counter.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#7A8078]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Live Sync Active</span>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = getStepIndex(order.status)
            const isReady = order.status === 'ready'
            const isCompleted = order.status === 'completed'

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-6 sm:p-7 transition-all ${
                  isReady
                    ? 'border-amber-400 shadow-[0_4px_25px_rgba(245,158,11,0.15)] ring-2 ring-amber-400/30'
                    : 'border-[#E8E4DA] shadow-xs'
                }`}
              >
                {/* Order Meta Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#EFECE6]">
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#F6F4EE] border border-[#E8E4DA] flex items-center justify-center font-serif text-lg font-bold text-[#1C1F1B]">
                      #{order.id}
                    </span>
                    <div>
                      <h4 className="font-serif text-xl sm:text-2xl text-[#1C1F1B] leading-tight">
                        {order.quantity}x {order.item_name}
                      </h4>
                      <div className="text-xs text-[#7A8078]">
                        {order.student_name ? `For: ${order.student_name} • ` : ''}
                        Amount: <strong className="text-[#1C1F1B]">₹{Math.round(order.total_price)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isReady
                          ? 'bg-amber-500 text-white animate-pulse'
                          : isCompleted
                          ? 'bg-[#2D5A43] text-white'
                          : order.status === 'preparing'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-[#E8EFEA] text-[#2D5A43] border border-[#D1E0D7]'
                      }`}
                    >
                      {order.status === 'ready' ? '🔔 Ready at Counter!' : order.status}
                    </span>

                    {onDismissOrder && (
                      <button
                        onClick={() => onDismissOrder(order.id)}
                        className="text-xs text-[#8C928B] hover:text-[#1C1F1B] underline transition cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>

                {/* Stepper Progress Bar */}
                <div className="pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {STATUS_STEPS.map((step, idx) => {
                      const isPastOrCurrent = idx <= currentStepIdx
                      const isCurrent = idx === currentStepIdx
                      const Icon = step.icon

                      return (
                        <div
                          key={step.key}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                            isCurrent
                              ? isReady
                                ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
                                : 'bg-[#E8EFEA]/60 border-[#2D5A43]/40 ring-1 ring-[#2D5A43]/20'
                              : isPastOrCurrent
                              ? 'bg-[#FAF8F5] border-[#E8E4DA]'
                              : 'bg-[#FAF9F6]/50 border-dashed border-[#E0DCD4] opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${
                                isCurrent
                                  ? isReady
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-[#2D5A43] text-white shadow-xs'
                                  : isPastOrCurrent
                                  ? 'bg-[#E8EFEA] text-[#2D5A43]'
                                  : 'bg-[#EBE7DF] text-[#8C928B]'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-bold text-[#8C928B]">
                              0{idx + 1}
                            </span>
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-[#1C1F1B]">{step.label}</div>
                            <div className="text-[11px] text-[#6B726A] mt-0.5">{step.desc}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
