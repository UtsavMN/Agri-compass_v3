import { useState, useEffect, useMemo } from 'react';
import { apiGet } from '@/lib/httpClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Badge } from './badge';
import { MapPin, Phone, Landmark, CloudRain, Sun, Leaf, HelpCircle, Compass, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Inset coordinates for all 30 districts on the Karnataka state outline map
interface DistrictCoordinates {
  name: string;
  x: number;
  y: number;
  soil: string;
  rainfall: string;
  climateZone: string;
}

const DISTRICT_COORDS: DistrictCoordinates[] = [
  { name: 'Bagalkot', x: 46, y: 28, soil: 'Black Cotton & Red Sandy', rainfall: '543 mm', climateZone: 'Northern Dry Zone' },
  { name: 'Ballari', x: 68, y: 48, soil: 'Black & Red Clayey', rainfall: '639 mm', climateZone: 'Eastern Dry Zone' },
  { name: 'Belagavi', x: 25, y: 28, soil: 'Black Cotton & Laterite', rainfall: '808 mm', climateZone: 'Northern Transition Zone' },
  { name: 'Bengaluru Rural', x: 76, y: 80, soil: 'Red Sandy & Red Loamy', rainfall: '815 mm', climateZone: 'Eastern Dry Zone' },
  { name: 'Bengaluru Urban', x: 74, y: 84, soil: 'Red Sandy Clay', rainfall: '978 mm', climateZone: 'Eastern Dry Zone' },
  { name: 'Bidar', x: 72, y: 6, soil: 'Lateritic Red & Black', rainfall: '847 mm', climateZone: 'Northern Dry Zone' },
  { name: 'Chamarajanagar', x: 58, y: 94, soil: 'Red Sandy & Black Clay', rainfall: '750 mm', climateZone: 'Southern Dry Zone' },
  { name: 'Chikkaballapura', x: 80, y: 72, soil: 'Red Gravelly Clay', rainfall: '730 mm', climateZone: 'Eastern Dry Zone' },
  { name: 'Chikkamagaluru', x: 36, y: 72, soil: 'Red Sandy & Deep Laterite', rainfall: '1925 mm', climateZone: 'Hilly Wet Zone' },
  { name: 'Chitradurga', x: 58, y: 60, soil: 'Red Sandy & Deep Black', rainfall: '512 mm', climateZone: 'Central Dry Zone' },
  { name: 'Dakshina Kannada', x: 24, y: 78, soil: 'Lateritic & Alluvial', rainfall: '3900 mm', climateZone: 'Coastal Zone' },
  { name: 'Davangere', x: 46, y: 58, soil: 'Red Sandy Clay & Mixed Red', rainfall: '644 mm', climateZone: 'Central Dry Zone' },
  { name: 'Dharwad', x: 34, y: 40, soil: 'Deep Black Cotton', rainfall: '772 mm', climateZone: 'Northern Transition Zone' },
  { name: 'Gadag', x: 44, y: 40, soil: 'Black Cotton & Loamy Red', rainfall: '612 mm', climateZone: 'Northern Dry Zone' },
  { name: 'Hassan', x: 44, y: 80, soil: 'Red Loamy & Sandy Clay', rainfall: '1041 mm', climateZone: 'Transition Zone' },
  { name: 'Haveri', x: 36, y: 52, soil: 'Red Sandy & Black Mix', rainfall: '753 mm', climateZone: 'Northern Transition Zone' },
  { name: 'Kalaburagi', x: 68, y: 18, soil: 'Deep Black Cotton', rainfall: '745 mm', climateZone: 'Northern Dry Zone' },
  { name: 'Kodagu', x: 32, y: 86, soil: 'Forest Clay & Deep Lateritic', rainfall: '2725 mm', climateZone: 'Hilly Wet Zone' },
  { name: 'Kolar', x: 88, y: 76, soil: 'Red Gravelly Loam', rainfall: '714 mm', climateZone: 'Eastern Dry Zone' },
  { name: 'Koppal', x: 54, y: 38, soil: 'Mixed Red and Black Clay', rainfall: '572 mm', climateZone: 'Northern Dry Zone' },
  { name: 'Mandya', x: 56, y: 84, soil: 'Red Sandy Loam & Clay Loam', rainfall: '702 mm', climateZone: 'Southern Dry Zone' },
  { name: 'Mysuru', x: 48, y: 90, soil: 'Red Loamy & Mixed Clay', rainfall: '785 mm', climateZone: 'Southern Transition Zone' },
  { name: 'Raichur', x: 78, y: 36, soil: 'Black Cotton & Red Sandy Clay', rainfall: '621 mm', climateZone: 'Northern Dry Zone' },
  { name: 'Ramanagara', x: 66, y: 84, soil: 'Red Sandy Loamy', rainfall: '822 mm', climateZone: 'Eastern Dry Zone' },
  { name: 'Shivamogga', x: 34, y: 62, soil: 'Lateritic Red & Clay Loamy', rainfall: '1813 mm', climateZone: 'Hilly Wet Zone' },
  { name: 'Tumakuru', x: 62, y: 72, soil: 'Red Sandy Gravelly Clay', rainfall: '685 mm', climateZone: 'Central Dry Zone' },
  { name: 'Udupi', x: 18, y: 68, soil: 'Laterite & Coastal Sandy', rainfall: '4100 mm', climateZone: 'Coastal Zone' },
  { name: 'Uttara Kannada', x: 20, y: 48, soil: 'Lateritic Loamy & Alluvial', rainfall: '2800 mm', climateZone: 'Coastal/Hilly Zone' },
  { name: 'Vijayapura', x: 48, y: 16, soil: 'Deep Black Cotton', rainfall: '564 mm', climateZone: 'Northern Dry Zone' },
  { name: 'Yadgir', x: 72, y: 28, soil: 'Deep Black & Red Sandy Loam', rainfall: '677 mm', climateZone: 'Northern Dry Zone' }
];

interface TalukInfo {
  name: string;
  x: number; // relative SVG coordinates in district view (0 - 100)
  y: number; // relative SVG coordinates in district view (0 - 100)
  soil: string;
  crops: string[];
  rskAddress: string;
  rskPhone: string;
}

// Hardcoded taluks for primary agricultural districts
const DIST_TALUKS_DATA: Record<string, TalukInfo[]> = {
  'Bagalkot': [
    { name: 'Bagalkot', x: 52, y: 46, soil: 'Black Cotton Soil', crops: ['Cotton', 'Sugarcane', 'Jowar', 'Wheat'], rskAddress: 'Sector-12, Near APMC Yard, Bagalkot - 587101', rskPhone: '08354-220022' },
    { name: 'Badami', x: 32, y: 68, soil: 'Red Sandy Soil', crops: ['Groundnut', 'Jowar', 'Sunflower', 'Maize'], rskAddress: 'Station Road, Near Bus Stand, Badami - 587201', rskPhone: '08357-220143' },
    { name: 'Jamakhandi', x: 28, y: 28, soil: 'Black Clayey Soil', crops: ['Sugarcane', 'Wheat', 'Bengal Gram', 'Jowar'], rskAddress: 'Opp. Government Hospital, Jamakhandi - 587301', rskPhone: '08353-221054' },
    { name: 'Mudhol', x: 20, y: 48, soil: 'Black Cotton Soil', crops: ['Sugarcane', 'Cotton', 'Maize', 'Turmeric'], rskAddress: 'Near Court Circle, Mudhol - 587313', rskPhone: '08350-280324' },
    { name: 'Hunagund', x: 72, y: 58, soil: 'Red Sandy Soil', crops: ['Groundnut', 'Bajra', 'Pomegranate', 'Onion'], rskAddress: 'Agri Extension Office, Main Road, Hunagund - 587118', rskPhone: '08351-260152' },
    { name: 'Bilagi', x: 55, y: 22, soil: 'Mixed Loam Soil', crops: ['Sugarcane', 'Maize', 'Sunflower', 'Groundnut'], rskAddress: 'Opp. Taluk Panchayat, Bilagi - 587116', rskPhone: '08355-230304' }
  ],
  'Mysuru': [
    { name: 'Mysuru', x: 50, y: 50, soil: 'Red Loamy Soil', crops: ['Ragi', 'Paddy', 'Vegetables', 'Flowers'], rskAddress: 'Krishi Bhavan, Near Exhibition Ground, Mysuru - 570001', rskPhone: '0821-2443422' },
    { name: 'Nanjangud', x: 55, y: 72, soil: 'Black Clayey Soil', crops: ['Paddy', 'Sugarcane', 'Banana', 'Cotton'], rskAddress: 'Station Road, Opp. KSRTC Stand, Nanjangud - 571301', rskPhone: '08221-226254' },
    { name: 'Hunsur', x: 30, y: 54, soil: 'Red Sandy Soil', crops: ['Tobacco', 'Ragi', 'Ginger', 'Maize'], rskAddress: 'Hunsur Bypass Road, Near Court Complex, Hunsur - 571105', rskPhone: '08222-252044' },
    { name: 'Periyapatna', x: 18, y: 48, soil: 'Red Sandy Loam', crops: ['Tobacco', 'Maize', 'Coffee', 'Pepper'], rskAddress: 'Main Road, Opp. Taluk Panchayat, Periyapatna - 571107', rskPhone: '08223-273516' },
    { name: 'K.R. Nagar', x: 32, y: 32, soil: 'Alluvial Loam Soil', crops: ['Paddy', 'Sugarcane', 'Tobacco', 'Groundnut'], rskAddress: 'Saligrama Road, K.R. Nagar - 571602', rskPhone: '08223-262304' },
    { name: 'T. Narasipura', x: 75, y: 60, soil: 'Red Loamy Soil', crops: ['Paddy', 'Sugarcane', 'Ragi', 'Banana'], rskAddress: 'T. Narasipura Link Road, Near Fort, T. Narasipura - 571124', rskPhone: '08227-260238' },
    { name: 'H.D. Kote', x: 42, y: 82, soil: 'Forest Clay Soil', crops: ['Cotton', 'Ragi', 'Ginger', 'Pulses'], rskAddress: 'Heggadadevanakote Town, Near Forest Office - 571114', rskPhone: '08228-255316' }
  ],
  'Belagavi': [
    { name: 'Belagavi', x: 38, y: 56, soil: 'Red Loamy Soil', crops: ['Rice', 'Sugarcane', 'Vegetables', 'Groundnut'], rskAddress: 'Club Road, Near District Court, Belagavi - 590001', rskPhone: '0831-2407261' },
    { name: 'Chikkodi', x: 36, y: 18, soil: 'Black Clayey Soil', crops: ['Sugarcane', 'Tobacco', 'Soyabean', 'Maize'], rskAddress: 'Chikkodi Main Road, Near Bus Stand - 591201', rskPhone: '08338-272104' },
    { name: 'Athani', x: 65, y: 14, soil: 'Black Cotton Soil', crops: ['Sugarcane', 'Jowar', 'Wheat', 'Grape'], rskAddress: 'Opp. APMC Yard, Athani - 591304', rskPhone: '08339-251243' },
    { name: 'Gokak', x: 48, y: 34, soil: 'Mixed Black Soil', crops: ['Cotton', 'Maize', 'Sugarcane', 'Sunflower'], rskAddress: 'Falls Road, Opp. Govt. Hospital, Gokak - 591307', rskPhone: '08332-225304' },
    { name: 'Khanapur', x: 22, y: 72, soil: 'Laterite Soil', crops: ['Paddy', 'Sugarcane', 'Sweet Potato', 'Cashew'], rskAddress: 'Khanapur Town, Opp. Railway Station - 591120', rskPhone: '08336-222316' },
    { name: 'Saudatti', x: 55, y: 62, soil: 'Black Cotton Soil', crops: ['Jowar', 'Groundnut', 'Cotton', 'Wheat'], rskAddress: 'Saudatti Fort Road, Near Circle - 591126', rskPhone: '08330-222452' },
    { name: 'Ramdurg', x: 78, y: 46, soil: 'Deep Black Soil', crops: ['Cotton', 'Sunflower', 'Wheat', 'Jowar'], rskAddress: 'Ramdurg Town, Near Court Circle - 591123', rskPhone: '08335-242051' },
    { name: 'Bailhongal', x: 44, y: 48, soil: 'Mixed Black Soil', crops: ['Cotton', 'Groundnut', 'Maize', 'Sorghum'], rskAddress: 'Opp. Central Bus Stand, Bailhongal - 591102', rskPhone: '08335-236204' }
  ],
  'Bengaluru Urban': [
    { name: 'Bengaluru North', x: 50, y: 32, soil: 'Red Sandy Soil', crops: ['Vegetables', 'Flowers', 'Maize', 'Grapes'], rskAddress: 'Yelahanka Satellite Town, Opp. Police Station - 560064', rskPhone: '080-28562226' },
    { name: 'Bengaluru South', x: 50, y: 68, soil: 'Red Loamy Soil', crops: ['Ragi', 'Vegetables', 'Fruits', 'Beans'], rskAddress: 'Banashankari 3rd Stage, Near Water Tank - 560085', rskPhone: '080-26723197' },
    { name: 'Bengaluru East', x: 74, y: 50, soil: 'Red Sandy Soil', crops: ['Flowers', 'Vegetables', 'Ragi', 'Mango'], rskAddress: 'K.R. Puram Old Madras Road, Bengaluru - 560036', rskPhone: '080-25613122' },
    { name: 'Anekal', x: 60, y: 88, soil: 'Red Clayey Soil', crops: ['Ragi', 'Flowers', 'Vegetables', 'Paddy'], rskAddress: 'Anekal Town, Near Mini Vidhana Soudha - 562106', rskPhone: '080-27841238' }
  ]
};

// Connections/paths inside primary districts for premium map aesthetics
const TALUK_CONNECTIONS: Record<string, string[][]> = {
  'Bagalkot': [
    ['Jamakhandi', 'Bilagi'], ['Jamakhandi', 'Mudhol'], ['Mudhol', 'Bilagi'],
    ['Mudhol', 'Bagalkot'], ['Bilagi', 'Bagalkot'], ['Bagalkot', 'Badami'],
    ['Bagalkot', 'Hunagund'], ['Badami', 'Hunagund']
  ],
  'Mysuru': [
    ['K.R. Nagar', 'Periyapatna'], ['K.R. Nagar', 'Hunsur'], ['K.R. Nagar', 'Mysuru'],
    ['Periyapatna', 'Hunsur'], ['Hunsur', 'H.D. Kote'], ['Hunsur', 'Mysuru'],
    ['H.D. Kote', 'Mysuru'], ['H.D. Kote', 'Nanjangud'], ['Mysuru', 'Nanjangud'],
    ['Mysuru', 'T. Narasipura'], ['Nanjangud', 'T. Narasipura']
  ],
  'Belagavi': [
    ['Chikkodi', 'Athani'], ['Chikkodi', 'Gokak'], ['Chikkodi', 'Bailhongal'],
    ['Athani', 'Gokak'], ['Gokak', 'Ramdurg'], ['Gokak', 'Bailhongal'],
    ['Ramdurg', 'Saudatti'], ['Bailhongal', 'Belagavi'], ['Bailhongal', 'Saudatti'],
    ['Belagavi', 'Khanapur'], ['Khanapur', 'Saudatti']
  ],
  'Bengaluru Urban': [
    ['Bengaluru North', 'Bengaluru East'], ['Bengaluru North', 'Bengaluru South'],
    ['Bengaluru East', 'Bengaluru South'], ['Bengaluru South', 'Anekal'],
    ['Bengaluru East', 'Anekal']
  ]
};

interface InteractiveDistrictMapProps {
  selectedDistrictName: string;
  onSelectDistrictName: (name: string) => void;
}

export function InteractiveDistrictMap({
  selectedDistrictName,
  onSelectDistrictName
}: InteractiveDistrictMapProps) {
  const [selectedTalukName, setSelectedTalukName] = useState<string>('');
  const [hoveredTalukName, setHoveredTalukName] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<any[]>([]);

  // Dynamically reset selected Taluk when District changes
  useEffect(() => {
    const taluks = getTalukList(selectedDistrictName);
    if (taluks.length > 0) {
      setSelectedTalukName(taluks[0].name);
    }
  }, [selectedDistrictName]);

  // Load active schemes inside map component to display them in the sidebar
  useEffect(() => {
    const loadSchemes = async () => {
      try {
        const data = await apiGet('/api/schemes');
        setSchemes(data || []);
      } catch (e) {
        console.error('Error loading schemes inside map:', e);
      }
    };
    loadSchemes();
  }, []);

  // Fetch coordinates of selected district for state outline inset map
  const activeDistrictCoords = useMemo(() => {
    return DISTRICT_COORDS.find(d => d.name.toLowerCase() === selectedDistrictName.toLowerCase()) || DISTRICT_COORDS[0];
  }, [selectedDistrictName]);

  // Generate list of taluks for the selected district (combining hardcoded and fallback logic)
  const getTalukList = (districtName: string): TalukInfo[] => {
    const matchedKey = Object.keys(DIST_TALUKS_DATA).find(
      key => key.toLowerCase() === districtName.toLowerCase()
    );
    if (matchedKey && DIST_TALUKS_DATA[matchedKey]) {
      return DIST_TALUKS_DATA[matchedKey];
    }
    // Fallback generator for other districts
    return [
      { name: `${districtName} North`, x: 50, y: 24, soil: 'Red Loamy Soil', crops: ['Ragi', 'Maize', 'Pulses', 'Oilseeds'], rskAddress: `North Taluk Office, ${districtName} - 560001`, rskPhone: '080-22213197' },
      { name: `${districtName} South`, x: 50, y: 76, soil: 'Clay Loam Soil', crops: ['Rice', 'Sugarcane', 'Vegetables', 'Flowers'], rskAddress: `South Taluk Office, ${districtName} - 560002`, rskPhone: '080-22213198' },
      { name: `${districtName} East`, x: 74, y: 50, soil: 'Red Sandy Soil', crops: ['Groundnut', 'Millets', 'Flowers', 'Maize'], rskAddress: `East Taluk Office, ${districtName} - 560003`, rskPhone: '080-22213199' },
      { name: `${districtName} West`, x: 26, y: 50, soil: 'Laterite Soil Mix', crops: ['Fruit Crops', 'Vegetables', 'Spices', 'Cashew'], rskAddress: `West Taluk Office, ${districtName} - 560004`, rskPhone: '080-22213200' },
      { name: `${districtName} Central`, x: 50, y: 50, soil: 'Mixed Loam Soil', crops: ['Cereals', 'Oilseeds', 'Pulses', 'Ginger'], rskAddress: `Central Raitha Samparka Kendra, ${districtName} - 560005`, rskPhone: '080-22213201' }
    ];
  };

  const taluks = useMemo(() => getTalukList(selectedDistrictName), [selectedDistrictName]);

  // Selected taluk object
  const selectedTaluk = useMemo(() => {
    return taluks.find(t => t.name === selectedTalukName) || taluks[0] || null;
  }, [taluks, selectedTalukName]);

  // Connection paths between taluk nodes
  const talukConnections = useMemo(() => {
    const matchedKey = Object.keys(TALUK_CONNECTIONS).find(
      key => key.toLowerCase() === selectedDistrictName.toLowerCase()
    );
    if (matchedKey && TALUK_CONNECTIONS[matchedKey]) {
      return TALUK_CONNECTIONS[matchedKey];
    }
    // Fallback connections for fallbacks
    return [
      [`${selectedDistrictName} Central`, `${selectedDistrictName} North`],
      [`${selectedDistrictName} Central`, `${selectedDistrictName} South`],
      [`${selectedDistrictName} Central`, `${selectedDistrictName} East`],
      [`${selectedDistrictName} Central`, `${selectedDistrictName} West`],
      [`${selectedDistrictName} North`, `${selectedDistrictName} East`],
      [`${selectedDistrictName} South`, `${selectedDistrictName} East`],
      [`${selectedDistrictName} North`, `${selectedDistrictName} West`],
      [`${selectedDistrictName} South`, `${selectedDistrictName} West`]
    ];
  }, [selectedDistrictName]);

  // Active eligible schemes for the currently selected district
  const activeSchemesForSelectedDistrict = useMemo(() => {
    return schemes.filter(scheme => {
      const districtsStr = scheme.active_districts;
      if (!districtsStr) return false;
      if (districtsStr.toLowerCase() === 'all') return true;
      return districtsStr.split(',').map((d: string) => d.trim().toLowerCase()).includes(selectedDistrictName.toLowerCase());
    });
  }, [schemes, selectedDistrictName]);

  return (
    <div className="space-y-6">
      <Card className="card-premium relative overflow-hidden">
        {/* Karnataka Inset Locator Map (Placed at top right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center bg-neutral-900/90 border border-neutral-800 rounded-xl p-2.5 w-24 shadow-2xl backdrop-blur-md">
          <span className="text-[7px] uppercase font-black tracking-widest text-text-muted mb-1 text-center">
            State Map
          </span>
          <svg viewBox="0 0 100 105" className="w-14 h-14 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {/* Outline shape of Karnataka */}
            <polygon
              points="25,28 46,28 48,16 72,6 68,18 72,28 78,36 88,76 80,72 58,94 48,90 32,86 24,78 18,68 20,48 25,28"
              fill="rgba(30, 30, 20, 0.4)"
              stroke="rgba(196, 154, 42, 0.3)"
              strokeWidth="1.5"
            />
            {/* Blinking gold pointer node at current active district coords */}
            <circle
              cx={activeDistrictCoords.x}
              cy={activeDistrictCoords.y}
              r="4.5"
              className="fill-gold-primary/20 animate-ping"
            />
            <circle
              cx={activeDistrictCoords.x}
              cy={activeDistrictCoords.y}
              r="2.8"
              className="fill-gold-primary stroke-white stroke-[0.5]"
            />
          </svg>
          <span className="text-[8px] font-black text-gold-primary uppercase tracking-tight truncate w-full text-center mt-1">
            {selectedDistrictName}
          </span>
        </div>

        <CardContent className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/40">
            <div>
              <h3 className="text-lg font-black text-gold-100 uppercase tracking-wider flex items-center gap-2">
                <Compass className="h-5 w-5 text-gold-primary animate-spin-slow" />
                Interactive District Taluk Map
              </h3>
              <p className="text-xs text-text-muted mt-1 max-w-[calc(100%-110px)]">
                Viewing sub-regions of **{selectedDistrictName}**. Click taluks to see specific local soils, recommended crops, and Raitha Samparka Kendras.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 items-start">
            {/* Map Canvas Column */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center bg-neutral-950/40 rounded-2xl border border-border/20 p-4 min-h-[500px] relative overflow-hidden">
              <div className="absolute top-4 left-4 bg-earth-card/85 backdrop-blur-md rounded-xl p-3 border border-border/40 text-[10px] text-text-secondary z-10 space-y-2">
                <div className="font-black uppercase tracking-wider text-gold-primary">Taluk Map Legend</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gold-primary rounded-full ring-2 ring-gold-primary/30"></div>
                  <span>Selected Taluk ({selectedTalukName})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neutral-800 rounded-full border border-neutral-700"></div>
                  <span>Other Taluk Node</span>
                </div>
              </div>

              {/* District SVG */}
              <svg
                viewBox="0 0 100 100"
                className="w-full max-w-[420px] h-auto filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
              >
                {/* Network Roads / Connections between taluks */}
                <g opacity="0.18">
                  {talukConnections.map(([from, to], idx) => {
                    const fromNode = taluks.find(t => t.name === from);
                    const toNode = taluks.find(t => t.name === to);
                    if (!fromNode || !toNode) return null;
                    return (
                      <line
                        key={idx}
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke="var(--accent)"
                        strokeWidth="0.5"
                        strokeDasharray="1.5 1.5"
                      />
                    );
                  })}
                </g>

                {/* Stylized bounding circle mapping the district limits */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="rgba(24, 24, 16, 0.08)"
                  stroke="rgba(196, 154, 42, 0.08)"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />

                {/* Taluk Nodes */}
                {taluks.map((taluk) => {
                  const isSelected = selectedTalukName === taluk.name;
                  const isHovered = hoveredTalukName === taluk.name;

                  let nodeColor = 'fill-neutral-900 stroke-neutral-700';
                  let nodeRadius = 2.4;

                  if (isSelected) {
                    nodeColor = 'fill-gold-primary stroke-white';
                    nodeRadius = 3.4;
                  } else if (isHovered) {
                    nodeColor = 'fill-gold-hover stroke-gold-primary';
                    nodeRadius = 3.0;
                  }

                  return (
                    <g
                      key={taluk.name}
                      onClick={() => setSelectedTalukName(taluk.name)}
                      onMouseEnter={() => setHoveredTalukName(taluk.name)}
                      onMouseLeave={() => setHoveredTalukName(null)}
                      className="cursor-pointer group select-none"
                    >
                      {/* Pulse ring for selected Taluk */}
                      {isSelected && (
                        <circle
                          cx={taluk.x}
                          cy={taluk.y}
                          r={nodeRadius * 2.0}
                          className="fill-gold-primary/10 animate-ping"
                          style={{ animationDuration: '2.5s' }}
                        />
                      )}

                      {/* Node Circle */}
                      <circle
                        cx={taluk.x}
                        cy={taluk.y}
                        r={nodeRadius}
                        className={`${nodeColor} stroke-[0.4] transition-all duration-300`}
                      />

                      {/* Taluk text label */}
                      <text
                        x={taluk.x}
                        y={taluk.y - (nodeRadius + 1.8)}
                        textAnchor="middle"
                        className={`text-[3.2px] font-black uppercase tracking-widest ${
                          isSelected ? 'fill-white font-bold font-serif' : 'fill-gold-primary/80'
                        } select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}
                      >
                        {taluk.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="w-full text-center text-[10px] text-text-muted mt-4 bg-earth-card/40 p-2 rounded-xl border border-border/20">
                👆 Click any taluk node on the map to switch local agricultural context.
              </div>
            </div>

            {/* Sidebar Taluk Detailed Info Column */}
            <div className="space-y-6 w-full">
              {selectedTaluk ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTaluk.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {/* Taluk Summary & Crops */}
                    <Card className="card-premium border-l-4 border-l-gold-primary bg-earth-card/60 backdrop-blur-md">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-black text-gold-100 uppercase tracking-tight flex items-center gap-2">
                          <Target className="h-5.5 w-5.5 text-gold-primary shrink-0 animate-pulse" />
                          {selectedTaluk.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-text-secondary uppercase font-bold tracking-wider">
                          Sub-Region Soil & Crop Suitability
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0 text-xs">
                        {/* Soil */}
                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-900/50 border border-border/10">
                          <Leaf className="h-4.5 w-4.5 text-gold-primary shrink-0 mt-0.5" />
                          <div>
                            <div className="font-black text-[10px] uppercase text-text-muted">Local Soil type</div>
                            <div className="text-text-primary mt-0.5 font-medium">{selectedTaluk.soil}</div>
                          </div>
                        </div>

                        {/* Crops List */}
                        <div className="space-y-1.5 pt-1">
                          <div className="font-black text-[10px] uppercase text-text-muted mb-1.5">Recommended Crops</div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedTaluk.crops.map((c) => (
                              <Badge
                                key={c}
                                className="bg-gold-primary/10 text-gold-primary border border-gold-primary/20 text-[9px] font-black uppercase"
                              >
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Local Office (Raitha Samparka Kendra) */}
                    <Card className="card-premium border-l-4 border-l-emerald-500 bg-earth-card/60 backdrop-blur-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                          <Landmark className="h-4 w-4" /> Taluk Helper Office
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0 text-xs">
                        <div>
                          <div className="font-black text-[10px] uppercase text-text-muted">Office Center</div>
                          <div className="text-text-primary font-bold mt-1">{selectedTaluk.name} RSK</div>
                        </div>

                        <div>
                          <div className="font-black text-[10px] uppercase text-text-muted">Address</div>
                          <div className="text-text-secondary mt-1 leading-relaxed font-medium">{selectedTaluk.rskAddress}</div>
                        </div>

                        <div className="pt-2">
                          <div className="font-black text-[10px] uppercase text-text-muted mb-2">Taluk Helpline</div>
                          <a
                            href={`tel:${selectedTaluk.rskPhone}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-500/20 transition-all duration-200"
                          >
                            <Phone className="h-3.5 w-3.5" /> Call: {selectedTaluk.rskPhone}
                          </a>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Active Schemes In District */}
                    <Card className="card-premium border-l-4 border-l-sky-500 bg-earth-card/60 backdrop-blur-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                          <HelpCircle className="h-4 w-4" /> Active Schemes in District
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                        {activeSchemesForSelectedDistrict.length > 0 ? (
                          activeSchemesForSelectedDistrict.map((scheme) => (
                            <div
                              key={scheme.id}
                              className="flex items-center justify-between p-2 rounded-xl border border-border/10 bg-neutral-900/40 text-[10px] text-text-secondary"
                            >
                              <span className="truncate pr-2">{scheme.name}</span>
                              <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[8px] font-black uppercase shrink-0">
                                {scheme.category}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <div className="text-[11px] text-text-muted text-center py-2">
                            No schemes active for this district.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="text-center py-8 text-text-muted">
                  Loading taluk information...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
