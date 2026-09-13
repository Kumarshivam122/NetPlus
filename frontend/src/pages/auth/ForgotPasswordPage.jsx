import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Key, Lock, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { apiForgotPassword, apiVerifyOTP, apiResetPassword } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    
    const res = await apiForgotPassword(email);
    setLoading(false);
    
    if (res.success) {
      addToast(res.message, 'success');
      setStep(2);
    } else {
      addToast(res.message || 'Failed to send OTP', 'error');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;
    setLoading(true);
    
    const res = await apiVerifyOTP(email, otp);
    setLoading(false);
    
    if (res.success) {
      addToast('OTP Verified!', 'success');
      setStep(3);
    } else {
      addToast(res.message || 'Invalid OTP', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    
    const res = await apiResetPassword(email, otp, newPassword);
    setLoading(false);
    
    if (res.success) {
      addToast('Password reset successfully!', 'success');
      setStep(4);
    } else {
      addToast(res.message || 'Failed to reset password', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="auth-main">
        <div className="auth-card animate-fade-up">
          
          {step === 1 && (
            <>
              <div className="auth-header">
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(56, 178, 172, 0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Mail size={28} />
                </div>
                <h1 className="auth-title" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>Forgot Password</h1>
                <p className="auth-subtitle">Enter your email address to receive a 6-digit verification code.</p>
              </div>

              <form onSubmit={handleSendEmail} className="auth-form" id="forgot-password-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      id="forgot-password-email"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1rem' }} id="reset-password-btn">
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>

                <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="auth-header">
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(233, 127, 57, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Key size={28} />
                </div>
                <h1 className="auth-title" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>Enter OTP</h1>
                <p className="auth-subtitle">We sent a 6-digit code to <strong>{email}</strong>.</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="auth-form" id="verify-otp-form">
                <div className="form-group">
                  <label className="form-label">Verification Code (OTP)</label>
                  <div className="input-with-icon">
                    <Key size={18} className="input-icon" />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      style={{ letterSpacing: '2px', fontWeight: 'bold' }}
                      id="otp-input"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1rem' }} id="verify-otp-btn">
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--gray-500)', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}>
                    Didn't receive code? Change email
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="auth-header">
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(56, 178, 172, 0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Lock size={28} />
                </div>
                <h1 className="auth-title" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>Create New Password</h1>
                <p className="auth-subtitle">Please enter your new password to secure your account.</p>
              </div>

              <form onSubmit={handleResetPassword} className="auth-form" id="new-password-form">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      id="new-password-input"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1rem' }} id="save-password-btn">
                  {loading ? 'Saving...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={32} />
              </div>
              <h2 style={{ color: 'var(--navy)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Password Reset!</h2>
              <p style={{ color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: '2rem' }}>
                Your password has been successfully reset. You can now login with your new credentials.
              </p>
              <Link to="/login" className="btn btn-primary btn-block" style={{ display: 'inline-block' }}>
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .auth-main { min-height: calc(100vh - 72px); display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; background: var(--gray-50); }
        .auth-card { background: #fff; border-radius: var(--radius-lg); padding: 2.5rem; width: 100%; max-width: 440px; box-shadow: var(--shadow-md); }
        .auth-header { text-align: center; margin-bottom: 2rem; }
        .auth-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }
        .auth-subtitle { color: var(--gray-500); font-size: 0.95rem; line-height: 1.5; }
        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); }
        .input-with-icon .form-control { padding-left: 2.5rem; }
      `}</style>
    </div>
  );
}
