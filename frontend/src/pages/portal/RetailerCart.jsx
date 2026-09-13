import React, { useState } from 'react';
import { ShoppingCart, Trash2, CheckCircle, Package, Info, MapPin } from 'lucide-react';
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

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalTax = cart.reduce((acc, item) => {
    if (item.taxIncluded === false) {
      return acc + ((item.price * (item.taxPercent || 0) / 100) * item.quantity);
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
    if (cart.length === 0) return;
    if (totalAmount < 1500) {
      addToast('Minimum order amount must be at least ₹1500', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiSubmitOrder({
        items: cart,
        note,
        discountCode: discountPercent > 0 ? coupon.toUpperCase() : null,
        discountAmount,
        totalAmount
      });
      addToast('Order placed successfully!', 'success');
      clearCart();
      navigate('/portal/orders');
    } catch (e) {
      addToast('Failed to place order.', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="portal-layout" id="retailer-cart">
      <PortalSidebar title="Shopping Cart" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h4 style={{ color:'var(--navy)', fontFamily:'var(--font-display)' }}>Your Cart</h4>
            <p style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>{cart.length} items in cart</p>
          </div>
        </div>

        <div className="portal-content" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
          
          <div className="cart-items" style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h5 style={{ marginBottom: '1.5rem', color: 'var(--navy)', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>Order Items</h5>
            
            {cart.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray-400)' }}>
                <ShoppingCart size={48} style={{ opacity:.3, marginBottom:'.75rem' }} />
                <p>Your cart is empty.</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => navigate('/portal/products')}>Browse Products</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{item.productName}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>{item.manufacturer}</div>
                      <div style={{ fontSize: '.85rem', color: 'var(--teal)', fontWeight: 600, marginTop: '.25rem' }}>₹{item.price.toFixed(2)} per {item.unit}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <input type="number" min="1" className="form-control" style={{ width: '70px', padding: '.25rem .5rem' }} 
                          value={item.quantity} onChange={(e) => updateQuantity(index, Number(e.target.value))} />
                        <span style={{ fontSize: '.8rem', color: 'var(--gray-500)' }}>{item.unit}</span>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', minWidth: '80px', textAlign: 'right' }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button onClick={() => removeFromCart(index)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', opacity: 0.7 }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cart-summary" style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h5 style={{ marginBottom: '1.5rem', color: 'var(--navy)' }}>Order Summary</h5>
            
            <div className="form-group">
              <label className="form-label">Order Notes</label>
              <textarea className="form-control" rows={2} placeholder="Delivery instructions..."
                value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Apply Coupon</label>
              <div style={{ display:'flex', gap:'.5rem' }}>
                <input className="form-control" type="text" placeholder="e.g. SUMMER20" style={{ textTransform: 'uppercase' }}
                  value={coupon} onChange={e => { setCoupon(e.target.value); setCouponMsg({text:'', type:''}); }} />
                <button type="button" className="btn btn-outline" onClick={() => handleApplyCoupon()}>Apply</button>
              </div>
              {couponMsg.text && (
                <div style={{ fontSize:'.75rem', marginTop:'.25rem', color: couponMsg.type === 'error' ? 'var(--red)' : couponMsg.type === 'info' ? 'var(--gray-400)' : 'var(--green)' }}>
                  {couponMsg.text}
                </div>
              )}
              
              {availableCoupons.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize:'.75rem', color:'var(--gray-400)', marginBottom:'.4rem', fontWeight:600 }}>Available Coupons</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                    {availableCoupons.map(c => (
                      <button 
                        key={c.id}
                        type="button"
                        onClick={() => handleApplyCoupon(c.code)}
                        style={{
                          background: 'var(--teal-light)', color: 'var(--teal-dark)', border: '1px dashed var(--teal)',
                          padding: '.25rem .75rem', borderRadius: '1rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer'
                        }}>
                        {c.code} ({c.discountPercentage}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background:'rgba(13,148,136,0.05)', borderRadius:'var(--radius-md)', padding:'1rem', marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:'.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', color:'var(--gray-500)' }}>
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
              <div style={{ color: 'var(--red)', fontSize: '.85rem', marginTop: '1rem', textAlign: 'center', fontWeight: 600 }}>
                Minimum order amount is ₹1500
              </div>
            )}
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
              disabled={cart.length === 0 || isSubmitting || totalAmount < 1500}
              onClick={handleSubmit}
            >
              <CheckCircle size={18} /> {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
