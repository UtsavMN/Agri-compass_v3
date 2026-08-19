import { useState, useEffect, useCallback } from "react";
import type { CropCard, CropDetail, PdfResponse } from "../types/cropGuide";
import { apiGet } from "../lib/httpClient";

const mapToCropCard = (dto: any): CropCard => {
  let raw: any = {};
  if (dto.rawJson) {
    try {
      raw = JSON.parse(dto.rawJson);
    } catch (e) {}
  }

  return {
    id: String(dto.id),
    slug: dto.name?.toLowerCase().replace(/\s+/g, '-') || String(dto.id),
    nameEnglish: dto.name || "",
    nameKannada: dto.name || "",
    nameScientific: dto.scientificName || null,
    season: dto.season || "",
    durationDays: dto.durationDays || 0,
    difficulty: dto.difficultyLevel || "Moderate",
    capitalMin: dto.investmentPerAcre || 0,
    capitalMax: dto.investmentPerAcre || 0,
    returnsMin: dto.expectedReturns || 0,
    returnsMax: dto.expectedReturns || 0,
    districts: JSON.stringify(dto.recommendedDistricts?.length ? dto.recommendedDistricts : (dto.district ? [dto.district] : [])),
    soilType: dto.soilType || "",
    rainfallMm: dto.rainfallMm || "",
    nKgAcre: (raw.npk_requirement_kg_per_ha?.N ? Math.round(raw.npk_requirement_kg_per_ha.N / 2.471) : dto.nutrient?.nitrogenKg) || null,
    pKgAcre: (raw.npk_requirement_kg_per_ha?.P ? Math.round(raw.npk_requirement_kg_per_ha.P / 2.471) : dto.nutrient?.phosphorusKg) || null,
    kKgAcre: (raw.npk_requirement_kg_per_ha?.K ? Math.round(raw.npk_requirement_kg_per_ha.K / 2.471) : dto.nutrient?.potassiumKg) || null,
    aiScore: dto.aiScore?.profitabilityScore || 85,
    pdfAvailable: true,
    temperatureRange: dto.temperatureRange || "",
    waterRequirement: dto.waterRequirement || ""
  };
};

