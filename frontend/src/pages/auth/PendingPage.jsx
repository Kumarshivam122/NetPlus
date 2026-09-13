import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, LogOut, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { COMPANY } from '../../data/store';

export default function PendingPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    refreshUser();
    // Also poll every 10 seconds just in case they leave the page open
    const interval = setInterval(refreshUser, 10000);
    return () => clearInterval(interval);
  }, [refreshUser]);

  const handleLogout = () => { logout(); navigate('/'); };

  const status = user?.status || 'pending';

  return (
    <div className="pending-page" id="pending-page">
      <div className="pending-card animate-scale-in">
        <img src="/netLogo.jpeg" alt="NET PLUS ENTERPRISES" style={{ width:64, borderRadius:12, marginBottom:'1.5rem' }} />

        {status === 'pending' && (
          <>
            <div className="pending-icon pending"><Clock size={48} /></div>
            <h2>Registration Under Review</h2>
            <p>
              Your medical shop <strong>"{user?.storeName}"</strong> registration has been received.
              Our team is reviewing your drug licence and submitted documents.
            </p>
            <div className="pending-timeline">
              <div className="pt-item done"><span>✅</span> Registration submitted</div>
              <div className="pt-item done"><span>✅</span> Documents received</div>
              <div className="pt-item current"><span>🔍</span> Under verification (1–2 business days)</div>
              <div className="pt-item"><span>📧</span> Approval email will be sent</div>
              <div className="pt-item"><span>🔓</span> Portal access granted</div>
            </div>
          </>
        )}

        {status === 'rejected' && (
          <>
            <div className="pending-icon rejected"><XCircle size={48} /></div>
            <h2>Registration Not Approved</h2>
            <p>
              Unfortunately, your registration for <strong>"{user?.storeName}"</strong> was not approved.
              This may be due to incomplete or unclear documents, or an invalid drug licence.
            </p>
            <div className="pending-contact">
              <p style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.75rem' }}>
                Please contact us to resolve this:
              </p>
              <a href={`tel:${COMPANY.phone}`} className="contact-chip"><Phone size={14} /> {COMPANY.phone}</a>
              <a href={`mailto:${COMPANY.email}`} className="contact-chip"><Mail size={14} /> {COMPANY.email}</a>
            </div>
          </>
        )}

        {status === 'approved' && (
          <>
            <div className="pending-icon approved"><CheckCircle size={48} /></div>
            <h2>Account Approved!</h2>
            <p>Your medical shop has been verified. You can now access the wholesale portal.</p>
            <Link to="/portal" className="btn btn-primary btn-lg" id="pending-goto-portal-btn">
              Go to Retailer Portal
            </Link>
          </>
        )}

        <div className="pending-footer">
          <span>Registered as: <strong>{user?.email}</strong></span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="pending-logout-btn">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      <style>{`
        .pending-page { min-height:100vh; background:linear-gradient(135deg,#1A1250 0%,#2D2D75 40%,#3B3B9E 100%); display:flex; align-items:center; justify-content:center; padding:2rem; }
        .pending-card { background:#fff; border-radius:var(--radius-xl); padding:3rem; max-width:520px; width:100%; text-align:center; box-shadow:var(--shadow-xl); }
        .pending-icon { margin-bottom:1.25rem; }
        .pending-icon.pending  { color:var(--accent); }
        .pending-icon.approved { color:var(--green); }
        .pending-icon.rejected { color:var(--red); }
        .pending-card h2 { color:var(--navy); margin-bottom:.75rem; font-size:1.5rem; }
        .pending-card p  { color:var(--gray-500); line-height:1.7; margin-bottom:1.5rem; }
        .pending-timeline { display:flex; flex-direction:column; gap:.6rem; background:var(--gray-50); border-radius:var(--radius-lg); padding:1.25rem; text-align:left; margin-bottom:1.5rem; }
        .pt-item { display:flex; align-items:center; gap:.65rem; font-size:.88rem; color:var(--gray-400); }
        .pt-item.done    { color:var(--gray-700); }
        .pt-item.current { color:var(--navy); font-weight:600; }
        .pending-contact { display:flex; flex-direction:column; gap:.6rem; margin-bottom:1.5rem; }
        .contact-chip { display:inline-flex; align-items:center; gap:.5rem; background:var(--gray-50); border:1.5px solid var(--gray-100); border-radius:var(--radius-full); padding:.5rem 1rem; font-size:.88rem; color:var(--navy); text-decoration:none; }
        .contact-chip:hover { border-color:var(--teal); color:var(--teal); }
        .pending-footer { display:flex; align-items:center; justify-content:space-between; margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--gray-100); font-size:.82rem; color:var(--gray-400); flex-wrap:wrap; gap:.75rem; }
      `}</style>
    </div>
  );
}
