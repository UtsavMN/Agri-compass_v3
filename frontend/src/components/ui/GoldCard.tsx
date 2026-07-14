import { motion } from "framer-motion";
import { cardHoverVariants } from "@/lib/animations";

interface GoldCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GoldCard = ({ children, className, onClick }: GoldCardProps) => (
  <motion.div
    variants={cardHoverVariants as any}
    initial="rest"
    whileHover="hover"
    onClick={onClick}
    className={`
      glass-card p-5
      transition-colors duration-300
      cursor-pointer ${className}
    `}
  >
    {children}
  </motion.div>
);
