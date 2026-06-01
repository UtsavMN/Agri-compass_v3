// src/components/dashboard/KarnatakaMap.tsx
// Renders ONLY the selected district as a transparent, glowing silhouette
// that blends seamlessly into whichever background it sits on.
import { useMemo } from 'react';
import { DISTRICT_CROP_DATA } from '@/data/masterData';
import { DISTRICT_PATHS } from '@/data/districtPaths';
import { useDistrict } from '@/store';

/** Parse a polygon points string into [{x, y}] */
const parsePoints = (pointsStr: string) =>
  pointsStr
    .trim()
    .split(' ')
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number);
      return { x, y };
    })
    .filter((p) => !isNaN(p.x) && !isNaN(p.y));

/** Axis-aligned bounding box with padding */
const getBBox = (pts: { x: number; y: number }[], pad = 20) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
};

/** Centroid for label placement */
const getCentroid = (pts: { x: number; y: number }[]) => {
  let sx = 0, sy = 0;
  for (const p of pts) { sx += p.x; sy += p.y; }
  return { x: sx / pts.length, y: sy / pts.length };
};

export const KarnatakaMap = () => {
  const { selectedDistrict } = useDistrict();
  const name = selectedDistrict || 'Bagalkot';
  const pointsStr = DISTRICT_PATHS[name];
  const data = DISTRICT_CROP_DATA[name];
  const color = data?.color || '#8B7355';

  const { viewBox, centroid } = useMemo(() => {
    if (!pointsStr) return { viewBox: '0 0 500 600', centroid: { x: 250, y: 300 } };
    const pts = parsePoints(pointsStr);
    if (pts.length === 0) return { viewBox: '0 0 500 600', centroid: { x: 250, y: 300 } };
    const bb = getBBox(pts, 24);
    return { viewBox: `${bb.x} ${bb.y} ${bb.w} ${bb.h}`, centroid: getCentroid(pts) };
  }, [pointsStr]);

  if (!pointsStr) return null;

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={viewBox}
        className="w-full h-auto"
        style={{ maxHeight: '400px', display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Outer ambient glow */}
          <filter id="map-glow-outer" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur1" />
            <feFlood floodColor="#c49a2a" floodOpacity="0.18" />
            <feComposite in2="blur1" operator="in" result="glow1" />
            <feMerge>
              <feMergeNode in="glow1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Inner edge highlight */}
          <filter id="map-glow-edge" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur2" />
            <feFlood floodColor={color} floodOpacity="0.35" />
            <feComposite in2="blur2" operator="in" result="glow2" />
            <feMerge>
              <feMergeNode in="glow2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient fill for the shape */}
          <linearGradient id="shape-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="50%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>

          {/* Animated pulse ring */}
          <radialGradient id="pulse-ring" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c49a2a" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#c49a2a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ghost shadow layer — offset behind the shape for depth */}
        <polygon
          points={pointsStr}
          fill="rgba(0,0,0,0.2)"
          stroke="none"
          transform="translate(2, 3)"
        />

        {/* Main district shape — transparent gradient fill with hardware-accelerated glow */}
        <polygon
          points={pointsStr}
          fill="url(#shape-fill)"
          stroke="rgba(196,154,42,0.5)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_15px_rgba(196,154,42,0.25)]"
          style={{ transition: 'fill 0.6s ease, stroke 0.6s ease' }}
        />

        {/* Bright inner stroke for definition */}
        <polygon
          points={pointsStr}
          fill="none"
          stroke="rgba(196,154,42,0.15)"
          strokeWidth="0.5"
          strokeLinejoin="round"
          strokeDasharray="4 3"
        />


      </svg>

      {/* District name — below the shape, blended into background */}
      <p className="text-center mt-3 text-[13px] font-serif font-bold tracking-[0.25em] uppercase text-[#c49a2a]/40 select-none">
        {name}
      </p>
    </div>
  );
};

