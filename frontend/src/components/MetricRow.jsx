import React from 'react'

export default function MetricRow() {
  const metrics = [
    {
      value: '12',
      label: 'Items on the counter',
    },
    {
      value: '3 min',
      label: 'Fastest pick right now',
    },
    {
      value: '₹15',
      label: 'Cheapest thing today',
    },
    {
      value: '4.7★',
      label: 'Highest rated dish',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-2xl border border-[#E8E4DA] p-2 sm:p-4 shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-[#EFECE6]">
      {metrics.map((item, idx) => (
        <div key={idx} className="p-4 sm:p-6 flex flex-col justify-center">
          <div className="font-serif text-3xl sm:text-4xl text-[#1C1F1B] font-normal tracking-tight">
            {item.value}
          </div>
          <div className="text-xs sm:text-sm text-[#6B726A] mt-1 font-medium">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
