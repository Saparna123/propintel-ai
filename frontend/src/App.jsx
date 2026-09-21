import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext";
import { Agents } from "./pages/Agents";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Assistant } from "./pages/Assistant";
import { Compare } from "./pages/Compare";
import { Dashboard } from "./pages/Dashboard";
import { EvidenceTrail } from "./pages/EvidenceTrail";
import { LocationIntelligence } from "./pages/LocationIntelligence";
import { MarketIntelligence } from "./pages/MarketIntelligence";
import { PropertyResearch } from "./pages/PropertyResearch";
import { Reports } from "./pages/Reports";
import { RiskIntelligence } from "./pages/RiskIntelligence";
import { Workspace } from "./pages/Workspace";

function Gate({ children }) {
  const { loading } = useApp();
  const location = useLocation();
  if (loading && location.pathname !== "/login" && location.pathname !== "/register") {
    return (
      <div className="empty">
        <h2>PropIntel AI</h2>
        <p>Loading the intelligence console…</p>
      </div>
    );
  }
  return children;
}

function ProtectedRoute({ children }) {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <Gate>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/research" element={<ProtectedRoute><PropertyResearch /></ProtectedRoute>} />
          <Route path="/workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
          <Route path="/risk" element={<ProtectedRoute><RiskIntelligence /></ProtectedRoute>} />
          <Route path="/location" element={<ProtectedRoute><LocationIntelligence /></ProtectedRoute>} />
          <Route path="/market" element={<ProtectedRoute><MarketIntelligence /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
          <Route path="/evidence" element={<ProtectedRoute><EvidenceTrail /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        </Routes>
      </Gate>
    </AppProvider>
  );
}
