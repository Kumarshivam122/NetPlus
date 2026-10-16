import React, { useState, useEffect } from 'react';
import { Search, X, CheckCircle, XCircle, Clock, RotateCcw, Truck, PackageCheck, Trash2 } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { apiGetOrders, apiUpdateOrderStatus, apiClearAllOrders } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDeliveryDate, formatDeliveredDate, computeExpectedDelivery } from '../../data/store';

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

  const handleClearAllOrders = async () => {
    if (window.confirm("Are you sure you want to delete ALL orders? This cannot be undone and will reset the portal for a completely fresh start.")) {
      await apiClearAllOrders();
      setOrders([]);
      setSelectedOrder(null);
      addToast('All orders cleared for a fresh start', 'success');
    }
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
            <p style={{ fontSize:'0.875rem', color:'var(--gray-400)' }}>{orders.length} total orders</p>
          </div>
          {orders.length > 0 && (
            <button 
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--red)', borderColor: 'var(--red)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={handleClearAllOrders}
              id="clear-all-orders-btn"
            >
              <Trash2 size={14} /> Clear All Orders (Fresh Start)
            </button>
          )}
        </div>
        <div className="portal-content">
          <div style={{ display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap', marginBottom:'1.5rem' }}>
            <div className="search-bar" style={{ flex:1, maxWidth:'360px' }}>
              <Search size={16} style={{ color:'var(--gray-400)' }} />
              <input id="admin-enq-search" placeholder="Search product or retailer..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--gray-400)' }} aria-label="Clear search" onClick={()=>setSearch('')}><X size={16} aria-hidden="true"/></button>}
            </div>
            <div className="filter-chips">
              {[
                { val:'all',      label:'All' },
                { val:'pending',  label:'Pending' },
                { val:'approved', label:'Approved' },
                { val:'delivered',label:'Delivered' },
                { val:'rejected', label:'Rejected' },
                { val:'cancelled',label:'Cancelled' },
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
                    <th>Expected Delivery</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(filtered || []).map(e => {
                    if (!e) return null;
                    const items = Array.isArray(e.items) ? e.items : [{ productName: e.productName, manufacturer: e.manufacturer, unitPrice: e.unitPrice, quantity: e.quantity, unit: e.unit, price: e.unitPrice }];
                    const firstItem = items[0] || {};
                    const totalAmt = e.totalAmount || items.reduce((acc, item) => acc + (Number(item?.price || item?.unitPrice || 0) * Number(item?.quantity || 0)), 0);
                    const orderId = e.orderId || e.id;
                    const expectedDelivery = e.expectedDeliveryDate || computeExpectedDelivery(e.createdAt);

                    return (
                    <tr key={orderId} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(e)}>
                      <td style={{ fontWeight:700, color:'var(--navy)', fontSize:'0.875rem', whiteSpace:'nowrap', fontFamily: 'monospace' }}>{orderId}</td>
                      <td style={{ fontWeight:600 }}>{e.userName}</td>
                      <td>
                        <div style={{ fontWeight:600, color:'var(--navy)' }}>
                          {firstItem.productName}
                          {items.length > 1 && <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginLeft: '.4rem' }}>(+{items.length - 1} more)</span>}
                        </div>
                      </td>
                      <td style={{ color:'var(--gray-500)', fontSize:'0.875rem' }}>{firstItem.manufacturer || e.manufacturer || 'Multiple'}</td>
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
                      <td>
                        {e.status === 'delivered' || e.status === 'completed' ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 7px', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 700 }}>
                            <PackageCheck size={12} color="#059669" />
                            <span>Delivered: {formatDeliveredDate(e.deliveredAt || e.updatedAt || e.createdAt)}</span>
                          </div>
                        ) : (e.status === 'cancelled' || e.status === 'rejected') ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--red)', fontWeight: 600 }}>Cancelled</span>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 7px', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 600 }}>
                            <Truck size={12} color="#15803d" />
                            <span>Exp: {formatDeliveryDate(expectedDelivery)}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize:'0.875rem', color:'var(--gray-400)', whiteSpace: 'nowrap' }}>
                        {new Date(e.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'.35rem', flexWrap:'wrap' }} onClick={(ev) => ev.stopPropagation()}>
                          {e.status === 'pending' && (
                            <>
                              <button className="btn btn-primary btn-sm" title="Approve"
                                onClick={() => handleStatus(e.id,'approved')} id={`approve-enq-${e.id}`}>
                                <CheckCircle size={14} aria-hidden="true" /> Approve
                              </button>
                              <button className="btn btn-danger btn-sm" title="Reject"
                                onClick={() => handleStatus(e.id,'rejected')} id={`reject-enq-${e.id}`}>
                                <XCircle size={14} aria-hidden="true" /> Reject
                              </button>
                            </>
                          )}
                          {e.status === 'approved' && (
                            <button className="btn btn-success btn-sm" title="Mark Delivered" style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }}
                              onClick={() => handleStatus(e.id,'delivered')} id={`complete-enq-${e.id}`}>
                              <CheckCircle size={14} aria-hidden="true" /> Mark Delivered
                            </button>
                          )}

                          {e.status !== 'pending' && e.status !== 'cancelled' && e.status !== 'returned' && e.status !== 'refunded' && (
                            <button className="btn btn-ghost btn-sm" title="Mark Pending"
                              onClick={() => handleStatus(e.id,'pending')} id={`pending-enq-${e.id}`}>
                              <Clock size={14} aria-hidden="true" /> Mark Pending
                            </button>
                          )}
                          {e.status === 'approved' && (
                            <button className="btn btn-danger btn-sm" title="Cancel Order"
                              onClick={() => {
                                if (window.confirm("Cancel this order?")) handleStatus(e.id,'cancelled');
                              }} id={`cancel-enq-${e.id}`}>
                              <XCircle size={14} aria-hidden="true" /> Cancel
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
                <p style={{ fontSize:'0.875rem', color:'var(--gray-400)', marginTop:'.2rem' }}>{selectedOrder.orderId}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.5rem' }}>
                <div>
                  <div style={{ fontSize:'0.875rem', color:'var(--gray-400)', marginBottom:'.2rem' }}>Retailer</div>
                  <div style={{ fontWeight:700, color:'var(--navy)' }}>{selectedOrder.userName}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.875rem', color:'var(--gray-400)', marginBottom:'.2rem' }}>Status</div>
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

              {/* Delivery Status / Date Callout */}
              {selectedOrder.status === 'delivered' || selectedOrder.status === 'completed' ? (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <PackageCheck size={22} color="#059669" />
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Status</div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#065f46' }}>
                        Order Delivered on {formatDeliveredDate(selectedOrder.deliveredAt || selectedOrder.updatedAt || selectedOrder.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700, background: '#d1fae5', padding: '3px 8px', borderRadius: '4px' }}>
                    Delivered ✓
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={20} color="#15803d" />
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Expected Delivery Date</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#14532d' }}>
                        {formatDeliveryDate(selectedOrder.expectedDeliveryDate || computeExpectedDelivery(selectedOrder.createdAt))}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600, background: '#dcfce7', padding: '3px 8px', borderRadius: '4px' }}>
                    NetPlus 24–48h Fleet
                  </div>
                </div>
              )}

              {selectedOrder.note && (
                <div style={{ marginBottom: '1.5rem', background:'var(--gray-50)', padding:'.75rem', borderRadius:'var(--radius-md)' }}>
                  <div style={{ fontSize:'0.875rem', color:'var(--gray-400)', marginBottom:'.2rem' }}>Order Note</div>
                  <div style={{ fontSize:'.85rem', color:'var(--navy)' }}>{selectedOrder.note}</div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ fontSize:'.9rem', color:'var(--navy)', marginBottom:'.5rem' }}>Items</h5>
                <div style={{ background:'var(--gray-50)', borderRadius:'var(--radius-md)', padding:'.75rem' }}>
                  {(selectedOrder.items || []).map((item, idx) => {
                    const price = Number(item.price || item.unitPrice || 0);
                    const qty = Number(item.quantity || 1);
                    return (
                      <div key={idx} style={{ display:'flex', justifyContent:'space-between', padding:'.5rem 0', borderBottom: idx < (selectedOrder.items || []).length - 1 ? '1px solid var(--gray-200)' : 'none' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize:'.85rem' }}>{item.productName}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                            <span>{qty} {item.unit || 'units'} × ₹{price.toFixed(2)}</span>
                            {item.freeQuantity > 0 && (
                              <span style={{ color: '#047857', fontWeight: 700, background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                +{item.freeQuantity} Free Bonus
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize:'.85rem' }}>
                          ₹{(qty * price).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', padding:'.75rem 1rem', background:'var(--cyan)', borderRadius:'var(--radius-md)' }}>
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
