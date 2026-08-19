// ─── CROP CARD (list view) ────────────────────────────────────────────────────
export interface CropCard {
  id: string;
  slug: string;
  nameEnglish: string;
  nameKannada: string;
  nameScientific: string | null;
  season: string;
  durationDays: number;
  difficulty: "Easy" | "Moderate" | "Hard";
  capitalMin: number;
  capitalMax: number;
  returnsMin: number;
  returnsMax: number;
  districts: string;         // JSON array string e.g. '["Shivamogga","Udupi"]'
  soilType: string;
  rainfallMm: string;
  nKgAcre: number | null;
  pKgAcre: number | null;
  kKgAcre: number | null;
  aiScore: number | null;
  pdfAvailable: boolean;
}

// ─── CROP DETAIL (full data) ──────────────────────────────────────────────────
export interface CropDetail extends CropCard {
  nameCommonAlt: string | null;

  overview: {
    why_good_now: string;
    income_best_case_min: number;
    income_best_case_max: number;
    income_worst_case_min: number;
    income_worst_case_max: number;
    best_districts: string[];
    season: string;
    crop_duration_days_min: number;
    crop_duration_days_max: number;
    beginner_friendly: boolean;
    beginner_note?: string;
  };

  soil: {
    soil_types_suitable: string[];
    soil_types_unsuitable: string[];
    ph_min: number;
    ph_max: number;
    drainage_requirement: string;
    land_prep_steps: string[];
    land_prep_cost_min: number;
    land_prep_cost_max: number;
    soil_corrections: Record<string, string>;
  };

  seed: {
    varieties: Array<{
      name: string;
      source: string;
      cost_per_unit: number;
      unit: string;
      suitable_districts: string[];
      highlights: string;
    }>;
    seedlings_per_acre?: number;
    sowing_method: string;
    row_spacing_cm: number;
    plant_spacing_cm: number;
    treatment_chemical: string;
    treatment_process: string;
  };

  irrigation: {
    water_requirement: string;
    recommended_method: string;
    drip_setup_cost_min?: number;
    drip_setup_cost_max?: number;
    schedule: Array<{
      stage: string;
      frequency: string;
      amount: string;
      note?: string;
    }>;
    critical_stage: string;
    critical_stage_consequence: string;
    overwatering_signs: string;
    underwatering_signs?: string;
    annual_rainfall_mm: string;
  };

  fertilizer: {
    nitrogen_kg_per_acre: number;
    phosphorus_kg_per_acre: number;
    potassium_kg_per_acre: number;
    urea_kg_per_acre: number;
    dap_kg_per_acre?: number;
    mop_kg_per_acre?: number;
    fym_kg_per_tree?: number;
    organic_type: string;
    split_dose_1?: string;
    split_dose_2?: string;
    basal_dose?: string;
    top_dressing?: string;
    application_method: string;
    micronutrients: Array<{
      nutrient: string;
      deficiency_sign: string;
      product: string;
      dose_g_per_tree: number;
      timing: string;
    }>;
  };

  weed: {
    critical_period: string;
    manual_tools: string[];
    manual_frequency: string;
    manual_cost_per_acre: number;
    weedicides: Array<{
      name: string;
      trade_names: string[];
      target_weeds: string;
      dosage_per_litre_water: string;
      timing: string;
      safety_critical?: string;
      cost_per_acre: number;
    }>;
    common_mistakes: string[];
  };

  pestDisease: {
    pests_diseases: Array<{
      name: string;
      name_kannada?: string;
      type: "pest" | "disease";
      severity: "moderate" | "severe" | "critical" | "fatal";
      affected_part: string;
      visual_symptoms: string;
      season: string;
      organic_control: string | null;
      chemical_name: string | null;
      chemical_dose: string | null;
      spray_timing: string;
      spray_count: number;
      cost_per_spray_per_acre?: number;
      wrong_chemicals: string[];
    }>;
    pesticide_safety_rules: string[];
    emergency_contact: string;
  };

  calendar: {
    weeks: Array<{
      period: string;
      tasks: string[];
      health_check: string;
      critical: boolean;
    }>;
  };

  harvest: {
    maturity_signs: string[];
    harvest_too_early_consequence: string;
    harvest_too_late_consequence: string;
    days_to_maturity_from_planting_min: number;
    days_to_maturity_from_planting_max: number;
    harvest_method: string;
    time_per_acre_days: number;
    total_harvest_cost_per_acre_min: number;
    total_harvest_cost_per_acre_max: number;
    yield_avg_quintal_per_acre: number;
    yield_best_quintal_per_acre: number;
    yield_worst_quintal_per_acre: number;
  };

  postHarvest: {
    processing_steps?: string[];
    processing_chali?: string[];
    processing_kempu?: string[];
    drying_days?: number;
    grades: Array<{
      grade: string;
      quality: string;
    }>;
    storage_duration: string;
    storage_conditions: string;
    storage_pest_prevention: string;
  };

  selling: {
    apmc_mandis: string[];
    cooperatives: Array<{ name: string; benefit: string }>;
    price_check_sources: string[];
    best_selling_time: string;
    negotiation_tips: string;
    msp_applicable: boolean;
    msp_amount: number | null;
  };

  financials: {
    cost_items: Array<{
      item: string;
      quantity: string;
      cost: number;
    }>;
    total_cost: number;
    expected_yield_quintal: number;
    price_per_quintal_conservative: number;
    gross_income: number;
    net_profit: number;
    break_even_price_per_quintal?: number;
    roi_percent: number;
    note?: string;
  };

  mistakes: {
    mistakes: Array<{
      mistake: string;
      what_happens: string;
      fix: string;
    }>;
  };

  faqs: {
    faqs: Array<{
      question: string;
      answer: string;
    }>;
  };

  schemes: {
    schemes: Array<{
      name: string;
      full_name?: string;
      benefit: string;
      how_to_apply: string;
      eligibility: string;
      contact: string;
    }>;
  };

  pdfCloudinaryUrl: string | null;
  pdfGithubUrl: string | null;
  kannadaAvailable: boolean;
  
  aiFeatures?: string[];
  iotParameters?: string[];

  // Formatting strings that we can add to ease UI
  displaySoilType?: string;
  displayRainfallMm?: string;
}

// ─── API RESPONSE ─────────────────────────────────────────────────────────────
export interface CropListResponse {
  crops: CropCard[];
  total: number;
}

export interface PdfResponse {
  slug: string;
  nameEnglish: string;
  pdfUrl: string;
  fallbackUrl: string;
  kannadaAvailable: boolean;
}
