import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft, Shield, Check, AlertTriangle } from 'lucide-react';
import { apiSimpleSignUp, apiSignIn, apiVerifyEmail } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { addToast } = useToast();

  const [form, setForm]         = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [step, setStep]         = useState('register');
  const [otp, setOtp]           = useState('');
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

    // Instead of logging in, we move to the verification step
    setLoading(false);
    addToast('Verification code sent to your email.', 'success');
    setStep('verify');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    const result = await apiVerifyEmail(form.email.trim(), otp.trim());

    if (!result.success) {
      setLoading(false);
      setError(result.error || 'Invalid or expired OTP. Please try again.');
      return;
    }

    // Now log them in
    const loginResult = await apiSignIn(form.email.trim(), form.password);
    setLoading(false);

    if (loginResult.success) {
      authLogin(loginResult.user);
      addToast('Email verified! Please complete your shop details.', 'success');
      navigate('/onboarding');
    } else {
      addToast('Email verified. Please log in.', 'success');
      navigate('/login');
    }
  };

  return (
    <div className="auth-page" id="register-page">
      <div className="auth-split-left">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="auth-back-btn"><ArrowLeft size={18} aria-hidden="true" /> Back</a>
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
            <div key={i} className="auth-left-feat"><Check size={18} aria-hidden="true" /> {f}</div>
          ))}
        </div>
        <div className="auth-admin-hint">
          <Shield size={16} aria-hidden="true" />
          <span>Need help? Contact support at netplus.enterprise10@gmail.com</span>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-card animate-scale-in">
          <div className="auth-form-header">
            <h1>{step === 'register' ? 'Create Account' : 'Verify Email'}</h1>
            <p>{step === 'register' ? 'Join NET PLUS as a retail partner' : `Enter the 6-digit code sent to ${form.email}`}</p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert"><AlertTriangle size={18} aria-hidden="true" /> {error}</div>
          )}

          {step === 'register' ? (
            <form onSubmit={handleSubmit} id="register-form">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name *</label>
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
                <label className="form-label" htmlFor="reg-email">Email Address *</label>
                <input
                  id="reg-email"
                  className="form-control"
                  type="email" required
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  autoComplete="email"
                  pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                  title="Please enter a valid email address (e.g., store@example.com)"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password *</label>
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
                id="reg-submit"
              >
                {loading ? <><span className="spinner" style={{width:'20px',height:'20px',borderWidth:'2px',borderColor:'rgba(255,255,255,0.4)',borderTopColor:'#fff'}}/> Creating account...</> : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} id="verify-form">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-otp">Verification Code *</label>
                <input
                  id="reg-otp"
                  className="form-control"
                  type="text" required
                  placeholder="123456"
                  maxLength={6}
                  style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading || otp.length !== 6}
                id="verify-submit"
              >
                {loading ? <><span className="spinner" style={{width:'20px',height:'20px',borderWidth:'2px',borderColor:'rgba(255,255,255,0.4)',borderTopColor:'#fff'}}/> Verifying...</> : 'Verify Email'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1rem' }}>
                <span style={{ color: 'var(--gray-500)' }}>Didn't receive code? </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', minHeight: '44px', padding: '0 0.5rem', textDecoration: 'underline' }}
                >
                  Resend
                </button>
              </div>
            </form>
          )}

          {step === 'register' && (
            <>
              <div className="auth-divider"><span>Already have an account?</span></div>
              <Link to="/login" className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }} id="go-login-btn">
                Sign In to Portal
              </Link>
            </>
          )}
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
          background: #fff; border: 1px solid #c9cde8;
          border-radius: var(--radius-lg); padding: 0.75rem 1rem;
          color: var(--navy-mid); font-size: 0.92rem; font-weight: 500;
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
        .auth-form-header p { color: var(--gray-500); font-size: 1rem; }

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

        .auth-note { text-align: center; color: var(--gray-500); font-size: 0.875rem; margin-top: 1rem; }

        @media (max-width: 900px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-split-left { display: none; }
          .auth-split-right { padding: 1.5rem 1rem; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
