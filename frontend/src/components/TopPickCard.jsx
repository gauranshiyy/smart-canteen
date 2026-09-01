import React, { useState } from 'react'
import { Star, Clock, ChevronDown, ChevronUp, Sparkles, Zap, ShoppingBag } from 'lucide-react'

// Rank badges configuration
const RANK_CONFIG = {
  1: {
    label: '#1 Top Pick',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600',
    borderClass: 'border-amber-400/80 shadow-[0_8px_30px_rgb(245,158,11,0.12)]',
    accentText: 'text-amber-700',
  },
  2: {
    label: '#2 Runner Up',
    badgeClass: 'bg-[#2D5A43] text-white border-[#234735]',
    borderClass: 'border-[#2D5A43]/40 shadow-[0_4px_20px_rgba(45,90,67,0.08)]',
    accentText: 'text-[#2D5A43]',
  },
  3: {
    label: '#3 Great Choice',
    badgeClass: 'bg-[#5F655E] text-white border-[#4A4F49]',
    borderClass: 'border-[#E0DBD0] shadow-xs',
    accentText: 'text-[#5F655E]',
  },
}

export default function TopPickCard({ item, rank, onOrder }) {
  const [expanded, setExpanded] = useState(false)
  const rankStyle = RANK_CONFIG[rank] || RANK_CONFIG[3]

  const generateWhyThisPick = (dish) => {
    const reasons = []

    if (dish.rating >= 4.7) {
      reasons.push({
        title: 'Top Student Rating',
        desc: `Exceptional ⭐ ${dish.rating.toFixed(1)}/5.0 rating — one of the highest rated dishes on campus.`,
      })
    } else if (dish.rating >= 4.4) {
      reasons.push({
        title: 'High Rating',
        desc: `Strong ⭐ ${dish.rating.toFixed(1)}/5.0 satisfaction score among campus peers.`,
      })
    } else {
      reasons.push({
        title: 'Decent Rating',
        desc: `⭐ ${dish.rating.toFixed(1)}/5.0 steady popular choice.`,
      })
    }

    if (dish.filling_score >= 5) {
      reasons.push({
        title: 'Maximum Satiety',
        desc: '🍲 5/5 filling meal — packed portion to sustain through long lecture and lab sessions.',
      })
    } else if (dish.filling_score >= 4) {
      reasons.push({
        title: 'Substantial Bite',
        desc: '🌯 4/5 filling score — comfortably satisfying for hunger pangs.',
      })
    } else if (dish.filling_score >= 3) {
      reasons.push({
        title: 'Quick Meal',
        desc: '🥟 3/5 moderate filling — great light lunch or mid-day snack.',
      })
    } else {
      reasons.push({
        title: 'Quick Refreshment',
        desc: '☕ 1-2/5 light refreshment — fast and energizing.',
      })
    }

    if (dish.estimated_wait_time <= 3) {
      reasons.push({
        title: 'Instant Pickup',
        desc: `⏱️ Only ${dish.estimated_wait_time} min wait — grab and go without standing in queue.`,
      })
    } else if (dish.estimated_wait_time <= 10) {
      reasons.push({
        title: 'Fast Prep Time',
        desc: `⏱️ Quick ${dish.estimated_wait_time} min counter turnaround.`,
      })
    } else {
      reasons.push({
        title: 'Freshly Cooked',
        desc: `⏱️ ${dish.estimated_wait_time} min wait — made fresh on order.`,
      })
    }

    return reasons
  }

  const reasons = generateWhyThisPick(item)

  return (
    <div
      className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 ${rankStyle.borderClass}`}
    >
      <div>
        {/* Top Rank Badge + Veg Indicator */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${rankStyle.badgeClass}`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{rankStyle.label}</span>
          </span>

          <div className="flex items-center space-x-2">
            {/* Score Pill */}
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E4DA] text-[#1C1F1B]">
              Score: <strong>{item.score?.toFixed(2)}</strong>
            </span>

            {/* Veg Badge */}
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full border ${
                item.is_veg
                  ? 'bg-[#2D5A43] border-[#2D5A43]'
                  : 'bg-[#991B1B] border-[#991B1B]'
              }`}
              title={item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
            />
          </div>
        </div>

        {/* Thumbnail & Name */}
        <div className="flex items-start space-x-4 mb-4">
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-16 h-16 rounded-2xl object-cover border border-[#E8E4DA] shrink-0 bg-[#F6F4EE]"
            />
          )}
          <div>
            <h3 className="font-serif text-2xl text-[#1C1F1B] leading-tight font-normal">
              {item.name}
            </h3>
            <span className="text-xs text-[#7A8078] capitalize font-medium">
              {item.category}
            </span>
          </div>
        </div>

        {/* Attributes Row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5F655E] pb-4 font-medium border-b border-[#EFECE6]">
          <span className="flex items-center space-x-1 text-[#1C1F1B]">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-semibold">{item.rating?.toFixed(1)}</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-[#7A8078]" />
            <span>{item.estimated_wait_time}m wait</span>
          </span>
          <span>•</span>
          <span>Filling {item.filling_score}/5</span>
        </div>

        {/* Expandable "Why this pick?" Button */}
        <div className="py-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full inline-flex items-center justify-between text-xs font-semibold text-[#2D5A43] hover:text-[#234735] transition p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8DE] cursor-pointer"
          >
            <span className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Why this pick?</span>
            </span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Expanded Breakdown */}
          {expanded && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-[#F6F4EE] border border-[#E8E4DA] text-xs space-y-2.5 animate-fadeIn">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A8078] border-b border-[#E0DBD0] pb-1">
                Score Analysis (Formula Breakdown)
              </div>
              <ul className="space-y-2 text-[#4A5049]">
                {reasons.map((r, i) => (
                  <li key={i} className="space-y-0.5">
                    <strong className="text-[#1C1F1B] font-semibold block">{r.title}:</strong>
                    <span className="text-[11px] leading-relaxed block">{r.desc}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-1.5 border-t border-[#E0DBD0] text-[10px] text-[#7A8078] italic">
                Formula: 50% rating + 30% filling - 20% wait penalty
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price & Order Action */}
      <div className="pt-4 border-t border-[#EFECE6] flex items-center justify-between gap-3">
        <div className="font-serif text-3xl font-normal text-[#1C1F1B]">
          ₹{Math.round(item.price)}
        </div>

        <button
          type="button"
          onClick={() => onOrder && onOrder(item)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#2D5A43] hover:bg-[#234735] active:scale-[0.97] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Order This</span>
        </button>
      </div>
    </div>
  )
}
