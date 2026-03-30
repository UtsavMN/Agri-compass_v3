/**
 * Chart Components for Farmer's Platform
 * Reusable, animated charts using Recharts
 * Optimized for crop prices and weather data
 */

import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Color palette
const COLORS = {
  primary: '#16a34a',
  secondary: '#22c55e',
  accent: '#0ea5e9',
  warning: '#eab308',
  danger: '#ef4444',
  success: '#10b981',
  gray: '#64748b',
};

const CHART_COLORS = [
  '#16a34a', // leaf-600
  '#22c55e', // leaf-500
  '#0ea5e9', // sky-500
  '#22c55e', // earth-500
  '#f97316', // orange-500
  '#8b5cf6', // purple-500
];

// ============================================
// CUSTOM TOOLTIP COMPONENTS
// ============================================

interface CustomTooltipProps {
  active?: boolean;
  // Generic payload entries from Recharts - keep as unknown and narrow below
  payload?: Record<string, unknown>[];
  label?: string;
  currency?: string;
  unit?: string;
}

function CustomTooltip({ active, payload, label, currency, unit }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index: number) => {
          const ev = entry as Record<string, unknown>;
          const color = String(ev['color'] ?? '');
          const name = String(ev['name'] ?? '');
          const value = ev['value'] ?? '';
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-slate-600">{name}:</span>
              <span className="font-semibold text-slate-900">
                {currency && currency}
                {String(value)}
                {unit && unit}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

// ============================================
// CROP PRICE CHARTS
// ============================================

interface PriceData {
  date: string;
  price: number;
  trend?: 'up' | 'down' | 'stable';
}

interface CropPriceTrendProps {
  data: PriceData[];
  title?: string;
  height?: number;
  showTrend?: boolean;
  currency?: string;
}

/**
 * Crop Price Trend Chart - Line chart with gradient
 */
export function CropPriceTrend({ 
  data, 
  title = 'Price Trend',
  height = 200,
  showTrend = true,
  currency = '₹'
}: CropPriceTrendProps) {
  // Calculate trend
  const trend = data.length >= 2 
    ? data[data.length - 1].price > data[0].price 
      ? 'up' 
      : data[data.length - 1].price < data[0].price 
        ? 'down' 
        : 'stable'
    : 'stable';

  const percentChange = data.length >= 2
    ? ((data[data.length - 1].price - data[0].price) / data[0].price * 100).toFixed(1)
    : '0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {showTrend && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-slate-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
             trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
             <Minus className="h-4 w-4" />}
            {Math.abs(Number(percentChange))}%
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => `${currency}${value}`}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={COLORS.primary}
            strokeWidth={2}
            fill="url(#priceFill)"
            animationDuration={1000}
            animationBegin={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/**
 * Price Comparison Chart - Multiple crops comparison
 */
interface PriceComparisonData {
  crop: string;
  price: number;
  change?: number;
}

export function PriceComparisonChart({ 
  data,
  height = 250,
  currency = '₹'
}: { 
  data: PriceComparisonData[];
  height?: number;
  currency?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="crop" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => `${currency}${value}`}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Bar 
            dataKey="price" 
            fill={COLORS.primary}
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
            animationBegin={100}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// ============================================
// WEATHER CHARTS
// ============================================

interface WeatherData {
  day: string;
  temp: number;
  rainfall?: number;
  humidity?: number;
}

/**
 * Temperature Trend Chart
 */
export function TemperatureTrend({ 
  data,
  height = 200
}: { 
  data: WeatherData[];
  height?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => `${value}°C`}
          />
          <Tooltip content={<CustomTooltip unit="°C" />} />
          <Line 
            type="monotone" 
            dataKey="temp" 
            stroke={COLORS.accent}
            strokeWidth={3}
            dot={{ fill: COLORS.accent, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/**
 * Rainfall Chart - Bar chart
 */
export function RainfallChart({ 
  data,
  height = 200
}: { 
  data: WeatherData[];
  height?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => `${value}mm`}
          />
          <Tooltip content={<CustomTooltip unit="mm" />} />
          <Bar 
            dataKey="rainfall" 
            fill={COLORS.accent}
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

/**
 * Combined Weather Chart - Temperature and Rainfall
 */
export function CombinedWeatherChart({ 
  data,
  height = 250
}: { 
  data: WeatherData[];
  height?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => `${value}°C`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => `${value}mm`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="temp" 
            stroke={COLORS.danger}
            strokeWidth={2}
            name="Temperature"
            dot={{ fill: COLORS.danger, r: 3 }}
            animationDuration={1000}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="rainfall" 
            stroke={COLORS.accent}
            strokeWidth={2}
            name="Rainfall"
            dot={{ fill: COLORS.accent, r: 3 }}
            animationDuration={1000}
            animationBegin={200}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// ============================================
// MARKET DISTRIBUTION CHARTS
// ============================================

interface MarketData {
  [key: string]: unknown;
  name: string;
  value: number;
}

/**
 * Market Share Pie Chart
 */
export function MarketShareChart({ 
  data,
  height = 250
}: { 
  data: MarketData[];
  height?: number;
}) {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, rotate: -10 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.6 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1000}
            animationBegin={0}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// ============================================
// MINI CHARTS (for cards)
// ============================================

/**
 * Mini Sparkline - Tiny trend indicator
 */
export function MiniSparkline({ 
  data,
  color = COLORS.primary,
  height = 40
}: { 
  data: number[];
  color?: string;
  height?: number;
}) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`miniGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color}
          strokeWidth={2}
          fill={`url(#miniGradient-${color})`}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Mini Bar Chart - Quick comparison
 */
export function MiniBarChart({ 
  data,
  height = 60
}: { 
  data: { label: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Bar 
          dataKey="value" 
          fill={COLORS.primary}
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
