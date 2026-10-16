export interface WeatherForecastDay {
  date: string;
  day_name?: string;
  temp_max: number;
  temp_min: number;
  apparent_temp_max?: number;
  description: string;
  precipitation: number;
  precipitation_probability?: number;
  et0?: number; // FAO-56 Reference Evapotranspiration (mm/day)
  wind_speed_max?: number;
  wind_direction?: string;
  uv_index?: number;
  spraying_suitability?: 'Favorable' | 'Caution' | 'Unfavorable';
  spraying_reason?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection?: string;
  description: string;
  uv?: number;
  precipitation?: number;
  precipitationProbability?: number;
  visibility?: number;
  pressure?: number;
  feelsLike?: number;
  et0?: number;
  forecast: WeatherForecastDay[];
}

export interface AdvisoryDomainCard {
  title: string;
  status: 'favorable' | 'caution' | 'critical' | 'info';
  statusLabel: string;
  description: string;
  actionItems: string[];
  metrics?: { label: string; value: string }[];
}

export interface WeatherAdvice {
  summary: string;
  farmingTips: string[];
  riskAlerts: string[];
  recommendations: string[];
  domains?: {
    spraying: AdvisoryDomainCard;
    irrigation: AdvisoryDomainCard;
    fertilizer: AdvisoryDomainCard;
    diseaseRisk: AdvisoryDomainCard;
    harvestField: AdvisoryDomainCard;
  };
}

export const KARNATAKA_DISTRICT_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'Bagalkot': { lat: 16.1850, lon: 75.6961 },
  'Ballari': { lat: 15.1394, lon: 76.9214 },
  'Belagavi': { lat: 15.8497, lon: 74.4977 },
  'Bengaluru Rural': { lat: 13.2300, lon: 77.7100 },
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

/**
 * Calculates the exact nearest Karnataka district to any (latitude, longitude) coordinate
 * using the Haversine great-circle distance formula.
 */
