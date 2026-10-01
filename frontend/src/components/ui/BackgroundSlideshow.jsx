import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1920&auto=format&fit=crop", // Modern luxury
  "https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=1920&auto=format&fit=crop", // Aerial residential
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1920&auto=format&fit=crop"  // Villa with pool
];

export function BackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', backgroundColor: '#000' }}>
      <AnimatePresence mode="popLayout">
        {IMAGES.map((src, index) => (
          index === currentIndex && (
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.1, x: ['0%', '-1%'], y: ['0%', '-1%'] }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 1.5, ease: "easeInOut" },
                scale: { duration: 8, ease: "linear" },
                x: { duration: 8, ease: "linear" },
                y: { duration: 8, ease: "linear" }
              }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                willChange: 'transform, opacity'
              }}
            />
          )
        ))}
      </AnimatePresence>
      
      {/* Dark Gradient Overlay */}
      <div style={{ 
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(8,20,40,0.55) 0%, rgba(8,20,40,0.35) 50%, rgba(8,20,40,0.65) 100%)',
        zIndex: 1
      }} />
    </div>
  );
}
