import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, ShoppingCart, CheckCircle, Package, Activity, HeartPulse, Stethoscope, Pill, Wind, Smile, TestTube, Cross, SlidersHorizontal, Plus, Star } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../../data/store';
import { apiGetProducts, apiSubmitOrder } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

function OrderModal({ product, onClose, onAdd }) {
  // Determine available units from pricing JSONB or fallback to defaults
  const availableUnits = product.pricing 
    ? Object.keys(product.pricing) 
    : ['Strips', 'Bottles', 'Boxes', 'Pieces'];

  const [qty, setQty]     = useState(10);
  const [unit, setUnit]   = useState(availableUnits[0] || 'Strips');

  // Compute exact price and MRP
  const effectivePrice = product.pricing && product.pricing[unit] 
    ? product.pricing[unit].price 
    : (() => {
        // Fallback calculation for legacy products
        switch(unit) {
          case 'Boxes':  return product.price * 10;
          case 'Pieces': return product.price * 0.1;
          default:       return product.price;
        }
      })();

  const effectiveMrp = product.pricing && product.pricing[unit]
    ? product.pricing[unit].mrp
    : (() => {
        // Fallback calculation for legacy products
        switch(unit) {
          case 'Boxes':  return product.mrp * 10;
          case 'Pieces': return product.mrp * 0.1;
          default:       return product.mrp;
        }
      })();

  const subTotal = qty * effectivePrice;
  const taxAmount = !product.taxIncluded ? (subTotal * (product.taxPercent || 0) / 100) : 0;
  const itemTotal = subTotal + taxAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      productId: product.id,
      productName: product.name,
      manufacturer: product.manufacturer,
      price: effectivePrice,
      mrp: effectiveMrp,
      taxIncluded: product.taxIncluded,
      taxPercent: product.taxPercent,
      quantity: Number(qty),
      unit
    });
  };

  return (
    <div className="modal-overlay" id="order-modal-overlay">
      <div className="modal" id="order-modal">
        <div className="modal-header">
          <div>
            <h4 style={{ color:'var(--navy)' }}>Place Order</h4>
            <p style={{ fontSize:'.82rem', color:'var(--gray-400)', marginTop:'.2rem' }}>{product.name}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ background:'var(--gray-50)', borderRadius:'var(--radius-md)', padding:'1rem', marginBottom:'1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.88rem' }}>
              <div>
                <div style={{ fontWeight:700, color:'var(--navy)' }}>{product.name}</div>
                <div style={{ color:'var(--gray-400)', fontSize:'.78rem', marginTop:'.2rem' }}>{product.generic}</div>
                <div style={{ color:'var(--gray-400)', fontSize:'.78rem' }}>Mfr: {product.manufacturer}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:800, color:'var(--teal)' }}>
                  ₹{effectivePrice.toFixed(2)}
                </div>
                <div style={{ fontSize:'.72rem', color:'var(--gray-400)', marginBottom: '2px' }}>per {unit}</div>
                <div style={{ fontSize:'.72rem', color: product.taxIncluded ? 'var(--green)' : 'var(--gray-500)', fontWeight: 600 }}>
                  {product.taxIncluded ? 'Tax Included' : `+ ${product.taxPercent || 0}% Tax`}
                </div>
                <div style={{ fontSize:'.72rem', color:'var(--gray-400)', marginTop: '4px' }}>MRP ₹{effectiveMrp.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} id="order-form">
            <div className="grid grid-2" style={{ gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">Quantity Required *</label>
                <input className="form-control" type="number" min={1} required
                  value={qty} onChange={e => setQty(e.target.value)} id="order-qty" />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-control" value={unit} onChange={e => setUnit(e.target.value)} id="order-unit">
                  {availableUnits.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ background:'rgba(13,148,136,0.05)', borderRadius:'var(--radius-md)', padding:'1rem', marginTop:'1rem', display:'flex', flexDirection:'column', gap:'.4rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', color:'var(--gray-500)' }}>
                <span>Subtotal ({qty} {unit})</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              {!product.taxIncluded && product.taxPercent > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', color:'var(--gray-500)', marginTop: '.25rem' }}>
                  <span>Estimated Tax ({product.taxPercent}%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'1.1rem', fontWeight:800, color:'var(--navy)', marginTop:'.25rem', paddingTop:'.4rem', borderTop:'1px dashed var(--gray-200)' }}>
                <span>Item Total</span>
                <span>₹{itemTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="modal-footer" style={{ padding:0, marginTop:'.5rem' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} id="order-cancel-btn">Cancel</button>
              <button type="submit" className="btn btn-primary" id="order-submit-btn">
                <ShoppingCart size={15} /> Add to Cart
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RetailerProducts() {
  const categoryIconMap = {
    'antibiotics': <TestTube size={32} color="#333" strokeWidth={1.5} />,
    'cardiovascular': <HeartPulse size={32} color="#333" strokeWidth={1.5} />,
    'diabetes': <Activity size={32} color="#333" strokeWidth={1.5} />,
    'pain': <Pill size={32} color="#333" strokeWidth={1.5} />,
    'vitamins': <Cross size={32} color="#333" strokeWidth={1.5} />,
    'gastro': <Stethoscope size={32} color="#333" strokeWidth={1.5} />,
    'neuro': <Activity size={32} color="#333" strokeWidth={1.5} />,
    'respiratory': <Wind size={32} color="#333" strokeWidth={1.5} />,
    'derma': <Smile size={32} color="#333" strokeWidth={1.5} />,
  };
  const { user }      = useAuth();
  const { addToast }  = useToast();
  const { cart, addToCart } = useCart();
  const navigate      = useNavigate();

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [rxFilter, setRxFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(40);

  useEffect(() => {
    let active = true;
    apiGetProducts().then(res => {
      if (active && res && res.length > 0) setProducts(res);
    });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== 'all') list = list.filter(p => p.category === category);
    if (rxFilter === 'rx')  list = list.filter(p => p.rx);
    if (rxFilter === 'otc') list = list.filter(p => !p.rx);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.generic.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, search, category, rxFilter]);

  // Reset display limit when filters change
  useEffect(() => {
    setDisplayLimit(40);
  }, [search, category, rxFilter]);

  const displayedProducts = useMemo(() => {
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  const handleAddToCart = (item) => {
    addToCart(item);
    addToast(`Added ${item.quantity} ${item.unit} of ${item.productName} to cart`, 'success');
    setSelected(null);
  };

  const discount = (p) => Math.round(((p.mrp - p.price) / p.mrp) * 100);

  return (
    <div className="portal-layout" id="retailer-products">
      <PortalSidebar title="Browse Products" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h4 style={{ color:'var(--navy)', fontFamily:'var(--font-display)' }}>Wholesale Catalog</h4>
            <p style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>{products.length} products available</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="badge badge-info"><Package size={12} /> Exclusive Retailer Pricing</div>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/portal/cart')}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '.5rem', padding: '0 1rem', height: '36px', overflow: 'visible' }}
            >
              <ShoppingCart size={16} /> Cart
              {cart.length > 0 && (
                <span style={{ 
                  position: 'absolute', top: '-6px', right: '-6px', 
                  background: 'var(--red)', color: 'white', borderRadius: '50%', 
                  width: '20px', height: '20px', fontSize: '11px', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="portal-content">
          {/* Filters */}
          <div className="products-filters" id="products-filter-bar">
            <div className="search-bar" style={{ flex:1, maxWidth:'400px' }}>
              <Search size={16} style={{ color:'var(--gray-400)' }} />
              <input
                id="product-search"
                placeholder="Search by name, generic, or manufacturer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--gray-400)' }}
                  onClick={() => setSearch('')}><X size={14} /></button>
              )}
            </div>
            <div style={{ display:'flex', gap:'.5rem', alignItems:'center', flexWrap:'wrap' }}>
              <Filter size={15} style={{ color:'var(--gray-400)' }} />
              {[
                { val:'all', label:'All Types' },
                { val:'rx',  label:'Rx Only' },
                { val:'otc', label:'OTC' },
              ].map(f => (
                <button key={f.val} className={`chip${rxFilter===f.val?' active':''}`}
                  onClick={() => setRxFilter(f.val)} id={`filter-${f.val}`}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* Category chips */}
          <div className="filter-chips" style={{ marginBottom:'1.5rem' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} className={`chip${category===c.id?' active':''}`}
                onClick={() => setCategory(c.id)} id={`cat-${c.id}`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div style={{ marginBottom:'1.25rem', fontSize:'.88rem', color:'var(--gray-500)' }}>
            Showing <strong style={{ color:'var(--navy)' }}>{filtered.length}</strong> products
            {search && <> for "<strong>{search}</strong>"</>}
          </div>

          {/* Products Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'var(--gray-400)' }}>
              <Package size={48} style={{ opacity:.3, marginBottom:'.75rem' }} />
              <p>No products found. Try different search terms.</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {displayedProducts.map((p, i) => (
                  <div key={p.id} className="product-card animate-fade-up" style={{ animationDelay:`${(i % 40) * 0.04}s`, padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Best Price Badge */}
                    <div style={{ position: 'absolute', top: 0, left: 0, background: '#F3E8FF', color: '#6B46C1', padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderTopLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                      Best Price
                    </div>

                    {/* Image Container */}
                    <div style={{ height: '160px', width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerText = '💊'; e.target.parentNode.style.fontSize = '4rem'; }} />
                      ) : (
                        <div style={{
                          background: '#f8fafc', width: '64px', height: '64px', borderRadius: '16px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                        }}>
                          {categoryIconMap[p.category] || <Activity size={32} color="#333" strokeWidth={1.5} />}
                          <span style={{
                            position: 'absolute', top: '16px', left: '16px', width: '8px', height: '8px',
                            backgroundColor: 'var(--teal)', borderRadius: '50%', opacity: 0.8
                          }}></span>
                        </div>
                      )}
                    </div>

                    {/* Product Title */}
                    <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600, color: '#333', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {p.name}
                    </div>

                    {/* Flex Spacer to push pricing and button to bottom */}
                    <div style={{ flexGrow: 1 }}></div>

                    {/* Pricing Section */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '1.5rem' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111' }}>₹{p.price.toFixed(2)}</span>
                      <span style={{ fontSize: '.85rem', color: '#777', textDecoration: 'line-through' }}>MRP ₹{p.mrp.toFixed(2)}</span>
                      <span style={{ fontSize: '.85rem', fontWeight: 700, color: '#0F766E' }}>{discount(p)}% off</span>
                    </div>

                    {/* Add Button */}
                    <button 
                      style={{ width: '100%', marginTop: '1rem', padding: '0.65rem', background: '#115E59', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.target.style.background = '#0F514C'}
                      onMouseOut={(e) => e.target.style.background = '#115E59'}
                      onClick={() => setSelected(p)}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>

              {filtered.length > displayLimit && (
                <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
                  <button 
                    className="btn" 
                    style={{ 
                      padding: '0.75rem 2rem', 
                      fontWeight: 600, 
                      background: 'var(--gray-100)', 
                      color: 'var(--navy)',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-full)'
                    }}
                    onClick={() => setDisplayLimit(prev => prev + 40)}
                  >
                    Show More Products
                  </button>
                  <div style={{ fontSize: '.8rem', color: 'var(--gray-400)', marginTop: '0.75rem' }}>
                    Showing {displayedProducts.length} of {filtered.length} products
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {selected && (
        <OrderModal product={selected} onClose={() => setSelected(null)} onAdd={handleAddToCart} />
      )}

      <style>{`
        .products-filters {
          display:flex; align-items:center; gap:1rem; flex-wrap:wrap;
          margin-bottom:1.25rem;
        }
        .products-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));
          gap:1.25rem;
        }
        .product-card-header { position:relative; }
        .product-discount-badge {
          position:absolute; top:.75rem; right:.75rem;
          background:var(--gradient-teal); color:#fff;
          font-size:.7rem; font-weight:700;
          padding:.2rem .55rem; border-radius:var(--radius-full);
        }
      `}</style>
    </div>
  );
}
