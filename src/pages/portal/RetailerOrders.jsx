import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, PackageCheck } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { useAuth } from '../../context/AuthContext';
import { apiGetRetailerOrders } from '../../services/api';

const STATUS_MAP = {
  pending:  { icon: <Clock size={14} />,         cls: 'warning', label: 'Pending' },
  approved: { icon: <CheckCircle size={14} />,   cls: 'success', label: 'Approved' },
  completed:{ icon: <PackageCheck size={14} />,  cls: 'info',    label: 'Completed' },
  rejected: { icon: <XCircle size={14} />,       cls: 'danger',  label: 'Rejected' },
};

export default function RetailerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (user?.id) {
      apiGetRetailerOrders(user.id).then(res => {
        if (active) {
          setOrders(res || []);
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
    return () => { active = false; };
  }, [user?.id]);

  return (
    <div className="portal-layout" id="retailer-orders">
      <PortalSidebar title="My Orders" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h4 style={{ color:'var(--navy)', fontFamily:'var(--font-display)' }}>My Orders</h4>
            <p style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>{orders.length} total orders</p>
          </div>
        </div>
        <div className="portal-content">
          {orders.length === 0 ? (
            <div style={{ textAlign:'center', padding:'5rem', color:'var(--gray-400)' }}>
              <ClipboardList size={56} style={{ opacity:.2, marginBottom:'1rem' }} />
              <h3 style={{ color:'var(--gray-300)' }}>No Orders Yet</h3>
              <p>Browse the product catalog and submit your first order.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Manufacturer</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(e => {
                    const s = STATUS_MAP[e.status] || STATUS_MAP.pending;
                    return (
                      <tr key={e.id}>
                        <td style={{ fontWeight:700, color:'var(--navy)', fontFamily:'var(--font-display)' }}>{e.id}</td>
                        <td>
                          <div style={{ fontWeight:600, color:'var(--navy)' }}>{e.productName}</div>
                        </td>
                        <td style={{ color:'var(--gray-500)' }}>{e.manufacturer}</td>
                        <td style={{ color:'var(--teal)', fontWeight:700 }}>₹{Number(e.unitPrice).toFixed(2)}</td>
                        <td>{e.quantity} {e.unit}</td>
                        <td>
                          <span className={`badge badge-${s.cls}`}>{s.icon} {s.label}</span>
                        </td>
                        <td style={{ fontSize:'.8rem', color:'var(--gray-400)' }}>
                          {new Date(e.submittedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
