import React, { useState, useEffect, useMemo, useRef } from 'react'
import MenuItemCard from './MenuItemCard'
import TopPicksSection from './TopPicksSection'
import {
  Search,
  RefreshCw,
  AlertCircle,
  UtensilsCrossed,
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Soup,
  ChefHat,
  SearchX,
} from 'lucide-react'

export default function MenuBrowse({ onOrder }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [budget, setBudget] = useState(200) // ₹0–₹200
  const [diet, setDiet] = useState('all') // 'all' | 'veg' | 'non-veg'
  const [category, setCategory] = useState('all') // 'all' | 'snack' | 'meal' | 'beverage'

  // Recommendation Engine States
  const [recommendations, setRecommendations] = useState(null)
  const [recomLoading, setRecomLoading] = useState(false)
  const [recomError, setRecomError] = useState(null)

  const topPicksRef = useRef(null)

  const fetchMenu = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_URL + '/menu')
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`)
      }
      const data = await response.json()
      setItems(data)
    } catch (err) {
      console.error('Error fetching menu items:', err)
      setError(err.message || 'Unable to connect to the backend server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  // Call POST /recommend
  const handleGetRecommendations = async () => {
    setRecomLoading(true)
    setRecomError(null)

    const payload = {
      budget: Number(budget),
      veg_only: diet === 'veg',
      category: category === 'all' ? null : category,
    }

    try {
      const response = await fetch(API_URL + '/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Recommendation service returned HTTP ${response.status}`)
      }

      const data = await response.json()
      setRecommendations(data)

      // Smooth scroll to top picks
      setTimeout(() => {
        if (topPicksRef.current) {
          topPicksRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (err) {
      console.error('Recommendation fetch error:', err)
      setRecomError(err.message || 'Could not fetch recommendations.')
    } finally {
      setRecomLoading(false)
    }
  }

  // Real-time client-side multi-criteria filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Budget filter: price <= budget
      const matchesBudget = item.price <= budget

      // 2. Diet filter: all / veg / non-veg
      let matchesDiet = true
      if (diet === 'veg') {
        matchesDiet = item.is_veg === true
      } else if (diet === 'non-veg') {
        matchesDiet = item.is_veg === false
      }

      // 3. Category filter: all / snack / meal / beverage
      const matchesCategory =
        category === 'all' || item.category?.toLowerCase() === category.toLowerCase()

      // 4. Search query by name
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())

      return matchesBudget && matchesDiet && matchesCategory && matchesSearch
    })
  }, [items, budget, diet, category, searchQuery])

  // Reset all filters to default
  const handleResetFilters = () => {
    setBudget(200)
    setDiet('all')
    setCategory('all')
    setSearchQuery('')
    setRecommendations(null)
  }

  const isFiltered = budget < 200 || diet !== 'all' || category !== 'all' || searchQuery !== ''

  return (
    <section id="menu-browse" className="space-y-8 scroll-mt-24">
      {/* Header and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#7A8078]">
              LIVE COUNTER EXPLORER
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1C1F1B] tracking-tight">
            Menu Browse
          </h2>
          <p className="text-sm sm:text-base text-[#555C54] leading-relaxed">
            Live prices, ratings, preparation wait times, and current counter availability.
          </p>
        </div>

        {/* Search Bar at the Top */}
        <div className="w-full md:w-80">
          <label htmlFor="menu-search" className="sr-only">
            Search menu by name
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C928B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="menu-search"
              type="text"
              placeholder="Search items by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white rounded-full border border-[#E0DBD0] text-sm text-[#1C1F1B] placeholder-[#8C928B] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/25 focus:border-[#2D5A43] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8C928B] hover:text-[#1C1F1B] rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#7A8078]">
            <SlidersHorizontal className="w-4 h-4 text-[#2D5A43]" />
            <span>Customize Constraints</span>
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#2D5A43] hover:text-[#234735] hover:underline transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* 1. Budget Slider Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="budget-slider" className="text-sm font-medium text-[#1C1F1B]">
                Budget Limit
              </label>
              <span className="font-serif text-2xl font-normal text-[#1C1F1B]">
                ₹{budget}
              </span>
            </div>

            <input
              id="budget-slider"
              type="range"
              min="0"
              max="200"
              step="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2.5 bg-[#EBE7DF] rounded-lg appearance-none cursor-pointer accent-[#2D5A43]"
            />

            <div className="flex justify-between text-[11px] text-[#8C928B] font-medium">
              <span>₹0</span>
              <span>Max: ₹200</span>
            </div>
          </div>

          {/* 2. Veg / Non-Veg Toggle Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1C1F1B]">Diet</span>
              <span className="text-xs text-[#7A8078] capitalize">
                {diet === 'all' ? 'All items' : diet === 'veg' ? 'Veg only' : 'Non-veg only'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#F7F5EE] rounded-2xl border border-[#E8E4DA]">
              <button
                type="button"
                onClick={() => setDiet('all')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  diet === 'all'
                    ? 'bg-[#2D5A43] text-white shadow-xs'
                    : 'text-[#5F655E] hover:text-[#1C1F1B]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDiet('veg')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  diet === 'veg'
                    ? 'bg-[#2D5A43] text-white shadow-xs'
                    : 'text-[#5F655E] hover:text-[#1C1F1B]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Veg</span>
              </button>
              <button
                type="button"
                onClick={() => setDiet('non-veg')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  diet === 'non-veg'
                    ? 'bg-[#2D5A43] text-white shadow-xs'
                    : 'text-[#5F655E] hover:text-[#1C1F1B]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                <span>Non-veg</span>
              </button>
            </div>
          </div>

          {/* 3. Category Dropdown Control */}
          <div className="space-y-3">
            <label htmlFor="category-select" className="text-sm font-medium text-[#1C1F1B] block">
              Meal Category
            </label>
            <div className="relative">
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2.5 px-4 bg-[#FAF8F5] rounded-2xl border border-[#DCD6CA] text-sm text-[#1C1F1B] font-medium focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition cursor-pointer appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="snack">Snacks</option>
                <option value="meal">Meals</option>
                <option value="beverage">Beverages</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#7A8078]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: "What Should I Eat?" */}
        <div className="pt-5 border-t border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#6B726A] flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            <span>Scores rating (50%), fullness (30%), and counter queue (20%)</span>
          </div>

          <button
            type="button"
            onClick={handleGetRecommendations}
            disabled={recomLoading}
            className="inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-full bg-[#2D5A43] hover:bg-[#234735] active:scale-[0.99] text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {recomLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Finding Best Dishes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>What Should I Eat?</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* "Your Top Picks" Section */}
      <div ref={topPicksRef}>
        <TopPicksSection
          recommendations={recommendations}
          loading={recomLoading}
          error={recomError}
          onClear={() => setRecommendations(null)}
          onRetry={handleGetRecommendations}
          onOrder={onOrder}
        />
      </div>

      {/* Results Count & Filter Pill Summary */}
      {!loading && !error && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#7A8078] font-medium border-b border-[#EAE6DD] pb-3">
          <div className="flex items-center space-x-2">
            <span>
              Showing <strong className="text-[#1C1F1B] text-sm">{filteredItems.length}</strong> of{' '}
              <strong className="text-[#1C1F1B]">{items.length}</strong> dishes
            </span>
          </div>

          {isFiltered && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#8C928B]">Active filters:</span>
              {budget < 200 && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#E8EFEA] text-[#2D5A43] font-semibold text-[11px] border border-[#D1E0D7]">
                  <span>≤ ₹{budget}</span>
                  <button onClick={() => setBudget(200)} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {diet !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#E8EFEA] text-[#2D5A43] font-semibold text-[11px] capitalize border border-[#D1E0D7]">
                  <span>{diet === 'veg' ? 'Veg only' : 'Non-veg only'}</span>
                  <button onClick={() => setDiet('all')} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {category !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#E8EFEA] text-[#2D5A43] font-semibold text-[11px] capitalize border border-[#D1E0D7]">
                  <span>{category}</span>
                  <button onClick={() => setCategory('all')} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#E8EFEA] text-[#2D5A43] font-semibold text-[11px] border border-[#D1E0D7]">
                  <span>"{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:opacity-75 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-[#E8E4DA] p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="w-20 h-20 bg-[#ECE8DF] rounded-2xl" />
                <div className="w-16 h-6 bg-[#ECE8DF] rounded-md" />
              </div>
              <div className="h-6 bg-[#ECE8DF] rounded w-3/4" />
              <div className="h-4 bg-[#ECE8DF] rounded w-1/2" />
              <div className="h-8 bg-[#ECE8DF] rounded w-1/3 pt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-3xl p-8 text-center space-y-3 shadow-xs">
          <div className="inline-flex p-3 rounded-full bg-[#FDE8E8] text-[#C81E1E]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl text-[#991B1B]">Failed to load menu items</h3>
          <p className="text-xs sm:text-sm text-[#7F1D1D] max-w-md mx-auto leading-relaxed">
            {error} Make sure your FastAPI backend is running on{' '}
            <code className="bg-[#FEE2E2] px-1.5 py-0.5 rounded font-mono">
              http://localhost:8000
            </code>
          </p>
          <button
            onClick={fetchMenu}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#991B1B] text-white text-xs font-semibold hover:bg-[#7F1D1D] transition cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Polished Empty State for Filters */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="bg-white rounded-3xl border border-[#E8E4DA] p-10 sm:p-14 text-center space-y-5 shadow-xs animate-fadeIn max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FAF8F5] border border-[#E8E4DA] flex items-center justify-center text-3xl shadow-xs">
            🍲
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#1C1F1B]">
              No matching dishes on the counter
            </h3>
            <p className="text-sm text-[#6B726A] max-w-md mx-auto leading-relaxed">
              We couldn't find any dish matching budget ≤ <strong>₹{budget}</strong>, {diet !== 'all' ? `diet "${diet}"` : 'all diets'}, and category "{category}".
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-2 px-7 py-3 rounded-full bg-[#2D5A43] text-white text-xs font-semibold hover:bg-[#234735] transition shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Menu Cards Grid with Smooth Transitions */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7A8078]">
              All Matching Counter Dishes
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onOrder={onOrder} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
