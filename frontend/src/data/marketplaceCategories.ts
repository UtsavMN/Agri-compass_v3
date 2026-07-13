// src/data/marketplaceCategories.ts

export interface ListingCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  subTypes: string[];
  requiredFields: string[];
  priceLabel: string;
}

export const LISTING_CATEGORIES: ListingCategory[] = [
  {
    id: 'land',
    label: 'Land',
    icon: '🌾',
    color: 'rgba(196,154,42,0.15)',
    subTypes: ['Agricultural Land for Sale', 'Land for Lease', 'Land for Rent', 'Land Lease Exchange'],
    requiredFields: ['area_acres', 'soil_type', 'water_source', 'price'],
    priceLabel: '₹ per acre or total price',
  },
  {
    id: 'crops',
    label: 'Crops & Produce',
    icon: '🌽',
    color: 'rgba(74,154,106,0.15)',
    subTypes: ['Crop for Bulk Sale', 'Vegetables', 'Fruits', 'Grains & Pulses', 'Spices'],
    requiredFields: ['crop_name', 'quantity_kg', 'quality_grade', 'price_per_kg'],
    priceLabel: '₹ per kg or per quintal',
  },
  {
    id: 'fertilizers',
    label: 'Fertilizers & Pesticides',
    icon: '🧪',
    color: 'rgba(74,122,196,0.15)',
    subTypes: ['Chemical Fertilizer', 'Organic Fertilizer', 'Pesticide', 'Fungicide', 'Bio-Input'],
    requiredFields: ['product_name', 'brand', 'quantity_kg', 'price'],
    priceLabel: '₹ per kg or per bag',
  },
  {
    id: 'manure',
    label: 'Manure & Compost',
    icon: '♻️',
    color: 'rgba(139,115,85,0.2)',
    subTypes: ['Farm Yard Manure (FYM)', 'Vermicompost', 'Poultry Manure', 'Green Manure', 'Biochar'],
    requiredFields: ['type', 'quantity_kg', 'price'],
    priceLabel: '₹ per kg or per tractor load',
  },
  {
    id: 'equipment',
    label: 'Equipment & Tools',
    icon: '🚜',
    color: 'rgba(196,90,74,0.15)',
    subTypes: ['Tractor', 'Harvester', 'Sprayer', 'Drip System', 'Pump', 'Hand Tools', 'Plough'],
    requiredFields: ['equipment_name', 'condition', 'year', 'price'],
    priceLabel: '₹ selling price or ₹/day rental',
  },
  {
    id: 'seeds',
    label: 'Seeds & Saplings',
    icon: '🌱',
    color: 'rgba(74,154,106,0.12)',
    subTypes: ['Certified Seeds', 'Hybrid Seeds', 'Saplings', 'Grafted Plants', 'Seedlings'],
    requiredFields: ['crop_type', 'variety', 'quantity', 'certification', 'price'],
    priceLabel: '₹ per kg or per sapling',
  },
  {
    id: 'labour',
    label: 'Labour & Services',
    icon: '👷',
    color: 'rgba(139,115,85,0.15)',
    subTypes: ['Farm Labour', 'Tractor Operator', 'Harvesting Service', 'Ploughing Service', 'Spraying Service'],
    requiredFields: ['service_type', 'availability', 'rate_per_day'],
    priceLabel: '₹ per day or per acre',
  },
  {
    id: 'livestock',
    label: 'Livestock',
    icon: '🐄',
    color: 'rgba(196,154,42,0.1)',
    subTypes: ['Cattle', 'Goats', 'Sheep', 'Poultry', 'Fish (Aquaculture)'],
    requiredFields: ['animal_type', 'breed', 'age', 'count', 'price'],
    priceLabel: '₹ per animal or per batch',
  },
];
