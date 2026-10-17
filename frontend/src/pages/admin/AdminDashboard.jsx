import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ClipboardList, Clock, CheckCircle, XCircle, TrendingUp, UserCheck, MessageSquare } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import { useAuth } from '../../context/AuthContext';
import { useAdminNotifications } from '../../context/AdminNotificationContext';
import { apiGetAllUsers, apiGetOrders, apiGetProducts, apiGetEnquiries } from '../../services/api';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../../data/store';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { pendingOrdersCount, pendingVerificationsCount, pendingEnquiriesCount } = useAdminNotifications();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalProducts, setTotalProducts] = useState(FALLBACK_PRODUCTS.length);
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    let active = true;
    apiGetAllUsers().then(res => {
      if (active && res) {
        setUsers(res.filter(u => u.role !== 'admin'));
      }
    });
    apiGetOrders().then(res => {
      if (active && res) setOrders(res);
    });
    apiGetProducts().then(res => {
      if (active && res) setTotalProducts(res.length);
    });
    apiGetEnquiries().then(res => {
      if (active && res) setEnquiries(Array.isArray(res) ? res : []);
    });
    return () => { active = false; };
  }, []);

  const pending  = users.filter(u => u.status === 'pending' || u.status === 'onboarding').length;
  const approved = users.filter(u => u.status === 'approved').length;
  const rejected = users.filter(u => u.status === 'rejected').length;

  const safeOrders = Array.isArray(orders) ? orders : [];
  const pendingEnq = safeOrders.filter(e => e && e.status === 'pending').length;
  const activeEnquiriesCount = pendingEnquiriesCount || enquiries.filter(e => !e.status || e.status === 'pending').length;

  const recentRegistrations = [...users].reverse().slice(0, 5);

  const productDemand = {};
  safeOrders.forEach(order => {
    if (!order) return;
    const items = Array.isArray(order.items) ? order.items : (order.productName ? [{ productName: order.productName, quantity: order.quantity }] : []);
    items.forEach(item => {
      if (item && item.productName) {
        if (!productDemand[item.productName]) productDemand[item.productName] = 0;
        productDemand[item.productName] += Number(item.quantity || 1);
      }
    });
  });

  const topProducts = Object.entries(productDemand)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="portal-layout" id="admin-dashboard">
      <PortalSidebar title="Admin Panel" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h1 style={{ color:'var(--navy)', fontSize:'1.2rem' }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize:'0.9rem', color:'var(--gray-500)' }}>Welcome, {user?.name}</p>
          </div>
          <div style={{ display:'flex', gap:'.75rem', alignItems:'center' }}>
            <AdminNotificationBell />
            {(pendingVerificationsCount > 0 || pending > 0) && (
              <Link to="/admin/verifications" className="badge badge-warning" id="pending-badge" style={{ textDecoration:'none', cursor:'pointer' }}>
                <Clock size={14} aria-hidden="true" /> {pendingVerificationsCount || pending} pending approval{(pendingVerificationsCount || pending)>1?'s':''}
              </Link>
            )}
            {activeEnquiriesCount > 0 && (
              <Link to="/admin/enquiries" className="badge badge-accent" id="pending-enquiries-badge" style={{ textDecoration:'none', cursor:'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MessageSquare size={14} aria-hidden="true" /> {activeEnquiriesCount} new request{activeEnquiriesCount>1?'s':''}
              </Link>
            )}
            <span className="badge badge-primary">Admin</span>
          </div>
        </div>

        <div className="portal-content">
          {/* Stats */}
          <div className="grid grid-4" style={{ marginBottom:'2rem' }}>
            {[
              { icon:Users,         label:'Total Retailers',  value:users.length,  color:'teal' },
              { icon:UserCheck,     label:'Approved',          value:approved,       color:'green' },
              { icon:Clock,         label:'Pending Review',    value:pendingVerificationsCount || pending, color:'accent' },
              { icon:ClipboardList, label:'Pending Orders',    value:pendingOrdersCount || pendingEnq,     color:'navy' },
            ].map((s,i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="stat-card">
                  <div className={`stat-icon ${s.color}`} aria-hidden="true"><Icon size={22} /></div>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overview Row */}
          <div className="grid grid-3" style={{ gap:'1.5rem', marginBottom:'2rem' }}>
            <div className="card" style={{ padding:'1.5rem', gridColumn:'span 2' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
                <h4 style={{ color:'var(--navy)' }}>Recent Registrations</h4>
                <Link to="/admin/users" style={{ fontSize:'0.875rem', color:'var(--teal)', fontWeight:600 }}>View All</Link>
              </div>
              {recentRegistrations.length === 0 ? (
                <p style={{ color:'var(--gray-400)', textAlign:'center', padding:'2rem' }}>No retailers registered yet.</p>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Store Name</th><th>Owner</th><th>City</th><th>Status</th><th>Registered</th></tr></thead>
                  <tbody>
                    {recentRegistrations.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight:600, color:'var(--navy)' }}>{u.storeName}</td>
                        <td>{u.ownerName}</td>
                        <td>{u.city}</td>
                        <td>
                          <span className={`badge badge-${u.status==='approved'?'success':u.status==='pending'?'warning':'danger'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ fontSize:'0.875rem', color:'var(--gray-400)' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card" style={{ padding:'1.5rem' }}>
              <h4 style={{ color:'var(--navy)', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                <TrendingUp size={16} style={{ color:'var(--teal)' }} /> Quick Stats
              </h4>
              {[
                { label:'Total Products',  value:totalProducts,    color:'var(--teal)' },
                { label:'Total Orders', value:orders.length,   color:'var(--navy)' },
                { label:'Pending Orders', value:pendingEnq,       color:'var(--accent)' },
                { label:'Enquiries / Requests', value:pendingEnquiriesCount, color:'var(--teal)' },
                { label:'Rejected Users',  value:rejected,           color:'var(--red)' },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'.6rem 0', borderBottom:'1px solid var(--gray-100)' }}>
                  <span style={{ fontSize:'.85rem', color:'var(--gray-500)' }}>{s.label}</span>
                  <span style={{ fontSize:'.95rem', fontWeight:800, color:s.color, fontFamily:'var(--font-display)' }}>{s.value}</span>
                </div>
              ))}
              <div style={{ marginTop:'1.25rem', display:'flex', flexDirection:'column', gap:'.6rem' }}>
                <Link to="/admin/users"     className="btn btn-primary btn-sm" style={{ justifyContent:'center' }} id="admin-dash-users">Manage Retailers</Link>
                <Link to="/admin/orders" className="btn btn-outline btn-sm"  style={{ justifyContent:'center' }} id="admin-dash-enq">View Orders</Link>
                <Link to="/admin/enquiries" className="btn btn-outline btn-sm"  style={{ justifyContent:'center' }} id="admin-dash-enquiries">Enquiries & Requests</Link>
              </div>
            </div>
          </div>

          {/* Top Products Row */}
          <div className="grid grid-3" style={{ gap:'1.5rem', marginBottom:'2rem' }}>
            <div className="card" style={{ padding:'1.5rem', gridColumn:'span 3' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
                <h4 style={{ color:'var(--navy)' }}>Most Demanded Products</h4>
                <Package size={16} style={{ color:'var(--teal)' }} />
              </div>
              {topProducts.length === 0 ? (
                <p style={{ color:'var(--gray-400)', textAlign:'center', padding:'2rem' }}>No orders yet.</p>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Product Name</th><th>Total Quantity Ordered</th></tr></thead>
                  <tbody>
                    {topProducts.map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight:600, color:'var(--navy)' }}>
                          <span style={{ display:'inline-block', minWidth:'26px', marginRight:'6px', color:'var(--gray-500)', fontWeight:700 }}>{idx + 1}.</span>
                          
                          
                          {p.name}
                        </td>
                        <td style={{ fontWeight:800, color:'var(--teal)', fontFamily:'var(--font-display)' }}>{p.qty} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
