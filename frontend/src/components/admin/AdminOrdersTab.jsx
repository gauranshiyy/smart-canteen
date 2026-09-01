import React, { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  ShoppingBag,
  RefreshCw,
  Search,
  X,
  AlertCircle,
  Filter,
  ArrowRight,
  Flame,
} from 'lucide-react'

export default function AdminOrdersTab({ adminPassword, showToast }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'placed' | 'preparing' | 'ready' | 'completed'
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [lastSynced, setLastSynced] = useState(new Date())

  // Fetch orders from GET /orders
  const fetchOrders = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL + '/orders')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setOrders(data)
      setLastSynced(new Date())
    } catch (err) {
      setError('Could not sync orders from backend.')
    } finally {
      if (!isBackground) setLoading(false)
    }
  }, [])

  // Initial fetch and auto-refresh every 10 seconds
  useEffect(() => {
    fetchOrders(false)
    const interval = setInterval(() => {
      fetchOrders(true)
    }, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  // Update order status via PUT /orders/{id}/status
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId)

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )

    try {
      const res = await fetch(API_URL + `/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Failed to update status on server')
      }

      const updated = await res.json()
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))

      if (showToast) {
        showToast(`Order #${orderId} moved to "${newStatus.toUpperCase()}"`)
      }
    } catch (err) {
      alert('Failed to update order status: ' + err.message)
      fetchOrders(false)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Format order created_at timestamp
  const formatTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesSearch =
      !searchQuery.trim() ||
      order.item_name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (order.student_name &&
        order.student_name.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
      `#${order.id}`.includes(searchQuery.trim())

    return matchesStatus && matchesSearch
  })

  // Summary counts
  const placedCount = orders.filter((o) => o.status === 'placed').length
  const preparingCount = orders.filter((o) => o.status === 'preparing').length
  const readyCount = orders.filter((o) => o.status === 'ready').length
  const completedCount = orders.filter((o) => o.status === 'completed').length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Orders Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Placed / New Orders */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'placed' ? 'all' : 'placed')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            placedCount > 0
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white border-[#E8E4DA]'
          } ${statusFilter === 'placed' ? 'ring-2 ring-amber-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1">
              {placedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block mr-1" />
              )}
              <span>New Placed</span>
            </span>
            <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xs">
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="font-serif text-3xl sm:text-4xl text-amber-900 mt-2">
            {placedCount}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">Requires kitchen action</div>
        </div>

        {/* Preparing */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'preparing' ? 'all' : 'preparing')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E4DA] transition-all cursor-pointer ${
            statusFilter === 'preparing' ? 'ring-2 ring-[#2D5A43] bg-[#FAF8F5]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#555C54]">
              Preparing
            </span>
            <span className="w-7 h-7 rounded-xl bg-[#E8EFEA] text-[#2D5A43] flex items-center justify-center text-xs">
              <ChefHat className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="font-serif text-3xl sm:text-4xl text-[#1C1F1B] mt-2">
            {preparingCount}
          </div>
          <div className="text-[11px] text-[#7A8078] mt-1">Cooking in kitchen</div>
        </div>

        {/* Ready */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'ready' ? 'all' : 'ready')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E4DA] transition-all cursor-pointer ${
            statusFilter === 'ready' ? 'ring-2 ring-emerald-500 bg-[#FAF8F5]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2D5A43]">
              Ready at Counter
            </span>
            <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
              <BellRing className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="font-serif text-3xl sm:text-4xl text-[#2D5A43] mt-2">
            {readyCount}
          </div>
          <div className="text-[11px] text-[#2D5A43]/80 mt-1">Awaiting student pickup</div>
        </div>

        {/* Completed */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E4DA] transition-all cursor-pointer ${
            statusFilter === 'completed' ? 'ring-2 ring-neutral-700 bg-[#FAF8F5]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A8078]">
              Completed
            </span>
            <span className="w-7 h-7 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] text-[#7A8078] flex items-center justify-center text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="font-serif text-3xl sm:text-4xl text-[#7A8078] mt-2">
            {completedCount}
          </div>
          <div className="text-[11px] text-[#8C928B] mt-1">Fulfilled orders</div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-[#E8E4DA] overflow-hidden shadow-xs">
        {/* Table Filter & Search Header */}
        <div className="p-5 sm:p-6 border-b border-[#EFECE6] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#8C928B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student, dish, or #id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-[#FAF8F5] rounded-full border border-[#DCD6CA] text-sm text-[#1C1F1B] focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8C928B] hover:text-[#1C1F1B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Chips & Sync Indicator */}
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'placed', 'preparing', 'ready', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#2D5A43] text-white shadow-xs'
                    : 'bg-[#FAF8F5] border border-[#DCD6CA] text-[#555C54] hover:bg-[#F2EFE9]'
                }`}
              >
                {st === 'all' ? 'All Orders' : st}
              </button>
            ))}

            <button
              onClick={() => fetchOrders(false)}
              className="p-2 rounded-full border border-[#DCD6CA] bg-white hover:bg-[#FAF8F5] text-[#7A8078] hover:text-[#1C1F1B] transition cursor-pointer ml-1"
              title={`Auto-refreshes every 10s • Last synced: ${lastSynced.toLocaleTimeString()}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#EFECE6] bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#7A8078]">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-4">Dish & Qty</th>
                <th className="py-4 px-4">Student</th>
                <th className="py-4 px-4">Placed At</th>
                <th className="py-4 px-4">Total Bill</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6] text-sm">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm text-[#7A8078]">
                    Loading incoming orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center space-y-3">
                    <div className="text-3xl">📭</div>
                    <div className="font-serif text-xl text-[#1C1F1B]">No orders found</div>
                    <p className="text-xs text-[#7A8078] max-w-sm mx-auto">
                      {statusFilter !== 'all'
                        ? `No orders currently in "${statusFilter}" status.`
                        : 'No student orders have been placed yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isNew = order.status === 'placed'
                  const isReady = order.status === 'ready'
                  const isCompleted = order.status === 'completed'
                  const isPreparing = order.status === 'preparing'

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isNew
                          ? 'bg-amber-50/70 hover:bg-amber-50/90 font-medium'
                          : isReady
                          ? 'bg-emerald-50/40 hover:bg-emerald-50/60'
                          : 'hover:bg-[#FAF8F5]/80'
                      }`}
                    >
                      {/* Order ID & New Badge */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif text-base font-bold text-[#1C1F1B]">
                            #{order.id}
                          </span>
                          {isNew && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white animate-pulse">
                              <Flame className="w-2.5 h-2.5" />
                              <span>NEW</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Dish & Quantity */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#1C1F1B]">
                          {order.quantity}x {order.item_name}
                        </div>
                        <div className="text-xs text-[#7A8078]">
                          @ ₹{Math.round(order.item_price)} each
                        </div>
                      </td>

                      {/* Student Name */}
                      <td className="py-4 px-4">
                        {order.student_name ? (
                          <div className="font-medium text-[#1C1F1B]">
                            {order.student_name}
                          </div>
                        ) : (
                          <span className="text-xs text-[#8C928B] italic">
                            Counter Walk-in
                          </span>
                        )}
                      </td>

                      {/* Time Placed */}
                      <td className="py-4 px-4 text-xs text-[#555C54]">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-[#7A8078]" />
                          <span>{formatTime(order.created_at)}</span>
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="py-4 px-4 font-serif text-base font-semibold text-[#1C1F1B]">
                        ₹{Math.round(order.total_price)}
                      </td>

                      {/* Current Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.id}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border cursor-pointer transition outline-none ${
                            isNew
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : isPreparing
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : isReady
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                          }`}
                        >
                          <option value="placed">Placed 📋</option>
                          <option value="preparing">Preparing 🍳</option>
                          <option value="ready">Ready 🔔</option>
                          <option value="completed">Completed ✅</option>
                        </select>
                      </td>

                      {/* 1-Click Quick Action Button */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isNew && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'preparing')}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                            >
                              <ChefHat className="w-3.5 h-3.5" />
                              <span>Start Prep</span>
                            </button>
                          )}

                          {isPreparing && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'ready')}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#2D5A43] hover:bg-[#234735] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                              <span>Mark Ready</span>
                            </button>
                          )}

                          {isReady && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          )}

                          {isCompleted && (
                            <span className="text-xs text-emerald-700 font-medium inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Fulfilled</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
