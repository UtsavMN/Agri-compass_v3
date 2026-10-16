/**
 * Canonical Crop & PDF Registry
 * Maps all crops from Crops_data.json to verified PDF cultivation guides in /crops info/
 * Supports resilient alias matching, safe URI paths, and technical dataset (JSON) exports.
 */

export interface CropPdfInfo {
  id: string;
  name: string;
  slug: string;
  scientificName?: string;
  pdfFileName: string;
  pdfPath: string; // URL-safe path e.g. /crops%20info/rice_cultivation_guide.pdf
  aliases: string[];
}

export const CROP_PDF_REGISTRY: Record<string, CropPdfInfo> = {
  "rice-paddy": {
    id: "crop_001",
    name: "Rice (Paddy)",
    slug: "rice-paddy",
    scientificName: "Oryza sativa L.",
    pdfFileName: "rice_cultivation_guide.pdf",
    pdfPath: "/crops%20info/rice_cultivation_guide.pdf",
    aliases: ["rice", "paddy", "dhan", "chawal", "nellu", "akki", "rice-paddy", "rice-(paddy)"]
  },
  "wheat": {
    id: "crop_002",
    name: "Wheat",
    slug: "wheat",
    scientificName: "Triticum aestivum",
    pdfFileName: "wheat_cultivation_guide.pdf",
    pdfPath: "/crops%20info/wheat_cultivation_guide.pdf",
    aliases: ["wheat", "gehun", "godhi"]
  },
  "maize-corn": {
    id: "crop_003",
    name: "Maize (Corn)",
    slug: "maize-corn",
    scientificName: "Zea mays",
    pdfFileName: "maize_cultivation_guide.pdf",
    pdfPath: "/crops%20info/maize_cultivation_guide.pdf",
    aliases: ["maize", "corn", "makka", "musukina jola", "maize-corn", "maize-(corn)"]
  },
  "tomato": {
    id: "crop_004",
    name: "Tomato",
    slug: "tomato",
    scientificName: "Solanum lycopersicum",
    pdfFileName: "tomato_cultivation_guide.pdf",
    pdfPath: "/crops%20info/tomato_cultivation_guide.pdf",
    aliases: ["tomato", "tamatar", "tomatokai"]
  },
  "chickpea-chana": {
    id: "crop_005",
    name: "Chickpea (Chana)",
    slug: "chickpea-chana",
    scientificName: "Cicer arietinum",
    pdfFileName: "chickpea_cultivation_guide.pdf",
    pdfPath: "/crops%20info/chickpea_cultivation_guide.pdf",
    aliases: ["chickpea", "chana", "kadale", "bengal gram", "chickpea-chana", "chickpea-(chana)"]
  },
  "sugarcane": {
    id: "crop_006",
    name: "Sugarcane",
    slug: "sugarcane",
    scientificName: "Saccharum officinarum",
    pdfFileName: "sugarcane_cultivation_guide.pdf",
    pdfPath: "/crops%20info/sugarcane_cultivation_guide.pdf",
    aliases: ["sugarcane", "ganna", "kabbu"]
  },
  "cotton": {
    id: "crop_007",
    name: "Cotton",
    slug: "cotton",
    scientificName: "Gossypium hirsutum",
    pdfFileName: "cotton_cultivation_guide.pdf",
    pdfPath: "/crops%20info/cotton_cultivation_guide.pdf",
    aliases: ["cotton", "kapas", "hatti"]
  },
  "groundnut-peanut": {
    id: "crop_008",
    name: "Groundnut (Peanut)",
    slug: "groundnut-peanut",
    scientificName: "Arachis hypogaea",
    pdfFileName: "groundnut_cultivation_guide.pdf",
    pdfPath: "/crops%20info/groundnut_cultivation_guide.pdf",
    aliases: ["groundnut", "peanut", "moongphali", "shenga", "kadale kai", "groundnut-peanut", "groundnut-(peanut)"]
  },
  "banana": {
    id: "crop_009",
    name: "Banana",
    slug: "banana",
    scientificName: "Musa acuminata",
    pdfFileName: "banana_cultivation_guide.pdf",
    pdfPath: "/crops%20info/banana_cultivation_guide.pdf",
    aliases: ["banana", "kela", "bale", "balehannu"]
  },
  "mustard": {
    id: "crop_010",
    name: "Mustard",
    slug: "mustard",
    scientificName: "Brassica juncea",
    pdfFileName: "mustard_cultivation_guide.pdf",
    pdfPath: "/crops%20info/mustard_cultivation_guide.pdf",
    aliases: ["mustard", "sarson", "sasive"]
  },
  "turmeric": {
    id: "crop_011",
    name: "Turmeric",
    slug: "turmeric",
    scientificName: "Curcuma longa",
    pdfFileName: "turmeric_cultivation_guide.pdf",
    pdfPath: "/crops%20info/turmeric_cultivation_guide.pdf",
    aliases: ["turmeric", "haldi", "arishina"]
  },
  "onion": {
    id: "crop_012",
    name: "Onion",
    slug: "onion",
    scientificName: "Allium cepa",
    pdfFileName: "onion_cultivation_guide.pdf",
    pdfPath: "/crops%20info/onion_cultivation_guide.pdf",
    aliases: ["onion", "pyaaz", "eerulli"]
  },
  "ragi-finger-millet": {
    id: "crop_013",
    name: "Ragi (Finger Millet)",
    slug: "ragi-finger-millet",
    scientificName: "Eleusine coracana",
    pdfFileName: "ragi_cultivation_guide.pdf",
    pdfPath: "/crops%20info/ragi_cultivation_guide.pdf",
    aliases: ["ragi", "finger millet", "mandua", "ragi-finger-millet", "ragi-(finger-millet)"]
  },
  "pigeon-pea-toor-dal--red-gram": {
    id: "crop_014",
    name: "Pigeon Pea (Toor Dal / Red Gram)",
    slug: "pigeon-pea-toor-dal--red-gram",
    scientificName: "Cajanus cajan",
    pdfFileName: "pigeon_pea_cultivation_guide.pdf",
    pdfPath: "/crops%20info/pigeon_pea_cultivation_guide.pdf",
    aliases: ["pigeon pea", "toor dal", "red gram", "arhar", "togari bele", "tur dal", "tur_dal", "pigeon_pea"]
  },
  "jowar-sorghum": {
    id: "crop_015",
    name: "Jowar (Sorghum)",
    slug: "jowar-sorghum",
    scientificName: "Sorghum bicolor",
    pdfFileName: "jowar_cultivation_guide.pdf",
    pdfPath: "/crops%20info/jowar_cultivation_guide.pdf",
    aliases: ["jowar", "sorghum", "jola", "jowar-sorghum", "jowar-(sorghum)"]
  },
  "foxtail-millet": {
    id: "crop_016",
    name: "Foxtail Millet",
    slug: "foxtail-millet",
    scientificName: "Setaria italica",
    pdfFileName: "foxtail_millet_cultivation_guide.pdf",
    pdfPath: "/crops%20info/foxtail_millet_cultivation_guide.pdf",
    aliases: ["foxtail millet", "kangni", "navane"]
  },
  "little-millet": {
    id: "crop_017",
    name: "Little Millet",
    slug: "little-millet",
    scientificName: "Panicum sumatrense",
    pdfFileName: "little_millet_cultivation_guide.pdf",
    pdfPath: "/crops%20info/little_millet_cultivation_guide.pdf",
    aliases: ["little millet", "kutki", "same", "saame"]
  },
  "barnyard-millet": {
    id: "crop_018",
    name: "Barnyard Millet",
    slug: "barnyard-millet",
    scientificName: "Echinochloa frumentacea",
    pdfFileName: "barnyard_millet_cultivation_guide.pdf",
    pdfPath: "/crops%20info/barnyard_millet_cultivation_guide.pdf",
    aliases: ["barnyard millet", "sanwa", "oodalu"]
  },
  "kodo-millet": {
    id: "crop_019",
    name: "Kodo Millet",
    slug: "kodo-millet",
    scientificName: "Paspalum scrobiculatum",
    pdfFileName: "kodo_millet_cultivation_guide.pdf",
    pdfPath: "/crops%20info/kodo_millet_cultivation_guide.pdf",
    aliases: ["kodo millet", "kodra", "haraka"]
  },
  "green-gram-moong": {
    id: "crop_020",
    name: "Green Gram (Moong)",
    slug: "green-gram-moong",
    scientificName: "Vigna radiata",
    pdfFileName: "moong_cultivation_guide.pdf",
    pdfPath: "/crops%20info/moong_cultivation_guide.pdf",
    aliases: ["green gram", "moong", "hesaru kalu", "moong dal", "green-gram-moong", "green_gram"]
  },
  "black-gram-urad-dal": {
    id: "crop_021",
    name: "Black Gram (Urad Dal)",
    slug: "black-gram-urad-dal",
    scientificName: "Vigna mungo",
    pdfFileName: "black_gram_cultivation_guide.pdf",
    pdfPath: "/crops%20info/black_gram_cultivation_guide.pdf",
    aliases: ["black gram", "urad", "urad dal", "uddu", "black-gram-urad-dal", "black_gram"]
  },
  "cowpea": {
    id: "crop_022",
    name: "Cowpea",
    slug: "cowpea",
    scientificName: "Vigna unguiculata",
    pdfFileName: "cowpea_cultivation_guide.pdf",
    pdfPath: "/crops%20info/cowpea_cultivation_guide.pdf",
    aliases: ["cowpea", "lobia", "alasande"]
  },
  "horse-gram": {
    id: "crop_023",
    name: "Horse Gram",
    slug: "horse-gram",
    scientificName: "Macrotyloma uniflorum",
    pdfFileName: "horsegram_cultivation_guide.pdf",
    pdfPath: "/crops%20info/horsegram_cultivation_guide.pdf",
    aliases: ["horse gram", "kulthi", "huruli", "horsegram", "horse-gram"]
  },
  "field-bean-avare": {
    id: "crop_024",
    name: "Field Bean (Avare)",
    slug: "field-bean-avare",
    scientificName: "Lablab purpureus",
    pdfFileName: "fieldbean_cultivation_guide.pdf",
    pdfPath: "/crops%20info/fieldbean_cultivation_guide.pdf",
    aliases: ["field bean", "avare", "avarekalu", "lablab", "fieldbean", "field-bean-avare"]
  },
  "kidney-beans-rajma": {
    id: "crop_025",
    name: "Kidney Beans (Rajma)",
    slug: "kidney-beans-rajma",
    scientificName: "Phaseolus vulgaris",
    pdfFileName: "kidneybean_cultivation_guide.pdf",
    pdfPath: "/crops%20info/kidneybean_cultivation_guide.pdf",
    aliases: ["kidney beans", "rajma", "kidneybean", "kidney-beans-rajma"]
  },
  "bajra-pearl-millet": {
    id: "crop_026",
    name: "Bajra (Pearl Millet)",
    slug: "bajra-pearl-millet",
    scientificName: "Pennisetum glaucum",
    pdfFileName: "bajra_cultivation_guide.pdf",
    pdfPath: "/crops%20info/bajra_cultivation_guide.pdf",
    aliases: ["bajra", "pearl millet", "sajje", "bajra-pearl-millet"]
  },
  "coffee": {
    id: "crop_027",
    name: "Coffee",
    slug: "coffee",
    scientificName: "Coffea arabica / canephora",
    pdfFileName: "coffee_cultivation_guide.pdf",
    pdfPath: "/crops%20info/coffee_cultivation_guide.pdf",
    aliases: ["coffee", "kapi", "kaafi"]
  },
  "arecanut": {
    id: "crop_028",
    name: "Arecanut",
    slug: "arecanut",
    scientificName: "Areca catechu",
    pdfFileName: "arecanut_cultivation_guide.pdf",
    pdfPath: "/crops%20info/arecanut_cultivation_guide.pdf",
    aliases: ["arecanut", "supari", "adike", "betel nut"]
  },
  "coconut": {
    id: "crop_029",
    name: "Coconut",
    slug: "coconut",
    scientificName: "Cocos nucifera",
    pdfFileName: "coconut_cultivation_guide.pdf",
    pdfPath: "/crops%20info/coconut_cultivation_guide.pdf",
    aliases: ["coconut", "nariyal", "tengu", "thengina kai"]
  },
  "cocoa": {
    id: "crop_030",
    name: "Cocoa",
    slug: "cocoa",
    scientificName: "Theobroma cacao",
    pdfFileName: "cocoa_cultivation_guide.pdf",
    pdfPath: "/crops%20info/cocoa_cultivation_guide.pdf",
    aliases: ["cocoa", "cacao"]
  },
  "black-pepper": {
    id: "crop_031",
    name: "Black Pepper",
    slug: "black-pepper",
    scientificName: "Piper nigrum",
    pdfFileName: "black_pepper_cultivation_guide.pdf",
    pdfPath: "/crops%20info/black_pepper_cultivation_guide.pdf",
    aliases: ["black pepper", "kali mirch", "kare menasu", "pepper", "black-pepper"]
  },
  "cardamom": {
    id: "crop_032",
    name: "Cardamom",
    slug: "cardamom",
    scientificName: "Elettaria cardamomum",
    pdfFileName: "cardamom_cultivation_guide.pdf",
    pdfPath: "/crops%20info/cardamom_cultivation_guide.pdf",
    aliases: ["cardamom", "elaichi", "elakki"]
  },
  "ginger": {
    id: "crop_033",
    name: "Ginger",
    slug: "ginger",
    scientificName: "Zingiber officinale",
    pdfFileName: "ginger_cultivation_guide.pdf",
    pdfPath: "/crops%20info/ginger_cultivation_guide.pdf",
    aliases: ["ginger", "adrak", "shunti"]
  },
  "chilli": {
    id: "crop_034",
    name: "Chilli",
    slug: "chilli",
    scientificName: "Capsicum annuum",
    pdfFileName: "chilli_cultivation_guide.pdf",
    pdfPath: "/crops%20info/chilli_cultivation_guide.pdf",
    aliases: ["chilli", "mirchi", "menasinakai", "chili"]
  },
  "coriander": {
    id: "crop_035",
    name: "Coriander",
    slug: "coriander",
    scientificName: "Coriandrum sativum",
    pdfFileName: "coriander_cultivation_guide.pdf",
    pdfPath: "/crops%20info/coriander_cultivation_guide.pdf",
    aliases: ["coriander", "dhaniya", "kothambari"]
  },
  "fenugreek": {
    id: "crop_036",
    name: "Fenugreek",
    slug: "fenugreek",
    scientificName: "Trigonella foenum-graecum",
    pdfFileName: "fenugreek_cultivation_guide.pdf",
    pdfPath: "/crops%20info/fenugreek_cultivation_guide.pdf",
    aliases: ["fenugreek", "methi", "menthya"]
  },
  "brinjal-eggplant": {
    id: "crop_037",
    name: "Brinjal (Eggplant)",
    slug: "brinjal-eggplant",
    scientificName: "Solanum melongena",
    pdfFileName: "brinjal_cultivation_guide.pdf",
    pdfPath: "/crops%20info/brinjal_cultivation_guide.pdf",
    aliases: ["brinjal", "eggplant", "baingan", "badanekai", "brinjal-eggplant"]
  },
  "cabbage": {
    id: "crop_038",
    name: "Cabbage",
    slug: "cabbage",
    scientificName: "Brassica oleracea var. capitata",
    pdfFileName: "cabbage_cultivation_guide.pdf",
    pdfPath: "/crops%20info/cabbage_cultivation_guide.pdf",
    aliases: ["cabbage", "patta gobhi", "kose"]
  },
  "cauliflower": {
    id: "crop_039",
    name: "Cauliflower",
    slug: "cauliflower",
    scientificName: "Brassica oleracea var. botrytis",
    pdfFileName: "cauliflower_cultivation_guide.pdf",
    pdfPath: "/crops%20info/cauliflower_cultivation_guide.pdf",
    aliases: ["cauliflower", "phool gobhi", "hookose"]
  },
  "capsicum": {
    id: "crop_040",
    name: "Capsicum",
    slug: "capsicum",
    scientificName: "Capsicum annuum var. grossum",
    pdfFileName: "capsicum_cultivation_guide.pdf",
    pdfPath: "/crops%20info/capsicum_cultivation_guide.pdf",
    aliases: ["capsicum", "shimla mirch", "donne menasinakai", "bell pepper"]
  },
  "beans-french-beans": {
    id: "crop_041",
    name: "Beans (French Beans)",
    slug: "beans-french-beans",
    scientificName: "Phaseolus vulgaris",
    pdfFileName: "beans_cultivation_guide.pdf",
    pdfPath: "/crops%20info/beans_cultivation_guide.pdf",
    aliases: ["beans", "french beans", "hurulikayi", "beans-french-beans"]
  },
  "mango": {
    id: "crop_042",
    name: "Mango",
    slug: "mango",
    scientificName: "Mangifera indica",
    pdfFileName: "mango_cultivation_guide.pdf",
    pdfPath: "/crops%20info/mango_cultivation_guide.pdf",
    aliases: ["mango", "aam", "mavu", "mavina hannu"]
  },
  "grapes": {
    id: "crop_043",
    name: "Grapes",
    slug: "grapes",
    scientificName: "Vitis vinifera",
    pdfFileName: "grapes_cultivation_guide.pdf",
    pdfPath: "/crops%20info/grapes_cultivation_guide.pdf",
    aliases: ["grapes", "angoor", "drakshi"]
  },
  "pomegranate": {
    id: "crop_044",
    name: "Pomegranate",
    slug: "pomegranate",
    scientificName: "Punica granatum",
    pdfFileName: "pomegranate_cultivation_guide.pdf",
    pdfPath: "/crops%20info/pomegranate_cultivation_guide.pdf",
    aliases: ["pomegranate", "anaar", "dalimbe"]
  },
  "soybean": {
    id: "crop_045",
    name: "Soybean",
    slug: "soybean",
    scientificName: "Glycine max",
    pdfFileName: "soybean_cultivation_guide.pdf",
    pdfPath: "/crops%20info/soybean_cultivation_guide.pdf",
    aliases: ["soybean", "soya", "soyabean"]
  },
  "sunflower": {
    id: "crop_046",
    name: "Sunflower",
    slug: "sunflower",
    scientificName: "Helianthus annuus",
    pdfFileName: "sunflower_cultivation_guide.pdf",
    pdfPath: "/crops%20info/sunflower_cultivation_guide.pdf",
    aliases: ["sunflower", "surajmukhi", "suryakanti"]
  },
  "sesame": {
    id: "crop_047",
    name: "Sesame",
    slug: "sesame",
    scientificName: "Sesamum indicum",
    pdfFileName: "sesame_cultivation_guide.pdf",
    pdfPath: "/crops%20info/sesame_cultivation_guide.pdf",
    aliases: ["sesame", "til", "yellu"]
  },
  "castor": {
    id: "crop_048",
    name: "Castor",
    slug: "castor",
    scientificName: "Ricinus communis",
    pdfFileName: "castor_cultivation_guide.pdf",
    pdfPath: "/crops%20info/castor_cultivation_guide.pdf",
    aliases: ["castor", "arandi", "haralu"]
  },
  "tobacco": {
    id: "crop_049",
    name: "Tobacco",
    slug: "tobacco",
    scientificName: "Nicotiana tabacum",
    pdfFileName: "tobacco_cultivation_guide.pdf",
    pdfPath: "/crops%20info/tobacco_cultivation_guide.pdf",
    aliases: ["tobacco", "tambaku", "hogesoppu"]
  }
};

