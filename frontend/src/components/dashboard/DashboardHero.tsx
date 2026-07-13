import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ParticleField } from "@/components/ui/ParticleField";

export const DashboardHero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[85vh] overflow-hidden flex items-center">
      {/* Parallax background */}
      <motion.div
        style={{ y, backgroundImage: `url('/map_karnataka.png')` }}
        className="absolute inset-0 bg-cover bg-center"
      />

      {/* Gold gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />

      {/* Particles */}
      <ParticleField />

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 max-w-2xl px-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-4"
        >
          Agri Compass · Government of Karnataka Scheme Support
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl font-serif text-[#F5F0E8] leading-tight mb-6"
        >
          Empowering<br />
          <span className="text-[#C9A84C]">Karnataka's</span> Fields
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-[#F5F0E8]/60 text-lg mb-8"
        >
          Make data-driven agricultural decisions with AI-powered crop intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="flex gap-4"
        >
          <button className="px-6 py-3 bg-[#C9A84C] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#D4B86A] transition-colors">
            ANALYZE SOIL
          </button>
          <button className="px-6 py-3 border border-[#C9A84C]/40 text-[#C9A84C] rounded-lg hover:border-[#C9A84C] transition-colors">
            EXPLORE CROPS
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};
