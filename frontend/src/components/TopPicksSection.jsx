import React from 'react'
import TopPickCard from './TopPickCard'
import { Sparkles, X } from 'lucide-react'

export default function TopPicksSection({ recommendations, loading, error, onClear, onRetry, onOrder }) {
  if (!loading && !error && (!recommendations || recommendations.length === 0)) {
    return null
  }

  return (
    <section id="top-picks" className="space-y-6 pt-2 animate-fadeIn scroll-mt-24">
      {/* Section Container */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFECE6] pb-6 mb-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#E8EFEA] to-[#FEF3C7] text-[#2D5A43] border border-[#D1E0D7]">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Recommendation Engine</span>
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1F1B] tracking-tight">
              Your Top Picks
            </h2>
            <p className="text-xs sm:text-sm text-[#555C54] leading-relaxed">
              Scored dynamically across student rating (50%), fullness score (30%), and counter wait time (20%).
            </p>
          </div>

          <button
            onClick={onClear}
            className="self-start sm:self-center inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-[#DCD6CA] bg-white hover:bg-[#F2EFE9] text-xs font-semibold text-[#1C1F1B] transition cursor-pointer shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Hide Picks</span>
          </button>
        </div>

        {/* Loading State Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-[#E8E4DA] p-6 space-y-4 animate-pulse"
              >
                <div className="h-6 bg-[#ECE8DF] rounded-full w-1/3" />
                <div className="flex space-x-3">
                  <div className="w-16 h-16 bg-[#ECE8DF] rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-[#ECE8DF] rounded w-3/4" />
                    <div className="h-4 bg-[#ECE8DF] rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-[#ECE8DF] rounded-xl w-full" />
                <div className="h-6 bg-[#ECE8DF] rounded w-1/4 pt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl p-6 text-center space-y-3">
            <h4 className="font-serif text-xl text-[#991B1B]">Could not compute recommendations</h4>
            <p className="text-xs text-[#7F1D1D] max-w-sm mx-auto">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-5 py-2 rounded-full bg-[#991B1B] text-white text-xs font-semibold hover:bg-[#7F1D1D] transition cursor-pointer"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* No Matches Found */}
        {!loading && !error && recommendations && recommendations.length === 0 && (
          <div className="text-center py-10 space-y-3">
            <div className="text-3xl">🔍</div>
            <h4 className="font-serif text-xl text-[#1C1F1B]">No dishes fit these strict constraints</h4>
            <p className="text-xs text-[#6B726A] max-w-sm mx-auto">
              Try increasing your budget or switching diet to "All" to unlock top picks.
            </p>
          </div>
        )}

        {/* Top 3 Cards Grid */}
        {!loading && !error && recommendations && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((item, index) => (
              <TopPickCard key={item.id} item={item} rank={index + 1} onOrder={onOrder} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
