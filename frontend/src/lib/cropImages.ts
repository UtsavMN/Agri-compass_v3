// Crop name to authentic agricultural images (local fast-loading, zero 429/404 rate-limits)
export const CROP_IMAGE_MAP: { [key: string]: string } = {
  // Cereals & Millets
  'rice': '/images/crops/rice.jpg',
  'paddy': '/images/crops/rice.jpg',
  'rice (paddy)': '/images/crops/rice.jpg',
  'wheat': '/images/crops/wheat.jpg',
  'maize': '/images/crops/maize.jpg',
  'maize (corn)': '/images/crops/maize.jpg',
  'corn': '/images/crops/maize.jpg',
  'ragi': '/images/crops/ragi.jpg',
  'ragi (finger millet)': '/images/crops/ragi.jpg',
  'finger millet': '/images/crops/ragi.jpg',
  'jowar': '/images/crops/jowar.jpg',
  'jowar (sorghum)': '/images/crops/jowar.jpg',
  'sorghum': '/images/crops/jowar.jpg',
  'bajra': '/images/crops/bajra.jpg',
  'bajra (pearl millet)': '/images/crops/bajra.jpg',
  'pearl millet': '/images/crops/bajra.jpg',
  'sajje': '/images/crops/bajra.jpg',
  'foxtail millet': '/images/crops/foxtail_millet.jpg',
  'navane': '/images/crops/foxtail_millet.jpg',
  'little millet': '/images/crops/little_millet.jpg',
  'saame': '/images/crops/little_millet.jpg',
  'barnyard millet': '/images/crops/barnyard_millet.jpg',
  'oodalu': '/images/crops/barnyard_millet.jpg',
  'kodo millet': '/images/crops/kodo_millet.jpg',
  'haraka': '/images/crops/kodo_millet.jpg',

  // Pulses & Legumes
  'chickpea': '/images/crops/chickpea.jpg',
  'chickpea (chana)': '/images/crops/chickpea.jpg',
  'chana': '/images/crops/chickpea.jpg',
  'bengal gram': '/images/crops/chickpea.jpg',
  'pigeon pea': '/images/crops/pigeon_pea.jpg',
  'pigeon pea (toor dal / red gram)': '/images/crops/pigeon_pea.jpg',
  'toor dal': '/images/crops/pigeon_pea.jpg',
  'red gram': '/images/crops/pigeon_pea.jpg',
  'green gram': '/images/crops/green_gram.jpg',
  'green gram (moong)': '/images/crops/green_gram.jpg',
  'moong': '/images/crops/green_gram.jpg',
  'black gram': '/images/crops/black_gram.jpg',
  'black gram (urad dal)': '/images/crops/black_gram.jpg',
  'urad dal': '/images/crops/black_gram.jpg',
  'cowpea': '/images/crops/cowpea.jpg',
  'lobia': '/images/crops/cowpea.jpg',
  'alasande': '/images/crops/cowpea.jpg',
  'horse gram': '/images/crops/horse_gram.jpg',
  'huruli': '/images/crops/horse_gram.jpg',
  'field bean': '/images/crops/field_bean.jpg',
  'field bean (avare)': '/images/crops/field_bean.jpg',
  'avarekalu': '/images/crops/field_bean.jpg',
  'avare': '/images/crops/field_bean.jpg',
  'kidney beans': '/images/crops/kidney_beans.jpg',
  'kidney beans (rajma)': '/images/crops/kidney_beans.jpg',
  'rajma': '/images/crops/kidney_beans.jpg',
  'beans': '/images/crops/beans.jpg',
  'beans (french beans)': '/images/crops/beans.jpg',
  'french beans': '/images/crops/beans.jpg',
  'hurulikayi': '/images/crops/beans.jpg',
  'soybean': '/images/crops/soybean.jpg',

  // Cash & Plantation Crops
  'sugarcane': '/images/crops/sugarcane.jpg',
  'cotton': '/images/crops/cotton.jpg',
  'arecanut': '/images/crops/arecanut.jpg',
  'adike': '/images/crops/arecanut.jpg',
  'betel nut': '/images/crops/arecanut.jpg',
  'coconut': '/images/crops/coconut.jpg',
  'tengu': '/images/crops/coconut.jpg',
  'coffee': '/images/crops/coffee.jpg',
  'cocoa': '/images/crops/cocoa.jpg',
  'tobacco': '/images/crops/tobacco.jpg',

  // Oilseeds
  'groundnut': '/images/crops/groundnut.jpg',
  'groundnut (peanut)': '/images/crops/groundnut.jpg',
  'peanut': '/images/crops/groundnut.jpg',
  'sunflower': '/images/crops/sunflower.jpg',
  'mustard': '/images/crops/mustard.jpg',
  'sasive': '/images/crops/mustard.jpg',
  'sesame': '/images/crops/sesame.jpg',
  'ellu': '/images/crops/sesame.jpg',
  'til': '/images/crops/sesame.jpg',
  'castor': '/images/crops/castor.jpg',
  'haralu': '/images/crops/castor.jpg',

  // Fruits
  'banana': '/images/crops/banana.jpg',
  'mango': '/images/crops/mango.jpg',
  'grapes': '/images/crops/grapes.jpg',
  'pomegranate': '/images/crops/pomegranate.jpg',
  'dalimbe': '/images/crops/pomegranate.jpg',

  // Spices & Condiments
  'turmeric': '/images/crops/turmeric.jpg',
  'arishina': '/images/crops/turmeric.jpg',
  'ginger': '/images/crops/ginger.jpg',
  'shunti': '/images/crops/ginger.jpg',
  'chilli': '/images/crops/chilli.jpg',
  'menasinakai': '/images/crops/chilli.jpg',
  'black pepper': '/images/crops/black_pepper.jpg',
  'menasu': '/images/crops/black_pepper.jpg',
  'cardamom': '/images/crops/cardamom.jpg',
  'yelakki': '/images/crops/cardamom.jpg',
  'coriander': '/images/crops/coriander.jpg',
  'kothambari': '/images/crops/coriander.jpg',
  'fenugreek': '/images/crops/fenugreek.jpg',
  'menthya': '/images/crops/fenugreek.jpg',
  'methi': '/images/crops/fenugreek.jpg',

  // Vegetables
  'tomato': '/images/crops/tomato.jpg',
  'onion': '/images/crops/onion.jpg',
  'potato': '/images/crops/potato.jpg',
  'brinjal': '/images/crops/brinjal.jpg',
  'brinjal (eggplant)': '/images/crops/brinjal.jpg',
  'eggplant': '/images/crops/brinjal.jpg',
  'badanekai': '/images/crops/brinjal.jpg',
  'cabbage': '/images/crops/cabbage.jpg',
  'cauliflower': '/images/crops/cauliflower.jpg',
  'capsicum': '/images/crops/capsicum.jpg',
};

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop';

