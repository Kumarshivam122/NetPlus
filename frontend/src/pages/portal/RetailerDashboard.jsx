import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ClipboardList, Clock, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { useAuth } from '../../context/AuthContext';
import { apiGetRetailerOrders, apiGetProducts } from '../../services/api';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../../data/store';

export default function RetailerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [totalProducts, setTotalProducts] = useState(FALLBACK_PRODUCTS.length);

  useEffect(() => {
    let active = true;
    if (user?.id) {
      apiGetRetailerOrders(user.id).then(res => {
        if (active && res) setOrders(res);
      });
    }
    apiGetProducts().then(res => {
      if (active && res) setTotalProducts(res.length);
    });
    return () => { active = false; };
  }, [user?.id]);

  const pending   = orders.filter(e => e.status === 'pending').length;
  const approved  = orders.filter(e => e.status === 'approved').length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="portal-layout" id="retailer-dashboard">
      <PortalSidebar title="Retailer Portal" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h4 style={{ color:'var(--navy)', fontFamily:'var(--font-display)', marginBottom:'2px' }}>
              Welcome, {user?.storeName || user?.ownerName}! 👋
            </h4>
            <p style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>Your NET PLUS wholesale portal</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <span className="badge badge-success"><span className="status-dot online" /> Account Active</span>
            <Link to="/portal/products" className="btn btn-primary btn-sm" id="topbar-browse-btn">
              Browse Products <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="portal-content">
          {/* Stats */}
          <div className="grid grid-4" style={{ marginBottom:'2rem' }}>
            {[
              { icon: Package, label: 'Total Products', value: totalProducts + '+', color: 'teal' },
              { icon: ClipboardList, label: 'My Orders', value: orders.length, color: 'navy' },
              { icon: Clock, label: 'Pending', value: pending, color: 'accent' },
              { icon: CheckCircle, label: 'Approved', value: approved, color: 'green' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="stat-card animate-fade-up" style={{ animationDelay:`${i*0.1}s` }}>
                  <div className={`stat-icon ${s.color}`}><Icon size={22} /></div>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Account Info */}
          <div className="grid grid-2" style={{ marginBottom:'2rem', gap:'1.5rem' }}>
            <div className="card" style={{ padding:'1.5rem' }}>
              <h4 style={{ color:'var(--navy)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                🏪 Your Store Details
              </h4>
              {[
                ['Store Name',  user?.storeName],
                ['Licence No',  user?.licenceNo],
                ['Owner',       user?.ownerName],
                ['Phone',       user?.phone],
                ['Email',       user?.email],
                ['Address',     `${user?.storeAddress}, ${user?.city} – ${user?.pincode}`],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'.45rem 0', borderBottom:'1px solid var(--gray-100)', fontSize:'.85rem' }}>
                  <span style={{ color:'var(--gray-400)', fontWeight:500 }}>{k}</span>
                  <span style={{ color:'var(--navy)', fontWeight:600, maxWidth:'55%', textAlign:'right', wordBreak:'break-word' }}>{v || '—'}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding:'1.5rem' }}>
              <h4 style={{ color:'var(--navy)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                <TrendingUp size={18} style={{ color:'var(--teal)' }} /> Quick Actions
              </h4>
              <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                <Link to="/portal/products" className="btn btn-primary" id="dash-browse-btn" style={{ justifyContent:'center' }}>
                  <Package size={16} /> Browse Wholesale Catalog
                </Link>
                <Link to="/portal/orders" className="btn btn-outline" id="dash-orders-btn" style={{ justifyContent:'center' }}>
                  <ClipboardList size={16} /> View My Orders
                </Link>
              </div>
              <div className="info-notice" style={{ marginTop:'1rem', borderRadius:'var(--radius-md)', padding:'.85rem', fontSize:'.82rem', color:'var(--gray-500)', background:'rgba(0,184,169,.07)', border:'1px solid rgba(0,184,169,.15)', display:'flex', gap:'.5rem' }}>
                <span>💡</span>
                <span>Search by product name, generic name, or manufacturer. Place orders for bulk orders.</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h4 style={{ color:'var(--navy)' }}>Recent Orders</h4>
              <Link to="/portal/orders" style={{ fontSize:'.82rem', color:'var(--teal)', fontWeight:600 }}>View All</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div style={{ padding:'3rem', textAlign:'center', color:'var(--gray-400)' }}>
                <ClipboardList size={40} style={{ opacity:.3, marginBottom:'.75rem' }} />
                <p>No orders yet. <Link to="/portal/products" style={{ color:'var(--teal)' }}>Browse products</Link> to place your first order.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ boxShadow:'none' }}>
                <table className="data-table">
                  <thead><tr><th>Order ID</th><th>Product</th><th>Qty</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {recentOrders.map(e => {
                      const items = e.items || [{ productName: e.productName, quantity: e.quantity, unit: e.unit }];
                      const firstItem = items[0] || {};
                      return (
                        <tr key={e.id}>
                          <td style={{ fontWeight:600, color:'var(--navy)' }}>{e.id}</td>
                          <td>
                            {firstItem.productName}
                            {items.length > 1 && <span style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginLeft: '.4rem' }}>(+{items.length - 1} more)</span>}
                          </td>
                          <td>
                            {firstItem.quantity} {firstItem.unit}
                          </td>
                          <td>
                            <span className={`badge badge-${
                              e.status==='approved' ? 'success' :
                              e.status==='delivered' ? 'info' :
                              e.status==='completed' ? 'info' :
                              e.status==='pending' ? 'warning' :
                              e.status==='returned' ? 'warning' :
                              e.status==='refunded' ? 'success' : 'danger'
                            }`}>
                              {e.status}
                            </span>
                          </td>
                          <td style={{ fontSize:'.8rem' }}>{new Date(e.createdAt || e.submittedAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