const mapToCropDetail = (dto: any): CropDetail => {
  const card = mapToCropCard(dto);
  
  let raw: any = {};
  if (dto.rawJson) {
    try {
      raw = JSON.parse(dto.rawJson);
    } catch (e) {
      console.error("Failed to parse rawJson", e);
    }
  }

  return {
    ...card,
    nameCommonAlt: raw.name_kannada || null,
    overview: {
      why_good_now: raw.summary || dto.guidelines || "",
      income_best_case_min: dto.expectedReturns || 0,
      income_best_case_max: raw.growing_guide?.profitability?.net_profit || dto.expectedReturns || 0,
      income_worst_case_min: dto.expectedReturns || 0,
      income_worst_case_max: dto.expectedReturns || 0,
      best_districts: dto.recommendedDistricts?.length ? dto.recommendedDistricts : (dto.district ? [dto.district] : []),
      season: dto.season || "",
      crop_duration_days_min: dto.durationDays || 0,
      crop_duration_days_max: dto.durationDays || 0,
      beginner_friendly: dto.difficultyLevel === "Easy",
    },
    soil: {
      soil_types_suitable: raw.soil?.texture ? [raw.soil.texture] : (dto.soilType ? [dto.soilType] : []),
      soil_types_unsuitable: [],
      ph_min: raw.soil?.ph_range ? parseFloat(raw.soil.ph_range.split('-')[0]) : (dto.soilRequirement?.phRange ? parseFloat(dto.soilRequirement.phRange.split('-')[0]) : 6.0),
      ph_max: raw.soil?.ph_range ? parseFloat(raw.soil.ph_range.split('-')[1]) : (dto.soilRequirement?.phRange ? parseFloat(dto.soilRequirement.phRange.split('-')[1] || dto.soilRequirement.phRange.split('-')[0]) : 7.0),
      drainage_requirement: dto.waterRequirement || "",
      land_prep_steps: raw.land_preparation?.steps || [dto.soilRequirement?.cropRotation, dto.soilRequirement?.greenManure ? "Green Manure" : null].filter(Boolean) as string[],
      land_prep_cost_min: 0,
      land_prep_cost_max: 0,
      soil_corrections: {}
    },
    seed: {
      varieties: (raw.seeds?.varieties || []).map((v: string) => ({
        name: v,
        source: "Local/UAS",
        cost_per_unit: 0,
        unit: "kg",
        suitable_districts: [],
        highlights: "Recommended variety"
      })),
      sowing_method: raw.seeds?.sowing_method || "",
      row_spacing_cm: parseInt((raw.seeds?.spacing || "0").split('x')[0]) || 0,
      plant_spacing_cm: parseInt((raw.seeds?.spacing || "0").split('x')[1]) || 0,
      treatment_chemical: raw.seeds?.seed_treatment || "",
      treatment_process: ""
    },
    irrigation: {
      water_requirement: raw.climate?.rainfall_mm || dto.waterRequirement || "",
      recommended_method: raw.irrigation?.method || dto.irrigations?.[0] || "",
      schedule: (raw.irrigation?.critical_stages || dto.irrigations || []).map((stage: string) => ({
        stage, frequency: "As needed", amount: "Moderate"
      })),
      critical_stage: raw.irrigation?.critical_stages?.[0] || dto.irrigations?.[0] || "",
      critical_stage_consequence: "Yield reduction",
      overwatering_signs: "Yellowing leaves",
      annual_rainfall_mm: dto.rainfallMm || ""
    },
    fertilizer: {
      nitrogen_kg_per_acre: dto.nutrient?.nitrogenKg || 0,
      phosphorus_kg_per_acre: dto.nutrient?.phosphorusKg || 0,
      potassium_kg_per_acre: dto.nutrient?.potassiumKg || 0,
      urea_kg_per_acre: 0,
      organic_type: raw.fertilizer?.fym_t_per_ha ? `FYM ${raw.fertilizer.fym_t_per_ha} t/ha` : (dto.soilRequirement?.organicCarbon || "Compost"),
      application_method: "Basal & Top Dressing",
      micronutrients: []
    },
    weed: {
      critical_period: "First 30-45 days",
      manual_tools: ["Hand hoe"],
      manual_frequency: raw.weed_management?.manual_weeding || "Every 15-20 days",
      manual_cost_per_acre: 2000,
      weedicides: (raw.weed_management?.herbicides || []).map((h: any) => ({
        name: h.name,
        trade_names: [],
        target_weeds: h.target || "Broad spectrum",
        dosage_per_litre_water: h.dose,
        timing: h.timing || "Pre-emergence",
        cost_per_acre: 0
      })),
      common_mistakes: []
    },
    pestDisease: {
      pests_diseases: [
        ...(raw.pest_management?.pests || []).map((p: any) => ({
          name: p.name,
          type: "pest",
          severity: "moderate",
          affected_part: "Plant",
          visual_symptoms: p.symptoms,
          season: "All",
          organic_control: p.organic_control,
          chemical_name: p.chemical_control,
          chemical_dose: null,
          spray_timing: "At onset",
          spray_count: 1,
          wrong_chemicals: []
        })),
        ...(raw.disease_management?.diseases || dto.diseases || []).map((d: any) => ({
          name: d.name,
          type: "disease",
          severity: "moderate",
          affected_part: "Leaves",
          visual_symptoms: d.symptoms,
          season: "All",
          organic_control: d.management || d.organic_control,
          chemical_name: d.chemical_control || null,
          chemical_dose: null,
          spray_timing: "At onset",
          spray_count: 1,
          wrong_chemicals: []
        }))
      ],
      pesticide_safety_rules: [],
      emergency_contact: "Kisan Call Center: 1551"
    },
    calendar: {
      weeks: [
        ...(dto.growingSteps || []).map((s: any) => ({
          period: s.title || `Step ${s.stepNumber}`,
          tasks: [s.details],
          health_check: "Soil Prep",
          critical: true
        })),
        ...(raw.growing_guide?.npk_schedule || []).map((n: any) => ({
          period: n.stage,
          tasks: [`Apply ${n.fertilizers} (${n.method})`, `N: ${n.N_kg_ha} kg/ha, P: ${n.P_kg_ha} kg/ha, K: ${n.K_kg_ha} kg/ha`],
          health_check: "Nutrient application",
          critical: true
        })),
        ...(raw.growing_guide?.irrigation?.schedule || []).map((i: any) => ({
          period: i.stage,
          tasks: [i.depth_cm || i.instruction || "Irrigate as required"],
          health_check: "Moisture check",
          critical: false
        }))
      ]
    },
    harvest: {
      maturity_signs: raw.harvesting?.signs_of_maturity ? [raw.harvesting.signs_of_maturity] : [],
      harvest_too_early_consequence: "Low weight/quality",
      harvest_too_late_consequence: "Overripe/Shattering",
      days_to_maturity_from_planting_min: dto.durationDays || 0,
      days_to_maturity_from_planting_max: dto.durationDays || 0,
      harvest_method: raw.harvesting?.method || "Manual",
      time_per_acre_days: 2,
      total_harvest_cost_per_acre_min: 0,
      total_harvest_cost_per_acre_max: 0,
      yield_avg_quintal_per_acre: dto.yieldInfo?.averageQuintals || 0,
      yield_best_quintal_per_acre: dto.yieldInfo?.bestPracticeQuintals || 0,
      yield_worst_quintal_per_acre: dto.yieldInfo?.minimumQuintals || 0
    },
    postHarvest: {
      grades: [],
      storage_duration: dto.postHarvest?.storageDurationMonths ? `${dto.postHarvest.storageDurationMonths} months` : "",
      storage_conditions: raw.harvesting?.storage || dto.postHarvest?.storageMethod || "",
      storage_pest_prevention: ""
    },
    selling: {
      apmc_mandis: [],
      cooperatives: [],
      price_check_sources: [],
      best_selling_time: "Immediately after harvest or after drying",
      negotiation_tips: "",
      msp_applicable: (dto.marketInfo?.averageMsp || 0) > 0,
      msp_amount: dto.marketInfo?.averageMsp || null
    },
    financials: {
      cost_items: [],
      total_cost: dto.investmentPerAcre || 0,
      expected_yield_quintal: dto.yieldInfo?.averageQuintals || 0,
      price_per_quintal_conservative: dto.marketInfo?.averageMsp || 0,
      gross_income: dto.expectedReturns || 0,
      net_profit: (dto.expectedReturns || 0) - (dto.investmentPerAcre || 0),
      roi_percent: dto.investmentPerAcre ? (((dto.expectedReturns || 0) - dto.investmentPerAcre) / dto.investmentPerAcre * 100) : 0
    },
    mistakes: { mistakes: [] },
    faqs: { faqs: [] },
    schemes: { schemes: [] },
    pdfCloudinaryUrl: `/crops info/${card.slug.replace(/-/g, '_')}_cultivation_guide.pdf`,
    pdfGithubUrl: null,
    kannadaAvailable: false,
    aiFeatures: raw.ai_features_supported || ["crop_recommendation", "yield_estimation"],
    iotParameters: raw.iot_monitoring_parameters || ["soil_moisture", "temperature"]
  };
};