/**
 * Resolves a crop name to a verified, authentic image URL using case-insensitive matching.
 */
export function getCropImage(cropName: string): string {
  if (!cropName) return DEFAULT_FALLBACK_IMAGE;

  const normalized = cropName.toLowerCase().trim();

  // Exact match
  if (CROP_IMAGE_MAP[normalized]) {
    return CROP_IMAGE_MAP[normalized];
  }

  // Check normalized stripped of special characters/parentheses
  const cleaned = normalized.replace(/\s*\(.*?\)\s*/g, '').trim();
  if (CROP_IMAGE_MAP[cleaned]) {
    return CROP_IMAGE_MAP[cleaned];
  }

  // Fuzzy check (if map key is inside crop name or vice-versa)
  for (const key of Object.keys(CROP_IMAGE_MAP)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return CROP_IMAGE_MAP[key];
    }
  }

  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Resolves a crop name or its database image URLs to a valid, viewable image.
 * Bypasses broken S3 URLs and empty placeholders.
 */
export function resolveCropImage(crop: { name?: string; nameEnglish?: string; imageUrl?: string; image_url?: string }): string {
  // Always use our curated dictionary to ensure authentic, accurate images
  const cropName = crop.nameEnglish || crop.name || '';
  return getCropImage(cropName);
}
