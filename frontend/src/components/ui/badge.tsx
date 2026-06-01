import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-surface text-text-primary hover:bg-surface/80',
        gold: 'border-transparent bg-gold-primary text-black hover:bg-gold-hover',
        secondary: 'border-transparent bg-card text-text-secondary hover:bg-card/80',
        destructive: 'border-transparent bg-red-900/50 text-red-400 hover:bg-red-900/70',
        outline: 'text-text-primary border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
