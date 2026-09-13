import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield, ArrowLeft } from 'lucide-react';
import { apiSignIn } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { addToast } = useToast();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await apiSignIn(form.email, form.password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    authLogin(result.user);
    addToast(`Welcome back, ${result.user.storeName || result.user.name}!`, 'success');

    if (result.user.role === 'admin')           navigate('/admin');
    else if (result.user.status === 'approved') navigate('/portal');
    else navigate('/pending');
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="auth-split-left">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="auth-back-btn"><ArrowLeft size={16} /> Back</a>
        <div className="auth-brand">
          <img src="/netLogo.jpeg" alt="NET PLUS ENTERPRISES" className="auth-logo" />
          <div className="auth-brand-name">NET PLUS ENTERPRISES</div>
          <div className="auth-brand-sub">Medical Wholesale & Distribution</div>
        </div>
        <div className="auth-quote">
          <p>"Trusted pharmaceutical supply for verified medical professionals."</p>
        </div>
        <div className="auth-left-features">
          {['Wholesale pricing for registered retailers', 'Live stock availability', 'Fast order system'].map((f, i) => (
            <div key={i} className="auth-left-feat"><span>✅</span> {f}</div>
          ))}
        </div>
        <div className="auth-admin-hint">
          <Shield size={14} />
          <span>Admin? Use your admin credentials to access the admin panel.</span>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-card animate-scale-in">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Login to your NET PLUS retailer portal</p>
          </div>

          {error && (
            <div className="auth-error-banner">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                id="login-email"
                className="form-control"
                type="email" required
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.5rem' }}>
                  <label className="form-label" style={{ marginBottom:0 }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize:'.8rem', color:'var(--teal)', textDecoration:'none', fontWeight:600 }} id="forgot-password-link">
                    Forgot Password?
                  </Link>
                </div>
              <div className="password-field">
                <input
                  id="login-password"
                  className="form-control"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  autoComplete="current-password"
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)} id="toggle-password">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', height: '48px' }}
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? <span className="btn-spinner" /> : <><LogIn size={16} /> Login to Portal</>}
            </button>
          </form>

          <div className="auth-divider"><span>Don't have an account?</span></div>
          <Link to="/register" className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }} id="go-register-btn">
            Register Your Medical Shop
          </Link>
          <p className="auth-note">
            This portal is exclusively for registered and verified medical shops.
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .auth-split-left {
          background: var(--gradient-hero);
          padding: 3rem;
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        .auth-split-left::before {
          content:'';
          position:absolute; inset:0;
          background:radial-gradient(ellipse 80% 80% at 20% 80%, rgba(22,163,74,0.2) 0%, transparent 70%);
        }
        .auth-back-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          color: rgba(255,255,255,0.6); font-size: 0.85rem; font-weight: 500;
          text-decoration: none; transition: var(--transition-fast);
          position: relative; z-index: 2;
        }
        .auth-back-btn:hover { color: #fff; }
        .auth-brand {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center; position: relative; z-index: 2;
        }
        .auth-logo { width: 90px; height: 90px; border-radius: 18px; margin-bottom: 1rem; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        .auth-brand-name { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: #fff; letter-spacing: 0.05em; }
        .auth-brand-sub  { font-size: 0.8rem; color: var(--teal-light); font-weight: 500; margin-top: 0.3rem; }
        .auth-quote {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-lg); padding: 1.25rem;
          color: rgba(255,255,255,0.65); font-size: 0.88rem; font-style: italic; line-height: 1.6;
          margin: 1.5rem 0; position: relative; z-index: 2;
        }
        .auth-left-features { display: flex; flex-direction: column; gap: 0.6rem; position: relative; z-index: 2; }
        .auth-left-feat { font-size: 0.85rem; color: rgba(255,255,255,0.7); display: flex; gap: 0.5rem; align-items: center; }
        .auth-admin-hint {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(249,168,37,0.1); border: 1px solid rgba(249,168,37,0.2);
          border-radius: var(--radius-md); padding: 0.75rem 1rem;
          color: rgba(249,168,37,0.85); font-size: 0.78rem; font-weight: 500;
          margin-top: 1.5rem; position: relative; z-index: 2;
        }
        .auth-split-right {
          background: var(--gray-50);
          display: flex; align-items: center; justify-content: center;
          padding: 2rem;
        }
        .auth-form-card {
          background: #fff; border-radius: var(--radius-xl);
          padding: 2.5rem; width: 100%; max-width: 440px;
          box-shadow: var(--shadow-xl); border: 1px solid var(--gray-100);
        }
        .auth-form-header { margin-bottom: 1.75rem; }
        .auth-form-header h2 { color: var(--navy); font-size: 1.6rem; margin-bottom: 0.3rem; }
        .auth-form-header p  { color: var(--gray-500); font-size: 0.9rem; }
        .auth-error-banner {
          background: rgba(229,57,53,0.08); border: 1.5px solid rgba(229,57,53,0.2);
          border-radius: var(--radius-md); padding: 0.75rem 1rem;
          color: var(--red); font-size: 0.88rem; font-weight: 500;
          margin-bottom: 1rem;
        }
        .password-field { position: relative; }
        .password-field .form-control { padding-right: 2.75rem; }
        .pass-toggle {
          position: absolute; right: 0.8rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--gray-400); display: flex;
        }
        .auth-divider {
          display: flex; align-items: center; gap: 1rem;
          margin: 1.5rem 0 0.75rem; color: var(--gray-400); font-size: 0.82rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--gray-200);
        }
        .auth-note { text-align: center; font-size: 0.75rem; color: var(--gray-400); margin-top: 1rem; }
        .btn-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-split-left { display: none; }
        }
      `}</style>
    </div>
  );
}
