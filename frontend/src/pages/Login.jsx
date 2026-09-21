import React, { useState } from "react";
import { useNavigate, Navigate, useLocation, Link } from "react-router-dom";
import { useApp } from "../AppContext";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const successMessage = location.state?.message;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/dashboard", { replace: true });
    } else {
      setError("Invalid credentials. Hint: use admin/admin");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--navy)' }}>PropIntel AI</h2>
        <p className="lede" style={{ textAlign: 'center', fontSize: '14px', marginBottom: '24px' }}>Sign in to the intelligence console</p>
        
        {successMessage && <div className="callout info" style={{ marginBottom: '16px' }}>{successMessage}</div>}
        {error && <div className="callout err" style={{ marginBottom: '16px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="field">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Enter admin"
              required 
            />
          </div>
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--teal)', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter admin"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '12px' }}>
            Login
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: 'var(--teal)', fontWeight: '600' }}>
              Create account
            </Link>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: 'var(--muted)' }}>
            Demo registration data is stored locally for demonstration purposes and is not production-grade authentication.
          </div>
        </form>
      </div>
    </div>
  );
}
