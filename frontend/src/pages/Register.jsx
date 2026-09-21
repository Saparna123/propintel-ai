import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useApp } from "../AppContext";

export function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { registerUser, user } = useApp();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName.trim()) return setError("Full Name is required.");
    if (!formData.email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError("Please enter a valid email address.");
    if (!formData.username.trim()) return setError("Username is required.");
    if (formData.password.length < 8) return setError("Password must be at least 8 characters.");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");

    const res = registerUser(formData.fullName, formData.email, formData.username, formData.password);
    if (!res.success) {
      setError(res.error);
    } else {
      navigate("/login", { state: { message: "Account created successfully. Please login to continue." }, replace: true });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--navy)' }}>Create your PropIntel AI account</h2>
        <p className="lede" style={{ textAlign: 'center', fontSize: '14px', marginBottom: '24px' }}>
          Set up your account to access intelligent property research and real estate risk assessment tools.
        </p>
        
        {error && <div className="callout err" style={{ marginBottom: '16px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="field">
            <label>Full Name</label>
            <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
          </div>
          
          <div className="field">
            <label>Email Address</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Username</label>
            <input name="username" type="text" value={formData.username} onChange={handleChange} required />
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
            <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <input name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '12px' }}>
            Create Account
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: 'var(--teal)', fontWeight: '600' }}>
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
