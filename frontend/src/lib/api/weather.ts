import { apiGet } from '../httpClient'
import { FarmsAPI } from '@/lib/api/farms'
import { WeatherAdvisor, WeatherData, WeatherAdvice } from '@/lib/ai/weatherAdvisor'
import { WeatherCache, NetworkUtils } from '@/lib/cache'

export interface WeatherResponse {
  district: string
  weather: WeatherData
  advisory: WeatherAdvice
  timestamp: string
  fallback?: boolean
  cached?: boolean
}

export interface WeatherLog {
  id?: string
  farm_id: string
  district: string
  temperature: number
  humidity: number
  wind_speed: number
  description: string
  precipitation: number
  recorded_at: string
}

export class WeatherAPI {
  private static weatherAdvisor = new WeatherAdvisor()

  // GET /api/weather/:district - Get current weather and advisory with caching
  static async getWeatherForDistrict(district: string): Promise<WeatherResponse | null> {
    const cacheKey = `weather_${district}`;

    // Try cache first
    const cached = WeatherCache.getWeather(district);
    if (cached) {
      return { ...cached, cached: true };
    }

    // Check network status
    if (!NetworkUtils.isOnline()) {
      console.warn('No internet connection, cannot fetch weather data');
      return null;
    }

    try {
      // Use standard apiGet which handles VITE_API_URL and Auth headers
      const data = await apiGet(`/api/weather/${encodeURIComponent(district)}`);

      // Cache the successful response
      WeatherCache.setWeather(district, data);

      return data;

    } catch (error) {
      console.error('Weather API fetch error:', error)

      // Fallback to direct weather advisor call
      try {
        const weatherData = await this.weatherAdvisor.getWeatherData(district)
        if (weatherData) {
          const advisory = await this.weatherAdvisor.getFarmingAdvice(weatherData, district)
          const fallbackData = {
            district,
            weather: weatherData,
            advisory,
            timestamp: new Date().toISOString(),
            fallback: true
          };

          // Cache fallback data with shorter TTL
          WeatherCache.setWeather(district, fallbackData);

          return fallbackData;
        }
      } catch (fallbackError) {
        console.error('Weather fallback error:', fallbackError)
      }

      return null
    }
  }

  // Store weather log for farm
  static async logWeatherForFarm(farmId: string, district: string, weatherData: WeatherData, userId: string = 'system'): Promise<boolean> {
    try {
      await FarmsAPI.addWeatherLog(farmId, userId, {
        notes: `Auto-logged weather for ${district}`,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        conditions: weatherData.description
      });
      return true
    } catch (error) {
      console.error('Weather logging error:', error)
      return false
    }
  }

  // Get last 7 days weather logs for farm
  static async getWeatherHistoryForFarm(farmId: string): Promise<any[]> {
    try {
      return await FarmsAPI.getWeatherLogs(farmId);
    } catch (error) {
      console.error('Weather history fetch error:', error)
      return []
    }
  }

  // Get current weather directly (bypass API route)
  static async getCurrentWeather(district: string): Promise<WeatherData | null> {
    return await this.weatherAdvisor.getWeatherData(district)
  }

  // Get farming advice for weather conditions
  static async getFarmingAdvice(weatherData: WeatherData, district: string): Promise<WeatherAdvice> {
    return await this.weatherAdvisor.getFarmingAdvice(weatherData, district)
  }
}
