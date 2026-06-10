import Papa from 'papaparse';
// No longer using Supabase

export interface DistrictData {
  district: string;
  recommended_crops: string;
  soil_type: string;
  avg_rainfall: string;
  weather_pattern: string;
}

export interface CropRecommendation {
  cropName: string;
  reason: string;
  season: string;
  expectedYield: string;
}

export interface DetailedCropData {
  crop: string;
  description: string;
  how_to_grow: string;
  economic_importance: string;
  uses: string;
  major_districts: string;
  youtube_links: string;
  article_links: string;
  region: string;
}

export class CropRecommender {
  private districtsCache: DistrictData[] = [];
  private detailedCropCache: DetailedCropData[] = [];

  async loadDistricts(): Promise<DistrictData[]> {
    if (this.districtsCache.length > 0) return this.districtsCache;

    try {
      // Load directly from public CSV
      const response = await fetch('/districts.csv');
      if (response.ok) {
        const csvText = await response.text();
        this.districtsCache = this.parseCSV(csvText);
        return this.districtsCache;
      }

      // Hardcoded fallback for Karnataka districts
      this.districtsCache = [
        { district: 'Mysuru', recommended_crops: 'Rice, Sugarcane, Coconut', soil_type: 'Red loam', avg_rainfall: '850mm', weather_pattern: 'Tropical' },
        { district: 'Mandya', recommended_crops: 'Sugarcane, Rice, Ragi', soil_type: 'Alluvial', avg_rainfall: '900mm', weather_pattern: 'Semi-arid' },
        { district: 'Hassan', recommended_crops: 'Coffee, Rice, Pepper', soil_type: 'Laterite', avg_rainfall: '1200mm', weather_pattern: 'Sub-tropical' },
        { district: 'Bangalore Rural', recommended_crops: 'Ragi, Groundnut, Vegetables', soil_type: 'Red sandy', avg_rainfall: '800mm', weather_pattern: 'Semi-arid' },
        { district: 'Tumakuru', recommended_crops: 'Ragi, Groundnut, Sunflower', soil_type: 'Red loam', avg_rainfall: '700mm', weather_pattern: 'Semi-arid' },
        { district: 'Chikkamagaluru', recommended_crops: 'Coffee, Pepper, Cardamom', soil_type: 'Laterite', avg_rainfall: '2000mm', weather_pattern: 'Tropical' },
        { district: 'Dakshina Kannada', recommended_crops: 'Coconut, Arecanut, Rubber', soil_type: 'Laterite', avg_rainfall: '3500mm', weather_pattern: 'Tropical' },
        { district: 'Udupi', recommended_crops: 'Rice, Coconut, Cashew', soil_type: 'Laterite', avg_rainfall: '4000mm', weather_pattern: 'Tropical' },
      ];
      return this.districtsCache;
    } catch (error) {
      console.error('Error loading districts:', error);
      return [];
    }
  }

  private parseCSV(csvText: string): DistrictData[] {
    const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
    if (!parsed.data || parsed.data.length < 2) return [];
    
    return parsed.data.slice(1).map(values => {
      return {
        district: values[0]?.trim() || '',
        recommended_crops: values[1]?.trim() || '',
        soil_type: values[2]?.trim() || '',
        avg_rainfall: values[3]?.trim() || '',
        weather_pattern: values[4]?.trim() || '',
      };
    });
  }

  async getRecommendations(district: string): Promise<CropRecommendation[]> {
    const districts = await this.loadDistricts();
    const districtData = districts.find(d => d.district.toLowerCase() === district.toLowerCase());

    if (!districtData) {
      return [{
        cropName: 'Rice',
        reason: 'Default recommendation for Karnataka',
        season: 'Kharif',
        expectedYield: '3-4 tons/acre'
      }];
    }

    const crops = districtData.recommended_crops
      .split(/[,/]/)
      .map((c) => c.trim())
      .filter(Boolean);
    const recommendations: CropRecommendation[] = [];

    for (const crop of crops.slice(0, 4)) { // Limit to 4 recommendations
      recommendations.push({
        cropName: crop,
        reason: `Suitable for ${districtData.soil_type} soil and ${districtData.weather_pattern} climate`,
        season: this.getSeasonForCrop(crop),
        expectedYield: this.getExpectedYield(crop, districtData.avg_rainfall)
      });
    }

    return recommendations;
  }

