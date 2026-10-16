import { useState, useEffect, useCallback } from "react";
import type { CropCard, CropDetail, PdfResponse } from "../types/cropGuide";
import { apiGet } from "../lib/httpClient";
import rawCropsDataset from "../data/cropsData.json";
import { findCropPdf, downloadCropPdf, downloadCropDatasetJson } from "../lib/cropPdfMap";

// Canonical pests & diseases for Rice fallback
const RICE_CANONICAL_PEST_DISEASE = {
  pests: [
    {
      name: "Stem Borer (Scirpophaga incertulas)",
      control: "Install 10 pheromone traps/acre; apply Cartap Hydrochloride 4G @ 8 kg/acre in standing water or Chlorantraniliprole 18.5% SC @ 60 ml/acre.",
      symptoms: "Dead hearts during vegetative phase and white earheads at heading phase."
    },
    {
      name: "Brown Plant Hopper (BPH)",
      control: "Avoid excess Nitrogen; alternate wetting and drying; spray Pymetrozine 50% WG @ 120 g/acre or Dinotefuran 20% SG @ 80 g/acre.",
      symptoms: "Hopper burn: drying and browning of plants in circular patches at base."
    },
    {
      name: "Gall Midge (Orseolia oryzae)",
      control: "Apply Fipronil 0.3% G @ 10 kg/acre or spray Thiamethoxam 25% WG @ 40 g/acre.",
      symptoms: "Silvery tubular galls (onion leaf / silver shoot symptom) causing tillers to fail."
    }
  ],
  diseases: [
    {
      name: "Blast Disease (Pyricularia oryzae)",
      control: "Seed treatment with Tricyclazole 75% WP @ 2 g/kg seed; spray Tricyclazole 75% WP @ 0.6 g/L water or Isoprothiolane 40% EC @ 1.5 ml/L.",
      symptoms: "Spindle-shaped lesions with grey center and brown margins on leaves; neck rot."
    },
    {
      name: "Bacterial Leaf Blight (Xanthomonas oryzae)",
      control: "Drain excess water; reduce nitrogen top-dressing; spray Streptocycline @ 1 g / 10 L water mixed with Copper Oxychloride 50% WP @ 25 g / 10 L.",
      symptoms: "Water-soaked streaks along leaf margins that turn yellow-white and wavy."
    },
    {
      name: "Sheath Blight (Rhizoctonia solani)",
      control: "Spray Hexaconazole 5% EC @ 2 ml/L or Validamycin 3% L @ 2.5 ml/L at first appearance.",
      symptoms: "Greenish-grey oval or irregular water-soaked spots on leaf sheaths near water line."
    }
  ]
};

