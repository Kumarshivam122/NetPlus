import React, { useState, useEffect } from 'react';
import { Search, X, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { apiGetOrders, apiUpdateOrderStatus } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminOrders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    const matchSearch = !q || e.userName?.toLowerCase().includes(q) || (e.items && e.items.some(item => item.productName?.toLowerCase().includes(q)));
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
                { val:'delivered',label:'📦 Delivered' },
                { val:'rejected', label:'❌ Rejected' },
                { val:'cancelled',label:'🚫 Cancelled' },
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
                    <th>Product / Items</th>
                    <th>Manufacturer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => {
                    const items = e.items || [{ productName: e.productName, manufacturer: e.manufacturer, unitPrice: e.unitPrice, quantity: e.quantity, unit: e.unit, price: e.unitPrice }];
                    const firstItem = items[0] || {};
                    const totalAmt = e.totalAmount || items.reduce((acc, item) => acc + (Number(item.price || item.unitPrice || 0) * Number(item.quantity || 0)), 0);

                    return (
                    <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(e)}>
                      <td style={{ fontWeight:700, color:'var(--navy)', fontSize:'.82rem' }}>{e.id}</td>
                      <td style={{ fontWeight:600 }}>{e.userName}</td>
                      <td>
                        <div style={{ fontWeight:600, color:'var(--navy)' }}>
                          {firstItem.productName}
                          {items.length > 1 && <span style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginLeft: '.4rem' }}>(+{items.length - 1} more)</span>}
                        </div>
                      </td>
                      <td style={{ color:'var(--gray-500)', fontSize:'.82rem' }}>{firstItem.manufacturer || e.manufacturer || 'Multiple'}</td>
                      <td style={{ fontWeight:700 }}>₹{Number(totalAmt).toFixed(2)}</td>
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
                      <td style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>
                        {new Date(e.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'.35rem' }} onClick={(ev) => ev.stopPropagation()}>
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
                            <button className="btn btn-success btn-sm" title="Mark Delivered" style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }}
                              onClick={() => handleStatus(e.id,'delivered')} id={`complete-enq-${e.id}`}>
                              <CheckCircle size={13} />
                            </button>
                          )}

                          {e.status !== 'pending' && e.status !== 'cancelled' && e.status !== 'returned' && e.status !== 'refunded' && (
                            <button className="btn btn-ghost btn-sm" title="Mark Pending"
                              onClick={() => handleStatus(e.id,'pending')} id={`pending-enq-${e.id}`}>
                              <Clock size={13} />
                            </button>
                          )}
                          {e.status === 'approved' && (
                            <button className="btn btn-danger btn-sm" title="Cancel Order"
                              onClick={() => {
                                if (window.confirm("Cancel this order?")) handleStatus(e.id,'cancelled');
                              }} id={`cancel-enq-${e.id}`}>
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
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

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth:'600px' }}>
            <div className="modal-header">
              <div>
                <h4 style={{ color:'var(--navy)' }}>Order Details</h4>
                <p style={{ fontSize:'.82rem', color:'var(--gray-400)', marginTop:'.2rem' }}>{selectedOrder.orderId}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.5rem' }}>
                <div>
                  <div style={{ fontSize:'.75rem', color:'var(--gray-400)', marginBottom:'.2rem' }}>Retailer</div>
                  <div style={{ fontWeight:700, color:'var(--navy)' }}>{selectedOrder.userName}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'.75rem', color:'var(--gray-400)', marginBottom:'.2rem' }}>Status</div>
                  <span className={`badge badge-${
                    selectedOrder.status==='approved' ? 'success' :
                    selectedOrder.status==='delivered' ? 'info' :
                    selectedOrder.status==='completed' ? 'info' :
                    selectedOrder.status==='pending' ? 'warning' :
                    selectedOrder.status==='returned' ? 'warning' :
                    selectedOrder.status==='refunded' ? 'success' : 'danger'
                  }`}>{selectedOrder.status.toUpperCase()}</span>
                </div>
              </div>

              {selectedOrder.note && (
                <div style={{ marginBottom: '1.5rem', background:'var(--gray-50)', padding:'.75rem', borderRadius:'var(--radius-md)' }}>
                  <div style={{ fontSize:'.75rem', color:'var(--gray-400)', marginBottom:'.2rem' }}>Order Note</div>
                  <div style={{ fontSize:'.85rem', color:'var(--navy)' }}>{selectedOrder.note}</div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ fontSize:'.9rem', color:'var(--navy)', marginBottom:'.5rem' }}>Items</h5>
                <div style={{ background:'var(--gray-50)', borderRadius:'var(--radius-md)', padding:'.75rem' }}>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} style={{ display:'flex', justifyContent:'space-between', padding:'.5rem 0', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--gray-200)' : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize:'.85rem' }}>{item.productName}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>{item.quantity} {item.unit} × ₹{item.price.toFixed(2)}</div>
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize:'.85rem' }}>
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', padding:'.75rem 1rem', background:'rgba(13,148,136,0.05)', borderRadius:'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color:'var(--navy)' }}>Total Amount</div>
                <div style={{ fontWeight: 800, color:'var(--teal)', fontSize:'1.1rem' }}>
                  ₹{(selectedOrder.totalAmount || (selectedOrder.items || []).reduce((acc, item) => acc + (item.quantity * item.price), 0)).toFixed(2)}
                </div>
              </div>
              
              {selectedOrder.status === 'approved' && (
                <div style={{ marginTop: '1.5rem', textAlign: 'right', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} 
                    onClick={() => {
                      if(window.confirm("Are you sure you want to cancel this order?")) {
                        handleStatus(selectedOrder.id, 'cancelled');
                        setSelectedOrder(null);
                      }
                    }}>
                    <XCircle size={15} /> Cancel Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