export function findNearestDistrict(lat: number, lon: number): { district: string; distanceKm: number } {
  let closest = 'Bengaluru Urban';
  let minDistance = Infinity;

  for (const [dist, coords] of Object.entries(KARNATAKA_DISTRICT_COORDINATES)) {
    const dLat = (coords.lat - lat) * (Math.PI / 180);
    const dLon = (coords.lon - lon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) * Math.cos(coords.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = 6371 * c;

    if (distKm < minDistance) {
      minDistance = distKm;
      closest = dist;
    }
  }

  return { district: closest, distanceKm: Math.round(minDistance * 10) / 10 };
}

export class WeatherAdvisor {
  private readonly WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '9445b4364af44639b9875034262207';
  private readonly WEATHER_BASE_URL = 'https://api.weatherapi.com/v1';

  public static readonly DISTRICT_COORDINATES = KARNATAKA_DISTRICT_COORDINATES;
  public static readonly findNearestDistrict = findNearestDistrict;

  private static degreesToCardinal(deg: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((deg % 360) / 22.5) % 16;
    return directions[index] || 'N';
  }

  private static wmoCodeToDescription(code: number): string {
    switch (code) {
      case 0: return 'Clear Sky';
      case 1: return 'Mainly Clear';
      case 2: return 'Partly Cloudy';
      case 3: return 'Overcast';
      case 45: return 'Foggy';
      case 48: return 'Depositing Rime Fog';
      case 51: return 'Light Drizzle';
      case 53: return 'Moderate Drizzle';
      case 55: return 'Dense Drizzle';
      case 56: case 57: return 'Freezing Drizzle';
      case 61: return 'Slight Rain';
      case 63: return 'Moderate Rain';
      case 65: return 'Heavy Rain';
      case 66: case 67: return 'Freezing Rain';
      case 71: return 'Slight Snow';
      case 73: return 'Moderate Snow';
      case 75: return 'Heavy Snow';
      case 77: return 'Snow Grains';
      case 80: return 'Light Rain Showers';
      case 81: return 'Moderate Rain Showers';
      case 82: return 'Violent Rain Showers';
      case 85: case 86: return 'Snow Showers';
      case 95: return 'Thunderstorm';
      case 96: return 'Thunderstorm with Hail';
      case 99: return 'Severe Thunderstorm with Hail';
      default: return 'Clear Sky';
    }
  }

  private static evaluateSprayingCondition(windKph: number, precipProb: number, precipMm: number): {
    suitability: 'Favorable' | 'Caution' | 'Unfavorable';
    reason: string;
  } {
    if (precipProb > 50 || precipMm > 4) {
      return {
        suitability: 'Unfavorable',
        reason: 'Wash-off hazard: Rain probability exceeds 50% or precipitation > 4mm.'
      };
    }
    if (windKph > 20) {
      return {
        suitability: 'Unfavorable',
        reason: 'Severe wind drift hazard (>20 km/h). Chemical loss to non-target areas.'
      };
    }
    if (windKph > 13 || precipProb > 25) {
      return {
        suitability: 'Caution',
        reason: 'Moderate drift risk. Restrict spraying to early morning (06:00–08:30) with anti-drift nozzles.'
      };
    }
    return {
      suitability: 'Favorable',
      reason: 'Optimal window: Calm wind (<13 km/h) and minimal rain risk (<25%).'
    };
  }

  async getWeatherData(district?: string, customCoords?: { lat: number; lon: number }): Promise<WeatherData | null> {
    const coords = customCoords || this.getDistrictCoordinates(district || 'Bengaluru Urban');
    if (!coords) return null;

    try {
      // 1. Fetch high-precision 7-day agricultural forecast from Open-Meteo
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,et0_fao_evapotranspiration,uv_index_max&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=Asia%2FKolkata`;
      
      const omPromise = fetch(openMeteoUrl).then(res => res.ok ? res.json() : null).catch(() => null);

      // 2. Fetch live station observation & alerts from WeatherAPI
      const waPromise = fetch(
        `${this.WEATHER_BASE_URL}/forecast.json?key=${this.WEATHER_API_KEY}&q=${coords.lat},${coords.lon}&days=3&alerts=yes`
      ).then(res => res.ok ? res.json() : null).catch(() => null);

      const [omData, waData] = await Promise.all([omPromise, waPromise]);

      if (!omData && !waData) {
        throw new Error('Both weather providers failed');
      }

      // If Open-Meteo succeeded, construct full 7-day agricultural forecast
      if (omData?.daily?.time && Array.isArray(omData.daily.time)) {
        const dailyTimes: string[] = omData.daily.time;
        const forecast: WeatherForecastDay[] = dailyTimes.map((dateStr, i) => {
          const wCode = omData.daily.weather_code?.[i] ?? 0;
          const tempMax = Math.round(omData.daily.temperature_2m_max?.[i] ?? 30);
          const tempMin = Math.round(omData.daily.temperature_2m_min?.[i] ?? 20);
          const apparentMax = omData.daily.apparent_temperature_max?.[i] ? Math.round(omData.daily.apparent_temperature_max[i]) : undefined;
          const precip = Number((omData.daily.precipitation_sum?.[i] ?? 0).toFixed(1));
          const precipProb = omData.daily.precipitation_probability_max?.[i] ?? 0;
          const windMax = Math.round(omData.daily.wind_speed_10m_max?.[i] ?? 10);
          const windDeg = omData.daily.wind_direction_10m_dominant?.[i] ?? 0;
          const et0 = omData.daily.et0_fao_evapotranspiration?.[i] ? Number(omData.daily.et0_fao_evapotranspiration[i].toFixed(2)) : undefined;
          const uv = omData.daily.uv_index_max?.[i] ? Number(omData.daily.uv_index_max[i].toFixed(1)) : undefined;

          const spray = WeatherAdvisor.evaluateSprayingCondition(windMax, precipProb, precip);

          const d = new Date(dateStr);
          const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });

          return {
            date: dateStr,
            day_name: dayName,
            temp_max: tempMax,
            temp_min: tempMin,
            apparent_temp_max: apparentMax,
            description: WeatherAdvisor.wmoCodeToDescription(wCode),
            precipitation: precip,
            precipitation_probability: precipProb,
            et0,
            wind_speed_max: windMax,
            wind_direction: WeatherAdvisor.degreesToCardinal(windDeg),
            uv_index: uv,
            spraying_suitability: spray.suitability,
            spraying_reason: spray.reason
          };
        });

        // Determine current observations
        const currentTemp = omData.current?.temperature_2m !== undefined ? Math.round(omData.current.temperature_2m) : (waData?.current?.temp_c ? Math.round(waData.current.temp_c) : 25);
        const currentHumidity = omData.current?.relative_humidity_2m !== undefined ? Math.round(omData.current.relative_humidity_2m) : (waData?.current?.humidity ?? 65);
        const currentWind = omData.current?.wind_speed_10m !== undefined ? Math.round(omData.current.wind_speed_10m) : (waData?.current?.wind_kph ? Math.round(waData.current.wind_kph) : 10);
        const currentWindDeg = omData.current?.wind_direction_10m ?? 0;
        const currentDesc = waData?.current?.condition?.text || WeatherAdvisor.wmoCodeToDescription(omData.current?.weather_code ?? 0);
        const feelsLike = omData.current?.apparent_temperature !== undefined ? Math.round(omData.current.apparent_temperature) : (waData?.current?.feelslike_c ? Math.round(waData.current.feelslike_c) : currentTemp);
        const precip = omData.current?.precipitation !== undefined ? Number(omData.current.precipitation.toFixed(1)) : (waData?.current?.precip_mm ?? 0);
        const pressure = omData.current?.surface_pressure ? Math.round(omData.current.surface_pressure) : (waData?.current?.pressure_mb ?? 1013);
        const uv = waData?.current?.uv ?? (omData.daily?.uv_index_max?.[0] ? Number(omData.daily.uv_index_max[0].toFixed(1)) : 5);
        const visibility = waData?.current?.vis_km ?? 10;
        const todayEt0 = omData.daily?.et0_fao_evapotranspiration?.[0] ? Number(omData.daily.et0_fao_evapotranspiration[0].toFixed(2)) : undefined;

        return {
          temperature: currentTemp,
          humidity: currentHumidity,
          windSpeed: currentWind,
          windDirection: WeatherAdvisor.degreesToCardinal(currentWindDeg),
          description: currentDesc,
          uv,
          precipitation: precip,
          precipitationProbability: omData.daily?.precipitation_probability_max?.[0] ?? 0,
          visibility,
          pressure,
          feelsLike,
          et0: todayEt0,
          forecast
        };
      }

      // Fallback: If only WeatherAPI responded
      if (waData?.forecast?.forecastday) {
        const forecast: WeatherForecastDay[] = waData.forecast.forecastday.map((item: any, i: number) => {
          const d = new Date(item.date);
          const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
          const windKph = item.day.maxwind_kph || 10;
          const precipMm = item.day.totalprecip_mm || 0;
          const rainProb = item.day.daily_chance_of_rain || 0;
          const spray = WeatherAdvisor.evaluateSprayingCondition(windKph, rainProb, precipMm);

          return {
            date: item.date,
            day_name: dayName,
            temp_max: Math.round(item.day.maxtemp_c),
            temp_min: Math.round(item.day.mintemp_c),
            description: item.day.condition.text,
            precipitation: precipMm,
            precipitation_probability: rainProb,
            wind_speed_max: Math.round(windKph),
            uv_index: item.day.uv,
            spraying_suitability: spray.suitability,
            spraying_reason: spray.reason
          };
        });

        return {
          temperature: Math.round(waData.current.temp_c),
          humidity: waData.current.humidity,
          windSpeed: Math.round(waData.current.wind_kph),
          description: waData.current.condition.text,
          uv: waData.current.uv,
          precipitation: waData.current.precip_mm,
          visibility: waData.current.vis_km,
          pressure: Math.round(waData.current.pressure_mb),
          feelsLike: Math.round(waData.current.feelslike_c),
          forecast
        };
      }

      return null;
    } catch (error) {
      console.error('Weather Advisor fetch error:', error);
      return null;
    }
  }

  private getDistrictCoordinates(district: string): { lat: number; lon: number } | null {
    if (!district) return WeatherAdvisor.DISTRICT_COORDINATES['Bengaluru Urban'];
    
    // Direct match
    if (WeatherAdvisor.DISTRICT_COORDINATES[district]) {
      return WeatherAdvisor.DISTRICT_COORDINATES[district];
    }

    // Case-insensitive match
    const clean = district.trim().toLowerCase();
    for (const [key, value] of Object.entries(WeatherAdvisor.DISTRICT_COORDINATES)) {
      if (key.toLowerCase() === clean) {
        return value;
      }
    }

    // Default to Bengaluru Urban
    return WeatherAdvisor.DISTRICT_COORDINATES['Bengaluru Urban'];
  }

  async getFarmingAdvice(weatherData: WeatherData, district: string): Promise<WeatherAdvice> {
    const temp = weatherData.temperature;
    const humidity = weatherData.humidity;
    const wind = weatherData.windSpeed;
    const precip = weatherData.precipitation ?? 0;
    const rainProb = weatherData.precipitationProbability ?? 0;
    const et0 = weatherData.et0 ?? 3.5;

    // Cumulative 48h precipitation forecast
    const precip48h = (weatherData.forecast?.slice(0, 2) || []).reduce((sum, d) => sum + (d.precipitation || 0), 0);
    const maxWind48h = Math.max(...(weatherData.forecast?.slice(0, 2) || []).map(d => d.wind_speed_max || wind));
    const maxRainProb48h = Math.max(...(weatherData.forecast?.slice(0, 2) || []).map(d => d.precipitation_probability || rainProb));

    // 1. Spraying Window Domain
    let sprayStatus: 'favorable' | 'caution' | 'critical' = 'favorable';
    let sprayLabel = 'Favorable Spray Window';
    let sprayDesc = 'Weather conditions are optimal for foliar and chemical crop protection sprays.';
    const sprayActions: string[] = [];

    if (maxRainProb48h > 50 || precip48h > 5) {
      sprayStatus = 'critical';
      sprayLabel = 'Unfavorable — Washout Risk';
      sprayDesc = `Heavy rainfall probability (${maxRainProb48h}%) or precipitation (${precip48h.toFixed(1)}mm) expected. Postpone spraying to prevent chemical wash-off and loss.`;
      sprayActions.push('Hold all protective and systemic fungicide/pesticide sprays.');
      sprayActions.push('If emergency application is needed, add an approved silicone-based sticker/surfactant.');
    } else if (maxWind48h > 18) {
      sprayStatus = 'caution';
      sprayLabel = 'Caution — Drift Hazard';
      sprayDesc = `Wind gusts up to ${maxWind48h} km/h will cause droplet drift, reducing canopy deposition and risking non-target damage.`;
      sprayActions.push('Restrict spraying strictly to early morning hours (06:00 to 08:30 AM).');
      sprayActions.push('Use air-induction anti-drift nozzles and lower spray boom height.');
    } else {
      sprayActions.push('Safe window for foliar fertilizers, biocontrol agents, and pesticide sprays.');
      sprayActions.push('Maintain standard sprayer nozzle pressure (2.0–2.5 bar) for uniform canopy coverage.');
    }

    // 2. Irrigation & Water Budgeting Domain
    let irrigStatus: 'favorable' | 'caution' | 'critical' | 'info' = 'info';
    let irrigLabel = 'Balanced Water Budget';
    let irrigDesc = `Reference Evapotranspiration (ET₀) is ${et0.toFixed(1)} mm/day against ${precip48h.toFixed(1)} mm forecast rainfall.`;
    const irrigActions: string[] = [];

    if (precip48h >= 15 || precip > 10) {
      irrigStatus = 'favorable';
      irrigLabel = 'Suspend Irrigation';
      irrigDesc = `Abundant rainfall (${precip48h.toFixed(1)} mm) meets root-zone moisture needs. Soil profile recharge underway.`;
      irrigActions.push('Turn off automated drip and sprinkler systems for the next 48 hours to conserve power and water.');
      irrigActions.push('Ensure field drainage channels and bunds are clear to prevent localized waterlogging.');
    } else if (et0 > 4.2 && precip48h < 2) {
      irrigStatus = 'caution';
      irrigLabel = 'High Moisture Depletion';
      irrigDesc = `Elevated crop evapotranspiration (${et0.toFixed(1)} mm/day) with negligible rain will cause moisture deficit in upper root zones.`;
      irrigActions.push('Schedule drip irrigation during low evaporative hours (early morning 05:30–08:00 AM or late evening).');
      irrigActions.push('Apply organic mulch (straw/biomass) to reduce direct soil evaporative loss.');
    } else {
      irrigActions.push('Continue normal scheduled deficit irrigation according to crop growth stage.');
      irrigActions.push('Monitor root-zone tensiometer; maintain soil moisture around 60–70% field capacity.');
    }

    // 3. Fertilizer & Soil Application Domain
    let fertStatus: 'favorable' | 'caution' | 'critical' = 'favorable';
    let fertLabel = 'Normal Nutrient Timing';
    let fertDesc = 'Soil moisture and temperature are suitable for nutrient uptake.';
    const fertActions: string[] = [];

    if (precip48h > 20) {
      fertStatus = 'critical';
      fertLabel = 'Postpone Nitrogen Broadcasting';
      fertDesc = `Heavy rainfall will trigger significant surface runoff and nitrate leaching beyond the root zone.`;
      fertActions.push('Do NOT broadcast urea or soluble NPK fertilizers before heavy rainfall.');
      fertActions.push('Resume top-dressing 24–36 hours after rain once excess surface moisture has drained.');
    } else if (precip48h > 3 && precip48h <= 15) {
      fertStatus = 'favorable';
      fertLabel = 'Prime Soil Incorporation';
      fertDesc = 'Light to moderate rain provides ideal soil moisture for rapid dissolution and root absorption of fertilizers.';
      fertActions.push('Excellent window for split application of urea, MOP, or secondary micronutrients.');
      fertActions.push('Incorporate basal compost or vermicompost into moist seedbeds.');
    } else {
      fertActions.push('For dry soil, irrigate immediately after fertilizer broadcasting to prevent volatilization loss.');
      fertActions.push('Foliar micronutrient feeding (Zinc, Boron, 19-19-19) is recommended under moderate temperatures.');
    }

    // 4. Disease & Fungal Pathogen Warning Domain
    let disStatus: 'favorable' | 'caution' | 'critical' = 'favorable';
    let disLabel = 'Low Pathogen Pressure';
    let disDesc = 'Atmospheric conditions do not present immediate elevated fungal or bacterial sporulation risks.';
    const disActions: string[] = [];

    if (humidity > 78 && temp >= 20 && temp <= 30) {
      disStatus = 'critical';
      disLabel = 'High Fungal Pathogen Risk';
      disDesc = `Warm temperatures (${temp}°C) combined with high humidity (${humidity}%) create ideal incubation conditions for foliar pathogens.`;
      disActions.push('High vulnerability for Rice Blast, Downy Mildew, Sheath Blight, and Cercospora leaf spots.');
      disActions.push('Conduct intensive canopy scouting in low-lying and densely planted plots.');
      disActions.push('Prepare preventative bio-fungicides (Trichoderma viride or Pseudomonas fluorescens) once leaves dry.');
    } else if (temp > 34 && humidity < 50) {
      disStatus = 'caution';
      disLabel = 'Sucking Pest Risk (Thrips & Mites)';
      disDesc = 'Hot, dry conditions accelerate reproductive cycles of sap-sucking arthropods.';
      disActions.push('Scout undersides of leaves for yellowing or leaf curling caused by thrips, aphids, and red spider mites.');
      disActions.push('Deploy yellow and blue sticky traps in field margins.');
    } else {
      disActions.push('Maintain regular field scouting routine; remove diseased weeds from field bunds.');
    }

    // 5. Harvest & Field Operations Domain
    let harvStatus: 'favorable' | 'caution' | 'critical' = 'favorable';
    let harvLabel = 'Optimal Field Trafficability';
    let harvDesc = 'Dry ground conditions allow tractors, combines, and labor teams to operate without soil compaction.';
    const harvActions: string[] = [];

    if (precip48h > 10 || precip > 5) {
      harvStatus = 'critical';
      harvLabel = 'Harvesting & Drying Alert';
      harvDesc = 'Wet weather impairs mechanical field access and poses grain spoilage risks.';
      harvActions.push('Suspend open-air sun drying of harvested grains and pulses; move to elevated covered storage.');
      harvActions.push('Delay combine harvester entry until soil dries to avoid severe rutting and compaction.');
      harvActions.push('Ensure stored grain moisture is kept below 12% to prevent aflatoxin contamination.');
    } else {
      harvActions.push('Favorable window for threshing, seed cleaning, and solar drying.');
      harvActions.push('Safe to proceed with land preparation, deep summer plowing, or bed forming.');
    }

    // Executive Summary Statement
    let summary = `Weather in ${district} is characterized by ${temp}°C, ${humidity}% humidity, and ${weatherData.description.toLowerCase()}.`;
    if (precip48h > 15) {
      summary = `Active precipitation alert for ${district}: ${precip48h.toFixed(1)}mm rainfall expected over 48 hours. Suspend field spraying, open-air drying, and nitrogen broadcasting. Clear field drainage.`;
    } else if (temp > 35) {
      summary = `Elevated thermal stress in ${district} with highs around ${temp}°C. Increase irrigation frequency and apply mulching to minimize canopy heat stress.`;
    } else if (maxWind48h > 20) {
      summary = `Gusty wind conditions in ${district} (up to ${maxWind48h} km/h). Avoid foliar spraying and inspect tall crops (maize, banana, sugarcane) for lodging support.`;
    } else {
      summary = `Favorable agro-climatic conditions prevailing across ${district}. Safe operational window for field operations, pest scouting, and precision nutrient application.`;
    }

    // Actionable Checklist
    const farmingTips: string[] = [
      ...sprayActions.slice(0, 1),
      ...irrigActions.slice(0, 1),
      ...fertActions.slice(0, 1),
      ...disActions.slice(0, 1),
      ...harvActions.slice(0, 1)
    ];

    // Risk alerts
    const riskAlerts: string[] = [];
    if (precip48h > 25) riskAlerts.push(`Heavy Rainfall Warning: ${precip48h.toFixed(1)}mm expected. Risk of localized flooding and root rot.`);
    if (temp > 36) riskAlerts.push(`Extreme Heat Stress: Temperatures approaching ${temp}°C. Protect nursery beds and sensitive blossoms.`);
    if (maxWind48h > 25) riskAlerts.push(`High Wind Gusts: Speeds up to ${maxWind48h} km/h may cause lodging in sugarcane and banana.`);
    if (humidity > 85 && temp > 22) riskAlerts.push(`Severe Fungal Incubation Alert: Relative humidity ${humidity}%. High risk for blast and mildew.`);

    return {
      summary,
      farmingTips,
      riskAlerts,
      recommendations: farmingTips,
      domains: {
        spraying: {
          title: 'Chemical & Foliar Spraying Window',
          status: sprayStatus,
          statusLabel: sprayLabel,
          description: sprayDesc,
          actionItems: sprayActions,
          metrics: [
            { label: 'Wind Speed', value: `${wind} km/h` },
            { label: 'Rain Probability', value: `${rainProb}%` }
          ]
        },
        irrigation: {
          title: 'Precision Irrigation & Water Budget (ET₀)',
          status: irrigStatus,
          statusLabel: irrigLabel,
          description: irrigDesc,
          actionItems: irrigActions,
          metrics: [
            { label: 'FAO-56 ET₀', value: `${et0.toFixed(1)} mm/d` },
            { label: '48h Forecast Rain', value: `${precip48h.toFixed(1)} mm` }
          ]
        },
        fertilizer: {
          title: 'Soil & Fertilizer Timing',
          status: fertStatus,
          statusLabel: fertLabel,
          description: fertDesc,
          actionItems: fertActions,
          metrics: [
            { label: 'Surface Runoff Risk', value: precip48h > 15 ? 'High' : 'Low' },
            { label: 'Nitrogen Loss Risk', value: precip48h > 15 ? 'Critical' : 'Minimal' }
          ]
        },
        diseaseRisk: {
          title: 'Crop Pathogen & Pest Alert',
          status: disStatus,
          statusLabel: disLabel,
          description: disDesc,
          actionItems: disActions,
          metrics: [
            { label: 'Relative Humidity', value: `${humidity}%` },
            { label: 'Canopy Disease Risk', value: disStatus === 'critical' ? 'High' : disStatus === 'caution' ? 'Moderate' : 'Low' }
          ]
        },
        harvestField: {
          title: 'Harvest & Field Trafficability',
          status: harvStatus,
          statusLabel: harvLabel,
          description: harvDesc,
          actionItems: harvActions,
          metrics: [
            { label: 'Soil Trafficability', value: harvStatus === 'critical' ? 'Poor / Muddy' : 'Optimal' },
            { label: 'Sun Drying Suitability', value: harvStatus === 'critical' ? 'Unsuitable' : 'Favorable' }
          ]
        }
      }
    };
  }

  async getWeeklySummary(district: string): Promise<string> {
    const weatherData = await this.getWeatherData(district);
    if (!weatherData) return 'Weather data unavailable for this district.';
    const advice = await this.getFarmingAdvice(weatherData, district);
    return `This week in ${district}: ${advice.summary}`;
  }
}

export const weatherAdvisor = new WeatherAdvisor();
