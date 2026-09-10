import React, { useState, useEffect } from 'react';
import { Search, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { apiGetOrders, apiUpdateOrderStatus } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');

  const reload = async () => {
    const data = await apiGetOrders();
    setOrders(data || []);
  };

  useEffect(() => {
    reload();
  }, []);

  const handleStatus = async (id, status) => {
    await apiUpdateOrderStatus(id, status);
    addToast(`Order updated to "${status}"`, status === 'approved' ? 'success' : 'warning');
    reload();
  };

  const filtered = orders.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.productName?.toLowerCase().includes(q) || e.userName?.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || e.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="portal-layout" id="admin-orders">
      <PortalSidebar title="Orders" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h4 style={{ color:'var(--navy)', fontFamily:'var(--font-display)' }}>Retailer Orders</h4>
            <p style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>{orders.length} total orders</p>
          </div>
        </div>
        <div className="portal-content">
          <div style={{ display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap', marginBottom:'1.5rem' }}>
            <div className="search-bar" style={{ flex:1, maxWidth:'360px' }}>
              <Search size={16} style={{ color:'var(--gray-400)' }} />
              <input id="admin-enq-search" placeholder="Search product or retailer..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--gray-400)' }} onClick={()=>setSearch('')}><X size={14}/></button>}
            </div>
            <div className="filter-chips">
              {[
                { val:'all',      label:'All' },
                { val:'pending',  label:'⏳ Pending' },
                { val:'approved', label:'✅ Approved' },
                { val:'completed',label:'📦 Completed' },
                { val:'rejected', label:'❌ Rejected' },
              ].map(f => (
                <button key={f.val} className={`chip${filter===f.val?' active':''}`}
                  onClick={() => setFilter(f.val)} id={`enq-filter-${f.val}`}>{f.label}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'var(--gray-400)' }}>
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Retailer</th>
                    <th>Product</th>
                    <th>Manufacturer</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight:700, color:'var(--navy)', fontSize:'.82rem' }}>{e.id}</td>
                      <td style={{ fontWeight:600 }}>{e.userName}</td>
                      <td>{e.productName}</td>
                      <td style={{ color:'var(--gray-500)', fontSize:'.82rem' }}>{e.manufacturer}</td>
                      <td style={{ color:'var(--teal)', fontWeight:800 }}>₹{Number(e.unitPrice).toFixed(2)}</td>
                      <td>{e.quantity} {e.unit}</td>
                      <td>
                        <span className={`badge badge-${
                          e.status==='approved' ? 'success' :
                          e.status==='completed' ? 'info' :
                          e.status==='pending' ? 'warning' : 'danger'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>
                        {new Date(e.submittedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'.35rem' }}>
                          {e.status === 'pending' && (
                            <>
                              <button className="btn btn-primary btn-sm" title="Approve"
                                onClick={() => handleStatus(e.id,'approved')} id={`approve-enq-${e.id}`}>
                                <CheckCircle size={13} />
                              </button>
                              <button className="btn btn-danger btn-sm" title="Reject"
                                onClick={() => handleStatus(e.id,'rejected')} id={`reject-enq-${e.id}`}>
                                <XCircle size={13} />
                              </button>
                            </>
                          )}
                          {e.status === 'approved' && (
                            <button className="btn btn-success btn-sm" title="Mark Completed" style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }}
                              onClick={() => handleStatus(e.id,'completed')} id={`complete-enq-${e.id}`}>
                              <CheckCircle size={13} />
                            </button>
                          )}
                          {e.status !== 'pending' && (
                            <button className="btn btn-ghost btn-sm" title="Mark Pending"
                              onClick={() => handleStatus(e.id,'pending')} id={`pending-enq-${e.id}`}>
                              <Clock size={13} />
                            </button>
                          )}
                        </div>
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
