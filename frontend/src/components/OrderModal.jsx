import React, { useState, useEffect } from 'react'
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ChefHat,
} from 'lucide-react'

export default function OrderModal({ isOpen, onClose, item, onOrderPlaced }) {
  const [quantity, setQuantity] = useState(1)
  const [studentName, setStudentName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [placedOrder, setPlacedOrder] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setError(null)
      setPlacedOrder(null)
    }
  }, [isOpen, item])

  if (!isOpen || !item) return null

  const totalPrice = Math.round(item.price * quantity)

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          item_id: item.id,
          quantity: quantity,
          student_name: studentName.trim() || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Server returned HTTP ${res.status}`)
      }

      const newOrder = await res.json()
      setPlacedOrder(newOrder)
      if (onOrderPlaced) {
        onOrderPlaced(newOrder)
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#E8E4DA] w-full max-w-lg overflow-hidden shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#EFECE6] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-[#E8EFEA] text-[#2D5A43] flex items-center justify-center text-sm font-bold">
              🛍️
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A8078]">
              {placedOrder ? 'Order Confirmation' : 'Place Counter Order'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EAE5DA] text-[#7A8078] hover:text-[#1C1F1B] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {placedOrder ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="text-center space-y-6 animate-fadeIn">
              {/* Success Badge */}
              <div className="w-16 h-16 rounded-3xl bg-[#E8EFEA] text-[#2D5A43] flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                  Order #{placedOrder.id} • {placedOrder.status.toUpperCase()}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#1C1F1B]">
                  Order placed!
                </h3>
                <p className="text-sm text-[#555C54] max-w-sm mx-auto leading-relaxed">
                  Head to the counter — they're preparing it now.
                </p>
              </div>

              {/* Order Summary Card */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] text-left space-y-3">
                <div className="flex items-center justify-between border-b border-[#EFECE6] pb-2 text-xs text-[#7A8078] font-semibold uppercase">
                  <span>Dish Summary</span>
                  <span>Total Bill</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#1C1F1B] text-base">
                      {placedOrder.quantity}x {placedOrder.item_name}
                    </div>
                    {placedOrder.student_name && (
                      <div className="text-xs text-[#6B726A]">
                        Student: <strong>{placedOrder.student_name}</strong>
                      </div>
                    )}
                  </div>
                  <div className="font-serif text-2xl text-[#1C1F1B]">
                    ₹{Math.round(placedOrder.total_price)}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-[#2D5A43] pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. Wait Time: ~{item.estimated_wait_time ?? 10} minutes</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#2D5A43] hover:bg-[#234735] text-white text-sm font-medium transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Track My Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* ORDER FORM */
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Selected Item Preview */}
              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA]">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E8E4DA] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#F2EFE9] border border-[#E8E4DA] flex items-center justify-center text-2xl shrink-0">
                    🍱
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        item.is_veg ? 'bg-[#2D5A43]' : 'bg-[#991B1B]'
                      }`}
                    />
                    <span className="text-xs text-[#7A8078] capitalize font-medium">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-serif text-xl text-[#1C1F1B] leading-snug">
                    {item.name}
                  </h4>
                  <div className="text-sm font-semibold text-[#1C1F1B] mt-0.5">
                    ₹{Math.round(item.price)} each
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1C1F1B] uppercase tracking-wider block">
                  Select Quantity
                </label>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA]">
                  <span className="text-sm text-[#555C54]">Number of plates/items:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-xl bg-white border border-[#DCD6CA] flex items-center justify-center text-[#1C1F1B] hover:bg-[#F2EFE9] disabled:opacity-40 transition cursor-pointer shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="font-serif text-2xl text-[#1C1F1B] w-6 text-center">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                      className="w-9 h-9 rounded-xl bg-white border border-[#DCD6CA] flex items-center justify-center text-[#1C1F1B] hover:bg-[#F2EFE9] disabled:opacity-40 transition cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Student Name / Identifier (Optional) */}
              <div className="space-y-2">
                <label htmlFor="student-name-input" className="text-xs font-semibold text-[#1C1F1B] uppercase tracking-wider block">
                  Student Name (Optional)
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  placeholder="e.g. Rahul Verma / Roll 42"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF8F5] rounded-2xl border border-[#DCD6CA] text-sm text-[#1C1F1B] focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] outline-none"
                />
              </div>

              {/* Total & Submit Button */}
              <div className="pt-4 border-t border-[#EFECE6] flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold text-[#7A8078] uppercase tracking-wider">
                    Total Amount
                  </div>
                  <div className="font-serif text-3xl text-[#1C1F1B]">
                    ₹{totalPrice}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-3.5 px-8 rounded-full bg-[#2D5A43] hover:bg-[#234735] text-white text-sm font-medium transition shadow-md hover:shadow-lg disabled:opacity-60 flex items-center space-x-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{loading ? 'Placing Order...' : 'Confirm Order'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
