import React, { useState } from 'react'
import { Star, Clock, ShoppingBag } from 'lucide-react'

// Category placeholder images
const PLACEHOLDER_IMAGES = {
  beverage: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
  snack: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  meal: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
}

export default function MenuItemCard({ item, onOrder }) {
  const [imageError, setImageError] = useState(false)
  const isAvailable = item.is_available !== false

  const placeholderUrl = PLACEHOLDER_IMAGES[item.category?.toLowerCase()] || PLACEHOLDER_IMAGES.default
  const imageUrl = (!imageError && item.image_url) ? item.image_url : placeholderUrl

  const categoryLabel = item.category
    ? item.category.charAt(0).toUpperCase() + item.category.slice(1)
    : 'Dish'

  const getFillingText = (score) => {
    if (!score) return null
    if (score >= 5) return 'Very filling'
    if (score >= 4) return 'Filling'
    if (score >= 3) return 'Moderate'
    return 'Light bite'
  }

  const fillingText = getFillingText(item.filling_score)

  return (
    <div
      className={`relative bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
        isAvailable
          ? 'border-[#E8E4DA] shadow-[0_2px_14px_-4px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 hover:border-[#D1CABE]'
          : 'border-[#E0DCD4] bg-[#F7F5F0] opacity-65 grayscale-[35%]'
      }`}
    >
      {/* Top Banner / Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        {/* Header Row: Thumbnail & Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Image Thumbnail */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#F2EFE9] border border-[#E8E4DA] shrink-0">
            <img
              src={imageUrl}
              alt={item.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          </div>

          {/* Badges Container */}
          <div className="flex flex-col items-end gap-1.5">
            {/* Veg / Non-Veg Indicator */}
            <div
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border ${
                item.is_veg
                  ? 'bg-[#E8EFEA] text-[#2D5A43] border-[#CDE0D4]'
                  : 'bg-[#FDE8E8] text-[#991B1B] border-[#F8B4B4]'
              }`}
            >
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full border ${
                  item.is_veg
                    ? 'bg-[#2D5A43] border-[#2D5A43]'
                    : 'bg-[#991B1B] border-[#991B1B]'
                }`}
              />
              <span>{item.is_veg ? 'VEG' : 'NON-VEG'}</span>
            </div>

            {/* Availability / Category Badge */}
            {!isAvailable ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-amber-200">
                Unavailable
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#7A8078] bg-[#FAF8F5] border border-[#ECE8DE] px-2.5 py-0.5 rounded-md">
                {categoryLabel}
              </span>
            )}
          </div>
        </div>

        {/* Dish Title */}
        <h3 className="font-serif text-xl sm:text-2xl text-[#1C1F1B] font-normal tracking-tight line-clamp-1 mb-1.5 group-hover:text-[#2D5A43] transition-colors">
          {item.name}
        </h3>

        {/* Metadata: Stars + Wait time + Filling score */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5F655E] font-medium mt-auto pt-2">
          {/* Star Rating */}
          <div className="flex items-center space-x-1 text-[#1C1F1B]">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-semibold">{item.rating ? item.rating.toFixed(1) : '4.0'}</span>
          </div>

          <span className="text-[#D4CEBF]">•</span>

          {/* Wait Time */}
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-[#7A8078]" />
            <span>{item.estimated_wait_time ?? 10}m prep</span>
          </div>

          {fillingText && (
            <>
              <span className="text-[#D4CEBF]">•</span>
              <span className="text-[#6B726A]">{fillingText}</span>
            </>
          )}
        </div>
      </div>

      {/* Card Footer: Price and Order Action */}
      <div className="px-5 sm:px-6 py-4 bg-[#FAF9F6] border-t border-[#EFECE6] flex items-center justify-between gap-3">
        <div>
          <div className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1F1B]">
            ₹{Math.round(item.price)}
          </div>
        </div>

        {isAvailable ? (
          <button
            type="button"
            onClick={() => onOrder && onOrder(item)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#2D5A43] hover:bg-[#234735] active:scale-[0.97] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order This</span>
          </button>
        ) : (
          <span className="text-[11px] font-semibold tracking-wider text-[#991B1B] bg-[#FDE8E8] px-3 py-1 rounded-full">
            Sold Out
          </span>
        )}
      </div>
    </div>
  )
}
