// Comprehensive Agronomic Diagnostic Engine for Karnataka Soils & Crops
export interface SoilDataInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pH: number;
  moisture: number;
  temperature_C: number;
  humidity_percent: number;
}

export interface SoilAnalysisPayload {
  farmer_name?: string;
  location?: string;
  date?: string;
  soil_data: SoilDataInput;
  preferred_crop?: string | null;
  crop_status?: 'growing' | 'yet_to_be_grown';
  field_size_acres?: number;
  water_source?: string;
  season?: string;
}

export interface CropGuide {
  sowing_details: string;
  fertilizer_npk_schedule_per_acre: string;
  irrigation_plan: string;
  pest_disease_management: string;
  harvesting_tips: string;
}

export interface RecommendedCrop {
  crop_name: string;
  suitability_score: number;
  expected_yield_per_acre_tons: number;
  growing_guide: CropGuide;
}

export interface SoilHealthReport {
  status: string;
  limiting_factors: string[];
  soil_amendment_recommendations: string;
}

export interface NutrientAdjustmentItem {
  nutrient: 'Nitrogen (N)' | 'Phosphorus (P)' | 'Potassium (K)' | 'Secondary & Micronutrients';
  current_level: string;
  target_level: string;
  difference: string;
  action: 'increase' | 'decrease' | 'maintain';
  unit_recommendation: string;
  commercial_fertilizer_dosage: string;
  rationale: string;
}

export interface WaterAdjustmentItem {
  parameter: string;
  current_moisture: string;
  ideal_moisture: string;
  difference: string;
  action: 'increase' | 'decrease' | 'maintain';
  unit_recommendation: string;
  frequency_and_schedule: string;
}

export interface SoilConditionImprovement {
  parameter: string;
  current_value: string;
  ideal_target: string;
  remediation_in_units: string;
  practical_steps: string;
}

export interface ActiveCropOptimization {
  crop_name: string;
  field_status: 'crop_growing';
  ideal_growing_protocol: {
    stage_summary: string;
    field_preparation_and_current_care: string;
    fertilizer_npk_schedule_per_acre: string;
    irrigation_plan: string;
    pest_disease_management: string;
    harvesting_tips: string;
  };
  nutrient_adjustments: NutrientAdjustmentItem[];
  water_adjustments: WaterAdjustmentItem;
  soil_condition_improvements: SoilConditionImprovement[];
  expected_yield_with_improvements: string;
  current_vs_ideal_summary: string;
}

export interface RecommendationResponse {
  mode: 'crop_recommendation' | 'active_crop_optimization';
  current_crop?: string | null;
  recommended_crops: RecommendedCrop[];
  active_crop_optimization?: ActiveCropOptimization;
  soil_health_report: SoilHealthReport;
  warnings: string[];
  confidence_level: number;
}

interface CropMaster {
  name: string;
  aliases: string[];
  idealN: [number, number];
  idealP: [number, number];
  idealK: [number, number];
  idealPH: [number, number];
  idealMoisture: [number, number];
  targetN: number;
  targetP: number;
  targetK: number;
  baseYieldTons: number;
  sowingGuide: string;
  basalDose: (nDef: number, pDef: number, kDef: number, acres: number) => string;
  topDress1: (acres: number) => string;
  topDress2: (acres: number) => string;
  irrigation: (waterSource: string, moisture: number) => string;
  pestManagement: string;
  harvestTips: string;
}

