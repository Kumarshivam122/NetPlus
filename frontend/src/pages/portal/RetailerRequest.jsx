import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      addToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/queries/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        addToast('Medicine request submitted successfully! Our team will contact you soon.', 'success');
        setFormData({ ...formData, medicineName: '', notes: '' });
      } else {
        addToast(data.message || 'Failed to submit request', 'error');
      }
    } catch (error) {
      addToast('Error submitting request', 'error');
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
            <h4 style={{ color:'var(--navy)', fontFamily:'var(--font-display)' }}>Query Portal</h4>
            <p style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>Submit a request for medicines not found in our catalog</p>
          </div>
        </div>
        <div className="portal-content">
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(0, 184, 169, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--teal)' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--navy)' }}>Request a Medicine</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Fill out the form below to request a specific medicine.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Medicine Name & Details *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Paracetamol 500mg, 10 strips"
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                />
              </div>

              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    maxLength="10"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                  <small style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Must be exactly 10 digits
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Any specific brand, manufacturer, or quantity requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting}
                style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
              >
                {submitting ? 'Submitting...' : <><Send size={18} /> Submit Request</>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
