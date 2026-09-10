import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft, Shield } from 'lucide-react';
import { apiSimpleSignUp, apiSignIn } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { addToast } = useToast();

  const [form, setForm]         = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await apiSimpleSignUp({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    if (!result.success) {
      setLoading(false);
      setError(result.error || 'Sign-up failed. Please try again.');
      return;
    }

    // Immediately log them in so we can redirect to onboarding
    const loginResult = await apiSignIn(form.email.trim(), form.password);
    setLoading(false);

    if (loginResult.success) {
      authLogin(loginResult.user);
      addToast('Account created! Please complete your shop details.', 'success');

      if (loginResult.user.status === 'onboarding') {
        navigate('/onboarding');
      } else if (loginResult.user.status === 'pending' || loginResult.user.status === 'rejected') {
        navigate('/pending');
      } else {
        navigate('/portal');
      }
    } else {
      // Login failed but signup worked — send to login page
      addToast('Account created. Please log in.', 'success');
      navigate('/login');
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-split-left">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="auth-back-btn"><ArrowLeft size={16} /> Back</a>
        <div className="auth-brand">
          <img src="/netLogo.jpeg" alt="NET PLUS ENTERPRISES" className="auth-logo" />
          <div className="auth-brand-name">NET PLUS ENTERPRISES</div>
          <div className="auth-brand-sub">Medical Wholesale & Distribution</div>
        </div>
        <div className="auth-quote">
          <p>"Join our network of verified medical professionals and access wholesale pricing."</p>
        </div>
        <div className="auth-left-features">
          {['Exclusive wholesale catalogs', 'Dedicated support team', 'Secure order tracking'].map((f, i) => (
            <div key={i} className="auth-left-feat"><span>✅</span> {f}</div>
          ))}
        </div>
        <div className="auth-admin-hint">
          <Shield size={14} />
          <span>Need help? Contact support at netplus.enterprise10@gmail.com</span>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-card animate-scale-in">
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p>Join NET PLUS as a retail partner</p>
          </div>

          {error && (
            <div className="auth-error-banner">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} id="register-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                id="reg-name"
                className="form-control"
                type="text" required
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                id="reg-email"
                className="form-control"
                type="email" required
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="password-field">
                <input
                  id="reg-password"
                  className="form-control"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
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
              id="register-submit-btn"
            >
              {loading ? <span className="btn-spinner" /> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <div className="auth-divider"><span>Already have an account?</span></div>
          <Link to="/login" className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }} id="go-login-btn">
            Sign In to Portal
          </Link>
          <p className="auth-note">
            Upon registration, you will need to complete your shop details for verification.
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
          margin-top: 4rem; position: relative; z-index: 2;
        }
        .auth-logo { height: 48px; border-radius: 8px; margin-bottom: 1.5rem; }
        .auth-brand-name {
          color: #fff; font-size: 1.8rem; font-weight: 900;
          font-family: var(--font-display); letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .auth-brand-sub { color: rgba(255,255,255,0.8); font-size: 1.1rem; }
        
        .auth-quote {
          margin-top: 3rem; position: relative; z-index: 2;
          color: #fff; font-size: 1.25rem; font-style: italic; line-height: 1.6;
          border-left: 3px solid var(--teal); padding-left: 1.5rem;
        }
        
        .auth-left-features {
          margin-top: 3rem; display: flex; flex-direction: column; gap: 1rem;
          position: relative; z-index: 2;
        }
        .auth-left-feat {
          display: flex; align-items: center; gap: 0.75rem;
          color: rgba(255,255,255,0.9); font-size: 0.95rem;
        }
        
        .auth-admin-hint {
          margin-top: auto; display: flex; align-items: center; gap: 0.5rem;
          color: rgba(255,255,255,0.5); font-size: 0.8rem;
          position: relative; z-index: 2;
        }

        .auth-split-right {
          background: var(--bg-primary);
          display: flex; align-items: center; justify-content: center;
          padding: 3rem;
        }
        
        .auth-form-card {
          width: 100%; max-width: 420px;
        }
        
        .auth-form-header { margin-bottom: 2rem; }
        .auth-form-header h2 {
          font-family: var(--font-display); color: var(--navy);
          font-size: 2rem; margin-bottom: 0.5rem; font-weight: 800;
        }
        .auth-form-header p { color: var(--gray-500); font-size: 1rem; }

        .auth-error-banner {
          background: #fef2f2; border-left: 4px solid var(--red);
          padding: 1rem; color: var(--red); font-size: 0.85rem; font-weight: 500;
          margin-bottom: 1.5rem; border-radius: 4px;
        }

        .form-label {
          display: block; font-size: 0.85rem; font-weight: 600;
          color: var(--navy); margin-bottom: 0.4rem;
        }
        .form-control {
          width: 100%; padding: 0.85rem 1rem;
          border: 1px solid var(--gray-200); border-radius: var(--radius-md);
          font-size: 0.95rem; transition: var(--transition-fast);
          background: #fff;
        }
        .form-control:focus {
          border-color: var(--teal); outline: none;
          box-shadow: 0 0 0 3px rgba(13,148,136,0.1);
        }

        .password-field { position: relative; }
        .pass-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: var(--gray-400); cursor: pointer;
          padding: 4px; display: flex; align-items: center; justify-content: center;
          transition: var(--transition-fast);
        }
        .pass-toggle:hover { color: var(--navy); }

        .auth-divider {
          display: flex; align-items: center; text-align: center; margin: 2rem 0;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; border-bottom: 1px solid var(--gray-200);
        }
        .auth-divider span {
          padding: 0 1rem; color: var(--gray-400); font-size: 0.85rem; font-weight: 500;
        }

        .auth-note {
          text-align: center; color: var(--gray-400); font-size: 0.8rem; margin-top: 1.5rem;
        }

        .animate-scale-in { animation: scaleIn 0.4s ease-out forwards; }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 900px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-split-left { display: none; }
          .auth-split-right { padding: 2rem; align-items: flex-start; padding-top: 4rem; }
        }
      `}</style>
    </div>
  );
}