const KARNATAKA_CROPS_MASTER: CropMaster[] = [
  {
    name: 'Paddy (Rice)',
    aliases: ['rice', 'paddy', 'bpt', 'ir-64', 'jyothi', 'ಭತ್ತ'],
    idealN: [70, 100],
    idealP: [30, 50],
    idealK: [40, 60],
    idealPH: [5.5, 7.2],
    idealMoisture: [50, 80],
    targetN: 90,
    targetP: 45,
    targetK: 50,
    baseYieldTons: 2.8,
    sowingGuide: 'Use 20-25 kg certified seed/acre. Treat seeds with Carbendazim (2g/kg) or Trichoderma viride (4g/kg). Transplant 20-25 day old seedlings at 20cm x 15cm spacing with 2-3 seedlings per hill.',
    basalDose: (nDef, pDef, kDef, acres) => {
      const dap = Math.round(Math.max(40, 50 + pDef * 0.3) * acres);
      const mop = Math.round(Math.max(25, 35 + kDef * 0.2) * acres);
      const zinc = Math.round(10 * acres);
      return `Basal Application (At final puddling/transplanting): Apply ${dap} kg DAP + ${mop} kg MOP + ${zinc} kg Zinc Sulphate per ${acres} acre(s). Incorporate into top 5cm soil.`;
    },
    topDress1: (acres) => {
      const urea = Math.round(35 * acres);
      return `Top Dressing 1 (Active Tillering, 25-30 DAT): Broadcast ${urea} kg Urea per ${acres} acre(s) under thin water layer (2-3 cm).`;
    },
    topDress2: (acres) => {
      const urea = Math.round(25 * acres);
      const mop = Math.round(15 * acres);
      return `Top Dressing 2 (Panicle Initiation, 55-60 DAT): Apply ${urea} kg Urea + ${mop} kg MOP per ${acres} acre(s) to maximize grain count and panicle weight.`;
    },
    irrigation: (waterSource, moisture) => {
      return moisture < 40 
        ? `Water status is low (${moisture}%). Immediately irrigate to maintain 2-3 cm shallow water layer. With ${waterSource}, practice alternate wetting and drying (AWD) after tillering to conserve water while ensuring field doesn't crack.`
        : `Maintain 3-5 cm standing water until grain filling stage. Stop irrigation 10-12 days before expected harvest to facilitate even ripening.`;
    },
    pestManagement: 'Monitor for Yellow Stem Borer and Blast. Install pheromone traps (5/acre). For leaf blast, spray Tricyclazole 75 WP @ 0.6g/L. For stem borer, apply Cartap Hydrochloride 4G @ 10kg/acre at tillering.',
    harvestTips: 'Harvest when 85-90% grains turn golden yellow and grain moisture drops to 20-22%. Thresh promptly and sun-dry to 13-14% moisture before warehousing.'
  },
  {
    name: 'Ragi (Finger Millet)',
    aliases: ['ragi', 'finger millet', 'millet', 'kora', 'ರಾಗಿ'],
    idealN: [40, 70],
    idealP: [20, 35],
    idealK: [25, 45],
    idealPH: [5.5, 7.5],
    idealMoisture: [30, 55],
    targetN: 60,
    targetP: 30,
    targetK: 35,
    baseYieldTons: 1.6,
    sowingGuide: 'Use 4-5 kg seed/acre for drilling or 2.5 kg for transplanting (GPU-28, ML-365, or Indaf varieties). Treat seed with Azospirillum (200g/acre). Sowing window: July 15 to August 15.',
    basalDose: (nDef, pDef, kDef, acres) => {
      const dap = Math.round(Math.max(30, 35 + pDef * 0.2) * acres);
      const mop = Math.round(Math.max(20, 25 + kDef * 0.2) * acres);
      return `Basal Application (At sowing): Furrow-apply ${dap} kg DAP + ${mop} kg MOP per ${acres} acre(s) along with 2-3 tons of farmyard manure.`;
    },
    topDress1: (acres) => {
      const urea = Math.round(25 * acres);
      return `Top Dressing 1 (25-30 days after emergence): Weeding followed by side-dressing of ${urea} kg Urea per ${acres} acre(s) when soil is moist.`;
    },
    topDress2: (acres) => {
      const urea = Math.round(15 * acres);
      return `Top Dressing 2 (Flowering/Boot Leaf, 50 DAS): Apply ${urea} kg Urea per ${acres} acre(s) if rainfall or supplemental irrigation is available.`;
    },
    irrigation: (waterSource) => {
      return `Ragi is highly drought tolerant. Critical stages requiring moisture are tillering (25-30 DAS) and flowering/grain formation (50-60 DAS). Provide 2-3 protective irrigations using ${waterSource} during prolonged dry spells.`;
    },
    pestManagement: 'Watch for Ragi Blast (Pyricularia grisea) and Stem Borer. Spray Mancozeb 75 WP @ 2g/L or Carbendazim @ 1g/L at first appearance of blast lesions.',
    harvestTips: 'Harvest earheads when they turn brown and dry. Cut only the earheads first, dry for 3-4 days on threshing floor, and machine or cattle thresh.'
  },
  {
    name: 'Maize (Corn)',
    aliases: ['maize', 'corn', 'makka', 'ಮೆಕ್ಕೆಜೋಳ'],
    idealN: [80, 120],
    idealP: [40, 60],
    idealK: [40, 70],
    idealPH: [5.8, 7.5],
    idealMoisture: [45, 65],
    targetN: 110,
    targetP: 50,
    targetK: 55,
    baseYieldTons: 3.4,
    sowingGuide: 'Seed rate: 7-8 kg/acre of certified hybrid seed (e.g. CP-818, Pioneer, NK-6240). Spacing: 60cm between rows and 20cm between plants at 4-5cm depth.',
    basalDose: (nDef, pDef, kDef, acres) => {
      const dap = Math.round(Math.max(45, 55 + pDef * 0.3) * acres);
      const mop = Math.round(Math.max(25, 30 + kDef * 0.2) * acres);
      const zinc = Math.round(10 * acres);
      return `Basal Application (At planting): Apply ${dap} kg DAP + ${mop} kg MOP + ${zinc} kg Zinc Sulphate per ${acres} acre(s) placed 5cm below and away from seed.`;
    },
    topDress1: (acres) => {
      const urea = Math.round(45 * acres);
      return `Top Dressing 1 (Knee-high stage, 30 DAS): Band application of ${urea} kg Urea per ${acres} acre(s) followed by earthing up.`;
    },
    topDress2: (acres) => {
      const urea = Math.round(30 * acres);
      return `Top Dressing 2 (Tasseling & Silking, 50-55 DAS): Apply ${urea} kg Urea per ${acres} acre(s) to guarantee maximum cob grain development.`;
    },
    irrigation: (waterSource) => {
      return `Maize is sensitive to both waterlogging and severe drought. Ensure excellent drainage. Irrigate at Knee-high, Tasseling, Silking, and Dough stages using ${waterSource}.`;
    },
    pestManagement: 'Scout regularly for Fall Armyworm (FAW - Spodoptera frugiperda). Apply whorl application of Emamectin Benzoate 5 SG @ 0.4g/L or Chlorantraniliprole 18.5 SC @ 0.4ml/L during early vegetative stages.',
    harvestTips: 'Harvest cobs when outer husks turn dry and papery, and black layer forms at the base of grains. Shell grains at 14% moisture.'
  },
  {
    name: 'Cotton',
    aliases: ['cotton', 'kapas', 'ಹತ್ತಿ'],
    idealN: [60, 90],
    idealP: [30, 50],
    idealK: [40, 70],
    idealPH: [6.5, 8.2],
    idealMoisture: [40, 60],
    targetN: 85,
    targetP: 45,
    targetK: 55,
    baseYieldTons: 1.4,
    sowingGuide: 'Use Bt-Cotton hybrids (e.g., DHH-11, Bunny, RCH-2). Spacing: 90cm x 60cm or 120cm x 45cm. Dibble 1-2 seeds per hill at 3-4cm depth.',
    basalDose: (nDef, pDef, kDef, acres) => {
      const dap = Math.round(Math.max(40, 50 + pDef * 0.2) * acres);
      const mop = Math.round(Math.max(25, 30 + kDef * 0.2) * acres);
      return `Basal Application: Apply ${dap} kg DAP + ${mop} kg MOP per ${acres} acre(s) in furrows before dibbling.`;
    },
    topDress1: (acres) => {
      const urea = Math.round(35 * acres);
      return `Top Dressing 1 (Square formation, 40-45 DAS): Apply ${urea} kg Urea per ${acres} acre(s) followed by light hoeing.`;
    },
    topDress2: (acres) => {
      const urea = Math.round(30 * acres);
      const mop = Math.round(15 * acres);
      return `Top Dressing 2 (Peak flowering & boll formation, 75 DAS): Side-dress ${urea} kg Urea + ${mop} kg MOP per ${acres} acre(s). Foliar spray of 1% 19:19:19 to prevent premature dropping.`;
    },
    irrigation: (waterSource) => {
      return `Avoid water stagnation. Critical irrigation timings are flowering (60-70 DAS) and boll development (90-100 DAS). With ${waterSource}, irrigate alternate furrows to prevent root asphyxiation.`;
    },
    pestManagement: 'Monitor Pink Bollworm using pheromone traps (8/acre). For sucking pests (aphids, jassids, thrips), spray Imidacloprid 17.8 SL @ 0.3ml/L or Neem oil (1500 ppm) @ 2ml/L.',
    harvestTips: 'Pick cotton in the morning hours when bolls are fully open and dry. Keep free of dry leaves and trash; store in clean, dry sheds.'
  },
  {
    name: 'Groundnut (Peanut)',
    aliases: ['groundnut', 'peanut', 'kadalekayi', 'ಕಡಲೆಕಾಯಿ'],
    idealN: [20, 35],
    idealP: [40, 60],
    idealK: [30, 50],
    idealPH: [6.0, 7.3],
    idealMoisture: [35, 55],
    targetN: 30,
    targetP: 50,
    targetK: 40,
    baseYieldTons: 1.3,
    sowingGuide: 'Use 40-50 kg kernels/acre (TMV-2, JL-24, KDG-128). Treat seeds with Trichoderma (4g/kg) and Rhizobium culture (200g/acre). Spacing: 30cm x 10cm.',
    basalDose: (nDef, pDef, kDef, acres) => {
      const dap = Math.round(35 * acres);
      const mop = Math.round(25 * acres);
      const gypsum = Math.round(100 * acres);
      return `Basal Application: Apply ${dap} kg DAP + ${mop} kg MOP + ${gypsum} kg Gypsum (essential sulfur & calcium for pod shell) per ${acres} acre(s).`;
    },
    topDress1: (acres) => {
      const gypsum = Math.round(100 * acres);
      return `Top Dressing (Pegging Stage, 40-45 DAS): Apply ${gypsum} kg Gypsum per ${acres} acre(s) around the root zone and earthing up to enhance peg penetration and kernel filling.`;
    },
    topDress2: () => {
      return `Nutrient Boost: Foliar spray of 0.5% Ferrous Sulphate + 0.1% Citric Acid at 35 DAS to avoid iron chlorosis in red sandy soils.`;
    },
    irrigation: (waterSource) => {
      return `Maintain moderate moisture during flowering (20-25 DAS) and peg elongation (40-45 DAS). Stop irrigation 7-10 days prior to harvest to prevent pod germination.`;
    },
    pestManagement: 'Watch for Tikka Leaf Spot (Cercospora) and Spodoptera litura. Spray Chlorothalonil 75 WP @ 2g/L or Hexaconazole 5 EC @ 1ml/L at initiation of brown spots.',
    harvestTips: 'Pull test plants; maturity is reached when inner shell surface turns dark brown/black. Pluck pods immediately and dry in sun until pods rattle inside.'
  },
  {
    name: 'Sugarcane',
    aliases: ['sugarcane', 'kabbu', 'ಕಬ್ಬು'],
    idealN: [100, 160],
    idealP: [50, 80],
    idealK: [60, 100],
    idealPH: [6.5, 8.0],
    idealMoisture: [55, 75],
    targetN: 140,
    targetP: 70,
    targetK: 85,
    baseYieldTons: 45.0,
    sowingGuide: 'Use 25,000-30,000 two-budded setts/acre (Co-86032, Co-62175). Treat setts in Carbendazim (1g/L) for 15 mins. Plant in furrows spaced 90-120cm apart.',
    basalDose: (nDef, pDef, kDef, acres) => {
      const dap = Math.round(75 * acres);
      const mop = Math.round(40 * acres);
      return `Basal Application (At planting): Place ${dap} kg DAP + ${mop} kg MOP per ${acres} acre(s) along with 5-6 tons decomposed compost.`;
    },
    topDress1: (acres) => {
      const urea = Math.round(65 * acres);
      return `Top Dressing 1 (Tillering Stage, 45 DAP): Apply ${urea} kg Urea per ${acres} acre(s) followed by partial earthing up.`;
    },
    topDress2: (acres) => {
      const urea = Math.round(65 * acres);
      const mop = Math.round(40 * acres);
      return `Top Dressing 2 (Grand Growth Phase, 90-100 DAP): Final earthing up with ${urea} kg Urea + ${mop} kg MOP per ${acres} acre(s).`;
    },
    irrigation: (waterSource) => {
      return `High water requirement crop. Water every 7-10 days in winter and 5-7 days in summer using ${waterSource}. Drip irrigation is highly recommended to save 40% water.`;
    },
    pestManagement: 'Monitor for Early Shoot Borer and Whitefly. Release Trichogramma chilonis egg parasitoids @ 20,000/acre. Spray Chlorantraniliprole 18.5 SC @ 0.3ml/L if shoot borer exceeds 10%.',
    harvestTips: 'Harvest at peak Brix reading (> 19-20%) around 11-12 months. Cut cane close to ground level with sharp knife to maximize sugar weight.'
  },
  {
    name: 'Arecanut',
    aliases: ['arecanut', 'adike', 'betel nut', 'ಅಡಿಕೆ'],
    idealN: [50, 80],
    idealP: [25, 45],
    idealK: [50, 90],
    idealPH: [5.5, 6.8],
    idealMoisture: [45, 70],
    targetN: 70,
    targetP: 35,
    targetK: 75,
    baseYieldTons: 1.2,
    sowingGuide: 'Use South Kanara, Mohitnagar, or Mangala varieties. Spacing: 2.7m x 2.7m (500 palms/acre). Plant 1-2 year old healthy seedlings in 90cm cube pits filled with compost and topsoil.',
    basalDose: (nDef, pDef, kDef, acres) => {
      const urea = Math.round(50 * acres);
      const rockPhos = Math.round(60 * acres);
      const mop = Math.round(60 * acres);
      return `First Split (Post-Monsoon, Sept-Oct): Apply ${urea} kg Urea + ${rockPhos} kg Rock Phosphate + ${mop} kg MOP per ${acres} acre(s) in a circular basin 1m away from palm base.`;
    },
    topDress1: (acres) => {
      const urea = Math.round(50 * acres);
      const mop = Math.round(60 * acres);
      return `Second Split (Pre-Monsoon, Feb-March): Apply ${urea} kg Urea + ${mop} kg MOP per ${acres} acre(s) accompanied by mulching with green leaves.`;
    },
    topDress2: (acres) => {
      const lime = Math.round(80 * acres);
      return `Soil Conditioning (April-May): Broadcast ${lime} kg Agricultural Lime or Dolomite per ${acres} acre(s) in acidic laterite soils.`;
    },
    irrigation: (waterSource) => {
      return `Arecanut cannot withstand drought. Provide 150-200 liters of water per palm every 4-6 days using ${waterSource} (preferably micro-sprinkler or drip) from November to May.`;
    },
    pestManagement: 'Crucial: Prevent Koleroga (Fruit rot / Phytophthora meadii) before monsoon onset by spraying 1% Bordeaux mixture. Spray second round 40 days later during mid-monsoon.',
    harvestTips: 'Harvest ripe nuts (deep orange/red) for Chali/Kottapak or tender nuts (6-7 months old) for Kalipak processing.'
  },
  {
    name: 'Tomato (Vegetable)',
    aliases: ['tomato', 'tamata', 'ಟೊಮೆಟೊ', 'ಟೊಮ್ಯಾಟೋ'],
    idealN: [60, 90],
    idealP: [35, 60],
    idealK: [45, 80],
    idealPH: [6.0, 7.2],
    idealMoisture: [45, 65],
    targetN: 80,
    targetP: 50,
    targetK: 65,
    baseYieldTons: 16.0,
    sowingGuide: 'Seed rate: 100-120g/acre for hybrids (Arka Rakshak, Shivam, Abhinav). Transplant 25-day seedlings at 60cm x 45cm on raised beds with silver-black mulch.',
    basalDose: (nDef, pDef, kDef, acres) => {
      const dap = Math.round(50 * acres);
      const mop = Math.round(35 * acres);
      return `Basal Application: Apply ${dap} kg DAP + ${mop} kg MOP + 15 kg Micronutrient mixture per ${acres} acre(s) into raised bed rows.`;
    },
    topDress1: (acres) => {
      const urea = Math.round(30 * acres);
      const mop = Math.round(20 * acres);
      return `Top Dressing 1 (Vegetative growth, 3 weeks after transplant): Apply ${urea} kg Urea + ${mop} kg MOP per ${acres} acre(s).`;
    },
    topDress2: (acres) => {
      const calciumNitrate = Math.round(20 * acres);
      return `Top Dressing 2 (Flowering & Fruit set): Apply ${calciumNitrate} kg Calcium Nitrate + 5 kg Boron per ${acres} acre(s) to avoid Blossom End Rot.`;
    },
    irrigation: (waterSource) => {
      return `Consistent soil moisture is key to prevent fruit cracking. Use ${waterSource} (drip recommended) daily or alternate days in summer.`;
    },
    pestManagement: 'Control Early/Late Blight and Whitefly. Spray Mancozeb @ 2.5g/L or Azoxystrobin @ 1ml/L for blights. Install yellow sticky traps (15/acre) for whiteflies.',
    harvestTips: 'Pick fruits at breaker stage for long-distance transport, or pink-to-red stage for local APMC mandi delivery.'
  }
];

