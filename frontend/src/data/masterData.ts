// src/data/masterData.ts
// ═══════════════════════════════════════════════════════════════
// AGRI COMPASS — MASTER DATA FILE
// Single source of truth for all static datasets.
// To update values: edit this file ONLY.
// Do NOT hardcode data anywhere else in the project.
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ───────────────────────────────────────────────────
export interface DistrictData {
  crops: string[]      // recommended crops for this district
  soil: string         // primary soil type
  rainfall: string     // average annual rainfall
  color: string        // map fill color (earthy tone)
  season: 'Kharif' | 'Rabi' | 'Both'
}

export interface CropImageMap {
  [cropKey: string]: string
}

export interface MarketTrend {
  name: string
  price: number | null        // ₹ per quintal (null if not live)
  changePercent: number | null
  unit: string
  sparkline: number[] | null  // 7 data points
}

export interface SeasonCrops {
  Kharif: string[]
  Rabi: string[]
  Zaid: string[]
}

// ─── DISTRICTS (31 Karnataka districts) ────────────────────
export const DISTRICTS: Record<string, DistrictData> = {
  "Bagalkot":          { crops: ["Cotton","Sunflower","Pomegranate"], soil: "Black Cotton",    rainfall: "500mm",  color: "#8B7355", season: "Kharif" },
  "Ballari":           { crops: ["Cotton","Groundnut","Maize"],       soil: "Red Sandy",       rainfall: "550mm",  color: "#9B6B4B", season: "Kharif" },
  "Belagavi":          { crops: ["Sugarcane","Cotton","Soybean"],     soil: "Black & Red",     rainfall: "800mm",  color: "#7B8B55", season: "Both"   },
  "Bengaluru Rural":   { crops: ["Ragi","Maize","Grapes"],            soil: "Red Loam",        rainfall: "850mm",  color: "#6B8B6B", season: "Both"   },
  "Bengaluru Urban":   { crops: ["Vegetables","Flowers","Ragi"],      soil: "Red Loam",        rainfall: "900mm",  color: "#5B7B5B", season: "Both"   },
  "Bidar":             { crops: ["Soybean","Pigeon Pea","Sorghum"],   soil: "Medium Black",    rainfall: "750mm",  color: "#8B6B5B", season: "Kharif" },
  "Chamarajanagar":    { crops: ["Sugarcane","Ragi","Turmeric"],      soil: "Red Sandy",       rainfall: "700mm",  color: "#7B9B55", season: "Both"   },
  "Chikkaballapura":   { crops: ["Tomato","Groundnut","Ragi"],        soil: "Red Sandy",       rainfall: "750mm",  color: "#8B7B4B", season: "Both"   },
  "Chikkamagaluru":    { crops: ["Coffee","Arecanut","Pepper"],       soil: "Laterite",        rainfall: "1800mm", color: "#5B8B5B", season: "Both"   },
  "Chitradurga":       { crops: ["Groundnut","Cotton","Sunflower"],   soil: "Red Sandy",       rainfall: "550mm",  color: "#9B7B45", season: "Kharif" },
  "Dakshina Kannada":  { crops: ["Arecanut","Coconut","Paddy"],       soil: "Laterite",        rainfall: "3500mm", color: "#4B8B6B", season: "Both"   },
  "Davanagere":        { crops: ["Cotton","Paddy","Maize"],           soil: "Black Cotton",    rainfall: "600mm",  color: "#8B7B55", season: "Both"   },
  "Dharwad":           { crops: ["Cotton","Sunflower","Soybean"],     soil: "Black Cotton",    rainfall: "750mm",  color: "#7B6B4B", season: "Kharif" },
  "Gadag":             { crops: ["Cotton","Sunflower","Wheat"],       soil: "Black Cotton",    rainfall: "550mm",  color: "#9B8B55", season: "Both"   },
  "Hassan":            { crops: ["Coffee","Arecanut","Paddy"],        soil: "Red Loam",        rainfall: "1200mm", color: "#5B7B6B", season: "Both"   },
  "Haveri":            { crops: ["Cotton","Maize","Chilli"],          soil: "Black Cotton",    rainfall: "700mm",  color: "#8B6B5B", season: "Kharif" },
  "Kalaburagi":        { crops: ["Tur Dal","Soybean","Cotton"],       soil: "Medium Black",    rainfall: "700mm",  color: "#9B7B55", season: "Kharif" },
  "Kodagu":            { crops: ["Coffee","Cardamom","Pepper"],       soil: "Laterite Forest", rainfall: "2500mm", color: "#4B7B5B", season: "Both"   },
  "Kolar":             { crops: ["Tomato","Ragi","Mulberry"],         soil: "Red Sandy",       rainfall: "750mm",  color: "#8B8B5B", season: "Both"   },
  "Koppal":            { crops: ["Cotton","Groundnut","Sunflower"],   soil: "Black Cotton",    rainfall: "500mm",  color: "#9B7B45", season: "Kharif" },
  "Mandya":            { crops: ["Sugarcane","Paddy","Ragi"],         soil: "Black & Red",     rainfall: "750mm",  color: "#6B9B5B", season: "Both"   },
  "Mysuru":            { crops: ["Sugarcane","Ragi","Turmeric"],      soil: "Red Loam",        rainfall: "750mm",  color: "#7B8B5B", season: "Both"   },
  "Raichur":           { crops: ["Cotton","Paddy","Sunflower"],       soil: "Black Cotton",    rainfall: "600mm",  color: "#9B8B45", season: "Kharif" },
  "Ramanagara":        { crops: ["Mulberry","Ragi","Vegetables"],     soil: "Red Loam",        rainfall: "800mm",  color: "#7B8B6B", season: "Both"   },
  "Shivamogga":        { crops: ["Arecanut","Paddy","Banana"],        soil: "Red Loam",        rainfall: "1500mm", color: "#5B9B5B", season: "Both"   },
  "Tumakuru":          { crops: ["Groundnut","Coconut","Ragi"],       soil: "Red Sandy",       rainfall: "750mm",  color: "#8B8B4B", season: "Both"   },
  "Udupi":             { crops: ["Arecanut","Coconut","Paddy"],       soil: "Laterite",        rainfall: "4000mm", color: "#4B9B6B", season: "Both"   },
  "Uttara Kannada":    { crops: ["Arecanut","Cashew","Paddy"],        soil: "Laterite",        rainfall: "3000mm", color: "#4B8B5B", season: "Both"   },
  "Vijayapura":        { crops: ["Pomegranate","Cotton","Grapes"],    soil: "Black Cotton",    rainfall: "550mm",  color: "#8B6B45", season: "Kharif" },
  "Yadgir":            { crops: ["Tur Dal","Cotton","Groundnut"],     soil: "Medium Black",    rainfall: "650mm",  color: "#9B7B5B", season: "Kharif" },
}

