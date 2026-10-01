import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../AppContext";
import { DataModeChip } from "./Badge";
import { Logo } from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Search, FileText, Bot, 
  ShieldAlert, Map, LineChart, SplitSquareHorizontal, 
  ListChecks, MessageSquare, PieChart, Sun, Moon
} from "lucide-react";
import { AnimatedBackground } from "./ui/AnimatedBackground";
import { useState, useEffect } from "react";

const LINKS = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/research", "Property Research", Search],
  ["/workspace", "Intelligence Profile", FileText],
  ["/agents", "Autonomous Agents", Bot],
  ["/risk", "Risk Intelligence", ShieldAlert],
  ["/location", "Location Intelligence", Map],
  ["/market", "Market Intelligence", LineChart],
  ["/compare", "Compare", SplitSquareHorizontal],
  ["/evidence", "Evidence Trail", ListChecks],
  ["/assistant", "AI Assistant", MessageSquare],
  ["/reports", "Reports", PieChart],
];

export function Layout({ children }) {
  const { meta, items, activeId, loadActive, error, logout, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Logo />
          <div>
            <div className="logo-word">SS</div>
            <div className="tagline">Property Intelligence Platform</div>
          </div>
        </div>
        <nav className="nav" aria-label="Primary" style={{ marginTop: '12px' }}>
          {LINKS.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="active-sidebar-bg"
                      style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(45,212,191,0.28), rgba(45,212,191,0.04))', borderLeft: '3px solid #2DD4BF', borderRadius: '0 8px 8px 0', zIndex: -1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={18} className="sidebar-icon" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <DataModeChip mode={meta?.data_mode} />
          <p className="tagline" style={{ marginTop: 10 }}>
            Evidence → Risk → Verification
          </p>
          <button className="btn btn-ghost" style={{ marginTop: '16px', width: '100%', fontSize: '13px', color: '#c5d2e3', borderColor: 'rgba(255,255,255,0.1)' }} onClick={handleLogout}>
            Logout ({user})
          </button>
        </div>
      </aside>

      <AnimatedBackground />

      <div className="main">
        
        <div className="topbar">
          <div className="kicker">ENTERPRISE PROPERTY INTELLIGENCE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={toggleTheme} 
              className="btn btn-ghost" 
              style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <label className="field" style={{ margin: 0 }}>
              <span className="visually-hidden" style={{ position: "absolute", left: -9999 }}>
                Active research
              </span>
              <select
                className="select-prop"
                value={activeId}
                onChange={(e) => loadActive(e.target.value)}
                aria-label="Active research record"
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.input?.name} · {it.input?.city}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        
        {error && (
          <div className="page" style={{ paddingTop: '20px' }}>
            <div className="callout err">External data is currently unavailable. {error}</div>
          </div>
        )}
        
        {/* Page Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ position: 'relative', zIndex: 10, minHeight: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
