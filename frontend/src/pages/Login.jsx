import React, { useState, useEffect } from "react";
import { useNavigate, Navigate, useLocation, Link } from "react-router-dom";
import { useApp } from "../AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Lock, Mail } from "lucide-react";
import { BackgroundSlideshow } from "../components/ui/BackgroundSlideshow";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "SS | Sign in";
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const successMessage = location.state?.message;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate loading for the spinner
    setTimeout(() => {
      if (login(username, password)) {
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid credentials. Hint: use admin/admin");
        setIsSubmitting(false);
      }
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      
      {/* BACKGROUND SLIDESHOW */}
      <BackgroundSlideshow />

      {/* LOGO AND TAGLINE */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
        }}
        style={{ zIndex: 10, marginBottom: '32px', position: 'relative', textAlign: 'center' }}
      >
        <h1 style={{ fontSize: '46px', fontWeight: 800, color: 'white', letterSpacing: '4px', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>SS</h1>
      </motion.div>

      {/* LOGIN CARD */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut", staggerChildren: 0.1 } }
        }}
        style={{ 
          zIndex: 10, 
          position: 'relative',
          width: '100%', 
          maxWidth: '400px', 
          background: 'rgba(255, 255, 255, 0.75)', 
          backdropFilter: 'blur(22px)', 
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255, 255, 255, 0.4)', 
          borderRadius: '24px', 
          padding: '32px 28px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', color: '#1a2433', marginBottom: '6px', fontWeight: 700 }}>Welcome back</h2>
          <p style={{ fontSize: '14px', color: '#5c6778', margin: 0 }}>Please enter your details to sign in.</p>
        </div>

        <AnimatePresence>
          {successMessage && (
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="callout info" style={{ marginBottom: '16px' }}>
              {successMessage}
            </motion.div>
          )}
          {error && (
            <motion.div 
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: [-10, 10, -10, 10, 0] }} 
              transition={{ duration: 0.4 }}
              exit={{ opacity: 0, height: 0 }} 
              className="callout err" 
              style={{ marginBottom: '16px', background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid #fca5a5' }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Email or Username</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="Enter your email"
                required 
                style={{ 
                  width: '100%', padding: '12px 14px 12px 42px', 
                  border: '1px solid #cbd5e1', borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.7)', fontSize: '14px',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
                style={{ 
                  width: '100%', padding: '12px 42px 12px 42px', 
                  border: '1px solid #cbd5e1', borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.7)', fontSize: '14px',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </button>
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', marginBottom: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer', borderRadius: '4px' }} />
              Remember me
            </label>
            <a href="#" style={{ fontSize: '13px', color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
          </motion.div>

          <motion.button 
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            type="submit" 
            disabled={isSubmitting}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              padding: '14px', borderRadius: '12px', border: 'none', 
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', 
              color: 'white', fontWeight: 700, fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', transition: 'background 0.3s',
              opacity: isSubmitting ? 0.8 : 1
            }}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
              />
            ) : "Sign In"}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
