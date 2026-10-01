import React from 'react';
import { motion } from 'framer-motion';

export function GlassCard({ children, style, ...props }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 10px 28px rgba(47,111,219,0.15)', borderColor: 'var(--border-strong)' }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: 'var(--shadow)',
        transition: 'border-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
