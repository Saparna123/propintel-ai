import React from 'react';

export function AnimatedBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', background: 'var(--bg-main)', transition: 'background 0.3s ease', pointerEvents: 'none' }}>
      {/* Blueprint Grid Lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(var(--grid-color) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        transition: 'background-image 0.3s ease'
      }} />
      
      {/* Top Right Glow */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, var(--glow-1) 0%, transparent 60%)',
        borderRadius: '50%', filter: 'blur(80px)',
        animation: 'floatBlobs 25s infinite alternate ease-in-out',
        transition: 'background 0.3s ease'
      }} />
      
      {/* Bottom Left Glow */}
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-10%', width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, var(--glow-2) 0%, transparent 60%)',
        borderRadius: '50%', filter: 'blur(80px)',
        animation: 'floatBlobs 30s infinite alternate-reverse ease-in-out',
        transition: 'background 0.3s ease'
      }} />

      <style>{`
        @keyframes floatBlobs {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 10%) scale(1.05); }
          100% { transform: translate(10%, -5%) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