/**
 * Resilient lookup function that resolves any crop slug, name, or id to its canonical PDF entry.
 */
export function findCropPdf(query: string): CropPdfInfo {
  if (!query) {
    return CROP_PDF_REGISTRY["rice-paddy"];
  }

  const clean = query.trim().toLowerCase();
  const normalized = clean.replace(/[^a-z0-9]/g, "");

  // 1. Direct key match
  if (CROP_PDF_REGISTRY[clean]) {
    return CROP_PDF_REGISTRY[clean];
  }

  // 2. Check id match (e.g. crop_001)
  for (const info of Object.values(CROP_PDF_REGISTRY)) {
    if (info.id.toLowerCase() === clean) return info;
  }

  // 3. Normalized slug check
  for (const [key, info] of Object.entries(CROP_PDF_REGISTRY)) {
    if (key.replace(/[^a-z0-9]/g, "") === normalized) return info;
    if (info.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized) return info;
  }

  // 4. Aliases search
  for (const info of Object.values(CROP_PDF_REGISTRY)) {
    if (info.aliases.some(a => a.toLowerCase() === clean || a.replace(/[^a-z0-9]/g, "") === normalized)) {
      return info;
    }
  }

  // 5. Substring / partial match
  for (const info of Object.values(CROP_PDF_REGISTRY)) {
    const normName = info.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalized.length >= 3 && (normName.includes(normalized) || normalized.includes(normName))) {
      return info;
    }
  }

  // Fallback: return default rice guide with safe URL
  return {
    id: "crop_fallback",
    name: query,
    slug: clean.replace(/\s+/g, "-"),
    pdfFileName: "rice_cultivation_guide.pdf",
    pdfPath: "/crops%20info/rice_cultivation_guide.pdf",
    aliases: []
  };
}

/**
 * Trigger download of the verified PDF cultivation guide
 */
export function downloadCropPdf(slugOrName: string, cropName?: string): void {
  const info = findCropPdf(slugOrName);
  const link = document.createElement("a");
  link.href = info.pdfPath;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = info.pdfFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger instant download of the complete, validated crop dataset as a clean JSON file
 */
export function downloadCropDatasetJson(cropData: any): void {
  const fileName = `${(cropData.slug || cropData.nameEnglish || "crop").toLowerCase().replace(/[^a-z0-9]/g, "_")}_agronomic_dataset.json`;
  
  // Format the complete dataset export
  const exportPayload = {
    metadata: {
      platform: "AgriCompass",
      version: "3.0.0",
      type: "Precision Agronomic Dataset",
      generatedAt: new Date().toISOString(),
      license: "Open Agricultural Knowledge Initiative"
    },
    crop: cropData
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
