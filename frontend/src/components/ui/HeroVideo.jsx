import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function HeroVideo() {
  const [videoError, setVideoError] = useState(false);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: -1 }}>
      {/* 
        To use a real video, place 'login-bg.mp4' in 'public/videos/'.
        We attempt to load it, falling back to an SVG animation if it fails.
      */}
      {!videoError && (
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          poster="/videos/login-poster.jpg"
          onError={() => setVideoError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <source src="/videos/login-bg.mp4" type="video/mp4" />
        </motion.video>
      )}

      {videoError && (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #081428, #133a4d)', position: 'relative', overflow: 'hidden' }}>
          {/* Animated SVG Skyline Fallback */}
          <div className="skyline-animation">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="building"
                style={{ 
                  left: `${i * 5}%`,
                  height: `${30 + Math.random() * 40}%`,
                  width: `${3 + Math.random() * 4}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="window" style={{ animationDelay: `${Math.random() * 5}s` }} />
                ))}
              </div>
            ))}
          </div>
          <div className="clouds">
            <div className="cloud" style={{ top: '10%', animationDuration: '60s' }} />
            <div className="cloud" style={{ top: '30%', animationDuration: '45s', width: '200px', height: '60px' }} />
          </div>
        </div>
      )}

      {/* Gradient Overlay */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(135deg, rgba(8,20,40,0.75) 0%, rgba(0,128,128,0.35) 100%)',
        zIndex: 1
      }} />
    </div>
  );
}
