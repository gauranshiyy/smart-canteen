import { API_URL } from '../../config';
import React, { useState, useEffect } from 'react'
import AdminItemModal from './AdminItemModal'
import AdminOrdersTab from './AdminOrdersTab'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  UtensilsCrossed,
  Layers,
  Sparkles,
  AlertTriangle,
  Clock,
  Star,
  ShieldCheck,
  ShoppingBag,
  X,
  ChefHat,
} from 'lucide-react'

export default function AdminDashboard({ adminPassword, onLogout, onSwitchToStudentView }) {
  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'menu'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState(null)
  const [placedOrderCount, setPlacedOrderCount] = useState(0)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch all menu items
  const fetchMenuItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL + '/menu')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data)
    } catch (err) {
      setError('Could not load menu items from backend.')
    } finally {
      setLoading(false)
    }
  }

  // Poll orders count for tab badge
  const checkPendingOrders = async () => {
    try {
      const res = await fetch(API_URL + '/orders')
      if (res.ok) {
        const orders = await res.json()
        const unActioned = orders.filter((o) => o.status === 'placed').length
        setPlacedOrderCount(unActioned)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchMenuItems()
    checkPendingOrders()
    const interval = setInterval(checkPendingOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  // Toggle Availability Inline
  const handleToggleAvailability = async (item) => {
    const newStatus = !item.is_available

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_available: newStatus } : i))
    )

    try {
      const res = await fetch(API_URL + `/admin/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ is_available: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Failed to update status on server')
      }

      showToast(`"${item.name}" marked as ${newStatus ? 'Available ✅' : 'Unavailable ❌'}`)
    } catch (err) {
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: item.is_available } : i))
      )
      alert('Failed to update availability: ' + err.message)
    }
  }

  // Create or Edit Item
  const handleSaveItem = async (formData, itemId) => {
    const isEdit = !!itemId
    const url = isEdit
      ? API_URL + `/admin/menu/${itemId}`
      : API_URL + '/admin/menu'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword,
      },
      body: JSON.stringify(formData),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || 'Server rejected item update')
    }

    const savedItem = await res.json()

    if (isEdit) {
      setItems((prev) => prev.map((i) => (i.id === itemId ? savedItem : i)))
      showToast(`Updated "${savedItem.name}" successfully!`)
    } else {
      setItems((prev) => [...prev, savedItem])
      showToast(`Added "${savedItem.name}" to menu!`)
    }
  }

  // Delete Item
  const handleDeleteItem = async (itemId) => {
    try {
      const res = await fetch(API_URL + `/admin/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': adminPassword,
        },
      })

      if (!res.ok) {
        throw new Error('Failed to delete item from server')
      }

      const deletedItemName = items.find((i) => i.id === itemId)?.name || 'Item'
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      setDeleteConfirmId(null)
      showToast(`Deleted "${deletedItemName}" from counter.`)
    } catch (err) {
      alert('Delete error: ' + err.message)
    }
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const availableCount = items.filter((i) => i.is_available).length
  const unavailableCount = items.length - availableCount

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1F1B] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 border border-[#2D5A43] text-sm font-medium animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8EFEA] text-[#2D5A43] border border-[#D1E0D7]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Staff Management Portal</span>
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1F1B]">
              Kitchen & Counter Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#6B726A]">
              Live incoming student orders, counter status progression, and dish availability.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'menu' && (
              <button
                onClick={() => {
                  setEditingItem(null)
                  setIsModalOpen(true)
                }}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#2D5A43] hover:bg-[#234735] text-white text-sm font-medium transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Dish</span>
              </button>
            )}

            <button
              onClick={onSwitchToStudentView}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-full border border-[#DCD6CA] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-sm font-medium text-[#1C1F1B] transition cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4 text-[#7A8078]" />
              <span>Student View</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center space-x-1.5 px-4 py-3 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center space-x-2 mt-8 pt-6 border-t border-[#EFECE6]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${activeTab === 'orders'
                ? 'bg-[#1C1F1B] text-white shadow-sm'
                : 'bg-[#FAF8F5] border border-[#E8E4DA] text-[#555C54] hover:bg-[#F2EFE9]'
              }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Incoming Orders</span>
            {placedOrderCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                {placedOrderCount} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${activeTab === 'menu'
                ? 'bg-[#1C1F1B] text-white shadow-sm'
                : 'bg-[#FAF8F5] border border-[#E8E4DA] text-[#555C54] hover:bg-[#F2EFE9]'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Menu & Availability ({items.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'orders' ? (
        /* INCOMING ORDERS TAB */
        <AdminOrdersTab adminPassword={adminPassword} showToast={showToast} />
      ) : (
        /* MENU & AVAILABILITY MANAGEMENT TAB */
        <div className="space-y-6">
          {/* Quick Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#E8E4DA] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase text-[#7A8078]">Total Menu Items</div>
                <div className="font-serif text-3xl text-[#1C1F1B] mt-1">{items.length}</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] flex items-center justify-center text-lg font-bold text-[#1C1F1B]">
                🍱
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#E8EFEA]/50 border border-[#D1E0D7] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase text-[#2D5A43]">Ready at Counter</div>
                <div className="font-serif text-3xl text-[#2D5A43] mt-1">{availableCount}</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#E8EFEA] text-[#2D5A43] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FEF2F2]/60 border border-[#FEE2E2] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase text-[#991B1B]">Sold Out / Prep</div>
                <div className="font-serif text-3xl text-[#991B1B] mt-1">{unavailableCount}</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#FDE8E8] text-[#991B1B] flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Table & Controls Container */}
          <div className="bg-white rounded-3xl border border-[#E8E4DA] overflow-hidden shadow-xs">
            {/* Table Top Bar */}
            <div className="p-6 border-b border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#8C928B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search dishes by name or category..."
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

              <div className="flex items-center space-x-3 text-xs text-[#7A8078] font-medium">
                <span>
                  Showing <strong className="text-[#1C1F1B]">{filteredItems.length}</strong> of{' '}
                  <strong className="text-[#1C1F1B]">{items.length}</strong> items
                </span>
                <button
                  onClick={fetchMenuItems}
                  className="p-1.5 hover:bg-[#F2EFE9] rounded-xl transition cursor-pointer"
                  title="Refresh table"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Responsive Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#EFECE6] bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#7A8078]">
                    <th className="py-4 px-6">Dish</th>
                    <th className="py-4 px-4">Diet</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4">Rating</th>
                    <th className="py-4 px-4">Wait Time</th>
                    <th className="py-4 px-4 text-center">Counter Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6] text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-sm text-[#7A8078]">
                        Loading counter menu data...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-sm text-[#7A8078]">
                        No dishes found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#FAF8F5]/80 transition-colors ${!item.is_available ? 'bg-neutral-50/50' : ''
                          }`}
                      >
                        {/* Dish & Thumbnail */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#F2EFE9] border border-[#E8E4DA] overflow-hidden shrink-0">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#7A8078]">
                                  🍲
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-[#1C1F1B]">{item.name}</div>
                              <div className="text-xs text-[#7A8078] capitalize">{item.category}</div>
                            </div>
                          </div>
                        </td>

                        {/* Veg / Non-Veg */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.is_veg
                                ? 'bg-[#E8EFEA] text-[#2D5A43] border border-[#CDE0D4]'
                                : 'bg-[#FDE8E8] text-[#991B1B] border border-[#F8B4B4]'
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-[#2D5A43]' : 'bg-[#991B1B]'
                                }`}
                            />
                            <span>{item.is_veg ? 'VEG' : 'NON-VEG'}</span>
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4 font-serif text-lg text-[#1C1F1B]">
                          ₹{Math.round(item.price)}
                        </td>

                        {/* Rating */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1 text-xs font-medium">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{item.rating?.toFixed(1)}</span>
                          </div>
                        </td>

                        {/* Wait Time */}
                        <td className="py-4 px-4 text-xs text-[#5F655E]">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-[#7A8078]" />
                            <span>{item.estimated_wait_time}m</span>
                          </div>
                        </td>

                        {/* Availability Toggle Switch */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(item)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition shadow-xs cursor-pointer ${item.is_available
                                ? 'bg-[#E8EFEA] hover:bg-[#D4E4D8] text-[#2D5A43] border border-[#CDE0D4]'
                                : 'bg-neutral-800 hover:bg-neutral-900 text-neutral-200 border border-neutral-700'
                              }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-1.5 ${item.is_available ? 'bg-emerald-500' : 'bg-red-400'
                                }`}
                            />
                            <span>{item.is_available ? 'In Stock' : 'Sold Out'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                setEditingItem(item)
                                setIsModalOpen(true)
                              }}
                              className="p-2 rounded-xl border border-[#DCD6CA] bg-white hover:bg-[#F2EFE9] text-[#1C1F1B] transition cursor-pointer"
                              title="Edit Item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            {deleteConfirmId === item.id ? (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-medium transition cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="p-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 transition cursor-pointer"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add / Edit Modal */}
          <AdminItemModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveItem}
            initialItem={editingItem}
          />
        </div>
      )}
    </div>
  )
}
