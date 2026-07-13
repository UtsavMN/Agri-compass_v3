import { Sprout, MapPin, Droplets, ArrowRight } from 'lucide-react'
import { getCurrentSeason, DISTRICT_CROP_DATA } from '@/data/masterData'
import { motion } from 'framer-motion'

export const SeasonAdvisoryCard = ({ district }: { district: string }) => {
  const season = getCurrentSeason()
  const advice = DISTRICT_CROP_DATA[district]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300 } }
  }

  return (
    <div className="relative p-6 h-full border border-earth-border/60 bg-[#0f0f0b]/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-premium group hover:border-gold-400/30 transition-colors">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gold-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-gold-400/10 transition-colors duration-700" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gold-400/10 rounded-lg border border-gold-400/20 shadow-[0_0_10px_rgba(196,154,42,0.1)]">
            <Sprout size={16} className="text-gold-400" />
          </div>
          <p className="text-[14px] font-bold text-gold-100 tracking-wide">Season Advisory</p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-gold-400/20 to-gold-400/5 text-gold-300 px-3 py-1 rounded-full border border-gold-400/20 shadow-inner">
          {season}
        </span>
      </div>

      <p className="text-[11px] text-gold-100/50 uppercase tracking-widest font-bold mb-4 relative z-10">
        Recommended for <span className="text-gold-400">{district}</span>
      </p>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2.5 mb-6 relative z-10"
      >
        {advice?.crops.map(crop => (
          <motion.div key={crop} variants={item} className="flex items-center gap-3 text-[13px] text-gold-100/80 hover:text-gold-100 hover:translate-x-1 transition-all p-2 rounded-lg hover:bg-gold-400/5 border border-transparent hover:border-gold-400/10 cursor-default">
            <ArrowRight className="h-3 w-3 text-gold-400/60" />
            <span className="font-medium tracking-wide">{crop}</span>
          </motion.div>
        ))}
      </motion.div>

      <div className="pt-5 mt-auto border-t border-earth-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
        <div className="bg-[#1a1a14]/60 p-4 min-h-[4.5rem] rounded-xl border border-earth-border/30 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="h-3 w-3 text-amber-500/80" />
            <p className="text-[9px] text-gold-100/40 uppercase font-black tracking-widest">Soil Type</p>
          </div>
          <p className="text-xs font-semibold text-gold-100/90 pl-4 break-words leading-snug">{advice?.soil}</p>
        </div>
        <div className="bg-[#1a1a14]/60 p-4 min-h-[4.5rem] rounded-xl border border-earth-border/30 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-2">
            <Droplets className="h-3 w-3 text-blue-400/80" />
            <p className="text-[9px] text-gold-100/40 uppercase font-black tracking-widest">Rainfall</p>
          </div>
          <p className="text-xs font-semibold text-gold-100/90 pl-4 break-words leading-snug">{advice?.rainfall}</p>
        </div>
      </div>
    </div>
  )
}
