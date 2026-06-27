import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WeatherAPI, WeatherResponse, WeatherLog } from '@/lib/api/weather'
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface WeatherCardProps {
  district: string
  farmId?: string
  compact?: boolean
}

export default function WeatherCard({ district, farmId, compact = false }: WeatherCardProps) {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null)
  const [weatherHistory, setWeatherHistory] = useState<WeatherLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hoist these helpers so effects can safely reference them
  const loadWeatherData = useCallback(async (isMounted: { current: boolean }) => {
    try {
      if (isMounted.current) { setLoading(true); setError(null); }

      const data = await WeatherAPI.getWeatherForDistrict(district)
      if (isMounted.current) {
        if (data) {
          setWeatherData(data)
          // Log weather for farm if farmId provided
          if (farmId && data.weather) {
            await WeatherAPI.logWeatherForFarm(farmId, district, data.weather)
          }
        } else {
          setError('Weather data not available')
        }
      }
    } catch (err) {
      console.error('Error loading weather:', err)
      if (isMounted.current) setError('Failed to load weather data')
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [district, farmId])

  const loadWeatherHistory = useCallback(async (isMounted: { current: boolean }) => {
    if (!farmId) return

    try {
      const history = await WeatherAPI.getWeatherHistoryForFarm(farmId)
      if (isMounted.current) setWeatherHistory(history)
    } catch (err) {
      console.error('Error loading weather history:', err)
    }
  }, [farmId])

  useEffect(() => {
    const isMounted = { current: true };
    loadWeatherData(isMounted)
    return () => { isMounted.current = false; }
  }, [district, loadWeatherData])

  useEffect(() => {
    const isMounted = { current: true };
    if (farmId) {
      loadWeatherHistory(isMounted)
    }
    return () => { isMounted.current = false; }
  }, [farmId, loadWeatherHistory])

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase()
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="h-6 w-6 text-blue-500" />
    } else if (desc.includes('cloud')) {
      return <Cloud className="h-6 w-6 text-gray-500" />
    } else {
      return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  const getTemperatureColor = (temp: number) => {
    if (temp >= 35) return 'text-red-600'
    if (temp >= 25) return 'text-orange-600'
    if (temp >= 15) return 'text-green-600'
    return 'text-blue-600'
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 animate-pulse" />
            Loading Weather...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weatherData) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Weather Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">{error || 'Unable to load weather data'}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadWeatherData({ current: true })}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { weather, advisory } = weatherData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getWeatherIcon(weather.description)}
              Today's Weather - {district}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadWeatherData({ current: true })}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Weather */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Thermometer className={`h-6 w-6 mx-auto mb-1 ${getTemperatureColor(weather.temperature)}`} />
              <div className={`text-2xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                {weather.temperature}°C
              </div>
              <div className="text-xs text-gray-600">Temperature</div>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Droplets className="h-6 w-6 mx-auto mb-1 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">{weather.humidity}%</div>
              <div className="text-xs text-gray-600">Humidity</div>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Wind className="h-6 w-6 mx-auto mb-1 text-gray-500" />
              <div className="text-2xl font-bold text-gray-600">{weather.windSpeed} km/h</div>
              <div className="text-xs text-gray-600">Wind Speed</div>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Cloud className="h-6 w-6 mx-auto mb-1 text-gray-500" />
              <div className="text-lg font-semibold text-gray-700 capitalize">
                {weather.description}
              </div>
              <div className="text-xs text-gray-600">Conditions</div>
            </div>
          </div>

          {/* Weather History Trend */}
          {weatherHistory.length > 1 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">7-Day Trend</span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {weatherHistory.slice(0, 7).reverse().map((log) => (
                  <div
                    key={log.id}
                    className="flex-shrink-0 text-center min-w-[40px]"
                  >
                    <div className={`text-xs font-medium ${getTemperatureColor(log.temperature)}`}>
                      {log.temperature}°
                    </div>
                    <div className="w-6 h-6 mx-auto mt-1 bg-blue-100 rounded-full flex items-center justify-center">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: log.precipitation > 20 ? '#3b82f6' :
                                         log.precipitation > 10 ? '#93c5fd' : '#e0f2fe'
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(log.recorded_at).getDate()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crop Advisory */}
          {!compact && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sun className="h-4 w-4 text-green-600" />
                Crop Advisory
              </h4>

              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700">{advisory.summary}</p>
                </div>

                {advisory.farmingTips.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Farming Tips:</h5>
                    <ul className="space-y-1">
                      {advisory.farmingTips.slice(0, 3).map((tip) => (
                        <li key={tip} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {advisory.riskAlerts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {advisory.riskAlerts.slice(0, 2).map((alert) => (
                      <Badge key={alert} variant="destructive" className="text-xs">
                        ⚠️ {alert}
                      </Badge>
                    ))}
                  </div>
                )}

                {advisory.recommendations.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                    <div className="flex flex-wrap gap-2">
                      {advisory.recommendations.slice(0, 2).map((rec) => (
                        <Badge key={rec} variant="secondary" className="text-xs">
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
