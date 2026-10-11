import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
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
        <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="auth-back-btn"><ArrowLeft size={18} aria-hidden="true" /> Back</a>
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
            <div key={i} className="auth-left-feat"><Check size={18} aria-hidden="true" /> {f}</div>
          ))}
        </div>
        <div className="auth-admin-hint">
          <Shield size={16} aria-hidden="true" />
          <span>Admin? Use your admin credentials to access the admin panel.</span>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-card animate-scale-in">
          <div className="auth-form-header">
            <h1>Welcome Back</h1>
            <p>Login to your NET PLUS retailer portal</p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert"><AlertTriangle size={18} aria-hidden="true" /> {error}</div>
          )}

          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address *</label>
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
                  <label className="form-label" style={{ marginBottom:0 }} htmlFor="login-password">Password</label>
                  <Link to="/forgot-password" style={{ fontSize:'.92rem', color:'var(--teal)', fontWeight:600 }} id="forgot-password-link">
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
                <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)} id="toggle-password" aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  <span>{showPass ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? <><span className="btn-spinner" /> Logging in...</> : <><LogIn size={18} aria-hidden="true" /> Login to Portal</>}
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
          background: var(--cyan);
          border-right: 1px solid #c9cde8;
          padding: 3rem;
          display: flex; flex-direction: column;
        }
        .auth-back-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          min-height: 44px;
          color: var(--teal-dark); font-size: 1rem; font-weight: 600;
          text-decoration: none;
        }
        .auth-back-btn:hover { text-decoration: underline; }
        .auth-brand {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center;
        }
        .auth-logo { width: 90px; height: 90px; border-radius: 12px; margin-bottom: 1rem; }
        .auth-brand-name { font-size: 1.4rem; font-weight: 800; color: var(--navy); letter-spacing: 0.02em; }
        .auth-brand-sub  { font-size: 0.95rem; color: var(--teal-dark); font-weight: 600; margin-top: 0.3rem; }
        .auth-quote {
          background: #fff; border: 1px solid #c9cde8;
          border-radius: var(--radius-lg); padding: 1.25rem;
          color: var(--navy-mid); font-size: 1rem; font-style: italic; line-height: 1.6;
          margin: 1.5rem 0;
        }
        .auth-quote p { color: var(--navy-mid); }
        .auth-left-features { display: flex; flex-direction: column; gap: 0.6rem; }
        .auth-left-feat { font-size: 1rem; color: var(--navy); display: flex; gap: 0.5rem; align-items: center; }
        .auth-admin-hint {
          display: flex; align-items: center; gap: 0.5rem;
          background: #fff4e0; border: 1px solid #f0cf94;
          border-radius: var(--radius-lg); padding: 0.75rem 1rem;
          color: #7a4100; font-size: 0.92rem; font-weight: 500;
          margin-top: 1.5rem;
        }
        .auth-split-right {
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem;
        }
        .auth-form-card {
          background: #fff; border-radius: var(--radius-lg);
          padding: 2.5rem; width: 100%; max-width: 440px;
          border: 1px solid var(--gray-200);
        }
        .auth-form-header { margin-bottom: 1.5rem; }
        .auth-form-header h1, .auth-form-header h2 { color: var(--navy); font-size: 1.6rem; margin-bottom: 0.3rem; }
        .auth-form-header p  { color: var(--gray-500); font-size: 1rem; }
        .auth-error-banner {
          display: flex; align-items: flex-start; gap: 0.5rem;
          background: #fde8e8; border: 1px solid #f5b5b5;
          border-radius: var(--radius-lg); padding: 0.75rem 1rem;
          color: #9b1c1c; font-size: 0.95rem; font-weight: 500;
          margin-bottom: 1rem;
        }
        .password-field { position: relative; }
        .password-field .form-control { padding-right: 5.25rem; }
        .pass-toggle {
          position: absolute; right: 0.4rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          min-height: 40px; padding: 0 0.6rem;
          color: var(--teal-dark); font-size: 0.92rem; font-weight: 600;
          display: flex; align-items: center; gap: 0.3rem;
        }
        .pass-toggle:hover { text-decoration: underline; }
        .auth-divider {
          display: flex; align-items: center; gap: 1rem;
          margin: 1.5rem 0 0.75rem; color: var(--gray-500); font-size: 0.95rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--gray-200);
        }
        .auth-note { text-align: center; font-size: 0.875rem; color: var(--gray-500); margin-top: 1rem; }
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
