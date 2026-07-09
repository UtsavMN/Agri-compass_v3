/**
 * Interactive District Map using Leaflet
 * Click districts to see agricultural data
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Leaf, Droplets } from 'lucide-react';

// Leaflet types (install with: npm install leaflet react-leaflet)
// For now, using dynamic import to avoid SSR issues

interface DistrictMapData {
  name: string;
  coordinates: [number, number]; // [latitude, longitude]
  crops: string[];
  rainfall: string;
  soilType: string;
}

const karnatakaDistricts: DistrictMapData[] = [
  { name: 'Bengaluru Urban', coordinates: [12.9716, 77.5946], crops: ['Ragi', 'Vegetables', 'Flowers'], rainfall: '800mm', soilType: 'Red sandy' },
  { name: 'Mysuru', coordinates: [12.2958, 76.6394], crops: ['Rice', 'Sugarcane', 'Coconut'], rainfall: '850mm', soilType: 'Red loam' },
  { name: 'Belagavi', coordinates: [15.8497, 74.4977], crops: ['Sugarcane', 'Cotton', 'Soybean'], rainfall: '750mm', soilType: 'Black' },
  { name: 'Dharwad', coordinates: [15.4589, 75.0078], crops: ['Cotton', 'Maize', 'Groundnut'], rainfall: '700mm', soilType: 'Black' },
  { name: 'Mangaluru', coordinates: [12.9141, 74.8560], crops: ['Coconut', 'Arecanut', 'Rubber'], rainfall: '3500mm', soilType: 'Laterite' },
  { name: 'Hubballi', coordinates: [15.3647, 75.1240], crops: ['Cotton', 'Jowar', 'Groundnut'], rainfall: '650mm', soilType: 'Black' },
  { name: 'Kalaburagi', coordinates: [17.3297, 76.8343], crops: ['Sorghum', 'Groundnut', 'Sunflower'], rainfall: '700mm', soilType: 'Black' },
  { name: 'Shivamogga', coordinates: [13.9299, 75.5681], crops: ['Rice', 'Coffee', 'Pepper'], rainfall: '1800mm', soilType: 'Laterite' },
];

/**
 * Lightweight Map Component (No Leaflet - Pure CSS/SVG)
 * For production, replace with actual Leaflet integration
 */
export function LightweightDistrictMap() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictMapData | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-leaf-600" />
          Karnataka Districts Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-leaf-50 to-blue-50 rounded-xl p-8 border-2 border-leaf-200 min-h-[400px] flex items-center justify-center">
              {/* Simple grid map representation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full max-w-md">
                {karnatakaDistricts.slice(0, 9).map((district) => (
                  <button
                    key={district.name}
                    onClick={() => setSelectedDistrict(district)}
                    onMouseEnter={() => setHoveredDistrict(district.name)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    className={`
                      p-4 rounded-lg text-xs font-semibold transition-all duration-200
                      ${selectedDistrict?.name === district.name 
                        ? 'bg-leaf-600 text-white shadow-lg scale-105' 
                        : hoveredDistrict === district.name
                        ? 'bg-leaf-100 text-leaf-900 shadow-md'
                        : 'bg-white text-slate-700 hover:bg-leaf-50'
                      }
                    `}
                  >
                    <MapPin className="h-4 w-4 mx-auto mb-1" />
                    {district.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
                <p className="font-semibold mb-2">Click districts to view data</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-leaf-600 rounded"></div>
                  <span>Selected</span>
                </div>
              </div>
            </div>
          </div>

          {/* District Info Panel */}
          <div className="space-y-4">
            {selectedDistrict ? (
              <>
                <div className="bg-gradient-to-br from-leaf-500 to-leaf-600 text-white rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-2">{selectedDistrict.name}</h3>
                  <p className="text-leaf-100 text-sm">
                    {selectedDistrict.coordinates[0].toFixed(4)}°N, {selectedDistrict.coordinates[1].toFixed(4)}°E
                  </p>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="h-4 w-4 text-leaf-600" />
                        <span className="text-sm font-semibold">Recommended Crops</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedDistrict.crops.map((crop, i) => (
                          <Badge key={i} variant="secondary">{crop}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold">Rainfall</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{selectedDistrict.rainfall}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-1">Soil Type</p>
                      <Badge variant="outline">{selectedDistrict.soilType}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="bg-slate-50 rounded-xl p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                <p className="text-slate-600">Click a district to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Full Leaflet Map Component (Install: npm install leaflet react-leaflet)
 * Uncomment when ready to use
 */
/*
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

export function LeafletDistrictMap() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictMapData | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Karnataka Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] rounded-xl overflow-hidden">
          <MapContainer
            center={[15.3173, 75.7139]} // Center of Karnataka
            zoom={7}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {karnatakaDistricts.map((district) => (
              <Marker
                key={district.name}
                position={district.coordinates}
                eventHandlers={{
                  click: () => setSelectedDistrict(district),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold mb-2">{district.name}</h3>
                    <p className="text-sm mb-1"><strong>Crops:</strong> {district.crops.join(', ')}</p>
                    <p className="text-sm mb-1"><strong>Rainfall:</strong> {district.rainfall}</p>
                    <p className="text-sm"><strong>Soil:</strong> {district.soilType}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
*/
