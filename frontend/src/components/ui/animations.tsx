/**
 * Animation Components for Farmer's Platform
 * Reusable animation components using Framer Motion
 */

import { motion, useInView, Variants, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useEffect, useRef, useState } from 'react';

// ============================================
// 1. ENTRY & SCROLL ANIMATIONS
// ============================================

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

/**
 * Scroll Reveal - Reveals content when it enters viewport
 * @example
 * <ScrollReveal direction="up" delay={0.2}>
 *   <Card>...</Card>
 * </ScrollReveal>
 */
export function ScrollReveal({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = ''
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0 
      } : {}}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger Container - Animates children with stagger effect
 * @example
 * <StaggerContainer>
 *   {items.map(item => <StaggerItem key={item.id}>{item}</StaggerItem>)}
 * </StaggerContainer>
 */
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  className = ''
}: StaggerContainerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={itemVariants} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </motion.div>
  );
}

/**
 * Fade In - Simple fade in animation
 */
export function FadeIn({ 
  children, 
  delay = 0,
  duration = 0.5,
  className = ''
}: { 
  children: ReactNode; 
  delay?: number; 
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
      style={{ willChange: 'opacity' }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 2. HOVER & CLICK INTERACTIONS
// ============================================

/**
 * Interactive Card - Card with hover and tap animations
 * @example
 * <InteractiveCard onClick={handleClick}>
 *   <CardContent>...</CardContent>
 * </InteractiveCard>
 */
interface InteractiveCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverScale?: number;
  hoverLift?: boolean;
}

export function InteractiveCard({ 
  children, 
  onClick, 
  className = '',
  hoverScale = 1.02,
  hoverLift = true
}: InteractiveCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ 
        scale: hoverScale,
        y: hoverLift ? -4 : 0,
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Bounce Button - Button with bounce animation on hover
 */
export function BounceButton({ 
  children, 
  onClick,
  className = ''
}: { 
  children: ReactNode; 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/**
 * Icon Spin - Spinning icon on hover
 */
export function SpinIcon({ 
  children,
  className = ''
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pulse Notification - Pulsing notification indicator
 */
export function PulseNotification({ 
  children,
  className = ''
}: { 
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative">
      {children}
      <motion.span
        className={`absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full ${className}`}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
}

// ============================================
// 3. PAGE TRANSITIONS
// ============================================

/**
 * Page Transition - Smooth page transition wrapper
 * @example
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 */
export function PageTransition({ 
  children,
  className = ''
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide In - Slide in from direction
 */
export function SlideIn({ 
  children,
  direction = 'right',
  className = ''
}: { 
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}) {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    up: { y: -100 },
    down: { y: 100 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...directions[direction] }}
      transition={{ duration: 0.3 }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale Modal - Modal with scale animation
 */
export function ScaleModal({ 
  children,
  isOpen,
  className = ''
}: { 
  children: ReactNode;
  isOpen: boolean;
  className?: string;
}) {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${className}`}
      >
        {children}
      </motion.div>
    </>
  );
}

// ============================================
// 4. COUNT UP ANIMATION
// ============================================




/**
 * Count Up - Animated number counter
 * @example
 * <CountUp end={1234} duration={2000} />
 */
export function CountUp({ 
  end, 
  duration = 2000,
  prefix = '',
  suffix = '',
  className = ''
}: { 
  end: number; 
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const rate = Math.min(progress / duration, 1);
      
      setCount(Math.floor(rate * end));

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ============================================
// 5. PROGRESS INDICATORS
// ============================================

/**
 * Progress Bar - Animated progress bar
 * @example
 * <ProgressBar progress={75} />
 */
export function ProgressBar({ 
  progress,
  className = '',
  showLabel = true
}: { 
  progress: number;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-leaf-500 to-leaf-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <motion.p
          className="text-xs text-slate-600 mt-1 text-right"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {progress}%
        </motion.p>
      )}
    </div>
  );
}

/**
 * Circular Progress - Animated circular progress indicator
 */
export function CircularProgress({ 
  progress,
  size = 120,
  strokeWidth = 8,
  className = ''
}: { 
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#16a34a"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-leaf-700">{progress}%</span>
      </div>
    </div>
  );
}

// ============================================
// 6. 3D MOTION & PARALLAX COMPONENTS
// ============================================

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * TiltCard - 3D card tilt hover effect
 */
export function TiltCard({ children, className = '', onClick }: TiltCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map mouse positions to rotation degrees
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { damping: 25, stiffness: 200 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { damping: 25, stiffness: 200 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate relative cursor position from center (-0.5 to 0.5)
    const mouseX = (event.clientX - rect.left) / width - 0.5;
    const mouseY = (event.clientY - rect.top) / height - 0.5;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        willChange: 'transform'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

