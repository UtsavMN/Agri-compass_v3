import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { MARKET_TRENDS, getCropImage, formatIndianNumber, MarketTrend } from '@/data/masterData'
import { motion } from 'framer-motion'

export const MarketTrendCard = React.memo(() => {
  const trends = MARKET_TRENDS
  const isLoading = false

  if (isLoading) return <MarketTrendSkeleton />

  return (
    <div className="relative p-6 h-full bg-[#0f0f0b]/80 backdrop-blur-xl border border-earth-border/60 rounded-2xl shadow-premium overflow-hidden group">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-gold-400/10 transition-colors duration-700" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gold-400/10 rounded-lg border border-gold-400/20 shadow-[0_0_10px_rgba(196,154,42,0.1)]">
            <TrendingUp size={16} className="text-gold-400" />
          </div>
          <p className="text-[14px] font-bold text-gold-100 tracking-wide">Market Trends</p>
        </div>
        <a href="/market-prices"
          className="text-[11px] font-black uppercase tracking-widest text-gold-400 hover:text-gold-300 hover:scale-105 transition-all bg-gold-400/10 px-3 py-1.5 rounded-full border border-gold-400/20 shadow-inner">
          View all
        </a>
      </div>

      {/* Animated ticker-style rows */}
      <div className="space-y-1 relative z-10">
        {trends?.slice(0, 8).map((crop, i) => (
          <MarketTrendRow key={crop.name} crop={crop} index={i} />
        ))}
      </div>

      {/* Last updated */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-earth-border/40 relative z-10">
        <p className="text-[10px] text-gold-100/40 font-bold uppercase tracking-widest">
          APMC Data
        </p>
        <p className="text-[10px] text-gold-400/60 font-bold uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live Updates
        </p>
      </div>
    </div>
  )
})

export const MarketTrendRow = React.memo(({ crop, index }: { crop: MarketTrend; index: number }) => {
  const isUp   = crop.changePercent > 0
  const isDown = crop.changePercent < 0
  const isFlat = crop.changePercent === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 24 }}
      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#1a1a14]/80 hover:scale-[1.02] border border-transparent hover:border-earth-border/60 transition-all cursor-pointer group shadow-sm hover:shadow-md"
      onClick={() => window.location.href = `/market-prices?crop=${crop.name}`}
    >
      {/* Crop name + season */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-earth-border/20 border border-earth-border/40 group-hover:border-gold-400/30 transition-colors shadow-inner">
          <img
            src={getCropImage(crop.name)}
            alt={crop.name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            onError={e => e.currentTarget.style.display = 'none'}
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gold-100/90 truncate tracking-wide group-hover:text-gold-400 transition-colors">{crop.name}</p>
          <p className="text-[10px] text-gold-100/40 uppercase font-black tracking-widest">{crop.unit}</p>
        </div>
      </div>

      {/* Sparkline mini chart — CSS animated bars */}
      <div className="flex items-end gap-[3px] h-6 mx-4">
        {crop.sparkline?.map((val, i) => {
          const max = Math.max(...crop.sparkline)
          const height = Math.max(4, Math.round((val / max) * 22))
          const isLast = i === crop.sparkline.length - 1
          return (
            <div
              key={i}
              className={`w-1 rounded-sm transition-all duration-300 ${
                isLast
                  ? isUp   ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                    : isDown ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                    : 'bg-gold-400 shadow-[0_0_8px_rgba(196,154,42,0.6)]'
                  : 'bg-earth-border/60 group-hover:bg-earth-border/80'
              }`}
              style={{ height: `${height}px` }}
            />
          )
        })}
      </div>

      {/* Price + change */}
      <div className="text-right flex-shrink-0">
        <p className="text-[13px] font-black text-gold-100 tracking-tight">
          ₹{formatIndianNumber(crop.price)}
        </p>
        <div className={`flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest mt-0.5 ${
          isUp   ? 'text-green-400'
          : isDown ? 'text-red-400'
          : 'text-gold-100/50'
        }`}>
          {isUp   && <TrendingUp size={10} className="stroke-[3]" />}
          {isDown && <TrendingDown size={10} className="stroke-[3]" />}
          {isFlat && <Minus size={10} className="stroke-[3]" />}
          {isFlat ? 'Stable' : `${isUp ? '+' : ''}${crop.changePercent.toFixed(1)}%`}
        </div>
      </div>
    </motion.div>
  )
})

const MarketTrendSkeleton = () => (
  <div className="p-6 h-full bg-[#0f0f0b]/80 backdrop-blur-xl border border-earth-border/60 rounded-2xl animate-pulse">
    <div className="h-4 bg-earth-border/40 rounded w-1/3 mb-6"></div>
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="flex justify-between items-center py-2">
          <div className="flex gap-3 w-1/2 items-center">
            <div className="h-8 w-8 bg-earth-border/40 rounded-lg"></div>
            <div className="h-3 bg-earth-border/40 rounded w-1/2"></div>
          </div>
          <div className="h-3 bg-earth-border/40 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  </div>
)
