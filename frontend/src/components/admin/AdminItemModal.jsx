import React, { useState, useEffect } from 'react'
import { X, Plus, Save, Sparkles, AlertCircle } from 'lucide-react'

export default function AdminItemModal({ isOpen, onClose, onSave, initialItem = null }) {
  const isEditing = !!initialItem

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'meal',
    is_veg: true,
    rating: 4.5,
    filling_score: 4,
    estimated_wait_time: 10,
    is_available: true,
    image_url: '',
  })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (initialItem) {
      setFormData({
        name: initialItem.name || '',
        price: initialItem.price || '',
        category: initialItem.category || 'meal',
        is_veg: initialItem.is_veg ?? true,
        rating: initialItem.rating ?? 4.5,
        filling_score: initialItem.filling_score ?? 4,
        estimated_wait_time: initialItem.estimated_wait_time ?? 10,
        is_available: initialItem.is_available ?? true,
        image_url: initialItem.image_url || '',
      })
    } else {
      setFormData({
        name: '',
        price: '',
        category: 'meal',
        is_veg: true,
        rating: 4.5,
        filling_score: 4,
        estimated_wait_time: 10,
        is_available: true,
        image_url: '',
      })
    }
    setError(null)
  }, [initialItem, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Dish name is required.')
      return
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setError('Please enter a valid price.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        is_veg: formData.is_veg,
        rating: parseFloat(formData.rating),
        filling_score: parseInt(formData.filling_score, 10),
        estimated_wait_time: parseInt(formData.estimated_wait_time, 10),
        is_available: formData.is_available,
        image_url: formData.image_url.trim() || null,
      }

      await onSave(payload, initialItem?.id)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save menu item.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#E8E4DA] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-5 border-b border-[#EFECE6] flex items-center justify-between z-10">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7A8078]">
              {isEditing ? 'UPDATE COUNTER ITEM' : 'ADD NEW DISH'}
            </span>
            <h3 className="font-serif text-2xl text-[#1C1F1B]">
              {isEditing ? `Edit "${initialItem.name}"` : 'Create New Menu Item'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F2EFE9] text-[#7A8078] hover:text-[#1C1F1B] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dish Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1C1F1B] block">Dish Name *</label>
            <input
              type="text"
              placeholder="e.g. Paneer Butter Masala Bowl"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#FAF8F5] rounded-xl border border-[#DCD6CA] text-sm text-[#1C1F1B] focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] outline-none"
              required
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C1F1B] block">Price (₹) *</label>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="e.g. 85"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#FAF8F5] rounded-xl border border-[#DCD6CA] text-sm text-[#1C1F1B] focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C1F1B] block">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#FAF8F5] rounded-xl border border-[#DCD6CA] text-sm text-[#1C1F1B] focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] outline-none"
              >
                <option value="meal">Meal</option>
                <option value="snack">Snack</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>
          </div>

          {/* Veg / Non-Veg & Availability Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F6F4EE] rounded-2xl border border-[#E8E4DA]">
            {/* Veg Switch */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1C1F1B]">Dietary Type</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_veg: !formData.is_veg })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  formData.is_veg
                    ? 'bg-[#E8EFEA] text-[#2D5A43] border border-[#CDE0D4]'
                    : 'bg-[#FDE8E8] text-[#991B1B] border border-[#F8B4B4]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    formData.is_veg ? 'bg-[#2D5A43]' : 'bg-[#991B1B]'
                  }`}
                />
                <span>{formData.is_veg ? 'VEG' : 'NON-VEG'}</span>
              </button>
            </div>

            {/* Availability Switch */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1C1F1B]">Status</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  formData.is_available
                    ? 'bg-[#2D5A43] text-white shadow-sm'
                    : 'bg-neutral-800 text-neutral-200'
                }`}
              >
                {formData.is_available ? 'Available' : 'Unavailable'}
              </button>
            </div>
          </div>

          {/* Rating, Filling Score, Wait Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C1F1B] block">Rating (0 - 5.0)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-4 py-2 bg-[#FAF8F5] rounded-xl border border-[#DCD6CA] text-sm text-[#1C1F1B] focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C1F1B] block">Filling (1 - 5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.filling_score}
                onChange={(e) => setFormData({ ...formData, filling_score: e.target.value })}
                className="w-full px-4 py-2 bg-[#FAF8F5] rounded-xl border border-[#DCD6CA] text-sm text-[#1C1F1B] focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C1F1B] block">Wait Time (min)</label>
              <input
                type="number"
                min="0"
                value={formData.estimated_wait_time}
                onChange={(e) => setFormData({ ...formData, estimated_wait_time: e.target.value })}
                className="w-full px-4 py-2 bg-[#FAF8F5] rounded-xl border border-[#DCD6CA] text-sm text-[#1C1F1B] focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] outline-none"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1C1F1B] block">
              Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 bg-[#FAF8F5] rounded-xl border border-[#DCD6CA] text-sm text-[#1C1F1B] focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#EFECE6] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#DCD6CA] text-sm font-medium text-[#1C1F1B] hover:bg-[#F2EFE9] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-2.5 rounded-full bg-[#2D5A43] hover:bg-[#234735] text-white text-sm font-medium transition-all shadow-md disabled:opacity-60 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Dish' : 'Add to Menu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
