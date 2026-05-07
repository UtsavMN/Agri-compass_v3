import { apiGet, apiPost, apiDelete, apiPut } from '../httpClient'
import { UploadAPI } from './upload'

export interface Farm {
  id: string
  user_id: string
  name: string
  location: string
  area_acres: number
  soil_type: string | null
  irrigation_type: string | null
  current_crop: string | null
  created_at: string
  duration_days?: number
  images?: string[]
}

export interface WeatherLog {
  id: string
  farm_id: string
  user_id: string
  notes: string
  temperature?: number
  humidity?: number
  conditions: string
  created_at: string
}

export interface FarmImage {
  id: string
  farm_id: string
  user_id: string
  image_url: string
  caption?: string
  created_at: string
}

export class FarmsAPI {
  // GET /api/farms - Get user's farms with enhanced data
  static async getFarms(userId: string): Promise<Farm[]> {
    try {
      const farms = await apiGet(`/api/farms?userId=${userId}`)
      return farms.map((farm: Farm) => ({
        ...farm,
        duration_days: Math.floor((Date.now() - new Date(farm.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      }))
    } catch (error) {
      console.error('Error fetching farms:', error)
      throw error
    }
  }

  // POST /api/farms - Create a new farm
  static async createFarm(farmData: {
    user_id: string
    name: string
    location: string
    area_acres: number
    soil_type?: string
    irrigation_type?: string
    current_crop?: string
  }): Promise<Farm> {
    try {
      return await apiPost('/api/farms', farmData)
    } catch (error) {
      console.error('Error creating farm:', error)
      throw error
    }
  }

  // PUT /api/farms/:id - Update farm details
  static async updateFarm(farmId: string, farmData: Partial<Farm>): Promise<Farm> {
    try {
      return await apiPut(`/api/farms/${farmId}`, farmData)
    } catch (error) {
      console.error('Error updating farm:', error)
      throw error
    }
  }

  // POST /api/farms/:id/weather - Add weather log
  static async addWeatherLog(farmId: string, userId: string, logData: {
    notes: string
    temperature?: number
    humidity?: number
    conditions: string
  }): Promise<WeatherLog> {
    try {
      return await apiPost(`/api/farms/${farmId}/weather`, { userId, ...logData })
    } catch (error) {
      console.error('Error adding weather log:', error)
      throw error
    }
  }

  // GET /api/farms/:id/weather - Get weather logs for a farm
  static async getWeatherLogs(farmId: string): Promise<WeatherLog[]> {
    try {
      return await apiGet(`/api/farms/${farmId}/weather`)
    } catch (error) {
      console.error('Error fetching weather logs:', error)
      throw error
    }
  }

  // POST /api/farms/:id/images - Upload farm image
  static async uploadFarmImage(farmId: string, userId: string, file: File, caption?: string): Promise<FarmImage> {
    try {
      // Upload raw file using the generic Multipart upload endpoint
      const uploadResult = await UploadAPI.uploadMedia(file, 'farms')
      
      return await apiPost(`/api/farms/${farmId}/images`, {
        userId,
        image_url: uploadResult.url,
        caption: caption || null
      })
    } catch (error) {
      console.error('Error uploading farm image:', error)
      throw error
    }
  }

  // GET /api/farms/:id/images - Get farm images
  static async getFarmImages(farmId: string): Promise<FarmImage[]> {
    try {
      return await apiGet(`/api/farms/${farmId}/images`)
    } catch (error) {
      console.error('Error fetching farm images:', error)
      throw error
    }
  }

  // POST /api/farms/:id/share - Share farm update to community
  static async shareToCommunity(farmId: string, userId: string, content: string): Promise<any> {
    try {
      return await apiPost(`/api/farms/${farmId}/share`, { userId, content })
    } catch (error) {
      console.error('Error sharing to community:', error)
      throw error
    }
  }

  // DELETE /api/farms/:id - Delete a farm
  static async deleteFarm(farmId: string): Promise<void> {
    try {
      await apiDelete(`/api/farms/${farmId}`)
    } catch (error) {
      console.error('Error deleting farm:', error)
      throw error
    }
  }
}