export function isCropYetToBeGrown(cropName?: string | null, cropStatus?: string): boolean {
  if (cropStatus === 'yet_to_be_grown') return true;
  if (cropStatus === 'growing' && cropName && cropName.trim()) return false;
  if (!cropName) return true;
  const normalized = cropName.trim().toLowerCase();
  return (
    normalized === '' ||
    normalized === 'none' ||
    normalized === 'null' ||
    normalized === 'undefined' ||
    normalized === 'fallow' ||
    normalized === 'empty' ||
    normalized.includes('yet to') ||
    normalized.includes('awaiting') ||
    normalized.includes('not planted')
  );
}

function resolveCropMaster(cropName: string): CropMaster {
  const norm = cropName.toLowerCase().trim();
  const found = KARNATAKA_CROPS_MASTER.find(
    (c) => c.name.toLowerCase().includes(norm) || c.aliases.some((a) => norm.includes(a) || a.includes(norm))
  );

  if (found) return found;

  // Dynamic fallback for custom/regional crop
  return {
    name: cropName,
    aliases: [norm],
    idealN: [60, 100],
    idealP: [30, 55],
    idealK: [35, 65],
    idealPH: [6.0, 7.5],
    idealMoisture: [45, 65],
    targetN: 80,
    targetP: 45,
    targetK: 50,
    baseYieldTons: 3.0,
    sowingGuide: `Standard regional sowing protocol for ${cropName}. Treat seeds with Trichoderma viride (4g/kg) and prepare well-pulverized seedbed with 2-3 tons/acre organic manure.`,
    basalDose: (nDef, pDef, kDef, acres) => {
      const dap = Math.round(45 * acres);
      const mop = Math.round(30 * acres);
      return `Basal Application: Apply ${dap} kg DAP + ${mop} kg MOP per ${acres} acre(s) into soil rows before planting.`;
    },
    topDress1: (acres) => {
      const urea = Math.round(35 * acres);
      return `Top Dressing 1 (Early vegetative growth): Apply ${urea} kg Urea per ${acres} acre(s) during moist soil conditions.`;
    },
    topDress2: (acres) => {
      const urea = Math.round(25 * acres);
      const mop = Math.round(15 * acres);
      return `Top Dressing 2 (Flowering/Fruit formation): Apply ${urea} kg Urea + ${mop} kg MOP per ${acres} acre(s).`;
    },
    irrigation: (waterSource) => {
      return `Maintain optimum root-zone moisture through ${waterSource}. Irrigate every 5-7 days avoiding both prolonged drought and standing water stagnation.`;
    },
    pestManagement: `Inspect weekly for local sucking pests and foliage spots. Apply neem oil 1500ppm (2ml/L) as preventive spray.`,
    harvestTips: `Harvest at optimal physiological maturity when 85% of produce reaches commercial grade and color.`
  };
}

