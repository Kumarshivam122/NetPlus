import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { 
  ClipboardList, Clock, CheckCircle, XCircle, PackageCheck, RotateCcw, 
  FileText, Truck, Calendar, Copy, Check, MapPin, Building, Phone, Gift, 
  ExternalLink, ArrowRight, X, AlertCircle, Sparkles, MessageCircle
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PortalSidebar from '../../components/PortalSidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiGetRetailerOrders, apiGetOrderById, apiCancelOrder } from '../../services/api';
import { COMPANY, formatDeliveryDate, computeExpectedDelivery } from '../../data/store';
import InvoicePrint from '../../components/InvoicePrint';

const STATUS_MAP = {
  pending:   { icon: <Clock size={14} />,         cls: 'warning', label: 'Pending Approval',   step: 1 },
  approved:  { icon: <CheckCircle size={14} />,   cls: 'success', label: 'Approved & Packing', step: 2 },
  dispatched:{ icon: <Truck size={14} />,         cls: 'info',    label: 'Out for Delivery',   step: 3 },
  delivered: { icon: <PackageCheck size={14} />,  cls: 'info',    label: 'Delivered',          step: 4 },
  completed: { icon: <PackageCheck size={14} />,  cls: 'info',    label: 'Completed',          step: 4 },
  rejected:  { icon: <XCircle size={14} />,       cls: 'danger',  label: 'Rejected',           step: 0 },
  cancelled: { icon: <XCircle size={14} />,       cls: 'danger',  label: 'Cancelled',          step: 0 },
  returned:  { icon: <RotateCcw size={14} />,     cls: 'warning', label: 'Returned',           step: 0 },
  refunded:  { icon: <RotateCcw size={14} />,     cls: 'success', label: 'Refunded',           step: 0 },
};

export default function RetailerOrders() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const urlOrderId = searchParams.get('orderId');
  const isJustPlaced = searchParams.get('placed') === 'true';

  const loadOrders = async () => {
    try {
      const res = await apiGetRetailerOrders(user?.id || user?._id);
      const list = res || [];
      setOrders(list);
      setLoading(false);

      if (urlOrderId) {
        const found = list.find(o => (
          o.orderId === urlOrderId || 
          o.order_id === urlOrderId || 
          String(o.id) === String(urlOrderId)
        ));
        if (found) {
          setSelectedOrder(found);
          if (isJustPlaced) setShowCelebration(true);
        } else {
          // If not yet present in list, attempt direct fetch
          const direct = await apiGetOrderById(urlOrderId);
          if (direct) {
            setSelectedOrder(direct);
            if (isJustPlaced) setShowCelebration(true);
          }
        }
      }
    } catch (err) {
      console.error('Error loading retailer orders:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id, user?._id, urlOrderId, isJustPlaced]);

  const handleCopyOrderNo = (orderNo) => {
    if (!orderNo) return;
    navigator.clipboard.writeText(orderNo);
    setCopied(true);
    addToast('Order number copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = (order) => {
    setPrintOrder(order);
    addToast('Generating PDF...', 'info');
    setTimeout(() => {
      const element = document.getElementById('invoice-capture');
      if (element) {
        const opt = {
          margin:       10,
          filename:     `Invoice_${order.orderId || order.id}.pdf`,
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

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await apiCancelOrder(id);
      addToast('Order cancelled successfully', 'success');
      setSelectedOrder(null);
      setShowCelebration(false);
      setSearchParams({});
      loadOrders();
    } catch (e) {
      addToast('Failed to cancel order', 'error');
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowCelebration(false);
    if (urlOrderId || isJustPlaced) {
      setSearchParams({});
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowCelebration(false);
  };

  // Helper for item calculations
  const calculateTotals = (order) => {
    const items = order.items || [];
    const subTotal = items.reduce((acc, item) => acc + (Number(item.price || item.unitPrice || 0) * Number(item.quantity || 0)), 0);
    const totalTax = items.reduce((acc, item) => {
      if (item.taxIncluded === false) {
        return acc + (((item.price || item.unitPrice || 0) * (item.taxPercent || 0) / 100) * (item.quantity || 1));
      }
      return acc;
    }, 0);
    const totalFreeQty = items.reduce((acc, item) => acc + (Number(item.freeQuantity) || 0), 0);
    const discountAmount = Number(order.discountAmount) || 0;
    const finalAmount = Number(order.totalAmount) || (subTotal - discountAmount + totalTax);

    return { subTotal, totalTax, totalFreeQty, discountAmount, finalAmount };
  };

  return (
    <div className="portal-layout" id="retailer-orders">
      <PortalSidebar title="My Orders" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h1 style={{ color:'var(--navy)', fontSize:'1.25rem', fontWeight: 700 }}>My Orders & Deliveries</h1>
            <p style={{ fontSize:'.9rem', color:'var(--gray-500)' }}>
              Track order progress, expected delivery dates & download invoices
            </p>
          </div>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={() => navigate('/portal/products')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            Browse Catalog <ArrowRight size={14} />
          </button>
        </div>

        <div className="portal-content">
          {loading ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'var(--gray-500)' }}>
              <Clock size={36} className="animate-spin" style={{ opacity:.5, marginBottom:'1rem' }} />
              <p>Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign:'center', padding:'5rem 1rem', color:'var(--gray-500)', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)' }}>
              <ClipboardList size={56} style={{ opacity:.4, marginBottom:'1rem', color: 'var(--teal)' }} aria-hidden="true" />
              <h2 style={{ color:'var(--navy)', fontSize:'1.3rem', marginBottom:'.4rem', fontWeight: 700 }}>No Orders Yet</h2>
              <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem', color: 'var(--gray-500)' }}>
                You haven't placed any wholesale medicine orders yet. Explore our catalog of 3,000+ products with guaranteed next-day dispatch.
              </p>
              <button className="btn btn-cta" onClick={() => navigate('/portal/products')}>
                Start Ordering Now
              </button>
            </div>
          ) : (
            <div className="table-wrapper" style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order No.</th>
                    <th>Product / Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Expected Delivery</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(e => {
                    const s = STATUS_MAP[e.status] || STATUS_MAP.pending;
                    const items = e.items || [];
                    const firstItem = items[0] || {};
                    const orderId = e.orderId || e.id;
                    const { finalAmount, totalFreeQty } = calculateTotals(e);
                    const expectedDelivery = e.expectedDeliveryDate || computeExpectedDelivery(e.createdAt);

                    return (
                      <tr 
                        key={orderId} 
                        style={{ cursor: 'pointer', transition: 'background 0.15s ease' }} 
                        onClick={() => openOrderModal(e)}
                        className="order-row-hover"
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--navy)', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                              {orderId}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                            {firstItem.productName || 'Wholesale Medicines'}
                            {items.length > 1 && (
                              <span style={{ fontSize: '.8rem', color: 'var(--teal)', fontWeight: 600, marginLeft: '.4rem', background: 'var(--cyan)', padding: '1px 6px', borderRadius: '4px' }}>
                                +{items.length - 1} more
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '.82rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span>{firstItem.manufacturer || 'Multiple'}</span>
                            {totalFreeQty > 0 && (
                              <span style={{ color: '#047857', fontWeight: 600, fontSize: '0.75rem' }}>
                                • +{totalFreeQty} Scheme Free
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--navy)' }}>
                            ₹{Number(finalAmount).toFixed(2)}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${s.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {s.icon} {s.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                            <Truck size={13} color="#15803d" />
                            <span>{formatDeliveryDate(expectedDelivery)}</span>
                          </div>
                        </td>
                        <td style={{ fontSize:'.88rem', color:'var(--gray-500)', whiteSpace: 'nowrap' }}>
                          {new Date(e.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        </td>
                        <td onClick={ev => ev.stopPropagation()} style={{ textAlign: 'right' }}>
                          <div style={{ display:'flex', gap:'.4rem', justifyContent: 'flex-end', flexWrap:'nowrap' }}>
                            <button 
                              className="btn btn-outline btn-sm" 
                              onClick={() => openOrderModal(e)} 
                              aria-label={`View order ${orderId}`}
                              style={{ padding: '.35rem .75rem', fontWeight: 600 }}
                            >
                              View
                            </button>
                            {e.status === 'pending' && (
                              <button 
                                className="btn btn-outline btn-sm" 
                                style={{ borderColor: 'var(--red)', color: 'var(--red)', padding: '.35rem .6rem' }}
                                onClick={() => handleCancel(e.id || orderId)} 
                                title="Cancel Order"
                              >
                                <XCircle size={14} aria-hidden="true" />
                              </button>
                            )}
                            {(e.status === 'delivered' || e.status === 'approved' || e.status === 'completed') && (
                              <button 
                                className="btn btn-ghost btn-sm"
                                onClick={() => handlePrint(e)} 
                                title="Download Invoice"
                                style={{ color: 'var(--teal)', padding: '.35rem .6rem' }}
                              >
                                <FileText size={15} aria-hidden="true" />
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

      {/* ─── FULL ORDER DETAILS MODAL ─── */}
      {selectedOrder && (() => {
        const orderId = selectedOrder.orderId || selectedOrder.id;
        const { subTotal, totalTax, totalFreeQty, discountAmount, finalAmount } = calculateTotals(selectedOrder);
        const expectedDelivery = selectedOrder.expectedDeliveryDate || computeExpectedDelivery(selectedOrder.createdAt);
        const s = STATUS_MAP[selectedOrder.status] || STATUS_MAP.pending;
        const currentStep = s.step || 1;
        const isCancelled = selectedOrder.status === 'cancelled' || selectedOrder.status === 'rejected';

        return (
          <div className="modal-overlay" onClick={closeModal} style={{ zIndex: 9998, background: 'rgba(15, 23, 42, 0.65)' }}>
            <div 
              className="modal-content animate-fade-up" 
              role="dialog" 
              aria-modal="true" 
              aria-label="Order details" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '680px', width: '95%', maxHeight: '92vh', overflowY: 'auto', padding: '0', borderRadius: '14px' }}
            >
              
              {/* Celebratory Order Placed Banner if just submitted */}
              {showCelebration && (
                <div style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#fff',
                  padding: '1.25rem 1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  borderTopLeftRadius: '14px',
                  borderTopRightRadius: '14px'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Sparkles size={24} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                      🎉 Order Placed Successfully!
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '0.9rem', color: '#d1fae5' }}>
                      Your wholesale purchase order has been received by NetPlus Dhanbad dispatch team.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Header */}
              <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#fff' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Order Number
                    </span>
                    <span className={`badge badge-${s.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {s.icon} {s.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <h2 style={{ margin: 0, color: 'var(--navy)', fontSize: '1.45rem', fontWeight: 800, fontFamily: 'monospace' }}>
                      {orderId}
                    </h2>
                    <button 
                      type="button"
                      onClick={() => handleCopyOrderNo(orderId)}
                      title="Copy Order Number"
                      style={{
                        background: copied ? '#ecfdf5' : '#f1f5f9',
                        border: '1px solid ' + (copied ? '#a7f3d0' : '#cbd5e1'),
                        color: copied ? '#047857' : '#475569',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                    Placed on: {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <button 
                  onClick={closeModal} 
                  aria-label="Close"
                  style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem 1.75rem', background: '#f8fafc' }}>
                
                {/* ─── PROMINENT EXPECTED DELIVERY CALLOUT CARD ─── */}
                <div style={{
                  background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Truck size={26} color="#38bdf8" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Expected Delivery Date
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                        {formatDeliveryDate(expectedDelivery)}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '2px' }}>
                        Direct Dispatch from NetPlus Central Depot, Dhanbad
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    textAlign: 'right',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Dispatch Schedule</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>24–48h Delivery Fleet</div>
                  </div>
                </div>

                {/* ─── ORDER STATUS TIMELINE STEPPER ─── */}
                {!isCancelled ? (
                  <div style={{ background: '#fff', borderRadius: '10px', padding: '1.25rem', border: '1px solid var(--gray-200)', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>
                      Order Fulfillment Status
                    </div>
                    <div className="order-stepper">
                      {[
                        { step: 1, label: 'Order Placed', desc: 'Received & logged' },
                        { step: 2, label: 'Approved',     desc: 'Verified & packing' },
                        { step: 3, label: 'In Transit',   desc: 'Out for delivery' },
                        { step: 4, label: 'Delivered',    desc: 'At your pharmacy' }
                      ].map((item, idx) => {
                        const isDone = currentStep >= item.step;
                        const isCurrent = currentStep === item.step;
                        return (
                          <div key={item.step} className="stepper-item">
                            <div className={`stepper-circle ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}>
                              {isDone ? <Check size={14} /> : item.step}
                            </div>
                            <div className="stepper-label" style={{ fontWeight: isCurrent ? 700 : 500, color: isDone ? 'var(--navy)' : 'var(--gray-400)' }}>
                              {item.label}
                            </div>
                            <div className="stepper-desc">{item.desc}</div>
                            {idx < 3 && <div className={`stepper-line ${currentStep > item.step ? 'done' : ''}`} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={22} color="#dc2626" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.9rem', color: '#991b1b' }}>
                      <strong>This order was cancelled.</strong> For any billing disputes or stock queries, please contact NetPlus support.
                    </div>
                  </div>
                )}

                {/* ─── PHARMACY & DELIVERY DESTINATION ─── */}
                <div style={{ background: '#fff', borderRadius: '10px', padding: '1.25rem', border: '1px solid var(--gray-200)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.75rem' }}>
                    <MapPin size={16} color="var(--teal)" />
                    <span>Delivery Address & Recipient</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Pharmacy / Shop</div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', marginTop: '2px' }}>
                        {user?.storeName || selectedOrder.userName || user?.name || 'Registered Retailer'}
                      </div>
                      <div style={{ color: 'var(--gray-600)', marginTop: '2px', lineHeight: 1.4 }}>
                        {user?.address || COMPANY.address}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Contact & Verification</div>
                      <div style={{ color: 'var(--navy)', fontWeight: 600, marginTop: '2px' }}>
                        Phone: {user?.phone || COMPANY.phone}
                      </div>
                      {user?.email && (
                        <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginTop: '2px' }}>
                          Email: {user.email}
                        </div>
                      )}
                      {(user?.dlNo || user?.gst) && (
                        <div style={{ color: 'var(--teal-dark)', fontSize: '0.82rem', marginTop: '2px', fontWeight: 600 }}>
                          DL: {user?.dlNo || 'Verified'} {user?.gst ? `| GST: ${user.gst}` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedOrder.note && (
                    <div style={{ marginTop: '0.9rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--gray-200)', fontSize: '0.88rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>Delivery Instructions / Note:</span> {selectedOrder.note}
                    </div>
                  )}
                </div>

                {/* ─── ORDER ITEMS WITH SCHEME BONUS ─── */}
                <div style={{ background: '#fff', borderRadius: '10px', padding: '1.25rem', border: '1px solid var(--gray-200)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Ordered Items ({(selectedOrder.items || []).length})
                    </div>
                    {totalFreeQty > 0 && (
                      <span style={{
                        background: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Gift size={12} color="#059669" /> +{totalFreeQty} Total Free Units
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(selectedOrder.items || []).map((item, idx) => {
                      const itemPrice = Number(item.price || item.unitPrice || 0);
                      const itemQty = Number(item.quantity || 1);
                      const itemFree = Number(item.freeQuantity || 0);
                      const lineTotal = itemPrice * itemQty;

                      return (
                        <div key={idx} style={{
                          padding: '0.75rem 0',
                          borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--gray-100)' : 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '1rem'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem' }}>
                              {item.productName}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                              Mfr: {item.manufacturer || 'Authorized Manufacturer'} • Unit: {item.unit || 'Strip'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--gray-700)', fontWeight: 500 }}>
                                {itemQty} {item.unit || 'units'} × ₹{itemPrice.toFixed(2)}
                              </span>
                              {itemFree > 0 && (
                                <span style={{
                                  background: '#ecfdf5',
                                  color: '#065f46',
                                  border: '1px solid #a7f3d0',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  <Gift size={11} color="#059669" /> +{itemFree} Free Extra ({itemQty + itemFree} total)
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1rem' }}>
                              ₹{lineTotal.toFixed(2)}
                            </div>
                            {itemFree > 0 && (
                              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                                Scheme applied
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ─── PRICE BREAKDOWN ─── */}
                <div style={{
                  background: 'var(--cyan)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                    <span>Items Subtotal</span>
                    <span>₹{subTotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--green)', fontWeight: 600 }}>
                      <span>Coupon Discount</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {totalTax > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                      <span>Applicable Tax</span>
                      <span>+₹{totalTax.toFixed(2)}</span>
                    </div>
                  )}

                  {totalFreeQty > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#047857', fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Gift size={13} color="#059669" /> Free Scheme Bonus Items
                      </span>
                      <span>+{totalFreeQty} Units Free</span>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--navy)',
                    paddingTop: '0.6rem',
                    marginTop: '0.25rem',
                    borderTop: '1px dashed rgba(0, 0, 0, 0.15)'
                  }}>
                    <span>Grand Total</span>
                    <span>₹{finalAmount.toFixed(2)}</span>
                  </div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div style={{
                padding: '1.25rem 1.75rem',
                background: '#fff',
                borderTop: '1px solid var(--gray-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <a 
                    href={`https://wa.me/919661242464?text=${encodeURIComponent(`Hello NetPlus team, I have a query regarding Order ${orderId}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#25D366', color: '#128C7E', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <MessageCircle size={15} color="#25D366" /> WhatsApp Support
                  </a>
                  {selectedOrder.status === 'pending' && (
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
                      onClick={() => handleCancel(selectedOrder.id || orderId)}
                    >
                      <XCircle size={15} /> Cancel Order
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => handlePrint(selectedOrder)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileText size={16} /> Download Invoice
                  </button>
                  <button 
                    className="btn btn-cta" 
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Invoice Generator DOM node */}
      {printOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '2rem' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--navy)', fontWeight: 600, fontSize: '1.1rem' }}>
            Generating PDF Invoice... Please wait.
          </div>
          <div style={{ border: '1px solid var(--gray-200)' }}>
            <InvoicePrint order={printOrder} user={user} />
          </div>
        </div>
      )}

      <style>{`
        .order-row-hover:hover {
          background-color: #f8fafc !important;
        }
        .order-stepper {
          display: flex;
          justify-content: space-between;
          position: relative;
          padding: 0.5rem 0;
        }
        .stepper-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
          text-align: center;
        }
        .stepper-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.82rem;
          z-index: 2;
          transition: all 0.2s ease;
        }
        .stepper-circle.active {
          border-color: var(--teal);
          background: var(--cyan);
          color: var(--teal-dark);
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.2);
        }
        .stepper-circle.done {
          background: #059669;
          border-color: #059669;
          color: #fff;
        }
        .stepper-label {
          font-size: 0.8rem;
          margin-top: 0.45rem;
        }
        .stepper-desc {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-top: 2px;
        }
        .stepper-line {
          position: absolute;
          top: 16px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: #e2e8f0;
          z-index: 1;
        }
        .stepper-line.done {
          background: #059669;
        }
        @media (max-width: 640px) {
          .stepper-desc { display: none; }
          .stepper-label { font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
}
