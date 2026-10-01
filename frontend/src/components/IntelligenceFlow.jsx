import { useState } from "react";
import { Badge } from "./Badge";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  ["ingestion", "Data Ingestion"],
  ["extraction", "Document Extraction"],
  ["geo", "Geospatial Analysis"],
  ["market", "Market Intelligence"],
  ["risk", "Risk Assessment"],
  ["verify", "Verification Checklist"],
  ["report", "Intelligence Report"],
];

export function IntelligenceFlow({ flow = [] }) {
  const [key, setKey] = useState(flow[0]?.key || "ingestion");
  const selected = flow.find((f) => f.key === key) || flow[0];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--success)';
      case 'data_unavailable': return 'var(--gold)';
      case 'unavailable': return '#94A3B8';
      case 'processing': return 'var(--accent-2)';
      case 'error': return 'var(--danger)';
      default: return '#94A3B8';
    }
  };

  return (
    <div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '10px 0 30px' }}>
        {/* Animated Connecting Line */}
        <div style={{ position: 'absolute', top: '24px', left: '5%', right: '5%', height: '2px', background: 'var(--border)', zIndex: 0 }} />
        <motion.div 
          style={{ position: 'absolute', top: '24px', left: '5%', height: '2px', background: 'var(--accent-2)', zIndex: 1 }}
          initial={{ width: 0 }}
          animate={{ width: `${(STAGES.findIndex(s => s[0] === key) / (STAGES.length - 1)) * 90}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {STAGES.map(([k, title], i) => {
          const stage = flow.find((f) => f.key === k);
          const isActive = key === k;
          const statusColor = getStatusColor(stage?.status);

          return (
            <div key={k} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '14%' }}>
              <button
                type="button"
                onClick={() => setKey(k)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: isActive ? '#fff' : statusColor,
                  border: `3px solid ${statusColor}`,
                  cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive ? `0 0 0 4px ${statusColor}33` : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {isActive && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} 
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor }}
                  />
                )}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {title}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'capitalize' }}>
                  {stage?.status || "waiting"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div 
            key={selected.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ 
              marginTop: '16px', background: 'var(--bg-surface)', 
              border: 'var(--card-border-width) solid var(--border)', borderRadius: '12px', padding: '20px',
              transition: 'all 0.3s ease'
            }}
          >
            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px' }}>{selected.title} Details</h3>
            <div className="grid g-2">
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Input</div>
                <div style={{ fontSize: '14px' }}>{selected.input}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Processing</div>
                <div style={{ fontSize: '14px' }}>{selected.processing}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Output</div>
                <div style={{ fontSize: '14px' }}>{selected.output}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Evidence</div>
                <div style={{ fontSize: '14px' }}>{selected.evidence}</div>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Badge kind={selected.status === "demo" ? "demo" : selected.status === "unavailable" || selected.status === "data_unavailable" ? "unavailable" : "verified"}>
                Status: {selected.status}
              </Badge>
              <Badge kind={selected.confidence} />
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                <strong>Data limitations:</strong> {selected.limitations}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
