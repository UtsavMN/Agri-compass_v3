/**
 * Loading Components & Skeletons for Farmer's Platform
 * Professional loading states and skeleton screens
 */

import { motion } from 'framer-motion';
import { Loader2, Sprout } from 'lucide-react';

// ============================================
// SKELETON LOADERS
// ============================================

/**
 * Shimmer Effect - CSS shimmer animation
 */
const shimmerVariants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  },
};

/**
 * Base Skeleton - Reusable skeleton component
 */
export function Skeleton({ 
  className = '',
  variant = 'pulse'
}: { 
  className?: string;
  variant?: 'pulse' | 'shimmer';
}) {
  if (variant === 'shimmer') {
    return (
      <motion.div
        className={`bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] rounded ${className}`}
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      />
    );
  }

  return (
    <div className={`bg-slate-100 animate-pulse rounded ${className}`} />
  );
}

/**
 * Card Skeleton - Loading skeleton for cards
 * @example
 * {loading ? <CardSkeleton /> : <Card>...</Card>}
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-xl p-6 space-y-4 bg-white">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" variant="shimmer" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" variant="shimmer" />
              <Skeleton className="h-3 w-1/2" variant="shimmer" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" variant="shimmer" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" variant="shimmer" />
            <Skeleton className="h-3 w-5/6" variant="shimmer" />
            <Skeleton className="h-3 w-4/6" variant="shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Crop Card Skeleton - Loading skeleton for crop cards
 */
export function CropCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-xl overflow-hidden bg-white">
          <Skeleton className="h-48 w-full" variant="shimmer" />
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" variant="shimmer" />
              <Skeleton className="h-6 w-32" variant="shimmer" />
            </div>
            <Skeleton className="h-4 w-24" variant="shimmer" />
            <Skeleton className="h-10 w-full rounded-lg" variant="shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-16 w-16 rounded-lg" variant="shimmer" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" variant="shimmer" />
            <Skeleton className="h-3 w-1/2" variant="shimmer" />
          </div>
          <Skeleton className="h-8 w-20 rounded" variant="shimmer" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-8" variant="shimmer" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12" variant="shimmer" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// LOADING SPINNERS
// ============================================

/**
 * Spinner - Basic loading spinner
 */
export function Spinner({ 
  size = 'md',
  className = ''
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={`${sizes[size]} animate-spin text-leaf-600 ${className}`} />
  );
}

/**
 * Themed Spinner - Agricultural themed spinner with sprout icon
 */
export function ThemedSpinner({ 
  size = 'md',
  className = ''
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <motion.div
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`${sizes[size]} mx-auto flex items-center justify-center`}
    >
      <Sprout className={`${sizes[size]} text-leaf-600 ${className}`} />
    </motion.div>
  );
}

/**
 * Dots Loader - Three dots animation
 */
export function DotsLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 bg-leaf-600 rounded-full"
          animate={{
            y: [-5, 0, -5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Loading Overlay - Full screen loading overlay
 */
export function LoadingOverlay({ 
  message = 'Loading...',
  transparent = false
}: { 
  message?: string;
  transparent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        transparent ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'
      }`}
    >
      <div className="text-center">
        <ThemedSpinner size="lg" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-slate-600 font-medium"
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
}

/**
 * Inline Loader - Small inline loading state
 */
export function InlineLoader({ 
  message = 'Loading',
  className = ''
}: { 
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Spinner size="sm" />
      <span className="text-sm text-slate-600">{message}</span>
      <DotsLoader />
    </div>
  );
}

// ============================================
// PROGRESS INDICATORS
// ============================================

/**
 * Linear Progress - Material Design style progress bar
 */
export function LinearProgress({ 
  indeterminate = false,
  value = 0,
  className = ''
}: { 
  indeterminate?: boolean;
  value?: number;
  className?: string;
}) {
  if (indeterminate) {
    return (
      <div className={`h-1 w-full bg-slate-100 overflow-hidden rounded-full ${className}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-leaf-500 to-leaf-600 w-1/3"
          animate={{
            x: ['-100%', '400%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    );
  }

  return (
    <div className={`h-1 w-full bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-leaf-500 to-leaf-600"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

/**
 * Step Progress - Multi-step progress indicator
 */
export function StepProgress({ 
  steps,
  currentStep,
  className = ''
}: { 
  steps: string[];
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <motion.div
              className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                index < currentStep
                  ? 'bg-leaf-600 text-white'
                  : index === currentStep
                  ? 'bg-leaf-100 text-leaf-700 ring-2 ring-leaf-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: index === currentStep ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {index < currentStep ? '✓' : index + 1}
            </motion.div>
            <span className="mt-2 text-xs text-center font-medium text-slate-600">
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 bg-slate-200 mx-4">
              <motion.div
                className="h-full bg-leaf-600"
                initial={{ width: 0 }}
                animate={{ width: index < currentStep ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Pulse Loader - Pulsing circles
 */
export function PulseLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-3 w-3 bg-leaf-600 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Circular Loading - Spinning circle
 */
export function CircularLoading({ 
  size = 40,
  strokeWidth = 4,
  className = ''
}: { 
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={(size - strokeWidth) / 2}
        fill="none"
        stroke="#16a34a"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${((size - strokeWidth) / 2) * Math.PI * 1.5} ${
          ((size - strokeWidth) / 2) * Math.PI * 0.5
        }`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  );
}