// ─── CROP IMAGES (Unsplash, free, no key needed) ────────────
export const CROP_IMAGES: CropImageMap = {
  rice:          "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?fit=crop&w=800&h=500&q=80",
  paddy:         "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?fit=crop&w=800&h=500&q=80",
  cotton:        "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?fit=crop&w=800&h=500&q=80",
  maize:         "https://images.unsplash.com/photo-1601593768799-76a5b6e76e1b?fit=crop&w=800&h=500&q=80",
  soybean:       "https://images.unsplash.com/photo-1599250356922-ddf7b1a17a4f?fit=crop&w=800&h=500&q=80",
  groundnut:     "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?fit=crop&w=800&h=500&q=80",
  sunflower:     "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?fit=crop&w=800&h=500&q=80",
  bajra:         "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?fit=crop&w=800&h=500&q=80",
  jowar:         "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?fit=crop&w=800&h=500&q=80",
  ragi:          "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?fit=crop&w=800&h=500&q=80",
  wheat:         "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?fit=crop&w=800&h=500&q=80",
  chickpea:      "https://images.unsplash.com/photo-1599250356922-ddf7b1a17a4f?fit=crop&w=800&h=500&q=80",
  bengal_gram:   "https://images.unsplash.com/photo-1599250356922-ddf7b1a17a4f?fit=crop&w=800&h=500&q=80",
  pigeon_pea:    "https://images.unsplash.com/photo-1599250356922-ddf7b1a17a4f?fit=crop&w=800&h=500&q=80",
  pomegranate:   "https://images.unsplash.com/photo-1603048588665-791ca8aea617?fit=crop&w=800&h=500&q=80",
  banana:        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?fit=crop&w=800&h=500&q=80",
  mango:         "https://images.unsplash.com/photo-1553279768-865429fa0078?fit=crop&w=800&h=500&q=80",
  grapes:        "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?fit=crop&w=800&h=500&q=80",
  tomato:        "https://images.unsplash.com/photo-1592841200221-a6898f307baa?fit=crop&w=800&h=500&q=80",
  onion:         "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?fit=crop&w=800&h=500&q=80",
  potato:        "https://images.unsplash.com/photo-1508313880080-c4bef0730395?fit=crop&w=800&h=500&q=80",
  chilli:        "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?fit=crop&w=800&h=500&q=80",
  arecanut:      "https://images.unsplash.com/photo-1611843467160-25afb8df1074?fit=crop&w=800&h=500&q=80",
  coconut:       "https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?fit=crop&w=800&h=500&q=80",
  sugarcane:     "https://images.unsplash.com/photo-1598512752271-33f913a5af13?fit=crop&w=800&h=500&q=80",
  coffee:        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?fit=crop&w=800&h=500&q=80",
  capsicum:      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?fit=crop&w=800&h=500&q=80",
  default:       "https://images.unsplash.com/photo-1500382017468-9049fed747ef?fit=crop&w=800&h=500&q=80",
}

