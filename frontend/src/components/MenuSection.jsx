import React, { useState, useEffect } from 'react'
import { Search, Sparkles, Clock, Star, Flame, Coffee, Utensils } from 'lucide-react'

// Food emojis mapping for visual flair
const FOOD_ICONS = {
  'Masala Chai': '☕',
  'Samosa Pav (2 pcs)': '🥟',
  'Egg Maggi': '🍳',
  'Aloo Paratha with Curd': '🫓',
  'Cold Coffee with Ice Cream': '🧋',
  'Masala Dosa': '🥞',
  'Paneer Kathi Wrap': '🌯',
  'Rajma Rice Bowl': '🍚',
  'Chole Bhature': '🍲',
  'Chicken Roll': '🍗',
  'Veg Fried Rice & Manchurian': '🥡',
  'Chicken Biryani Bowl': '🍗',
}

const DISH_DESCRIPTIONS = {
  'Masala Chai': 'Ginger-cardamom infused hot cutting chai.',
  'Samosa Pav (2 pcs)': 'Crispy aloo samosas in soft pav with spicy garlic chutney.',
  'Egg Maggi': 'Double egg masala Maggi with roasted spices.',
  'Aloo Paratha with Curd': 'Tawa-roasted stuffed paratha with butter & curd.',
  'Cold Coffee with Ice Cream': 'Rich blended iced coffee topped with chocolate scoop.',
  'Masala Dosa': 'Crispy golden crepe with spiced potato masala and sambar.',
  'Paneer Kathi Wrap': 'Hot off the tawa, easy to eat while walking.',
  'Rajma Rice Bowl': 'Full plate, keeps you going till evening lab.',
  'Chole Bhature': 'Fluffy hot bhature with spicy Punjabi chole.',
  'Chicken Roll': 'Spiced tandoori chicken shreds wrapped in crispy paratha.',
  'Veg Fried Rice & Manchurian': 'Classic Indo-Chinese combo bowl with thick gravy.',
  'Chicken Biryani Bowl': 'Fragrant basmati rice cooked with succulent chicken and raita.',
}

export default function MenuSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('http://localhost:8000/menu')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setItems(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load menu:', err)
        setError('Could not fetch menu from backend.')
        setLoading(false)
      })
  }, [])

  const categories = ['All', 'Meals', 'Snacks', 'Beverages']

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Meals' && item.category === 'meal') ||
      (selectedCategory === 'Snacks' && item.category === 'snack') ||
      (selectedCategory === 'Beverages' && item.category === 'beverage')

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const getFillingLabel = (score) => {
    if (score >= 5) return 'Very filling'
    if (score >= 4) return 'Filling'
    if (score >= 3) return 'Moderate'
    return 'Light bite'
  }

  return (
    <section id="menu" className="space-y-6 pt-4">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#7A8078]">
          LIVE COUNTER
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-[#1C1F1B] tracking-tight">
          Today's menu
        </h2>
        <p className="text-sm sm:text-base text-[#555C54] max-w-2xl leading-relaxed">
          Prices, ratings, wait times and availability — updated directly from the backend database.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#1C1F1B] text-white shadow-sm'
                    : 'bg-white hover:bg-[#EBE7DF] text-[#1C1F1B] border border-[#E0DBD0]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#8C928B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search the counter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-full border border-[#E0DBD0] text-sm text-[#1C1F1B] placeholder-[#8C928B] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition"
          />
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-[#6B726A]">
          Loading campus menu from SQLite database...
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error} Make sure the backend server is running at <code className="font-mono">http://localhost:8000</code>.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#6B726A] bg-white rounded-2xl border border-[#E8E4DA]">
          No items found matching your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const icon = FOOD_ICONS[item.name] || '🍲'
            const description = DISH_DESCRIPTIONS[item.name] || `${item.category} prepared fresh at the counter.`
            const simulatedRatingsCount = Math.floor(item.rating * 40 + item.id * 11)

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E8E4DA] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Icon + Veg/Non-Veg Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4EFEB] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      {icon}
                    </div>

                    <span
                      className={`text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase ${
                        item.is_veg
                          ? 'bg-[#E8EFEA] text-[#2D5A43] border border-[#D1E0D7]'
                          : 'bg-[#FDE8E8] text-[#991B1B] border border-[#F8B4B4]'
                      }`}
                    >
                      {item.is_veg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-2xl text-[#1C1F1B] font-normal tracking-tight mb-1">
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#6B726A] leading-relaxed mb-4 min-h-[36px]">
                    {description}
                  </p>

                  {/* Attributes row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5F655E] pb-4 font-medium">
                    <span className="flex items-center space-x-1 text-[#1C1F1B]">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{item.rating.toFixed(1)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-[#7A8078]" />
                      <span>{item.estimated_wait_time} min wait</span>
                    </span>
                    <span>•</span>
                    <span>{getFillingLabel(item.filling_score)}</span>
                  </div>
                </div>

                {/* Footer Price & Rating Count */}
                <div className="pt-4 border-t border-[#EFECE6] flex items-baseline justify-between">
                  <div className="font-serif text-3xl font-normal text-[#1C1F1B]">
                    ₹{Math.round(item.price)}
                  </div>
                  <div className="text-[11px] font-bold text-[#8C928B] uppercase tracking-wider">
                    {simulatedRatingsCount} RATINGS
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
