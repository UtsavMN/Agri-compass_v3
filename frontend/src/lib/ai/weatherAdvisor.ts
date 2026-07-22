export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  uv?: number;
  precipitation?: number;
  visibility?: number;
  pressure?: number;
  forecast: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    description: string;
    precipitation: number;
  }>;
}

export interface WeatherAdvice {
  summary: string;
  farmingTips: string[];
  riskAlerts: string[];
  recommendations: string[];
}

export class WeatherAdvisor {
  private readonly WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '9445b4364af44639b9875034262207';
  private readonly WEATHER_BASE_URL = 'https://api.weatherapi.com/v1';

  async getWeatherData(district: string): Promise<WeatherData | null> {
    try {
      // Get coordinates for the district (simplified mapping)
      const coords = this.getDistrictCoordinates(district);
      if (!coords) return null;

      // Current and forecast weather in one call via WeatherAPI
      const response = await fetch(
        `${this.WEATHER_BASE_URL}/forecast.json?key=${this.WEATHER_API_KEY}&q=${coords.lat},${coords.lon}&days=5`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        temperature: Math.round(data.current.temp_c),
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        description: data.current.condition.text,
        uv: data.current.uv,
        precipitation: data.current.precip_mm,
        visibility: data.current.vis_km,
        pressure: data.current.pressure_mb,
        forecast: data.forecast.forecastday.map((item: any) => ({
          date: item.date,
          temp_max: Math.round(item.day.maxtemp_c),
          temp_min: Math.round(item.day.mintemp_c),
          description: item.day.condition.text,
          precipitation: item.day.totalprecip_mm
        }))
      };
    } catch (error) {
      console.error('Weather API error, generating mock data based on district hash:', error);
      
      // Hash-based fallback logic (matches backend fallback)
      let hash = 0;
      for (let i = 0; i < district.length; i++) {
          hash = (hash << 5) - hash + district.charCodeAt(i);
          hash |= 0; // Convert to 32bit int
      }
      const absHash = Math.abs(hash);

      const descriptions = ["clear sky", "few clouds", "scattered clouds", "broken clouds", "shower rain", "rain", "thunderstorm", "mist"];
      const description = descriptions[absHash % descriptions.length];
      const temperature = 20.0 + (absHash % 150) / 10.0;
      const humidity = 40 + (absHash % 40);
      const windSpeed = 5.0 + (absHash % 200) / 10.0;

      const forecast = [];
      for (let i = 0; i < 5; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          
          const dayHash = absHash + i * 31;
          const dayDesc = descriptions[dayHash % descriptions.length];
          const tempMax = 25.0 + (dayHash % 100) / 10.0;
          const tempMin = 15.0 + (dayHash % 80) / 10.0;
          const precipitation = (dayHash % 100) > 70 ? (dayHash % 50) : 0;
          
          forecast.push({
              date: date.toISOString().split('T')[0],
              temp_max: Math.round(tempMax),
              temp_min: Math.round(tempMin),
              description: dayDesc,
              precipitation: precipitation
          });
      }

      return {
          temperature: Math.round(temperature),
          humidity,
          windSpeed,
          description,
          forecast
      };
    }
  }