function calculateActiveCropOptimization(
  crop: CropMaster,
  soil: SoilDataInput,
  acres: number,
  waterSource: string
): ActiveCropOptimization {
  const { nitrogen, phosphorus, potassium, pH, moisture } = soil;

  // 1. Nutrient Adjustments in exact units
  const nutrientAdjustments: NutrientAdjustmentItem[] = [];

  // Nitrogen (N)
  const deltaN = crop.targetN - nitrogen;
  if (deltaN > 5) {
    const ureaPerAcre = Math.round(Math.max(12, deltaN * 0.4047 * 2.17));
    const totalUrea = Math.round(ureaPerAcre * acres);
    nutrientAdjustments.push({
      nutrient: 'Nitrogen (N)',
      current_level: `${nitrogen} kg/ha (${Math.round(nitrogen * 0.4047)} kg/acre)`,
      target_level: `${crop.targetN} kg/ha (${Math.round(crop.targetN * 0.4047)} kg/acre)`,
      difference: `-${Math.round(deltaN)} kg/ha deficit (-${Math.round(deltaN * 0.4047)} kg N/acre)`,
      action: 'increase',
      unit_recommendation: `Apply +${totalUrea} kg Urea total across your ${acres} acre(s) field`,
      commercial_fertilizer_dosage: `+${ureaPerAcre} kg/acre Urea (Split into 50% basal and 50% active vegetative top-dressing)`,
      rationale: `Soil nitrogen is below the optimal requirement for ${crop.name}. Adequate nitrogen is essential for rapid vegetative tillering, stem thickness, and chlorophyll synthesis.`,
    });
  } else if (deltaN < -15) {
    const reduceUreaPerAcre = Math.round(Math.abs(deltaN) * 0.4047 * 2.17);
    const totalReduce = Math.round(reduceUreaPerAcre * acres);
    nutrientAdjustments.push({
      nutrient: 'Nitrogen (N)',
      current_level: `${nitrogen} kg/ha (${Math.round(nitrogen * 0.4047)} kg/acre)`,
      target_level: `${crop.targetN} kg/ha (${Math.round(crop.targetN * 0.4047)} kg/acre)`,
      difference: `+${Math.round(Math.abs(deltaN))} kg/ha surplus (+${Math.round(Math.abs(deltaN * 0.4047))} kg N/acre)`,
      action: 'decrease',
      unit_recommendation: `Reduce synthetic Nitrogen / Urea by -${totalReduce} kg total across ${acres} acre(s)`,
      commercial_fertilizer_dosage: `Reduce by -${reduceUreaPerAcre} kg/acre Urea (Avoid excess nitrogen fertilization)`,
      rationale: `High nitrogen surplus detected. Excess nitrogen causes vegetative lodging, succulent leaves prone to insect attacks, and delayed harvest maturity.`,
    });
  } else {
    nutrientAdjustments.push({
      nutrient: 'Nitrogen (N)',
      current_level: `${nitrogen} kg/ha`,
      target_level: `${crop.targetN} kg/ha`,
      difference: `Balanced (Within optimal buffer for ${crop.name})`,
      action: 'maintain',
      unit_recommendation: `Maintain standard basal maintenance of ${Math.round(20 * acres)} kg Urea across field`,
      commercial_fertilizer_dosage: `20 kg/acre Urea as maintenance dose`,
      rationale: `Soil nitrogen is adequately balanced for current growth requirements.`,
    });
  }

  // Phosphorus (P)
  const deltaP = crop.targetP - phosphorus;
  if (deltaP > 3) {
    const dapPerAcre = Math.round(Math.max(10, deltaP * 0.4047 * 2.17));
    const sspPerAcre = Math.round(Math.max(25, deltaP * 0.4047 * 6.25));
    const totalDap = Math.round(dapPerAcre * acres);
    nutrientAdjustments.push({
      nutrient: 'Phosphorus (P)',
      current_level: `${phosphorus} kg/ha (${Math.round(phosphorus * 0.4047)} kg/acre)`,
      target_level: `${crop.targetP} kg/ha (${Math.round(crop.targetP * 0.4047)} kg/acre)`,
      difference: `-${Math.round(deltaP)} kg/ha deficit (-${Math.round(deltaP * 0.4047)} kg P₂O₅/acre)`,
      action: 'increase',
      unit_recommendation: `Apply +${totalDap} kg DAP (or +${Math.round(sspPerAcre * acres)} kg SSP) for ${acres} acre(s)`,
      commercial_fertilizer_dosage: `+${dapPerAcre} kg/acre DAP placed 5 cm deep in furrows near root zone`,
      rationale: `Phosphorus is urgently needed for vigorous root elongation, early establishment, and energy transfer in ${crop.name}.`,
    });
  } else if (deltaP < -10) {
    const reduceDapPerAcre = Math.round(Math.abs(deltaP) * 0.4047 * 2.17);
    nutrientAdjustments.push({
      nutrient: 'Phosphorus (P)',
      current_level: `${phosphorus} kg/ha`,
      target_level: `${crop.targetP} kg/ha`,
      difference: `+${Math.round(Math.abs(deltaP))} kg/ha surplus`,
      action: 'decrease',
      unit_recommendation: `Reduce DAP application by -${Math.round(reduceDapPerAcre * acres)} kg across ${acres} acre(s)`,
      commercial_fertilizer_dosage: `Reduce by -${reduceDapPerAcre} kg/acre DAP`,
      rationale: `High residual soil phosphorus is present. Additional phosphorus will immobilize zinc and iron, inducing micro-chlorosis.`,
    });
  } else {
    nutrientAdjustments.push({
      nutrient: 'Phosphorus (P)',
      current_level: `${phosphorus} kg/ha`,
      target_level: `${crop.targetP} kg/ha`,
      difference: `Balanced`,
      action: 'maintain',
      unit_recommendation: `Maintain standard maintenance P of ~15-20 kg/acre DAP`,
      commercial_fertilizer_dosage: `15 kg/acre DAP`,
      rationale: `Available soil phosphorus meets the crop's physiological threshold.`,
    });
  }

  // Potassium (K)
  const deltaK = crop.targetK - potassium;
  if (deltaK > 4) {
    const mopPerAcre = Math.round(Math.max(8, deltaK * 0.4047 * 1.67));
    const totalMop = Math.round(mopPerAcre * acres);
    nutrientAdjustments.push({
      nutrient: 'Potassium (K)',
      current_level: `${potassium} kg/ha (${Math.round(potassium * 0.4047)} kg/acre)`,
      target_level: `${crop.targetK} kg/ha (${Math.round(crop.targetK * 0.4047)} kg/acre)`,
      difference: `-${Math.round(deltaK)} kg/ha deficit (-${Math.round(deltaK * 0.4047)} kg K₂O/acre)`,
      action: 'increase',
      unit_recommendation: `Apply +${totalMop} kg Muriate of Potash (MOP) across your ${acres} acre(s) field`,
      commercial_fertilizer_dosage: `+${mopPerAcre} kg/acre MOP (Apply 50% basal and 50% at peak vegetative/flowering stage)`,
      rationale: `Potassium enhances stomatal water conservation, straw strength, drought tolerance, and grain/fruit weight in ${crop.name}.`,
    });
  } else if (deltaK < -15) {
    const reduceMopPerAcre = Math.round(Math.abs(deltaK) * 0.4047 * 1.67);
    nutrientAdjustments.push({
      nutrient: 'Potassium (K)',
      current_level: `${potassium} kg/ha`,
      target_level: `${crop.targetK} kg/ha`,
      difference: `+${Math.round(Math.abs(deltaK))} kg/ha surplus`,
      action: 'decrease',
      unit_recommendation: `Reduce MOP application by -${Math.round(reduceMopPerAcre * acres)} kg across ${acres} acre(s)`,
      commercial_fertilizer_dosage: `Reduce by -${reduceMopPerAcre} kg/acre MOP`,
      rationale: `Soil has ample potassium reserves. Lowering potash addition saves input costs without sacrificing yield.`,
    });
  } else {
    nutrientAdjustments.push({
      nutrient: 'Potassium (K)',
      current_level: `${potassium} kg/ha`,
      target_level: `${crop.targetK} kg/ha`,
      difference: `Balanced`,
      action: 'maintain',
      unit_recommendation: `Maintain 15-20 kg/acre MOP`,
      commercial_fertilizer_dosage: `15 kg/acre MOP`,
      rationale: `Available soil potassium is within the ideal range for ${crop.name}.`,
    });
  }

  // Secondary & Micronutrients
  let microAction: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let microRec = `Apply +10 kg/acre balanced micronutrient mixture (Zinc, Iron, Boron, Copper) during early vegetative growth.`;
  let microDosage = `+10 kg/acre Micronutrient Mix`;
  let microRationale = `Provides essential trace co-factors for plant enzymes and photosystem integrity.`;

  if (pH > 7.8) {
    microAction = 'increase';
    microRec = `Apply +${Math.round(10 * acres)} kg Zinc Sulphate (ZnSO₄) + ${Math.round(2.5 * acres)} kg Borax across ${acres} acre(s)`;
    microDosage = `+10 kg/acre Zinc Sulphate + 2.5 kg/acre Borax in basal application`;
    microRationale = `Alkaline soil (pH ${pH}) severely binds zinc and boron. Supplemental zinc prevents Khaira disease and terminal leaf whitening.`;
  } else if (pH < 5.8) {
    microAction = 'increase';
    microRec = `Apply +${Math.round(15 * acres)} kg Magnesium Sulphate + ${Math.round(250 * acres)} kg Agricultural Lime across ${acres} acre(s)`;
    microDosage = `+15 kg/acre Magnesium Sulphate + 250 kg/acre Agricultural Lime`;
    microRationale = `Acidic soil (pH ${pH}) causes magnesium depletion and aluminum toxicity. Liming neutralizes hydrogen ions and releases bonded minerals.`;
  }

  nutrientAdjustments.push({
    nutrient: 'Secondary & Micronutrients',
    current_level: `Soil pH: ${pH}, NPK Ratio: ${nitrogen}:${phosphorus}:${potassium}`,
    target_level: `Optimum pH: ${crop.idealPH[0]} - ${crop.idealPH[1]} with active trace minerals`,
    difference: pH > 7.8 ? 'Alkaline Zinc/Boron fixation' : pH < 5.8 ? 'Acidic Calcium/Magnesium depletion' : 'Optimal micronutrient availability',
    action: microAction,
    unit_recommendation: microRec,
    commercial_fertilizer_dosage: microDosage,
    rationale: microRationale,
  });

  // 2. Water & Irrigation Adjustments in exact units
  let waterAction: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let waterDiff = `Optimal moisture range (${crop.idealMoisture[0]}% - ${crop.idealMoisture[1]}%)`;
  let waterUnitRec = `Maintain current water application rate of ~20-25 mm per watering cycle.`;
  let waterSchedule = `Irrigate every 5-6 days using ${waterSource} based on evapotranspiration.`;

  if (moisture < crop.idealMoisture[0]) {
    waterAction = 'increase';
    const moistureDef = crop.idealMoisture[0] - moisture;
    waterDiff = `-${moistureDef}% moisture deficit below ideal threshold (${crop.idealMoisture[0]}%)`;
    waterUnitRec = `Increase irrigation volume by +15 to +20 mm per cycle (increase drip run time by +45 minutes/day or +2.5 hours per furrow flooding)`;
    waterSchedule = `Deliver 25-30 mm water every 3-4 days using ${waterSource} to restore optimal field capacity.`;
  } else if (moisture > crop.idealMoisture[1]) {
    waterAction = 'decrease';
    const moistureSurplus = moisture - crop.idealMoisture[1];
    waterDiff = `+${moistureSurplus}% moisture surplus above crop tolerance limit (${crop.idealMoisture[1]}%)`;
    waterUnitRec = `Reduce irrigation volume by -30% to -40% (withhold supplemental water for 3-5 days). Open surface drainage furrows (15 cm depth) to purge standing water.`;
    waterSchedule = `Pause irrigation until root-zone moisture recedes below ${crop.idealMoisture[1]}% to prevent root hypoxia and damping-off disease.`;
  }

  const waterAdjustments: WaterAdjustmentItem = {
    parameter: 'Soil Moisture & Field Water Dynamics',
    current_moisture: `${moisture}%`,
    ideal_moisture: `${crop.idealMoisture[0]}% - ${crop.idealMoisture[1]}%`,
    difference: waterDiff,
    action: waterAction,
    unit_recommendation: waterUnitRec,
    frequency_and_schedule: waterSchedule,
  };

  // 3. Soil Condition Improvements
  const soilConditionImprovements: SoilConditionImprovement[] = [
    {
      parameter: 'Soil pH Reaction & Chemical Buffer',
      current_value: `pH ${pH}`,
      ideal_target: `${crop.idealPH[0]} - ${crop.idealPH[1]}`,
      remediation_in_units:
        pH < 6.0
          ? `Apply +${Math.round(250 * acres)} to ${Math.round(350 * acres)} kg Agricultural Lime (Calcium Carbonate) for ${acres} acre(s)`
          : pH > 7.8
          ? `Apply +${Math.round(300 * acres)} to ${Math.round(400 * acres)} kg Agricultural Gypsum for ${acres} acre(s)`
          : `Maintain neutral buffer: Apply 2 tons/acre compost annually (no chemical neutralizing agents required)`,
      practical_steps:
        pH < 6.0
          ? `Broadcast lime evenly before tillage and incorporate into top 10 cm soil at least 2 weeks before heavy fertilization.`
          : pH > 7.8
          ? `Incorporate gypsum with irrigation to replace sodium with calcium and leach salts below the active root zone.`
          : `Current soil pH is within the ideal agronomic window for ${crop.name}.`,
    },
    {
      parameter: 'Organic Carbon & Biological Rhizosphere',
      current_value: `Moderate Organic Reserve`,
      ideal_target: `> 0.75% Active Organic Carbon`,
      remediation_in_units: `Apply +${Math.round(3 * acres)} to ${Math.round(4 * acres)} Tons well-decomposed Farm Yard Manure (FYM) or +${Math.round(1.5 * acres)} Tons Vermicompost`,
      practical_steps: `Incorporate FYM enriched with Trichoderma viride (2 kg/ton) and Pseudomonas fluorescens to stimulate mycorrhizal nutrient transport to ${crop.name} root hair.`,
    },
    {
      parameter: 'Soil Aeration & Compaction Alleviation',
      current_value: `Current Moisture: ${moisture}%, Chemistry Balance: Evaluated`,
      ideal_target: `Crumb structure with 50% pore space (25% air, 25% water)`,
      remediation_in_units: `Inter-row hoeing / shallow scarification at 25-30 DAS`,
      practical_steps: `Perform shallow mechanical hoeing between crop rows to break hard soil crusting, accelerate soil oxygen diffusion, and interrupt capillary weed water loss.`,
    },
  ];

  const yieldBoostPercent = Math.min(22, Math.max(8, Math.round(12 + Math.abs(deltaN) * 0.1 + (pH < 6.0 || pH > 7.8 ? 5 : 0))));
  const potentialYield = Math.round(crop.baseYieldTons * (1 + yieldBoostPercent / 100) * 10) / 10;

  return {
    crop_name: crop.name,
    field_status: 'crop_growing',
    ideal_growing_protocol: {
      stage_summary: `Complete agronomic protocol for ${crop.name} on ${acres} acre(s) field with ${waterSource} irrigation.`,
      field_preparation_and_current_care: crop.sowingGuide,
      fertilizer_npk_schedule_per_acre: `${crop.basalDose(Math.max(0, deltaN), Math.max(0, deltaP), Math.max(0, deltaK), acres)}\n\n${crop.topDress1(acres)}\n\n${crop.topDress2(acres)}`,
      irrigation_plan: crop.irrigation(waterSource, moisture),
      pest_disease_management: crop.pestManagement,
      harvesting_tips: crop.harvestTips,
    },
    nutrient_adjustments: nutrientAdjustments,
    water_adjustments: waterAdjustments,
    soil_condition_improvements: soilConditionImprovements,
    expected_yield_with_improvements: `${potentialYield} Tons/Acre (approx. +${yieldBoostPercent}% yield boost over baseline with recommended unit balancing)`,
    current_vs_ideal_summary: `Field is currently cultivating ${crop.name}. Based on laboratory soil diagnostics, optimal nutrient adjustments and moisture management have been compiled in specific units above to maximize harvest output.`,
  };
}

