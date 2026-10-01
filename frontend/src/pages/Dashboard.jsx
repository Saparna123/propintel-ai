import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../AppContext";
import { Badge } from "../components/Badge";
import { Disclaimer } from "../components/Disclaimer";
import { IntelligenceFlow } from "../components/IntelligenceFlow";
import { Layout } from "../components/Layout";
import { GlassCard } from "../components/ui/GlassCard";
import { StatCounter } from "../components/ui/StatCounter";
import { Building2, ShieldAlert, AlertOctagon, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function Dashboard() {
  const { meta, active, items } = useApp();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    document.title = "SS | Dashboard";
    api.metrics().then(setMetrics).catch(() => setMetrics(null));
  }, []);

  const statConfig = [
    { label: "Properties Researched", key: "properties_researched", icon: <Building2 size={24} />, color: "var(--accent)" },
    { label: "Risk Assessments", key: "risk_assessments", icon: <ShieldAlert size={24} />, color: "var(--accent)" },
    { label: "High-Risk Cases", key: "high_risk_cases", icon: <AlertOctagon size={24} />, color: "var(--danger)" },
    { label: "Research Completion", key: "research_completion_pct", icon: <CheckCircle2 size={24} />, color: "var(--success)", isPercent: true },
  ];

  return (
    <Layout>
      <div className="page" style={{ paddingTop: '16px' }}>
        {/* Slim Hero Banner */}
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: '16px', padding: '32px 40px', marginBottom: '24px',
          background: 'linear-gradient(90deg, rgba(10,31,61,0.95) 0%, rgba(15,42,74,0.88) 60%, rgba(20,60,110,0.80) 100%)', color: 'white',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', height: '260px', display: 'flex', alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.15, zIndex: -1,
            backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop)',
            backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(3px)'
          }} />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '900px' }}>
            <div style={{ color: '#5EEAD4', fontSize: '13px', letterSpacing: '0.14em', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Property Intelligence Dashboard</div>
            <h1 style={{ color: '#FFFFFF', margin: 0, fontSize: '40px' }}>Executive overview</h1>
            <p style={{ color: '#E2ECF8', margin: '8px 0 0 0', fontSize: '17px', lineHeight: 1.6, opacity: 1, maxWidth: '900px' }}>
              {meta?.secondary} This console is an intelligence workstation — not a listings marketplace. Headline counters below are labelled demonstration metrics unless marked as session-verified.
            </p>
          </div>
        </div>

        <div className="grid g-4" style={{ display: 'grid' }}>
          {statConfig.map((stat, idx) => (
            <GlassCard key={stat.label} style={{ 
              height: '100%', 
              justifyContent: 'space-between',
              borderTop: '3px solid transparent',
              borderTopImage: 'linear-gradient(to right, var(--accent), var(--accent-2)) 1'
            }}>
              {!metrics ? (
                // Skeleton Loader
                <div style={{ animation: 'pulse 1.5s infinite ease-in-out', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '60%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px' }} />
                      <div style={{ width: '80%', height: '40px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '999px', marginTop: 'auto' }} />
                </div>
              ) : (
                <>
                  <StatCounter 
                    label={stat.label} 
                    value={stat.isPercent ? `${metrics[stat.key]}%` : metrics[stat.key]} 
                    icon={stat.icon} 
                  />
                  <div style={{ marginTop: '20px' }}>
                    <div className="badge b-demo" style={{ 
                      display: 'block', fontSize: '10.5px', padding: '4px 10px', 
                      letterSpacing: '0.04em', whiteSpace: 'normal', borderRadius: '12px',
                      maxWidth: '100%', boxSizing: 'border-box', textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      DEMO / SAMPLE SYSTEM METRICS
                    </div>
                  </div>
                </>
              )}
            </GlassCard>
          ))}
        </div>

        <div className="grid g-23" style={{ marginTop: 24 }}>
          <GlassCard>
            <h3 style={{ color: 'var(--text-primary)' }}>Property Intelligence Flow</h3>
            <p className="lede" style={{ marginBottom: '24px' }}>Interactive pipeline for the active research record. Stages reflect backend status, not simulated telemetry.</p>
            {active?.flow ? <IntelligenceFlow flow={active.flow} /> : (
              <div className="empty" style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                Data Not Available — launch or select a research job.
              </div>
            )}
          </GlassCard>
          
          <GlassCard>
            <h3 style={{ color: 'var(--text-primary)' }}>Session records</h3>
            <p className="lede">{metrics?.session_note}</p>
            
            {!metrics ? (
              <div style={{ width: '60px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            ) : (
              <div className="metric" style={{ marginBottom: '12px' }}>{metrics?.session_research_count ?? items.length}</div>
            )}
            
            <Badge kind="verified">Verified — this backend process</Badge>
            
            <ul style={{ paddingLeft: '20px', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '15px' }}>
              {items.map((it) => (
                <li key={it.id} style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{it.input?.name}</strong> — {it.status}
                </li>
              ))}
            </ul>
            
            <Link className="btn btn-primary" to="/research" style={{ display: 'inline-block', marginTop: '24px' }}>
              Start research
            </Link>
          </GlassCard>
        </div>
        
        <div style={{ marginTop: '40px' }}>
          <Disclaimer text={meta?.disclaimer} />
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </Layout>
  );
}
