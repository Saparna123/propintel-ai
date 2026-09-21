import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";
import { DataModeChip } from "./Badge";
import { Logo } from "./Logo";

const LINKS = [
  ["/dashboard", "Dashboard"],
  ["/research", "Property Research"],
  ["/workspace", "Intelligence Profile"],
  ["/agents", "Autonomous Agents"],
  ["/risk", "Risk Intelligence"],
  ["/location", "Location Intelligence"],
  ["/market", "Market Intelligence"],
  ["/compare", "Compare"],
  ["/evidence", "Evidence Trail"],
  ["/assistant", "AI Assistant"],
  ["/reports", "Reports"],
];

export function Layout({ children }) {
  const { meta, items, activeId, loadActive, error, logout, user } = useApp();
  const navigate = useNavigate();

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
            <div className="logo-word">PropIntel AI</div>
            <div className="tagline">From Property Data to Actionable Intelligence.</div>
          </div>
        </div>
        <nav className="nav" aria-label="Primary">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : "")}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <DataModeChip mode={meta?.data_mode} />
          <p className="tagline" style={{ marginTop: 10 }}>
            Evidence → Risk → Verification
          </p>
          <button className="btn btn-ghost" style={{ marginTop: '16px', width: '100%', fontSize: '13px' }} onClick={handleLogout}>
            Logout ({user})
          </button>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <div className="kicker">Infosys · Enterprise Property Intelligence</div>
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
        {error && (
          <div className="page">
            <div className="callout err">External data is currently unavailable. {error}</div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
