import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, ShoppingCart, CheckCircle, Package } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../../data/store';
import { apiGetProducts, apiSubmitOrder } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

function OrderModal({ product, onClose, onSubmit }) {
  const [qty, setQty]     = useState(10);
  const [unit, setUnit]   = useState('Strips');
  const [note, setNote]   = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ qty, unit, note });
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
                  ₹{product.price.toFixed(2)}
                </div>
                <div style={{ fontSize:'.72rem', color:'var(--gray-400)' }}>per {product.unit}</div>
                <div style={{ fontSize:'.72rem', color:'var(--gray-400)' }}>MRP ₹{product.mrp.toFixed(2)}</div>
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
                  <option>Strips</option><option>Bottles</option><option>Boxes</option><option>Pieces</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea className="form-control" rows={3} placeholder="Any specific requirements, delivery notes, etc."
                value={note} onChange={e => setNote(e.target.value)} id="order-notes" />
            </div>
            <div className="modal-footer" style={{ padding:0, marginTop:'.5rem' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} id="order-cancel-btn">Cancel</button>
              <button type="submit" className="btn btn-primary" id="order-submit-btn">
                <CheckCircle size={15} /> Submit Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RetailerProducts() {
  const { user }      = useAuth();
  const { addToast }  = useToast();

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [rxFilter, setRxFilter] = useState('all');
  const [selected, setSelected] = useState(null);

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

  const handleOrderSubmit = async ({ qty, unit, note }) => {
    await apiSubmitOrder({
      userId:        user?.id,
      userName:      user?.storeName || user?.ownerName || 'Retailer',
      productId:     selected.id,
      productName:   selected.name,
      manufacturer:  selected.manufacturer,
      unitPrice:     selected.price,
      quantity:      Number(qty),
      unit,
      note,
    });
    addToast(`Order submitted for ${selected.name}`, 'success');
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
          <div className="badge badge-info"><Package size={12} /> Exclusive Retailer Pricing</div>
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
                {c.icon} {c.label}
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
            <div className="products-grid">
              {filtered.map((p, i) => (
                <div key={p.id} className="product-card animate-fade-up" style={{ animationDelay:`${i*0.04}s` }}>
                  <div className="product-card-header">
                    <div style={{ fontSize:'2rem' }}>
                      {CATEGORIES.find(c => c.id === p.category)?.icon || '💊'}
                    </div>
                    <div className="product-discount-badge">-{discount(p)}% off MRP</div>
                  </div>
                  <div className="product-card-body">
                    <div className="product-category">
                      <span className="badge badge-info" style={{ fontSize:'.68rem' }}>
                        {CATEGORIES.find(c=>c.id===p.category)?.label}
                      </span>
                      {p.rx && <span className="badge badge-danger" style={{ fontSize:'.68rem', marginLeft:'.3rem' }}>Rx</span>}
                    </div>
                    <div className="product-name" style={{ marginTop:'.4rem' }}>{p.name}</div>
                    <div className="product-manufacturer">{p.generic}</div>
                    <div style={{ fontSize:'.72rem', color:'var(--gray-400)', marginTop:'.15rem' }}>
                      Mfr: {p.manufacturer}
                    </div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:'.5rem', marginTop:'.5rem' }}>
                      <div className="product-price">₹{p.price.toFixed(2)}</div>
                      <div style={{ fontSize:'.78rem', color:'var(--gray-400)', textDecoration:'line-through' }}>
                        ₹{p.mrp.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ fontSize:'.72rem', color:'var(--gray-400)' }}>per {p.unit}</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'.75rem' }}>
                      <span style={{ fontSize:'.75rem', color: p.stock > 200 ? 'var(--green)' : p.stock > 50 ? 'var(--accent)' : 'var(--red)', fontWeight:600 }}>
                        {p.stock > 200 ? '● In Stock' : p.stock > 50 ? '● Low Stock' : '● Very Low'}
                      </span>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelected(p)}
                        id={`enquire-${p.id}`}
                      >
                        <ShoppingCart size={13} /> Enquire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selected && (
        <OrderModal product={selected} onClose={() => setSelected(null)} onSubmit={handleOrderSubmit} />
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
