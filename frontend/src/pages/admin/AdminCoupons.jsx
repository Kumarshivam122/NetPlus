import React, { useState, useEffect } from 'react';
import { Tag, Plus, Check, X, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { apiGetCoupons, apiCreateCoupon, apiUpdateCoupon, apiDeleteCoupon } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminCoupons() {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercentage: 10, isActive: true, isVisible: true });

  const loadCoupons = async () => {
    setLoading(true);
    const data = await apiGetCoupons();
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return addToast('Coupon code is required', 'danger');
    
    const created = await apiCreateCoupon(newCoupon);
    if (created && !created.message) {
      addToast('Coupon created successfully', 'success');
      setShowAddForm(false);
      setNewCoupon({ code: '', discountPercentage: 10, isActive: true, isVisible: true });
      loadCoupons();
    } else {
      addToast(created?.message || 'Failed to create coupon', 'danger');
    }
  };

  const handleToggle = async (coupon, field) => {
    const updated = await apiUpdateCoupon(coupon.id, { [field]: !coupon[field] });
    if (updated) {
      addToast(`Coupon updated`, 'success');
      setCoupons(coupons.map(c => c.id === coupon.id ? updated : c));
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon ${code}? This cannot be undone.`)) return;
    const success = await apiDeleteCoupon(id);
    if (success) {
      addToast('Coupon deleted', 'info');
      setCoupons(coupons.filter(c => c.id !== id));
    }
  };

  return (
    <div className="portal-layout" id="admin-coupons">
      <PortalSidebar title="Coupons" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h4 style={{ color:'var(--navy)', fontFamily:'var(--font-display)' }}>Coupon Management</h4>
            <p style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>Manage discounts available to retailers</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> New Coupon
          </button>
        </div>
        
        <div className="portal-content">
          {showAddForm && (
            <div className="form-card" style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h5 style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '.5rem' }}><Tag size={18} /> Create New Coupon</h5>
                <button onClick={() => setShowAddForm(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={18} color="var(--gray-400)" /></button>
              </div>
              <form onSubmit={handleAddCoupon} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input type="text" className="input" placeholder="e.g. SUMMER20" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} required />
                </div>
                <div className="form-group">
                  <label>Discount Percentage (%)</label>
                  <input type="number" className="input" min="1" max="100" value={newCoupon.discountPercentage} onChange={e => setNewCoupon({...newCoupon, discountPercentage: parseFloat(e.target.value)})} required />
                </div>
                <div className="form-group" style={{ display: 'flex', gap: '1.5rem', marginBottom: '.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newCoupon.isActive} onChange={e => setNewCoupon({...newCoupon, isActive: e.target.checked})} />
                    <span style={{ fontSize: '.85rem', color: 'var(--navy)' }}>Active</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newCoupon.isVisible} onChange={e => setNewCoupon({...newCoupon, isVisible: e.target.checked})} />
                    <span style={{ fontSize: '.85rem', color: 'var(--navy)' }}>Visible to Retailers</span>
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 1.5rem' }}>
                  <Save size={16} /> Save Coupon
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'var(--gray-400)' }}>
              <Tag size={48} style={{ opacity:.2, marginBottom:'1rem' }} />
              <h3 style={{ color:'var(--gray-300)' }}>No Coupons Found</h3>
              <p>Create a coupon to start offering discounts to your retailers.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Coupon Code</th>
                    <th>Discount</th>
                    <th>Status (Can be used)</th>
                    <th>Visibility (Advertised in Cart)</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight:700, color:'var(--navy)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <Tag size={14} style={{ color: 'var(--teal)' }} />
                          {c.code}
                        </div>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--teal)' }}>{c.discountPercentage}% OFF</td>
                      <td>
                        <button 
                          onClick={() => handleToggle(c, 'isActive')}
                          className={`badge badge-${c.isActive ? 'success' : 'danger'}`} 
                          style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}
                        >
                          {c.isActive ? <Check size={12}/> : <X size={12}/>} 
                          {c.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleToggle(c, 'isVisible')}
                          className={`badge badge-${c.isVisible ? 'info' : 'warning'}`} 
                          style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}
                        >
                          {c.isVisible ? <Eye size={12}/> : <EyeOff size={12}/>} 
                          {c.isVisible ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td style={{ fontSize:'.8rem', color:'var(--gray-400)' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--red)' }} onClick={() => handleDelete(c.id, c.code)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
