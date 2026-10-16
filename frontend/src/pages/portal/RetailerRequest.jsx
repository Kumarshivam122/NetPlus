import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, ShieldCheck, Clock, PhoneCall } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiSubmitMedicineRequest } from '../../services/api';

export default function RetailerRequest() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    medicineName: '',
    email: user?.email || '',
    phone: user?.phone || '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.email || '',
        phone: prev.phone || (user.phone ? user.phone.replace(/\D/g, '').slice(-10) : '')
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      addToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        medicineName: formData.medicineName.trim(),
        email: formData.email.trim(),
        phone: cleanPhone,
        notes: formData.notes.trim(),
        userId: user?.id || user?._id || null,
        userName: user?.ownerName || user?.name || null,
        pharmacyName: user?.storeName || null,
        dlNumber: user?.dlNumber || null
      };

      const res = await apiSubmitMedicineRequest(payload);
      
      if (res && res.success !== false) {
        addToast('Medicine request submitted successfully! Notified administration team.', 'success');
        setFormData({ ...formData, medicineName: '', notes: '' });
        setSubmittedSuccess(true);
      } else {
        addToast(res?.message || 'Failed to submit request', 'error');
      }
    } catch (error) {
      console.error('Request submission error:', error);
      addToast(error.message || 'Error submitting request. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-layout" id="retailer-request">
      <PortalSidebar title="Request Medicine" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h1 style={{ color:'var(--navy)', fontSize:'1.2rem', fontWeight: 700 }}>Procurement Query Portal</h1>
            <p style={{ fontSize:'.9rem', color:'var(--gray-500)' }}>Request non-listed medicines, injections, or bulk formulations directly</p>
          </div>
        </div>
        <div className="portal-content">
          <div className="card" style={{ maxWidth: '640px', margin: '0 auto', padding: '2.25rem', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1.25rem' }}>
              <div style={{ padding: '0.85rem', background: '#ecfdf5', borderRadius: '12px', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
                <MessageSquare size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--navy)', fontWeight: 700, margin: 0 }}>Request a Medicine</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', margin: '3px 0 0' }}>
                  Our central procurement depot in Dhanbad sources requested items within 24–48 hours.
                </p>
              </div>
            </div>

            {submittedSuccess && (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>Request Logged in System & Dispatched to Admin!</div>
                  <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: '2px' }}>
                    An alert was transmitted to the NetPlus admin team and registered on your merchant account.
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="req-medicine" style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  Medicine Name & Dosage Details *
                </label>
                <input
                  id="req-medicine"
                  type="text"
                  className="form-control" 
                  required 
                  placeholder="e.g. Augmentin 625 Duo, Monocef 1g, Pan-D (10 boxes)"
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                />
              </div>

              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="req-email" style={{ fontWeight: 600, color: 'var(--navy)' }}>
                    Email Address *
                  </label>
                  <input
                    id="req-email"
                    type="email"
                    className="form-control" 
                    required 
                    placeholder="pharmacy@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="req-phone" style={{ fontWeight: 600, color: 'var(--navy)' }}>
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="req-phone"
                    type="text"
                    className="form-control" 
                    required 
                    maxLength="10"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                  <small style={{ color: 'var(--gray-500)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    Used by dispatch manager for quote & availability
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="req-notes" style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  Additional Notes / Specific Manufacturer (Optional)
                </label>
                <textarea
                  id="req-notes"
                  className="form-control" 
                  rows="3" 
                  placeholder="e.g. Preferred brand: Cipla / Alkem, required by Monday, bulk discount inquiry..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                <Clock size={16} color="var(--teal)" style={{ flexShrink: 0 }} />
                <span>Submitted requests immediately display in the Admin Depot Panel and trigger an automated email notice.</span>
              </div>

              <button 
                type="submit" 
                className="btn btn-cta btn-lg"
                disabled={submitting}
                style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', fontWeight: 700 }}
                id="submit-medicine-req-btn"
              >
                {submitting ? 'Submitting...' : <><Send size={18} aria-hidden="true" /> Submit Medicine Request</>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