export const useCropList = (params?: {
  search?: string;
  season?: string;
  district?: string;
  sort?: string;
}) => {
  const [crops, setCrops] = useState<CropCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCrops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = "/api/crops?size=100";
      
      if (params?.search) {
        endpoint = `/api/crops/search?query=${encodeURIComponent(params.search)}`;
      } else if (params?.district && params.district !== 'all') {
        endpoint = `/api/crops/district/${encodeURIComponent(params.district)}`;
      } else if (params?.season && params.season !== 'all') {
        endpoint = `/api/crops/season/${encodeURIComponent(params.season)}`;
      }
      
      const data = await apiGet(endpoint);
      
      let dtos = [];
      if (Array.isArray(data)) {
        dtos = data;
        setTotalPages(1);
      } else if (data && Array.isArray(data.content)) {
        dtos = data.content;
        setTotalPages(data.total_pages || data.totalPages || 1);
      }
      
      if (params?.season && params.season !== 'all' && !endpoint.includes('/season/')) {
        dtos = dtos.filter((c: any) => c.season?.toLowerCase().includes(params.season!.toLowerCase()));
      }
      if (params?.district && params.district !== 'all' && !endpoint.includes('/district/')) {
        dtos = dtos.filter((c: any) => 
           c.district?.toLowerCase().includes(params.district!.toLowerCase()) ||
           (c.recommendedDistricts && c.recommendedDistricts.some((d:string) => d.toLowerCase().includes(params.district!.toLowerCase())))
        );
      }
      
      if (params?.sort === 'alphabetical') {
         dtos.sort((a:any, b:any) => (a.name || '').localeCompare(b.name || ''));
      } else if (params?.sort === 'profit_high_low') {
         dtos.sort((a:any, b:any) => ((b.expectedReturns||0)-(b.investmentPerAcre||0)) - ((a.expectedReturns||0)-(a.investmentPerAcre||0)));
      } else if (params?.sort === 'water_low_high') {
         dtos.sort((a:any, b:any) => (a.rainfallMm || '').localeCompare(b.rainfallMm || ''));
      }

      setCrops(dtos.map(mapToCropCard));
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load crops");
      setCrops([]);
    } finally {
      setLoading(false);
    }
  }, [params?.search, params?.season, params?.district, params?.sort]);

  useEffect(() => { fetchCrops(); }, [fetchCrops]);

  return { crops, totalPages, loading, error, refetch: fetchCrops };
};

export const useCropDetail = (slugOrId: string) => {
  const [crop, setCrop] = useState<CropDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugOrId) return;
    let cancelled = false;

    const fetch_ = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = null;
        if (!isNaN(Number(slugOrId))) {
            data = await apiGet(`/api/crops/${slugOrId}`);
        } else {
            const list = await apiGet(`/api/crops?size=500`);
            const dtos = list.content || [];
            data = dtos.find((c: any) => 
               (c.name?.toLowerCase().replace(/\s+/g, '-') === slugOrId) ||
               (String(c.id) === slugOrId)
            );
        }
        
        if (!data) throw new Error("Crop not found");
        if (!cancelled) setCrop(mapToCropDetail(data));
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Failed to load crop");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch_();
    return () => { cancelled = true; };
  }, [slugOrId]);

  return { crop, loading, error };
};

export const usePdfDownload = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = async (slug: string, cropName: string) => {
    setDownloading(true);
    setError(null);
    try {
      const formattedSlug = slug.replace(/-/g, '_').toLowerCase();
      const pdfUrl = `/crops info/${formattedSlug}_cultivation_guide.pdf`;
      window.open(pdfUrl, '_blank');
    } catch (err: any) {
      setError(err.message ?? "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return { downloadPdf, downloading, error };
};