export const mapToCropCard = (dto: any): CropCard => {
  let raw: any = {};
  if (dto.rawJson) {
    try {
      raw = typeof dto.rawJson === "string" ? JSON.parse(dto.rawJson) : dto.rawJson;
    } catch (e) {}
  }

  // If rawJson was empty, match from bundled master dataset
  if (!raw || Object.keys(raw).length === 0) {
    const cleanName = (dto.name || dto.nameEnglish || "").toLowerCase();
    const cleanSlug = (dto.slug || "").toLowerCase();
    raw = (rawCropsDataset as any[]).find((c: any) =>
      c.slug?.toLowerCase() === cleanSlug ||
      c.name?.toLowerCase() === cleanName ||
      c.id === dto.id ||
      cleanName.includes(c.name?.toLowerCase()) ||
      c.name?.toLowerCase().includes(cleanName)
    ) || {};
  }

  const durationParsed = typeof raw.duration_days === "string"
    ? parseInt(raw.duration_days.replace(/[^0-9]/g, "")) || dto.durationDays || 100
    : dto.durationDays || 100;

  const pdfInfo = findCropPdf(raw.slug || dto.slug || dto.name || "");

  return {
    id: String(dto.id || raw.id || pdfInfo.id),
    slug: raw.slug || dto.slug || pdfInfo.slug,
    nameEnglish: raw.name || dto.name || dto.nameEnglish || "",
    nameKannada: (Array.isArray(raw.local_names) && raw.local_names[raw.local_names.length - 1]) || dto.nameKannada || dto.name || "",
    nameScientific: raw.scientific_name || dto.scientificName || null,
    season: Array.isArray(raw.season) ? raw.season.join(", ") : (dto.season || "Kharif"),
    durationDays: durationParsed,
    difficulty: (raw.difficulty_level || dto.difficultyLevel || "Moderate") as any,
    capitalMin: dto.investmentPerAcre || 25000,
    capitalMax: dto.investmentPerAcre ? Math.round(dto.investmentPerAcre * 1.3) : 35000,
    returnsMin: dto.expectedReturns || 45000,
    returnsMax: dto.expectedReturns ? Math.round(dto.expectedReturns * 1.4) : 75000,
    districts: JSON.stringify(raw.recommended_districts_karnataka || dto.recommendedDistricts || (dto.district ? [dto.district] : ["Statewide"])),
    soilType: raw.soil?.texture || dto.soilType || "Fertile Loam",
    rainfallMm: raw.climate?.rainfall_mm || dto.rainfallMm || "700-1100 mm",
    nKgAcre: (raw.npk_requirement_kg_per_ha?.N ? Math.round(raw.npk_requirement_kg_per_ha.N / 2.471) : dto.nutrient?.nitrogenKg) || 45,
    pKgAcre: (raw.npk_requirement_kg_per_ha?.P ? Math.round(raw.npk_requirement_kg_per_ha.P / 2.471) : dto.nutrient?.phosphorusKg) || 25,
    kKgAcre: (raw.npk_requirement_kg_per_ha?.K ? Math.round(raw.npk_requirement_kg_per_ha.K / 2.471) : dto.nutrient?.potassiumKg) || 25,
    aiScore: dto.aiScore?.profitabilityScore || (raw.frontend_display?.priority_crop ? 92 : 88),
    pdfAvailable: true,
  };
};