// Helper — safely get crop image
export const getCropImage = (name = ''): string => {
  const key = name.toLowerCase().trim()
    .replace(/\s*\(.*?\)\s*/g, '')  // remove parenthetical like "(Pearl Millet)"
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z_]/g, '')
  return CROP_IMAGES[key] ?? CROP_IMAGES.default
}

// ─── SEASON CALENDAR ────────────────────────────────────────
export const SEASON_CROPS: SeasonCrops = {
  Kharif: ["Cotton", "Ragi", "Maize", "Soybean", "Groundnut", "Sunflower", "Bajra", "Jowar", "Paddy"],
  Rabi:   ["Wheat", "Chickpea", "Mustard", "Lentil", "Sunflower", "Safflower", "Barley"],
  Zaid:   ["Maize", "Groundnut", "Vegetables", "Watermelon", "Cucumber", "Moong"],
}

// Returns current season based on month
export const getCurrentSeason = (): keyof SeasonCrops => {
  const month = new Date().getMonth() // 0-indexed
  if (month >= 5 && month <= 9)  return 'Kharif'  // Jun–Oct
  if (month >= 10 || month <= 1) return 'Rabi'    // Nov–Feb
  return 'Zaid'                                    // Mar–May
}

// ─── MARKET TREND FALLBACK DATA ─────────────────────────────
// TODO: fetch real data from APMC/data.gov.in API
export const MARKET_TRENDS: MarketTrend[] = [
  { name: "Cotton",      price: null,  changePercent: null, unit: "₹/quintal", sparkline: null },
  { name: "Tomato",      price: null,  changePercent: null, unit: "₹/quintal", sparkline: null },
  { name: "Onion",       price: null,  changePercent: null, unit: "₹/quintal", sparkline: null },
  { name: "Sugarcane",   price: null,  changePercent: null, unit: "₹/quintal", sparkline: null },
  { name: "Ragi",        price: null,  changePercent: null, unit: "₹/quintal", sparkline: null },
  { name: "Maize",       price: null,  changePercent: null, unit: "₹/quintal", sparkline: null },
  { name: "Groundnut",   price: null,  changePercent: null, unit: "₹/quintal", sparkline: null },
  { name: "Pomegranate", price: null,  changePercent: null, unit: "₹/quintal", sparkline: null },
  { name: "Banana",      price: null,  changePercent: null, unit: "₹/quintal", sparkline: null },
  { name: "Wheat",       price: null,  changePercent: null, unit: "₹/quintal", sparkline: null },
]

// ─── UTILITY FUNCTIONS ──────────────────────────────────────
export const formatCurrency = (n: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(n)

export const formatIndianNumber = (n: number): string =>
  new Intl.NumberFormat('en-IN').format(Math.round(n))

export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60)   return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export const DISTRICT_CROP_DATA = DISTRICTS;

