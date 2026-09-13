import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { ClipboardList, Clock, CheckCircle, XCircle, PackageCheck, RotateCcw, FileText } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiGetRetailerOrders, apiCancelOrder } from '../../services/api';
import InvoicePrint from '../../components/InvoicePrint';

const STATUS_MAP = {
  pending:  { icon: <Clock size={14} />,         cls: 'warning', label: 'Pending' },
  approved: { icon: <CheckCircle size={14} />,   cls: 'success', label: 'Approved' },
  delivered:{ icon: <PackageCheck size={14} />,  cls: 'info',    label: 'Delivered' },
  completed:{ icon: <PackageCheck size={14} />,  cls: 'info',    label: 'Completed' },
  rejected: { icon: <XCircle size={14} />,       cls: 'danger',  label: 'Rejected' },
  cancelled:{ icon: <XCircle size={14} />,       cls: 'danger',  label: 'Cancelled' },
  returned: { icon: <RotateCcw size={14} />,     cls: 'warning', label: 'Returned' },
  refunded: { icon: <RotateCcw size={14} />,     cls: 'success', label: 'Refunded' },
};

export default function RetailerOrders() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);

  const handlePrint = (order) => {
    setPrintOrder(order);
    addToast('Generating PDF...', 'info');
    setTimeout(() => {
      const element = document.getElementById('invoice-capture');
      if (element) {
        const opt = {
          margin:       10,
          filename:     `Invoice_ORD-${order.id}.pdf`,
          image:        { type: 'jpeg', quality: 1 },
          html2canvas:  { scale: 4, useCORS: true, windowWidth: 800, width: 800 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save().then(() => {
          addToast('PDF downloaded successfully!', 'success');
          setPrintOrder(null);
        }).catch(err => {
          console.error(err);
          addToast('Failed to generate PDF', 'error');
          setPrintOrder(null);
        });
      } else {
        console.error('Invoice element not found');
        addToast('Failed to prepare invoice', 'error');
        setPrintOrder(null);
      }
    }, 500);
  };

  const loadOrders = () => {
    if (user?.id) {
      apiGetRetailerOrders(user.id).then(res => {
        setOrders(res || []);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await apiCancelOrder(id);
      addToast('Order cancelled successfully', 'success');
      setSelectedOrder(null);
      loadOrders();
    } catch (e) {
      addToast('Failed to cancel order', 'error');
    }
  };


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
                    <th>Product / Items</th>
                    <th>Manufacturer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(e => {
                    const s = STATUS_MAP[e.status] || STATUS_MAP.pending;
                    const items = e.items || [{ productName: e.productName, manufacturer: e.manufacturer, unitPrice: e.unitPrice, quantity: e.quantity, unit: e.unit, price: e.unitPrice }];
                    const firstItem = items[0] || {};
                    const totalAmt = e.totalAmount || items.reduce((acc, item) => acc + (Number(item.price || item.unitPrice || 0) * Number(item.quantity || 0)), 0);

                    return (
                      <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(e)}>
                        <td style={{ fontWeight:700, color:'var(--navy)', fontFamily:'var(--font-display)' }}>{e.id}</td>
                        <td>
                          <div style={{ fontWeight:600, color:'var(--navy)' }}>
                            {firstItem.productName}
                            {items.length > 1 && <span style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginLeft: '.4rem' }}>(+{items.length - 1} more)</span>}
                          </div>
                        </td>
                        <td style={{ color:'var(--gray-500)' }}>{firstItem.manufacturer || e.manufacturer || 'Multiple'}</td>
                        <td>
                          <div style={{ fontWeight: 700 }}>₹{Number(totalAmt).toFixed(2)}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${s.cls}`}>{s.icon} {s.label}</span>
                        </td>
                        <td style={{ fontSize:'.8rem', color:'var(--gray-400)' }}>
                          {new Date(e.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        </td>
                        <td onClick={ev => ev.stopPropagation()}>
                          {e.status === 'pending' && (
                            <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--red)', color: 'var(--red)', padding: '.25rem .5rem', fontSize: '.75rem' }} 
                              onClick={() => handleCancel(e.id)} title="Cancel Order">
                              <XCircle size={14} /> Cancel
                            </button>
                          )}
                          {e.status === 'delivered' && (
                            <button className="btn btn-outline btn-sm" style={{ padding: '.25rem .5rem', fontSize: '.75rem' }} 
                              onClick={() => handlePrint(e)} title="Download Invoice">
                              <FileText size={14} /> Invoice
                            </button>
                          )}
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
                <span style={{ fontSize: '1.2rem' }}>×</span>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.5rem' }}>
                <div>
                  <div style={{ fontSize:'.75rem', color:'var(--gray-400)', marginBottom:'.2rem' }}>Date Submitted</div>
                  <div style={{ fontWeight:700, color:'var(--navy)' }}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                  </div>
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
              
              {selectedOrder.status === 'pending' && (
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => handleCancel(selectedOrder.id)}>
                    <XCircle size={15} /> Cancel Order
                  </button>
                </div>
              )}
              {selectedOrder.status === 'delivered' && (
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                  <button className="btn btn-primary" onClick={() => handlePrint(selectedOrder)}>
                    <FileText size={15} /> Download Invoice
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {printOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '2rem' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--navy)', fontWeight: 600, fontSize: '1.1rem' }}>
            Generating PDF... Please wait.
          </div>
          <div style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <InvoicePrint order={printOrder} user={user} />
          </div>
        </div>
      )}
    </div>
  );
}
