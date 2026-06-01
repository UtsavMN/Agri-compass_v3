import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun } from 'lucide-react'
import { WeatherAPI, type WeatherResponse } from '@/lib/api/weather'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export const WeatherChip = ({ district }: { district?: string }) => {
  const [data, setData] = useState<WeatherResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const activeDistrict = district || 'Bengaluru Urban'
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const loadWeather = async () => {
      setLoading(true)
      try {
        const res = await WeatherAPI.getWeatherForDistrict(activeDistrict)
        if (mounted && res) {
          setData(res)
        }
      } catch (e) {
        // Silent catch for top nav widget
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadWeather()
    return () => { mounted = false }
  }, [activeDistrict])

  const temp = Math.round(data?.weather.temperature || 32)
  const isRaining = data?.weather?.description?.toLowerCase().includes('rain')
  const WeatherIcon = isRaining ? CloudRain : (temp > 30 ? Sun : Cloud)

  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/weather')}
      className="h-9 px-3 gap-2 flex items-center justify-center transition-all rounded-full border shadow-premium backdrop-blur-md bg-[#1a1a14]/60 hover:bg-[#1a1a14]/90 border-earth-border/40 hover:border-gold-400/30 group"
    >
      <WeatherIcon className="h-4 w-4 text-gold-400 group-hover:text-gold-300 transition-colors" />
      <span className="text-[11px] font-black font-mono text-gold-100/90 tracking-wider">
        {loading ? '--°' : `${temp}°`}
      </span>
    </motion.button>
  )
}
