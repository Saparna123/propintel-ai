import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function StatCounter({ value, label, icon, color = 'var(--accent)' }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString().replace(/,/g, ''), 10) || 0;
    if (end === 0) return;
    
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  const displayValue = isNaN(value) && typeof value === 'string' ? value : count.toLocaleString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ 
        width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', border: 'none'
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.3, minHeight: '2.6em' }}>
          {label}
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}
        >
          {displayValue}
        </motion.div>
      </div>
    </div>
  );
}
