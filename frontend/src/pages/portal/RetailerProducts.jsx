import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, ShoppingCart, CheckCircle, Package, Activity, HeartPulse, Stethoscope, Pill, Wind, Smile, TestTube, Cross, SlidersHorizontal, Plus, Star, ChevronLeft, Tag, Building2, Layers, Beaker, ShieldCheck, Info } from 'lucide-react';
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

/* ─── Product Detail Modal (Amazon / Flipkart style) ─── */
function ProductDetailModal({ product, onClose, onOrder, categoryIconMap }) {
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  // Available units from pricing JSONB
  const availableUnits = product.pricing
    ? Object.keys(product.pricing)
    : ['Strips', 'Bottles', 'Boxes', 'Pieces'];

  const defaultUnit = availableUnits[0] || 'Strips';
  const effectivePrice = product.pricing && product.pricing[defaultUnit]
    ? product.pricing[defaultUnit].price
    : product.price;
  const effectiveMrp = product.pricing && product.pricing[defaultUnit]
    ? product.pricing[defaultUnit].mrp
    : product.mrp;

  return (
    <div className="pdp-overlay" onClick={onClose}>
      <div className="pdp-modal" onClick={e => e.stopPropagation()}>
        {/* Close / Back button */}
        <button className="pdp-close" onClick={onClose} title="Close">
          <X size={22} />
        </button>

        <div className="pdp-layout">
          {/* ── Left: Large Image ── */}
          <div className="pdp-image-section">
            <div className="pdp-image-wrapper">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="pdp-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.querySelector('.pdp-image-fallback').style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="pdp-image-fallback"
                style={{ display: product.imageUrl ? 'none' : 'flex' }}
              >
                {categoryIconMap[product.category]
                  ? React.cloneElement(categoryIconMap[product.category], { size: 80, strokeWidth: 1 })
                  : <Activity size={80} color="#333" strokeWidth={1} />}
              </div>
            </div>
            {discount > 0 && (
              <div className="pdp-discount-ribbon">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="pdp-info-section">
            {/* Category Badge */}
            <div className="pdp-category-badge">
              <Tag size={12} />
              {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
              {product.rx && <span className="pdp-rx-badge">Rx</span>}
            </div>

            {/* Product Name */}
            <h2 className="pdp-title">{product.name}</h2>

            {/* Generic Name */}
            {product.generic && (
              <p className="pdp-generic">
                <Beaker size={14} style={{ flexShrink: 0 }} />
                {product.generic}
              </p>
            )}

            {/* Manufacturer */}
            <p className="pdp-manufacturer">
              <Building2 size={14} style={{ flexShrink: 0 }} />
              {product.manufacturer}
            </p>

            {/* Divider */}
            <div className="pdp-divider" />

            {/* Pricing */}
            <div className="pdp-pricing">
              <span className="pdp-price">₹{effectivePrice.toFixed(2)}</span>
              <span className="pdp-mrp">MRP ₹{effectiveMrp.toFixed(2)}</span>
              {discount > 0 && (
                <span className="pdp-discount-text">{discount}% off</span>
              )}
            </div>
            <div className="pdp-per-unit">per {defaultUnit}</div>

            {/* Tax Info */}
            <div className="pdp-tax-info">
              <ShieldCheck size={14} />
              {product.taxIncluded
                ? 'Inclusive of all taxes'
                : `+ ${product.taxPercent || 0}% Tax applicable`}
            </div>

            {/* Details Grid */}
            <div className="pdp-details-grid">
              <div className="pdp-detail-item">
                <span className="pdp-detail-label">Pack Size</span>
                <span className="pdp-detail-value">{product.unit || '—'}</span>
              </div>
              <div className="pdp-detail-item">
                <span className="pdp-detail-label">Stock</span>
                <span className="pdp-detail-value" style={{ color: (product.stock || 0) > 0 ? 'var(--green, #16a34a)' : 'var(--red, #dc2626)' }}>
                  {(product.stock || 0) > 0 ? `${product.stock} units` : 'Out of Stock'}
                </span>
              </div>
              <div className="pdp-detail-item">
                <span className="pdp-detail-label">Category</span>
                <span className="pdp-detail-value">{product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}</span>
              </div>
              <div className="pdp-detail-item">
                <span className="pdp-detail-label">Type</span>
                <span className="pdp-detail-value">{product.rx ? 'Prescription' : 'Over the Counter'}</span>
              </div>
            </div>

            {/* Available Units */}
            {availableUnits.length > 1 && (
              <div className="pdp-units-section">
                <span className="pdp-units-label"><Layers size={14} /> Available Units</span>
                <div className="pdp-units-chips">
                  {availableUnits.map(u => (
                    <span key={u} className="pdp-unit-chip">{u}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              className="pdp-add-btn"
              onClick={() => {
                onClose();
                onOrder(product);
              }}
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          </div>
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
  const [detailProduct, setDetailProduct] = useState(null);
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
                  <div key={p.id} className="product-card animate-fade-up" style={{ animationDelay:`${(i % 40) * 0.04}s`, padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'relative', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'box-shadow 0.25s ease, transform 0.25s ease' }}
                    onClick={() => setDetailProduct(p)}
                    onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    
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

                    {/* Add Button — stopPropagation so it doesn't open the detail modal */}
                    <button 
                      style={{ width: '100%', marginTop: '1rem', padding: '0.65rem', background: '#115E59', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.target.style.background = '#0F514C'}
                      onMouseOut={(e) => e.target.style.background = '#115E59'}
                      onClick={(e) => { e.stopPropagation(); setSelected(p); }}
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

      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onOrder={(p) => { setDetailProduct(null); setSelected(p); }}
          categoryIconMap={categoryIconMap}
        />
      )}

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

        /* ── Product Detail Modal (PDP) ── */
        .pdp-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          animation: pdpFadeIn 0.25s ease;
        }
        @keyframes pdpFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pdpSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pdp-modal {
          position: relative;
          background: #fff;
          border-radius: 16px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1);
          animation: pdpSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pdp-close {
          position: absolute; top: 16px; right: 16px; z-index: 10;
          width: 38px; height: 38px; border-radius: 50%;
          border: none; background: rgba(0,0,0,0.06); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, transform 0.2s;
          color: #555;
        }
        .pdp-close:hover {
          background: rgba(0,0,0,0.12);
          transform: rotate(90deg);
        }
        .pdp-layout {
          display: flex;
          min-height: 420px;
        }

        /* Image Section */
        .pdp-image-section {
          flex: 0 0 45%;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          display: flex; align-items: center; justify-content: center;
          position: relative;
          border-radius: 16px 0 0 16px;
          padding: 2rem;
        }
        .pdp-image-wrapper {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          min-height: 300px;
        }
        .pdp-image {
          max-width: 100%; max-height: 350px;
          object-fit: contain;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.08));
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pdp-image:hover {
          transform: scale(1.06);
        }
        .pdp-image-fallback {
          width: 140px; height: 140px;
          background: rgba(255,255,255,0.8);
          border-radius: 24px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .pdp-discount-ribbon {
          position: absolute; top: 20px; left: 0;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: #fff; font-size: 0.75rem; font-weight: 800;
          padding: 6px 16px 6px 12px;
          border-radius: 0 20px 20px 0;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(220,38,38,0.3);
        }

        /* Info Section */
        .pdp-info-section {
          flex: 1; padding: 2rem 2.25rem;
          display: flex; flex-direction: column;
          overflow-y: auto;
        }
        .pdp-category-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f0fdf4; color: #15803d;
          font-size: 0.72rem; font-weight: 600;
          padding: 4px 12px; border-radius: 20px;
          width: fit-content; text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .pdp-rx-badge {
          background: #fef2f2; color: #dc2626;
          font-size: 0.65rem; font-weight: 700;
          padding: 2px 8px; border-radius: 10px;
          margin-left: 6px;
        }
        .pdp-title {
          font-size: 1.55rem; font-weight: 800;
          color: #0f172a; margin: 0.75rem 0 0.4rem;
          line-height: 1.3;
          font-family: var(--font-display, inherit);
        }
        .pdp-generic {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.88rem; color: #64748b;
          margin: 0 0 0.25rem; font-style: italic;
        }
        .pdp-manufacturer {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.85rem; color: #475569;
          margin: 0 0 0.5rem; font-weight: 500;
        }
        .pdp-divider {
          height: 1px;
          background: linear-gradient(90deg, #e2e8f0, transparent);
          margin: 0.75rem 0;
        }
        .pdp-pricing {
          display: flex; align-items: baseline; gap: 10px;
          flex-wrap: wrap;
        }
        .pdp-price {
          font-size: 2rem; font-weight: 900;
          color: #0f172a;
          font-family: var(--font-display, inherit);
        }
        .pdp-mrp {
          font-size: 0.95rem; color: #94a3b8;
          text-decoration: line-through;
        }
        .pdp-discount-text {
          font-size: 0.9rem; font-weight: 700;
          color: #0f766e;
          background: #f0fdfa; padding: 2px 10px;
          border-radius: 12px;
        }
        .pdp-per-unit {
          font-size: 0.78rem; color: #94a3b8;
          margin-top: 2px;
        }
        .pdp-tax-info {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.8rem; color: #16a34a;
          margin-top: 0.6rem; font-weight: 500;
        }
        .pdp-details-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: 1.25rem;
          background: #f8fafc;
          border-radius: 12px;
          padding: 1rem;
        }
        .pdp-detail-item {
          display: flex; flex-direction: column; gap: 2px;
        }
        .pdp-detail-label {
          font-size: 0.7rem; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.5px;
          font-weight: 600;
        }
        .pdp-detail-value {
          font-size: 0.88rem; color: #334155;
          font-weight: 600;
        }
        .pdp-units-section {
          margin-top: 1rem;
        }
        .pdp-units-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.8rem; color: #64748b;
          font-weight: 600; margin-bottom: 0.5rem;
        }
        .pdp-units-chips {
          display: flex; gap: 6px; flex-wrap: wrap;
        }
        .pdp-unit-chip {
          font-size: 0.75rem; padding: 4px 12px;
          background: #f1f5f9; color: #475569;
          border-radius: 16px; font-weight: 500;
          border: 1px solid #e2e8f0;
        }
        .pdp-add-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; width: 100%; margin-top: auto;
          padding: 0.9rem 1.5rem;
          background: linear-gradient(135deg, #115E59, #0f766e);
          color: #fff; border: none; border-radius: 12px;
          font-size: 1.05rem; font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(17,94,89,0.3);
          margin-top: 1.5rem;
        }
        .pdp-add-btn:hover {
          background: linear-gradient(135deg, #0d4f4a, #115E59);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(17,94,89,0.4);
        }
        .pdp-add-btn:active {
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .pdp-layout {
            flex-direction: column;
          }
          .pdp-image-section {
            flex: none;
            border-radius: 16px 16px 0 0;
            min-height: 220px;
            padding: 1.5rem;
          }
          .pdp-image { max-height: 200px; }
          .pdp-info-section { padding: 1.5rem; }
          .pdp-title { font-size: 1.25rem; }
          .pdp-price { font-size: 1.6rem; }
          .pdp-modal { max-height: 95vh; }
        }
      `}</style>
    </div>
  );
}