  private getDistrictCoordinates(district: string): { lat: number; lon: number } | null {
    const coordinates: { [key: string]: { lat: number; lon: number } } = {
      'Bagalkot': { lat: 16.1850, lon: 75.6961 },
      'Ballari': { lat: 15.1394, lon: 76.9214 },
      'Belagavi': { lat: 15.8497, lon: 74.4977 },
      'Bengaluru Rural': { lat: 12.9716, lon: 77.5946 },
      'Bengaluru Urban': { lat: 12.9716, lon: 77.5946 },
      'Bidar': { lat: 17.9133, lon: 77.5300 },
      'Chamarajanagar': { lat: 11.9261, lon: 76.9437 },
      'Chikkaballapur': { lat: 13.4355, lon: 77.7314 },
      'Chikkamagaluru': { lat: 13.3153, lon: 75.7754 },
      'Chitradurga': { lat: 14.2265, lon: 76.3980 },
      'Dakshina Kannada': { lat: 12.9141, lon: 74.8560 },
      'Davanagere': { lat: 14.4644, lon: 75.9218 },
      'Dharwad': { lat: 15.4589, lon: 75.0078 },
      'Gadag': { lat: 15.4325, lon: 75.6381 },
      'Hassan': { lat: 13.0068, lon: 76.0996 },
      'Haveri': { lat: 14.7950, lon: 75.4003 },
      'Kalaburagi': { lat: 17.3297, lon: 76.8343 },
      'Kodagu': { lat: 12.3375, lon: 75.8069 },
      'Kolar': { lat: 13.1367, lon: 78.1292 },
      'Koppal': { lat: 15.3500, lon: 76.1500 },
      'Mandya': { lat: 12.5223, lon: 76.8951 },
      'Mysuru': { lat: 12.2958, lon: 76.6394 },
      'Raichur': { lat: 16.2076, lon: 77.3463 },
      'Ramanagara': { lat: 12.7203, lon: 77.2800 },
      'Shivamogga': { lat: 13.9299, lon: 75.5681 },
      'Tumakuru': { lat: 13.3409, lon: 77.1011 },
      'Udupi': { lat: 13.3409, lon: 74.7421 },
      'Uttara Kannada': { lat: 14.6667, lon: 74.5000 },
      'Vijayanagara': { lat: 15.3196, lon: 76.4600 },
      'Vijayapura': { lat: 16.8302, lon: 75.7100 },
      'Yadgir': { lat: 16.7667, lon: 77.1333 }
    };

    return coordinates[district] || null;
  }

  async getFarmingAdvice(weatherData: WeatherData, district: string): Promise<WeatherAdvice> {
    const advice: WeatherAdvice = {
      summary: '',
      farmingTips: [],
      riskAlerts: [],
      recommendations: []
    };

    // Temperature-based advice
    if (weatherData.temperature > 35) {
      advice.summary = 'Hot weather conditions detected';
      advice.farmingTips.push('Provide shade to young plants');
      advice.farmingTips.push('Increase irrigation frequency');
      advice.riskAlerts.push('Heat stress risk for crops');
      advice.recommendations.push('Mulching helps retain soil moisture');
    } else if (weatherData.temperature < 15) {
      advice.summary = 'Cool weather conditions';
      advice.farmingTips.push('Protect plants from frost');
      advice.farmingTips.push('Delay transplanting if temperatures remain low');
      advice.riskAlerts.push('Frost damage possible');
    } else {
      advice.summary = 'Favorable weather for farming activities';
      advice.farmingTips.push('Good conditions for field work');
      advice.farmingTips.push('Optimal for planting and irrigation');
    }

    // Humidity and precipitation advice
    const avgPrecipitation = weatherData.forecast.reduce((sum, day) => sum + day.precipitation, 0) / weatherData.forecast.length;

    if (avgPrecipitation > 50) {
      advice.farmingTips.push('Heavy rain expected - prepare drainage');
      advice.riskAlerts.push('Waterlogging risk for low-lying areas');
      advice.recommendations.push('Harvest mature crops before heavy rains');
    } else if (avgPrecipitation < 20) {
      advice.farmingTips.push('Low rainfall expected');
      advice.riskAlerts.push('Drought stress possible');
      advice.recommendations.push('Implement irrigation scheduling');
    }

    // Wind speed advice
    if (weatherData.windSpeed > 15) {
      advice.farmingTips.push('High winds expected');
      advice.riskAlerts.push('Wind damage to crops possible');
      advice.recommendations.push('Stake tall plants and delay spraying');
    }

    // District-specific advice
    if (district.toLowerCase().includes('coastal')) {
      advice.farmingTips.push('Monitor for salt spray damage');
    } else if (district.toLowerCase().includes('malnad')) {
      advice.farmingTips.push('Heavy rainfall region - focus on drainage');
    }

    return advice;
  }

  async getWeeklySummary(district: string): Promise<string> {
    const weatherData = await this.getWeatherData(district);
    if (!weatherData) return 'Weather data unavailable for this district.';

    const advice = await this.getFarmingAdvice(weatherData, district);

    return `This week in ${district}: ${advice.summary}. ${advice.farmingTips[0] || 'Monitor weather closely.'}`;
  }
}

export const weatherAdvisor = new WeatherAdvisor();
