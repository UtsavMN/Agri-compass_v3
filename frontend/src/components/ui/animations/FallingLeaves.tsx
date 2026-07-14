import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeafProps {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
  imageSrc: string;
}

const LEAF_IMAGES = [
  '/icons8-autumn-48.png',
  '/icons8-autumn-96.png',
  '/icons8-fallen-leaf-48.png',
  '/icons8-fallen-leaf-96.png',
  '/icons8-maple-leaf-48.png',
  '/icons8-maple-leaf-96.png',
];

export function FallingLeaves() {
  const [leaves, setLeaves] = useState<LeafProps[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Generate an initial set of leaves
    const generateLeaves = () => {
      const newLeaves: LeafProps[] = [];
      const numLeaves = isMobile ? 6 : 15; // Reduced amount on mobile
      for (let i = 0; i < numLeaves; i++) {
        newLeaves.push(createLeaf(i));
      }
      setLeaves(newLeaves);
    };

    generateLeaves();

    // Periodically recycle leaves to keep them flowing
    const interval = setInterval(() => {
      setLeaves(currentLeaves => {
        return currentLeaves.map(leaf => {
          // If enough time has passed, respawn leaf
          if (Math.random() > 0.8) {
            return createLeaf(leaf.id);
          }
          return leaf;
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile]);

  const createLeaf = (id: number): LeafProps => {
    // Randomize starting x position (favoring edges: 0-20% and 80-100%)
    const isLeftEdge = Math.random() > 0.5;
    const x = isLeftEdge ? Math.random() * 20 : 80 + Math.random() * 20;
    const randomImage = LEAF_IMAGES[Math.floor(Math.random() * LEAF_IMAGES.length)];

    return {
      id,
      x,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 15, // Slow fall
      rotation: Math.random() * 360,
      size: 15 + Math.random() * 20, // Random leaf size matching previous SVG size
      imageSrc: randomImage,
    };
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <AnimatePresence>
        {leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            initial={{
              y: -50,
              x: `${leaf.x}vw`,
              rotate: leaf.rotation,
              opacity: 0,
            }}
            animate={{
              y: '110vh',
              x: [`${leaf.x}vw`, `${leaf.x - 5}vw`, `${leaf.x + 5}vw`, `${leaf.x}vw`], // Slight swaying
              rotate: leaf.rotation + 360,
              opacity: [0, 0.4, 0.4, 0], // Reduced opacity for subtlety
            }}
            transition={{
              duration: leaf.duration,
              delay: leaf.delay,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.1, 0.9, 1],
            }}
            className="absolute"
            style={{ width: leaf.size, height: leaf.size }}
          >
            <img 
              src={leaf.imageSrc} 
              alt="falling leaf" 
              className="w-full h-full object-contain opacity-60" 
              style={{ filter: 'grayscale(40%) sepia(80%) hue-rotate(-10deg) brightness(0.8)' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