export function generateScientificSoilRecommendation(payload: SoilAnalysisPayload): RecommendationResponse {
  const { soil_data, preferred_crop, crop_status, field_size_acres = 1, water_source = 'Well/Borewell' } = payload;
  const { nitrogen, phosphorus, potassium, pH, moisture } = soil_data;

  // 1. Calculate Limiting Factors and Soil Health Status
  const limitingFactors: string[] = [];
  let healthScore = 100;

  // Nitrogen Assessment
  if (nitrogen < 50) {
    limitingFactors.push(`Critically low Nitrogen (${nitrogen} kg/ha) restricts vegetative vigor and chlorophyll synthesis.`);
    healthScore -= 20;
  } else if (nitrogen < 65) {
    limitingFactors.push(`Sub-optimal Nitrogen (${nitrogen} kg/ha) requires basal and split top-dressing augmentation.`);
    healthScore -= 10;
  }

  // Phosphorus Assessment
  if (phosphorus < 20) {
    limitingFactors.push(`Phosphorus deficiency (${phosphorus} kg/ha) impairs early root development and tillering.`);
    healthScore -= 15;
  }

  // Potassium Assessment
  if (potassium < 35) {
    limitingFactors.push(`Low Potassium (${potassium} kg/ha) reduces disease resistance, stalk strength, and drought tolerance.`);
    healthScore -= 15;
  }

  // pH Balance Assessment
  let amendmentRecommendation = 'Soil pH is well-balanced (6.0 - 7.5). Maintain existing organic matter by adding 2-3 tons/acre well-decomposed FYM annually.';
  if (pH < 5.5) {
    limitingFactors.push(`Acidic soil pH (${pH}) reduces phosphorus uptake and increases risk of aluminum/manganese toxicity.`);
    amendmentRecommendation = `Soil is strongly acidic (pH ${pH}). Broadcast 250-350 kg/acre Agricultural Lime (Calcium Carbonate) or Dolomite during summer tillage to neutralize acidity and unlock bound phosphorus.`;
    healthScore -= 20;
  } else if (pH < 6.0) {
    limitingFactors.push(`Moderately acidic soil pH (${pH}) may slow down microbial nitrogen mineralization.`);
    amendmentRecommendation = `Mild acidity detected (pH ${pH}). Apply 150 kg/acre Agricultural Lime along with organic compost before planting.`;
    healthScore -= 10;
  } else if (pH > 8.0) {
    limitingFactors.push(`Alkaline soil pH (${pH}) causes micronutrient fixation (Iron, Zinc, Manganese chlorosis).`);
    amendmentRecommendation = `Soil is alkaline (pH ${pH}). Apply 250-400 kg/acre Agricultural Gypsum and incorporate green manure (Daincha/Sunhemp) to neutralize alkalinity and improve soil structure.`;
    healthScore -= 20;
  }

  // Moisture Assessment
  if (moisture < 30) {
    limitingFactors.push(`Soil moisture is critically low (${moisture}%). Pre-sowing irrigation is mandatory.`);
    healthScore -= 15;
  } else if (moisture > 85) {
    limitingFactors.push(`Soil is near saturation (${moisture}%). Adequate surface drainage is required to avoid root rot.`);
    healthScore -= 10;
  }

  let status: 'Excellent' | 'Good' | 'Deficient' | 'Critical' = 'Good';
  if (healthScore >= 85) status = 'Excellent';
  else if (healthScore >= 65) status = 'Good';
  else if (healthScore >= 45) status = 'Deficient';
  else status = 'Critical';

  // Warnings
  const warnings: string[] = [];
  if (pH < 5.2) warnings.push('Acid toxicity warning: Liming is essential prior to sowing nitrogen-heavy crops.');
  if (pH > 8.2) warnings.push('Alkalinity alert: Zinc deficiency is probable. Add zinc sulphate in basal dose.');
  if (moisture < 25) warnings.push('Arid soil moisture: Germination failure risk if seeds are sown without pre-irrigation.');
  if (nitrogen < 30) warnings.push('Acute nitrogen deficit: Seedlings will show rapid yellowing unless basal DAP/Urea is provided.');

  const fallowField = isCropYetToBeGrown(preferred_crop, crop_status);

  // If a crop is already being grown on the farm (Mode: active_crop_optimization)
  if (!fallowField && preferred_crop) {
    const activeCropMaster = resolveCropMaster(preferred_crop);
    const optimization = calculateActiveCropOptimization(
      activeCropMaster,
      soil_data,
      field_size_acres,
      water_source
    );

    // Provide single growing guide for this crop for backward compatibility
    const yieldMultiplier = 0.85 + (healthScore / 100) * 0.3;
    const expectedYield = Math.round(activeCropMaster.baseYieldTons * yieldMultiplier * 10) / 10;
    const growingGuide: CropGuide = {
      sowing_details: activeCropMaster.sowingGuide,
      fertilizer_npk_schedule_per_acre: `${activeCropMaster.basalDose(Math.max(0, activeCropMaster.targetN - nitrogen), Math.max(0, activeCropMaster.targetP - phosphorus), Math.max(0, activeCropMaster.targetK - potassium), field_size_acres)}\n\n${activeCropMaster.topDress1(field_size_acres)}\n\n${activeCropMaster.topDress2(field_size_acres)}`,
      irrigation_plan: activeCropMaster.irrigation(water_source, moisture),
      pest_disease_management: activeCropMaster.pestManagement,
      harvesting_tips: activeCropMaster.harvestTips,
    };

    const singleActiveCrop: RecommendedCrop = {
      crop_name: activeCropMaster.name,
      suitability_score: Math.max(60, Math.min(98, healthScore)),
      expected_yield_per_acre_tons: expectedYield,
      growing_guide: growingGuide,
    };

    return {
      mode: 'active_crop_optimization',
      current_crop: activeCropMaster.name,
      recommended_crops: [singleActiveCrop],
      active_crop_optimization: optimization,
      soil_health_report: {
        status,
        limiting_factors: limitingFactors.length > 0 ? limitingFactors : [`Nutrient levels are well balanced for ${activeCropMaster.name} cultivation.`],
        soil_amendment_recommendations: amendmentRecommendation,
      },
      warnings,
      confidence_level: Math.round(92 + Math.min(6, healthScore * 0.05)),
    };
  }

  // Otherwise, crop is YET TO BE GROWN on this farm (Mode: crop_recommendation)
  // Match & Rank top crops suited to this soil profile
  const scoredCrops = KARNATAKA_CROPS_MASTER.map((crop) => {
    let score = 90;

    // Check N tolerance
    if (nitrogen < crop.idealN[0]) score -= Math.min(25, (crop.idealN[0] - nitrogen) * 0.4);
    if (nitrogen > crop.idealN[1]) score -= 5;

    // Check P tolerance
    if (phosphorus < crop.idealP[0]) score -= Math.min(20, (crop.idealP[0] - phosphorus) * 0.5);

    // Check K tolerance
    if (potassium < crop.idealK[0]) score -= Math.min(15, (crop.idealK[0] - potassium) * 0.4);

    // Check pH tolerance
    if (pH < crop.idealPH[0]) score -= Math.min(30, (crop.idealPH[0] - pH) * 20);
    if (pH > crop.idealPH[1]) score -= Math.min(30, (pH - crop.idealPH[1]) * 15);

    // Check Moisture tolerance
    if (moisture < crop.idealMoisture[0]) score -= Math.min(20, (crop.idealMoisture[0] - moisture) * 0.4);

    const finalScore = Math.max(55, Math.min(98, Math.round(score)));
    const yieldMultiplier = 0.85 + (finalScore / 100) * 0.3;
    const expectedYield = Math.round(crop.baseYieldTons * yieldMultiplier * 10) / 10;

    const nDef = Math.max(0, crop.targetN - nitrogen);
    const pDef = Math.max(0, crop.targetP - phosphorus);
    const kDef = Math.max(0, crop.targetK - potassium);

    const growingGuide: CropGuide = {
      sowing_details: crop.sowingGuide,
      fertilizer_npk_schedule_per_acre: `${crop.basalDose(nDef, pDef, kDef, field_size_acres)}\n\n${crop.topDress1(field_size_acres)}\n\n${crop.topDress2(field_size_acres)}`,
      irrigation_plan: crop.irrigation(water_source, moisture),
      pest_disease_management: crop.pestManagement,
      harvesting_tips: crop.harvestTips,
    };

    return {
      crop_name: crop.name,
      suitability_score: finalScore,
      expected_yield_per_acre_tons: expectedYield,
      growing_guide: growingGuide,
    };
  });

  // Sort descending by suitability score
  scoredCrops.sort((a, b) => b.suitability_score - a.suitability_score);
  const recommendedCrops = scoredCrops.slice(0, 3);

  return {
    mode: 'crop_recommendation',
    current_crop: null,
    recommended_crops: recommendedCrops,
    soil_health_report: {
      status,
      limiting_factors: limitingFactors.length > 0 ? limitingFactors : ['Nutrient levels are well balanced for regional Karnataka cultivation.'],
      soil_amendment_recommendations: amendmentRecommendation,
    },
    warnings,
    confidence_level: Math.round(92 + Math.min(6, healthScore * 0.05)),
  };
}
