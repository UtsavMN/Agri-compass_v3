import { motion } from 'framer-motion';

interface LoadingShimmerProps {
  className?: string;
  height?: string;
  width?: string;
}

/**
 * Base Shimmer component with premium dark-gold theme pulses
 */
export function LoadingShimmer({ className = '', height = 'h-4', width = 'w-full' }: LoadingShimmerProps) {
  return (
    <div className={`${width} ${height} ${className} bg-earth-elevated/70 rounded-xl overflow-hidden relative`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}

interface CardShimmerProps {
  className?: string;
}

/**
 * Standard Card Shimmer for listings and content grid elements
 */
export function CardShimmer({ className = '' }: CardShimmerProps) {
  return (
    <div className={`bg-earth-card rounded-2xl border border-earth-border p-6 space-y-4 shadow-premium ${className}`}>
      <LoadingShimmer height="h-6" width="w-3/4" />
      <div className="space-y-2">
        <LoadingShimmer height="h-4" width="w-full" />
        <LoadingShimmer height="h-4" width="w-5/6" />
      </div>
      <div className="flex gap-3 pt-2">
        <LoadingShimmer height="h-8" width="w-20" className="rounded-lg" />
        <LoadingShimmer height="h-8" width="w-16" className="rounded-lg" />
      </div>
    </div>
  );
}

interface CropCardShimmerProps {
  count?: number;
}

/**
 * Grid layout matching the main crop lists
 */
export function CropCardShimmer({ count = 3 }: CropCardShimmerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardShimmer key={index} className="animate-pulse" />
      ))}
    </div>
  );
}

/**
 * Table Shimmer matching the Mandi arrivals and pricing table
 */
export function TableShimmer({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-earth-border bg-earth-card p-4 space-y-4">
      {/* Table Headers */}
      <div className="flex justify-between items-center pb-3 border-b border-earth-border">
        <LoadingShimmer height="h-5" width="w-1/4" />
        <LoadingShimmer height="h-5" width="w-1/6" />
        <LoadingShimmer height="h-5" width="w-1/6" />
        <LoadingShimmer height="h-5" width="w-1/6" />
      </div>
      {/* Table Rows */}
      <div className="space-y-4 pt-1">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex justify-between items-center py-1">
            <LoadingShimmer height="h-4" width="w-1/3" />
            <LoadingShimmer height="h-4" width="w-1/5" />
            <LoadingShimmer height="h-4" width="w-1/5" />
            <LoadingShimmer height="h-4" width="w-1/6" className="ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Detailed Shimmer replicating the exact double-column layout of the CropDetails screen
 */
export function CropDetailsShimmer() {
  return (
    <div className="space-y-8 pb-12">
      {/* Top action header */}
      <div className="flex justify-between items-center">
        <LoadingShimmer height="h-10" width="w-32" className="rounded-xl" />
        <LoadingShimmer height="h-10" width="w-48" className="rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left main content block */}
        <div className="lg:col-span-3 space-y-8">
          {/* Main Hero block */}
          <div className="rounded-3xl border border-earth-border bg-earth-card h-[450px] p-10 flex flex-col justify-end space-y-6 relative overflow-hidden">
            <div className="flex gap-2">
              <LoadingShimmer height="h-6" width="w-24" className="rounded-full" />
              <LoadingShimmer height="h-6" width="w-28" className="rounded-full" />
            </div>
            <LoadingShimmer height="h-16" width="w-1/2" className="rounded-xl" />
            <LoadingShimmer height="h-5" width="w-1/3" />
          </div>

          {/* Additional details tabs */}
          <div className="bg-earth-card border border-earth-border rounded-3xl p-8 space-y-6">
            <div className="flex gap-4 border-b border-earth-border pb-4">
              <LoadingShimmer height="h-8" width="w-24" className="rounded-lg" />
              <LoadingShimmer height="h-8" width="w-24" className="rounded-lg" />
              <LoadingShimmer height="h-8" width="w-24" className="rounded-lg" />
            </div>
            <div className="space-y-3">
              <LoadingShimmer height="h-4" width="w-full" />
              <LoadingShimmer height="h-4" width="w-11/12" />
              <LoadingShimmer height="h-4" width="w-4/5" />
            </div>
          </div>
        </div>

        {/* Right side status column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-earth-card border border-earth-border rounded-3xl p-6 h-[200px] flex flex-col justify-between">
            <LoadingShimmer height="h-6" width="w-2/3" />
            <div className="space-y-2">
              <LoadingShimmer height="h-8" width="w-1/3" />
              <LoadingShimmer height="h-3" width="w-full" className="rounded-full" />
            </div>
          </div>
          
          <div className="bg-earth-card border border-earth-border rounded-3xl p-6 h-[220px] flex flex-col justify-between">
            <LoadingShimmer height="h-6" width="w-1/2" />
            <div className="space-y-3">
              <LoadingShimmer height="h-4" width="w-full" />
              <LoadingShimmer height="h-4" width="w-5/6" />
              <LoadingShimmer height="h-4" width="w-4/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
