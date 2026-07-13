import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-3xl border border-earth-border/40 bg-earth-card/40 backdrop-blur-sm p-12 text-center shadow-premium group max-w-xl mx-auto ${className}`}
    >
      {/* Background Gold Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-400/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-gold-400/8 transition-colors duration-500" />

      {/* Decorative inner elements */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon Container with subtle gold border & hover bounce */}
        <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-400/5 border border-gold-400/10 text-gold-400/60 group-hover:text-gold-400 group-hover:border-gold-400/20 group-hover:scale-105 transition-all duration-300">
          <Icon className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-gold-100 mb-2 uppercase tracking-wide">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gold-100/40 text-sm max-w-sm leading-relaxed mb-6 font-medium">
            {description}
          </p>
        )}

        {/* CTA Button */}
        {action && (
          <Button
            onClick={action.onClick}
            className="btn-gold h-10 px-6 rounded-xl text-xs font-black uppercase tracking-widest shadow-gold-glow"
          >
            {action.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