  private getSeasonForCrop(crop: string): string {
    const cropSeasons: { [key: string]: string } = {
      'Rice': 'Kharif',
      'Sugarcane': 'Year-round',
      'Coffee': 'Year-round',
      'Coconut': 'Year-round',
      'Ragi': 'Kharif',
      'Groundnut': 'Kharif',
      'Pepper': 'Year-round',
      'Cardamom': 'Year-round',
      'Arecanut': 'Year-round',
      'Rubber': 'Year-round',
      'Cashew': 'Year-round',
      'Sunflower': 'Kharif',
      'Vegetables': 'Year-round'
    };
    return cropSeasons[crop] || 'Kharif';
  }

  private getExpectedYield(crop: string, rainfall: string): string {
    const rainfallNum = parseInt(rainfall.replace('mm', ''));
    const baseYields: { [key: string]: string } = {
      'Rice': rainfallNum > 1000 ? '4-5 tons/acre' : '3-4 tons/acre',
      'Sugarcane': '80-100 tons/acre',
      'Coffee': '500-800 kg/acre',
      'Coconut': '50-70 nuts/tree/year',
      'Ragi': '1-2 tons/acre',
      'Groundnut': '1-1.5 tons/acre',
      'Pepper': '200-300 kg/acre',
      'Cardamom': '100-150 kg/acre'
    };
    return baseYields[crop] || '2-3 tons/acre';
  }

  async getDistricts(): Promise<string[]> {
    const districts = await this.loadDistricts();
    return districts.map(d => d.district);
  }

  async loadDetailedCropData(): Promise<DetailedCropData[]> {
    if (this.detailedCropCache.length > 0) return this.detailedCropCache;

    try {
      // Load all regional CSV files
      const regions = [
        { file: '/final_farmer_complete_Plateau_Region.csv', region: 'Plateau Region' },
        { file: '/final_farmer_complete_Coastal_Karnataka.csv', region: 'Coastal Karnataka' },
        { file: '/final_farmer_complete_Malnad__Western_Ghats.csv', region: 'Malnad Western Ghats' },
        { file: '/final_farmer_complete_Northern_Karnataka.csv', region: 'Northern Karnataka' }
      ];

      for (const { file, region } of regions) {
        try {
          const response = await fetch(file);
          if (!response.ok) continue;
          const csvText = await response.text();
          const crops = this.parseDetailedCropCSV(csvText, region);
          this.detailedCropCache.push(...crops);
        } catch (error) {
          console.warn(`Failed to load ${file}:`, error);
        }
      }

      return this.detailedCropCache;
    } catch (error) {
      console.error('Error loading detailed crop data:', error);
      return [];
    }
  }

  private parseDetailedCropCSV(csvText: string, region: string): DetailedCropData[] {
    const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
    if (!parsed.data || parsed.data.length < 2) return [];

    return parsed.data.slice(1).map(values => {
      return {
        crop: values[0]?.trim() || '',
        description: values[1]?.trim() || '',
        how_to_grow: values[2]?.trim() || '',
        economic_importance: values[3]?.trim() || '',
        uses: values[4]?.trim() || '',
        major_districts: values[5]?.trim() || '',
        youtube_links: values[6]?.trim() || '',
        article_links: values[7]?.trim() || '',
        region: region
      };
    });
  }

  async getDetailedCropInfo(cropName: string): Promise<DetailedCropData | null> {
    const crops = await this.loadDetailedCropData();
    return crops.find(crop =>
      crop.crop.toLowerCase().includes(cropName.toLowerCase()) ||
      cropName.toLowerCase().includes(crop.crop.toLowerCase())
    ) || null;
  }

  async getCropsForDistrict(district: string): Promise<DetailedCropData[]> {
    const crops = await this.loadDetailedCropData();
    return crops.filter(crop =>
      crop.major_districts.toLowerCase().includes(district.toLowerCase())
    );
  }

  async getAllCrops(): Promise<DetailedCropData[]> {
    return await this.loadDetailedCropData();
  }
}

export const cropRecommender = new CropRecommender();
