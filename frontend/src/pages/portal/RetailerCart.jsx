import React, { useState } from 'react';
import { ShoppingCart, Trash2, CheckCircle, Package, Info, MapPin, Gift } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiSubmitOrder, apiGetActiveCoupons, apiValidateCoupon } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function RetailerCart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [note, setNote] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    apiGetActiveCoupons().then(data => {
      if (active) setAvailableCoupons(data || []);
    });
    return () => { active = false; };
  }, []);

  const getItemFreeQty = (item) => {
    if (!item) return 0;
    const scheme = item.scheme;
    if (scheme && typeof scheme === 'object' && (scheme.enabled !== false) && Number(scheme.minQty) > 0) {
      const min = Number(scheme.minQty);
      const free = Number(scheme.freeQty) || 1;
      return Math.floor((Number(item.quantity) || 1) / min) * free;
    }
    return Number(item.freeQuantity) || 0;
  };

  const safeCart = Array.isArray(cart) ? cart.filter(Boolean) : [];
  const totalFreeItems = safeCart.reduce((acc, item) => acc + (item ? getItemFreeQty(item) : 0), 0);

  const subTotal = safeCart.reduce((acc, item) => acc + ((Number(item?.price) || 0) * (Number(item?.quantity) || 0)), 0);
  const totalTax = safeCart.reduce((acc, item) => {
    if (item?.taxIncluded === false) {
      return acc + (((Number(item.price) || 0) * (Number(item.taxPercent) || 0) / 100) * (Number(item.quantity) || 1));
    }
    return acc;
  }, 0);
  const discountAmount = (subTotal * discountPercent) / 100;
  const totalAmount = subTotal - discountAmount + totalTax;

  const handleApplyCoupon = async (codeOverride) => {
    const code = (codeOverride || coupon).trim().toUpperCase();
    if (!code) return;
    
    setCouponMsg({ text: 'Validating...', type: 'info' });
    const result = await apiValidateCoupon(code);
    
    if (result && !result.message) {
      setCoupon(result.code);
      setDiscountPercent(result.discountPercentage);
      setCouponMsg({ text: `${result.discountPercentage}% discount applied!`, type: 'success' });
    } else {
      setDiscountPercent(0);
      setCouponMsg({ text: result?.message || 'Invalid coupon code', type: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (safeCart.length === 0) return;
    if (totalAmount < 1500) {
      addToast('Minimum order amount must be at least ₹1500', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const itemsWithFree = safeCart.map(item => ({
        ...item,
        freeQuantity: getItemFreeQty(item)
      }));

      const createdOrder = await apiSubmitOrder({
        items: itemsWithFree,
        note,
        discountCode: discountPercent > 0 ? coupon.toUpperCase() : null,
        discountAmount,
        totalAmount
      });

      if (!createdOrder) {
        throw new Error('Failed to create order. Please try again.');
      }

      addToast('Order placed successfully!', 'success');
      clearCart();
      const orderId = createdOrder?.orderId || createdOrder?.order_id || createdOrder?.id || '';
      if (orderId) {
        navigate(`/portal/orders?orderId=${encodeURIComponent(orderId)}&placed=true`);
      } else {
        navigate('/portal/orders?placed=true');
      }
    } catch (e) {
      console.error('Order checkout error:', e);
      addToast(e.message || 'Failed to place order.', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="portal-layout" id="retailer-cart">
      <PortalSidebar title="Shopping Cart" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h1 style={{ color:'var(--navy)', fontSize:'1.2rem' }}>Your Cart</h1>
            <p style={{ fontSize:'.9rem', color:'var(--gray-500)' }}>{safeCart.length} items in cart</p>
          </div>
        </div>

        <div className="portal-content cart-layout">

          <div className="cart-items cart-panel">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--navy)', fontSize: '1.15rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem' }}>Order Items</h2>

            {safeCart.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray-500)' }}>
                <ShoppingCart size={48} style={{ opacity:.4, marginBottom:'.75rem' }} aria-hidden="true" />
                <p>Your cart is empty.</p>
                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/portal/products')}>Browse Products</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {safeCart.map((item, index) => {
                  if (!item) return null;
                  const freeQty = getItemFreeQty(item);
                  const itemPrice = Number(item.price || 0);
                  const itemQty = Math.max(1, parseInt(item.quantity, 10) || 1);
                  return (
                  <div key={index} className="cart-row">
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{item.productName || item.name || 'Medicine'}</div>
                      <div style={{ fontSize: '.9rem', color: 'var(--gray-500)' }}>{item.manufacturer || ''}</div>
                      <div style={{ fontSize: '.95rem', color: 'var(--teal)', fontWeight: 600, marginTop: '.25rem' }}>₹{itemPrice.toFixed(2)} per {item.unit || 'Unit'}</div>
                      {freeQty > 0 ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          marginTop: '.35rem'
                        }}>
                          <Gift size={13} color="#059669" />
                          Scheme: +{freeQty} Free Extra ({itemQty + freeQty} {item.unit || 'unit'} total)
                        </div>
                      ) : (item.scheme && typeof item.scheme === 'object' && Number(item.scheme.minQty) > 0 && itemQty < Number(item.scheme.minQty)) ? (
                        <div style={{
                          fontSize: '0.78rem',
                          color: '#d97706',
                          fontWeight: 500,
                          marginTop: '.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Gift size={12} />
                          Add {Number(item.scheme.minQty) - itemQty} more to get {item.scheme.freeQty || 1} Free!
                        </div>
                      ) : null}
                    </div>
                    <div className="cart-row-controls">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <input type="number" min="1" className="form-control" style={{ width: '84px' }}
                          aria-label={`Quantity of ${item.productName || 'product'}`}
                          value={itemQty} onChange={(e) => updateQuantity(index, Math.max(1, parseInt(e.target.value, 10) || 1))} />
                        <span style={{ fontSize: '.9rem', color: 'var(--gray-500)' }}>{item.unit || 'Unit'}</span>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', minWidth: '90px', textAlign: 'right' }}>
                        ₹{(itemPrice * itemQty).toFixed(2)}
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(index)} aria-label={`Remove ${item.productName || 'item'} from cart`} style={{ color: 'var(--red)' }}>
                        <Trash2 size={16} aria-hidden="true" /> Remove
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="cart-summary cart-panel">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--navy)', fontSize: '1.15rem' }}>Order Summary</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="cart-note">Order Notes</label>
              <textarea id="cart-note" className="form-control" rows={2} placeholder="Delivery instructions"
                value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label" htmlFor="cart-coupon">Apply Coupon</label>
              <div style={{ display:'flex', gap:'.5rem' }}>
                <input id="cart-coupon" className="form-control" type="text" placeholder="e.g. SUMMER20" style={{ textTransform: 'uppercase' }}
                  value={coupon} onChange={e => { setCoupon(e.target.value); setCouponMsg({text:'', type:''}); }} />
                <button type="button" className="btn btn-outline" onClick={() => handleApplyCoupon()}>Apply</button>
              </div>
              {couponMsg.text && (
                <div role="status" style={{ fontSize:'.9rem', marginTop:'.4rem', fontWeight: 500, color: couponMsg.type === 'error' ? 'var(--red)' : couponMsg.type === 'info' ? 'var(--gray-500)' : 'var(--green)' }}>
                  {couponMsg.text}
                </div>
              )}
              
              {availableCoupons.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize:'.9rem', color:'var(--gray-500)', marginBottom:'.4rem', fontWeight:600 }}>Available Coupons</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                    {availableCoupons.map(c => (
                      <button 
                        key={c.id}
                        type="button"
                        onClick={() => handleApplyCoupon(c.code)}
                        style={{
                          background: 'var(--cyan)', color: 'var(--teal-dark)', border: '1px dashed var(--teal)',
                          padding: '.35rem .9rem', minHeight: '36px', borderRadius: '1rem', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer'
                        }}>
                        {c.code} ({c.discountPercentage}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background:'var(--cyan)', borderRadius:'var(--radius-md)', padding:'1rem', marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:'.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.95rem', color:'var(--gray-500)' }}>
                <span>Subtotal</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', color:'var(--green)' }}>
                  <span>Discount ({discountPercent}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {totalTax > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', color:'var(--navy-light)' }}>
                  <span>Estimated Tax</span>
                  <span>+₹{totalTax.toFixed(2)}</span>
                </div>
              )}
              {totalFreeItems > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', color:'#047857', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Gift size={14} color="#059669" /> Free Scheme Bonus Items
                  </span>
                  <span>+{totalFreeItems} pieces</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'1.2rem', fontWeight:800, color:'var(--navy)', marginTop:'.5rem', paddingTop:'.5rem', borderTop:'1px dashed var(--gray-200)' }}>
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="info-notice" style={{ marginTop: '1.5rem', background: '#f8fafc', borderColor: '#e2e8f0', color: 'var(--navy)' }}>
              <MapPin size={18} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Delivery Notice:</strong> Your order will be delivered to the medical store address you provided during registration.
              </div>
            </div>

            {totalAmount > 0 && totalAmount < 1500 && (
              <div role="alert" style={{ color: 'var(--red)', fontSize: '.95rem', marginTop: '1rem', textAlign: 'center', fontWeight: 600 }}>
                Minimum order amount is ₹1500
              </div>
            )}

            <button
              className="btn btn-cta btn-lg"
              style={{ width: '100%', marginTop: '1.5rem' }}
              disabled={safeCart.length === 0 || isSubmitting || totalAmount < 1500}
              onClick={handleSubmit}
            >
              <CheckCircle size={18} aria-hidden="true" /> {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>

        </div>
      </main>

      <style>{`
        .cart-layout { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; align-items: start; }
        .cart-panel { background: #fff; border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: 1.5rem; }
        .cart-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; padding: 1rem; border: 1px solid var(--gray-200); border-radius: var(--radius-lg); }
        .cart-row-controls { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        @media (max-width: 1100px) { .cart-layout { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
