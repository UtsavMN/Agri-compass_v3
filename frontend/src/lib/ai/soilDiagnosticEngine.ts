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
  preferred_crop?: string;
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

export interface RecommendationResponse {
  recommended_crops: RecommendedCrop[];
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
    aliases: ['rice', 'paddy', 'bpt', 'ir-64', 'jyothi'],
    idealN: [70, 100],
    idealP: [30, 50],
    idealK: [40, 60],
    idealPH: [5.5, 7.2],
    idealMoisture: [50, 80],
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
    aliases: ['ragi', 'finger millet', 'millet', 'kora'],
    idealN: [40, 70],
    idealP: [20, 35],
    idealK: [25, 45],
    idealPH: [5.5, 7.5],
    idealMoisture: [30, 55],
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
    aliases: ['maize', 'corn', 'makka'],
    idealN: [80, 120],
    idealP: [40, 60],
    idealK: [40, 70],
    idealPH: [5.8, 7.5],
    idealMoisture: [45, 65],
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
    aliases: ['cotton', 'kapas'],
    idealN: [60, 90],
    idealP: [30, 50],
    idealK: [40, 70],
    idealPH: [6.5, 8.2],
    idealMoisture: [40, 60],
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
    aliases: ['groundnut', 'peanut', 'kadalekayi'],
    idealN: [20, 35],
    idealP: [40, 60],
    idealK: [30, 50],
    idealPH: [6.0, 7.3],
    idealMoisture: [35, 55],
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
    aliases: ['sugarcane', 'kabbu'],
    idealN: [100, 160],
    idealP: [50, 80],
    idealK: [60, 100],
    idealPH: [6.5, 8.0],
    idealMoisture: [55, 75],
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
    aliases: ['arecanut', 'adike', 'betel nut'],
    idealN: [50, 80],
    idealP: [25, 45],
    idealK: [50, 90],
    idealPH: [5.5, 6.8],
    idealMoisture: [45, 70],
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
    aliases: ['tomato', 'tamata'],
    idealN: [60, 90],
    idealP: [35, 60],
    idealK: [45, 80],
    idealPH: [6.0, 7.2],
    idealMoisture: [45, 65],
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

export function generateScientificSoilRecommendation(payload: SoilAnalysisPayload): RecommendationResponse {
  const { soil_data, preferred_crop, field_size_acres = 1, water_source = 'Well/Borewell', location = 'Karnataka' } = payload;
  const { nitrogen, phosphorus, potassium, pH, moisture, temperature_C, humidity_percent } = soil_data;

  // 1. Calculate Limiting Factors and Soil Health Status
  const limitingFactors: string[] = [];
  let healthScore = 100;

  // Nitrogen Assessment
  const nDef = Math.max(0, 75 - nitrogen);
  if (nitrogen < 50) {
    limitingFactors.push(`Critically low Nitrogen (${nitrogen} kg/ha) restricts vegetative vigor and chlorophyll synthesis.`);
    healthScore -= 20;
  } else if (nitrogen < 65) {
    limitingFactors.push(`Sub-optimal Nitrogen (${nitrogen} kg/ha) requires basal and split top-dressing augmentation.`);
    healthScore -= 10;
  }

  // Phosphorus Assessment
  const pDef = Math.max(0, 35 - phosphorus);
  if (phosphorus < 20) {
    limitingFactors.push(`Phosphorus deficiency (${phosphorus} kg/ha) impairs early root development and tillering.`);
    healthScore -= 15;
  }

  // Potassium Assessment
  const kDef = Math.max(0, 50 - potassium);
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

  // 2. Warnings
  const warnings: string[] = [];
  if (pH < 5.2) warnings.push('Acid toxicity warning: Liming is essential prior to sowing nitrogen-heavy crops.');
  if (pH > 8.2) warnings.push('Alkalinity alert: Zinc deficiency is probable. Add zinc sulphate in basal dose.');
  if (moisture < 25) warnings.push('Arid soil moisture: Germination failure risk if seeds are sown without pre-irrigation.');
  if (nitrogen < 30) warnings.push('Acute nitrogen deficit: Seedlings will show rapid yellowing unless basal DAP/Urea is provided.');

  // 3. Match Crops
  const scoredCrops = KARNATAKA_CROPS_MASTER.map(crop => {
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

    // Preferred crop boost
    let isPreferred = false;
    if (preferred_crop) {
      const normPref = preferred_crop.toLowerCase().trim();
      isPreferred = crop.name.toLowerCase().includes(normPref) || crop.aliases.some(a => normPref.includes(a) || a.includes(normPref));
      if (isPreferred) {
        score += 8; // prioritize user's farm crop
      }
    }

    const finalScore = Math.max(55, Math.min(98, Math.round(score)));
    const yieldMultiplier = 0.85 + (finalScore / 100) * 0.3;
    const expectedYield = Math.round(crop.baseYieldTons * yieldMultiplier * 10) / 10;

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
      isPreferred
    };
  });

  // Sort crops: if preferred crop exists, make sure it is at position 0, then sort others by score descending
  scoredCrops.sort((a, b) => {
    if (a.isPreferred && !b.isPreferred) return -1;
    if (!a.isPreferred && b.isPreferred) return 1;
    return b.suitability_score - a.suitability_score;
  });

  const recommendedCrops = scoredCrops.slice(0, 3).map(({ isPreferred, ...rest }) => rest);

  return {
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