export const mapToCropDetail = (dto: any): CropDetail => {
  const card = mapToCropCard(dto);

  let raw: any = {};
  if (dto.rawJson) {
    try {
      raw = typeof dto.rawJson === "string" ? JSON.parse(dto.rawJson) : dto.rawJson;
    } catch (e) {
      console.error("Failed to parse rawJson", e);
    }
  }

  // Match from local authoritative dataset if raw is incomplete
  if (!raw || !raw.growing_guide) {
    const cleanName = (dto.name || dto.nameEnglish || "").toLowerCase();
    const cleanSlug = (dto.slug || card.slug || "").toLowerCase();
    const matched = (rawCropsDataset as any[]).find((c: any) =>
      c.slug?.toLowerCase() === cleanSlug ||
      c.name?.toLowerCase() === cleanName ||
      c.id === dto.id ||
      cleanName.includes(c.name?.toLowerCase()) ||
      c.name?.toLowerCase().includes(cleanName)
    );
    if (matched) {
      raw = { ...matched, ...raw };
    }
  }

  const guide = raw.growing_guide || {};
  const seedSel = guide.seed_selection || {};
  const sowing = guide.sowing || {};
  const irrigation = guide.irrigation || {};
  const harvest = guide.harvest || {};
  const profitability = guide.profitability || {};
  const weed = guide.weed_management || {};
  const pestDisease = guide.pest_disease || (raw.slug === "rice-paddy" ? RICE_CANONICAL_PEST_DISEASE : {});

  // Parse pH range
  const phStr = String(raw.soil?.ideal_pH || dto.soilRequirement?.phRange || "6.0–7.5");
  const phParts = phStr.replace(/[^0-9.–-]/g, "").split(/[–-]/);
  const phMin = parseFloat(phParts[0]) || 6.0;
  const phMax = parseFloat(phParts[1]) || (phMin + 1.0);

  // Parse spacing
  const spacingStr = String(sowing.spacing_cm || "0 x 0");
  const spacingParts = spacingStr.split(/[xX]/).map(s => parseInt(s.trim()) || 0);
  const rowSpacing = spacingParts[0] || 0;
  const plantSpacing = spacingParts[1] || 0;

  // Map seed varieties
  const varietiesList = (seedSel.varieties || []).map((v: string) => ({
    name: v,
    source: "UAS Bangalore / UAS Dharwad Certified",
    cost_per_unit: 0,
    unit: "kg",
    suitable_districts: raw.recommended_districts_karnataka || [],
    highlights: "Recommended high-yielding regional cultivar"
  }));

  // Map Land Prep steps (REAL agronomic steps from dataset!)
  const landPrepSteps: string[] = Array.isArray(guide.soil_preparation) && guide.soil_preparation.length > 0
    ? guide.soil_preparation
    : Array.isArray(raw.land_preparation?.steps) && raw.land_preparation.steps.length > 0
      ? raw.land_preparation.steps
      : [
          "Plough field 2–3 times to 20–25 cm depth to achieve fine tilth and destroy weeds",
          "Apply 10 tonnes Farmyard Manure (FYM) or 5 tonnes vermicompost per hectare",
          "Incorporate organic matter thoroughly during the last ploughing",
          "Form ridges and furrows or level the field according to irrigation requirements"
        ];

  // Map Pests & Diseases
  const rawPests = pestDisease.pests || raw.pest_management?.pests || [];
  const mappedPests = rawPests.map((p: any) => ({
    name: p.name,
    type: "pest" as const,
    severity: "moderate" as const,
    affected_part: "Foliage / Shoots",
    visual_symptoms: p.symptoms || "Damage on leaves, stems or shoots",
    season: "All seasons",
    organic_control: p.organic_control || null,
    chemical_name: p.control || p.chemical_control || "Consult local Raitha Samparka Kendra (RSK)",
    chemical_dose: null,
    spray_timing: "At initial pest threshold onset",
    spray_count: 1,
    wrong_chemicals: []
  }));

  const rawDiseases = pestDisease.diseases || raw.disease_management?.diseases || dto.diseases || [];
  const mappedDiseases = rawDiseases.map((d: any) => ({
    name: d.name,
    type: "disease" as const,
    severity: "moderate" as const,
    affected_part: "Leaves / Roots",
    visual_symptoms: d.symptoms || "Lesions, discoloration or wilting",
    season: "All seasons",
    organic_control: d.organic_control || d.management || null,
    chemical_name: d.control || d.chemical_control || "Consult local Raitha Samparka Kendra (RSK)",
    chemical_dose: null,
    spray_timing: "At first appearance of pathogen spots",
    spray_count: 1,
    wrong_chemicals: []
  }));

  const allPestsDiseases = [...mappedPests, ...mappedDiseases];

  // Map Calendar
  const calendarWeeks: Array<{ period: string; tasks: string[]; health_check: string; critical: boolean }> = [];
  if (Array.isArray(guide.growth_timeline) && guide.growth_timeline.length > 0) {
    guide.growth_timeline.forEach((item: any) => {
      calendarWeeks.push({
        period: `${item.stage} (${item.days} days)`,
        tasks: [
          `Monitor crop during ${item.stage.toLowerCase()} phase`,
          item.instruction || `Maintain recommended soil moisture and scout for pests`
        ],
        health_check: item.stage,
        critical: true
      });
    });
  }

  if (Array.isArray(guide.npk_schedule) && guide.npk_schedule.length > 0) {
    guide.npk_schedule.forEach((n: any) => {
      calendarWeeks.push({
        period: `${n.stage} (DAS ${n.days_after_sowing || "0"})`,
        tasks: [
          `Apply ${n.fertilizers || "NPK balance"} (${n.method || "Basal/Broadcast"})`,
          `Target: N: ${n.N_kg_ha || 0} kg/ha, P: ${n.P_kg_ha || 0} kg/ha, K: ${n.K_kg_ha || 0} kg/ha`
        ],
        health_check: "Nutrient Remediation",
        critical: true
      });
    });
  }

  if (calendarWeeks.length === 0 && Array.isArray(landPrepSteps)) {
    landPrepSteps.forEach((step, idx) => {
      calendarWeeks.push({
        period: `Preparation Phase — Step ${idx + 1}`,
        tasks: [step],
        health_check: "Soil & Land Preparation",
        critical: true
      });
    });
  }

  const pdfInfo = findCropPdf(raw.slug || card.slug || card.nameEnglish);

  return {
    ...card,
    nameCommonAlt: Array.isArray(raw.local_names) ? raw.local_names.join(", ") : (raw.name_kannada || null),
    overview: {
      why_good_now: raw.summary || dto.guidelines || "Well-suited for sustainable cultivation in Karnataka agro-climatic conditions.",
      income_best_case_min: card.capitalMin,
      income_best_case_max: card.returnsMax,
      income_worst_case_min: card.capitalMin,
      income_worst_case_max: card.returnsMin,
      best_districts: raw.recommended_districts_karnataka || dto.recommendedDistricts || (dto.district ? [dto.district] : ["All districts"]),
      season: card.season,
      crop_duration_days_min: card.durationDays,
      crop_duration_days_max: card.durationDays,
      beginner_friendly: raw.recommendation_factors?.suitable_for_beginner_farmers !== false,
      beginner_note: raw.recommendation_factors?.suitable_for_beginner_farmers ? "Suitable for beginner smallholders with basic irrigation access." : "Requires disciplined pest monitoring and agronomic management."
    },
    soil: {
      soil_types_suitable: raw.soil?.texture ? [raw.soil.texture] : [card.soilType],
      soil_types_unsuitable: [],
      ph_min: phMin,
      ph_max: phMax,
      drainage_requirement: raw.soil?.drainage || "Good drainage required",
      land_prep_steps: landPrepSteps,
      land_prep_cost_min: 6000,
      land_prep_cost_max: 10000,
      soil_corrections: {
        "Low Organic Matter": "Incorporate 10 tonnes FYM or 5 tonnes vermicompost per hectare",
        "Acidic Soil (pH < 6.0)": "Apply agricultural lime 1–2 t/ha 2 weeks before planting",
        "Alkaline Soil (pH > 7.5)": "Apply Gypsum 500 kg/acre and ensure green manuring"
      }
    },
    seed: {
      varieties: varietiesList,
      seedlings_per_acre: 0,
      sowing_method: sowing.method || "Direct line sowing / Nursery transplanting",
      row_spacing_cm: rowSpacing,
      plant_spacing_cm: plantSpacing,
      treatment_chemical: seedSel.seed_treatment || "Carbendazim @ 2g/kg or Trichoderma @ 4g/kg seed",
      treatment_process: "Slurry treatment or soak as recommended 24 hours prior to sowing"
    },
    irrigation: {
      water_requirement: raw.recommendation_factors?.water_requirement_level || irrigation.total_water_mm || "500–800 mm",
      recommended_method: irrigation.schedule?.[0]?.depth_cm ? `Surface / Furrow (${irrigation.schedule[0].depth_cm})` : "Drip / Furrow Irrigation",
      schedule: (irrigation.schedule || []).map((s: any) => ({
        stage: s.stage || "Growth Stage",
        frequency: s.depth_cm || "Regular interval",
        amount: s.instruction || "Maintain field capacity without waterlogging"
      })),
      critical_stage: (irrigation.critical_stages && irrigation.critical_stages[0]) || "Flowering & Pod/Grain Development",
      critical_stage_consequence: "Severe moisture stress during critical stage can cause 30–50% yield reduction",
      overwatering_signs: "Yellowing foliage, root asphyxiation, and collar rot",
      annual_rainfall_mm: card.rainfallMm
    },
    fertilizer: {
      nitrogen_kg_per_acre: card.nKgAcre || 40,
      phosphorus_kg_per_acre: card.pKgAcre || 20,
      potassium_kg_per_acre: card.kKgAcre || 20,
      urea_kg_per_acre: Math.round((card.nKgAcre || 40) / 0.46),
      organic_type: "Well-decomposed FYM (10 t/ha) or Vermicompost (5 t/ha)",
      application_method: "Basal dressing at sowing + Top dressing at vegetative and flowering stages",
      micronutrients: [
        {
          nutrient: "Zinc (Zn)",
          deficiency_sign: "Khaira disease / interveinal chlorosis on young leaves",
          product: "Zinc Sulphate 21%",
          dose_g_per_tree: 10,
          timing: "Basal application @ 10 kg/acre"
        }
      ]
    },
    weed: {
      critical_period: weed.critical_period || "First 30–45 days after sowing",
      manual_tools: ["Hand hoe", "Cycle weeder", "Rotary weeder"],
      manual_frequency: weed.manual_weeding || "Two hand weedings at 20 and 40 DAS",
      manual_cost_per_acre: 3000,
      weedicides: (weed.herbicides || []).map((h: any) => ({
        name: h.name,
        trade_names: [],
        target_weeds: h.target || "Broad-spectrum weeds",
        dosage_per_litre_water: h.dose || "As per label",
        timing: h.timing || "Pre-emergence within 48 hours of sowing",
        cost_per_acre: 800
      })),
      common_mistakes: ["Delayed first weeding beyond 30 DAS leads to severe weed-crop competition"]
    },
    pestDisease: {
      pests_diseases: allPestsDiseases,
      pesticide_safety_rules: [
        "Wear protective masks and gloves while preparing spray solutions",
        "Spray early morning or late evening; avoid spraying against the wind",
        "Observe mandatory pre-harvest interval (PHI) before harvesting produce"
      ],
      emergency_contact: "Kisan Call Center: 1551 | UAS Bangalore Agronomy Helpline"
    },
    calendar: {
      weeks: calendarWeeks
    },
    harvest: {
      maturity_signs: [harvest.maturity_days ? `Maturity attained in ${harvest.maturity_days} days` : "Crop changes to harvest color and grain/fruit hardens"],
      harvest_too_early_consequence: "High moisture content, poor test weight, and reduced market grade",
      harvest_too_late_consequence: "Pod shattering, grain lodging, and pest vulnerability in field",
      days_to_maturity_from_planting_min: card.durationDays,
      days_to_maturity_from_planting_max: card.durationDays,
      harvest_method: "Manual harvesting using sickles or mechanical harvester",
      time_per_acre_days: 2,
      total_harvest_cost_per_acre_min: 3000,
      total_harvest_cost_per_acre_max: 5000,
      yield_avg_quintal_per_acre: dto.yieldInfo?.averageQuintals || 18,
      yield_best_quintal_per_acre: dto.yieldInfo?.bestPracticeQuintals || 25,
      yield_worst_quintal_per_acre: dto.yieldInfo?.minimumQuintals || 12
    },
    postHarvest: {
      grades: [
        { grade: "Grade A (Fair Average Quality)", quality: "Clean, dry, uniform grains/fruits free from pest damage" }
      ],
      storage_duration: "6–12 months under proper moisture control",
      storage_conditions: harvest.post_harvest || "Sun dry to safe moisture level (<12%) and store in elevated gunny bags",
      storage_pest_prevention: "Treat storage bags with 5% Neem oil or store in hermetic bags"
    },
    selling: {
      apmc_mandis: ["District APMC Mandi", "Bandipalya (Mysuru)", "Kolar APMC", "Gundlupet APMC"],
      cooperatives: [{ name: "Karnataka State Agricultural Marketing Board (KSAMB)", benefit: "Direct auction transparent bidding" }],
      price_check_sources: ["Agmarknet Daily Live Prices", "e-NAM Portal"],
      best_selling_time: "Immediately post drying or off-peak post-harvest window",
      negotiation_tips: "Sort and grade produce into uniform sizes to command 10–15% premium price",
      msp_applicable: true,
      msp_amount: dto.marketInfo?.averageMsp || 2800
    },
    financials: {
      cost_items: [],
      total_cost: card.capitalMin,
      expected_yield_quintal: dto.yieldInfo?.averageQuintals || 18,
      price_per_quintal_conservative: dto.marketInfo?.averageMsp || 2500,
      gross_income: card.returnsMin,
      net_profit: card.returnsMin - card.capitalMin,
      roi_percent: card.capitalMin ? Math.round(((card.returnsMin - card.capitalMin) / card.capitalMin) * 100) : 75
    },
    mistakes: { mistakes: [] },
    faqs: { faqs: [] },
    schemes: { schemes: [] },
    pdfCloudinaryUrl: pdfInfo.pdfPath,
    pdfGithubUrl: null,
    kannadaAvailable: true,
    aiFeatures: raw.ai_features_supported || ["crop_recommendation", "yield_estimation", "disease_detection"],
    iotParameters: raw.iot_monitoring_parameters || ["soil_moisture", "temperature", "humidity"],

    // Extra rich matrices
    displaySoilType: card.soilType,
    displayRainfallMm: card.rainfallMm,
    seedDetails: {
      seed_rate: seedSel.seed_rate || "Recommended seed rate as per UAS guidelines",
      seed_treatment: seedSel.seed_treatment || "Carbendazim @ 2g/kg seed",
      germination_days: seedSel.germination_days || "3–7 days",
      sowing_method: sowing.method || "Direct line sowing",
      spacing_cm: sowing.spacing_cm || "Recommended spacing",
      depth_cm: sowing.depth_cm || "2–4 cm",
      best_time: sowing.best_time || "June–July (Kharif) / Oct–Nov (Rabi)",
      tips: sowing.tips || "Maintain adequate soil moisture prior to sowing"
    },
    npkSchedule: Array.isArray(guide.npk_schedule) ? guide.npk_schedule : [],
    growthTimeline: Array.isArray(guide.growth_timeline) ? guide.growth_timeline : [],
    harvestDetails: {
      maturity_days: harvest.maturity_days || String(card.durationDays),
      yield_per_ha: harvest.yield_per_ha || "Standard regional yield",
      post_harvest: harvest.post_harvest || "Sun dry and store in moisture-proof containers"
    },
    profitabilityDetails: {
      input_cost_per_ha: profitability.input_cost_per_ha || "₹25,000–35,000",
      net_profit: profitability.net_profit || "₹30,000–50,000",
      market_demand: profitability.market_demand || "High — steady demand"
    },
    pdfFileName: pdfInfo.pdfFileName,
    rawDataset: raw
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
      } else if (params?.district && params.district !== "all") {
        endpoint = `/api/crops/district/${encodeURIComponent(params.district)}`;
      } else if (params?.season && params.season !== "all") {
        endpoint = `/api/crops/season/${encodeURIComponent(params.season)}`;
      }

      let dtos: any[] = [];
      try {
        const data = await apiGet(endpoint);
        if (Array.isArray(data)) {
          dtos = data;
        } else if (data && Array.isArray(data.content)) {
          dtos = data.content;
          setTotalPages(data.total_pages || data.totalPages || 1);
        }
      } catch (e) {
        // Backend not reachable, fall back to master dataset
        console.warn("Backend API unavailable, loading crops from local master dataset", e);
      }

      // If backend returned no crops, populate from bundled master dataset
      if (!dtos || dtos.length === 0) {
        dtos = (rawCropsDataset as any[]).map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          scientificName: c.scientific_name,
          season: Array.isArray(c.season) ? c.season.join(", ") : c.season,
          durationDays: parseInt(String(c.duration_days).replace(/[^0-9]/g, "")) || 100,
          difficultyLevel: c.difficulty_level || "Moderate",
          district: c.recommended_districts_karnataka?.[0] || "Statewide",
          recommendedDistricts: c.recommended_districts_karnataka || [],
          rawJson: JSON.stringify(c)
        }));
      }

      // Filter locally
      if (params?.search) {
        const q = params.search.toLowerCase();
        dtos = dtos.filter((c: any) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.scientificName || "").toLowerCase().includes(q) ||
          (c.slug || "").toLowerCase().includes(q)
        );
      }
      if (params?.season && params.season !== "all") {
        dtos = dtos.filter((c: any) => (c.season || "").toLowerCase().includes(params.season!.toLowerCase()));
      }
      if (params?.district && params.district !== "all") {
        dtos = dtos.filter((c: any) =>
          (c.district || "").toLowerCase().includes(params.district!.toLowerCase()) ||
          (c.recommendedDistricts && c.recommendedDistricts.some((d: string) => d.toLowerCase().includes(params.district!.toLowerCase())))
        );
      }

      // Sorting
      if (params?.sort === "alphabetical" || params?.sort === "name") {
        dtos.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
      } else if (params?.sort === "profit_high_low" || params?.sort === "expectedReturns") {
        dtos.sort((a: any, b: any) => ((b.expectedReturns || 0) - (b.investmentPerAcre || 0)) - ((a.expectedReturns || 0) - (a.investmentPerAcre || 0)));
      } else if (params?.sort === "investmentPerAcre") {
        dtos.sort((a: any, b: any) => (a.investmentPerAcre || 0) - (b.investmentPerAcre || 0));
      } else if (params?.sort === "ai_score") {
        dtos.sort((a: any, b: any) => (b.aiScore?.profitabilityScore || 0) - (a.aiScore?.profitabilityScore || 0));
      }

      setCrops(dtos.map(mapToCropCard));
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load crops");
      // Resilient fallback
      setCrops((rawCropsDataset as any[]).map(c => mapToCropCard({ ...c, rawJson: JSON.stringify(c) })));
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
        let data: any = null;

        // Try backend first
        try {
          if (!isNaN(Number(slugOrId))) {
            data = await apiGet(`/api/crops/${slugOrId}`);
          } else {
            const list = await apiGet(`/api/crops?size=500`);
            const dtos = list?.content || (Array.isArray(list) ? list : []);
            data = dtos.find((c: any) =>
              (c.name?.toLowerCase().replace(/\s+/g, '-') === slugOrId.toLowerCase()) ||
              (String(c.id) === slugOrId) ||
              (c.slug === slugOrId.toLowerCase())
            );
          }
        } catch (apiErr) {
          console.warn("Backend crop query failed or unavailable, resolving from master dataset", apiErr);
        }

        // If not found from backend, find in local authoritative master dataset
        if (!data) {
          const clean = slugOrId.toLowerCase().trim();
          const cleanNoDash = clean.replace(/[^a-z0-9]/g, "");

          const matched = (rawCropsDataset as any[]).find((c: any) => {
            const cSlug = (c.slug || "").toLowerCase();
            const cName = (c.name || "").toLowerCase();
            const cId = (c.id || "").toLowerCase();
            return (
              cSlug === clean ||
              cId === clean ||
              cName.replace(/[^a-z0-9]/g, "") === cleanNoDash ||
              cSlug.replace(/[^a-z0-9]/g, "") === cleanNoDash ||
              clean.includes(cSlug) ||
              cSlug.includes(clean)
            );
          });

          if (matched) {
            data = {
              id: matched.id,
              name: matched.name,
              slug: matched.slug,
              scientificName: matched.scientific_name,
              season: Array.isArray(matched.season) ? matched.season.join(", ") : matched.season,
              durationDays: parseInt(String(matched.duration_days).replace(/[^0-9]/g, "")) || 100,
              difficultyLevel: matched.difficulty_level || "Moderate",
              rawJson: JSON.stringify(matched)
            };
          }
        }

        if (!data) {
          throw new Error(`Crop '${slugOrId}' not found in registry`);
        }

        if (!cancelled) {
          setCrop(mapToCropDetail(data));
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error loading crop:", err);
          setError(err.message ?? "Failed to load crop");
        }
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

  const downloadPdf = async (slugOrName: string, cropName?: string) => {
    setDownloading(true);
    setError(null);
    try {
      downloadCropPdf(slugOrName, cropName);
    } catch (err: any) {
      setError(err.message ?? "Download failed");
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return { downloadPdf, downloading, error };
};

export const useDatasetDownload = () => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadDataset = (crop: CropDetail | any) => {
    setDownloading(true);
    setError(null);
    try {
      downloadCropDatasetJson(crop?.rawDataset || crop);
    } catch (err: any) {
      setError(err.message ?? "Dataset export failed");
    } finally {
      setTimeout(() => setDownloading(false), 600);
    }
  };

  return { downloadDataset, downloading, error };
};
