import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, LogOut, Phone, Mail, Search, Unlock } from 'lucide-react';
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
            <div className="pending-icon pending" aria-hidden="true"><Clock size={48} /></div>
            <h1>Registration Under Review</h1>
            <p>
              Your medical shop <strong>"{user?.storeName}"</strong> registration has been received.
              Our team is reviewing your drug licence and submitted documents.
            </p>
            <div className="pending-timeline">
              <div className="pt-item done"><CheckCircle size={18} aria-hidden="true" /> Registration submitted</div>
              <div className="pt-item done"><CheckCircle size={18} aria-hidden="true" /> Documents received</div>
              <div className="pt-item current"><Search size={18} aria-hidden="true" /> Under verification (1–2 business days)</div>
              <div className="pt-item"><Mail size={18} aria-hidden="true" /> Approval email will be sent</div>
              <div className="pt-item"><Unlock size={18} aria-hidden="true" /> Portal access granted</div>
            </div>
          </>
        )}

        {status === 'rejected' && (
          <>
            <div className="pending-icon rejected" aria-hidden="true"><XCircle size={48} /></div>
            <h1>Registration Not Approved</h1>
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
            <div className="pending-icon approved" aria-hidden="true"><CheckCircle size={48} /></div>
            <h1>Account Approved!</h1>
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
        .pending-page { min-height:100vh; background:var(--off-white); display:flex; align-items:center; justify-content:center; padding:2rem 1rem; }
        .pending-card { background:#fff; border-radius:var(--radius-lg); padding:2.5rem; max-width:540px; width:100%; text-align:center; border:1px solid var(--gray-200); }
        .pending-icon { margin-bottom:1rem; }
        .pending-icon.pending  { color:var(--orange-dark); }
        .pending-icon.approved { color:var(--green); }
        .pending-icon.rejected { color:var(--red); }
        .pending-card h1 { color:var(--navy); margin-bottom:.75rem; font-size:1.5rem; }
        .pending-card p  { color:var(--navy-light); line-height:1.7; margin-bottom:1.5rem; }
        .pending-timeline { display:flex; flex-direction:column; gap:.6rem; background:var(--off-white); border:1px solid var(--gray-200); border-radius:var(--radius-lg); padding:1.25rem; text-align:left; margin-bottom:1.5rem; }
        .pt-item { display:flex; align-items:center; gap:.65rem; font-size:.95rem; color:var(--gray-500); }
        .pt-item.done    { color:var(--gray-700); }
        .pt-item.done svg { color:var(--green); }
        .pt-item.current { color:var(--navy); font-weight:700; }
        .pending-contact { display:flex; flex-direction:column; gap:.6rem; margin-bottom:1.5rem; }
        .contact-chip { display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:44px; background:#fff; border:1px solid var(--gray-300); border-radius:var(--radius-lg); padding:.5rem 1rem; font-size:1rem; font-weight:600; color:var(--navy); text-decoration:none; }
        .contact-chip:hover { border-color:var(--teal); color:var(--teal-dark); background:var(--cyan); }
        .pending-footer { display:flex; align-items:center; justify-content:space-between; margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--gray-200); font-size:.9rem; color:var(--gray-500); flex-wrap:wrap; gap:.75rem; }
      `}</style>
    </div>
  );
}
