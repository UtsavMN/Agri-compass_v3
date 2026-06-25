import { motion } from "framer-motion";
import { cardHoverVariants } from "@/lib/animations";

interface GoldCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GoldCard = ({ children, className, onClick }: GoldCardProps) => (
  <motion.div
    variants={cardHoverVariants}
    initial="rest"
    whileHover="hover"
    onClick={onClick}
    className={`
      bg-[#111111] border border-[#1E1E1E] rounded-xl p-5
      hover:border-[#C9A84C]/30 transition-colors duration-300
      cursor-pointer ${className}
    `}
  >
    {children}
  </motion.div>
);
