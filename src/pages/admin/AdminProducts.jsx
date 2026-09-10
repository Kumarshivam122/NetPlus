import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Trash2, CheckCircle } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../../data/store';
import { apiGetProducts, apiCreateProduct, apiDeleteProduct } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminProducts() {
  const { addToast } = useToast();
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newProd, setNewProd] = useState({
    name: '',
    generic: '',
    manufacturer: '',
    category: 'antibiotics',
    price: '',
    mrp: '',
    unit: 'Strip/10',
    stock: 100,
    rx: true,
  });

  const loadProducts = () => {
    apiGetProducts().then(res => {
      if (res && res.length > 0) setProducts(res);
    });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const res = await apiCreateProduct({
      ...newProd,
      price: parseFloat(newProd.price),
      mrp: parseFloat(newProd.mrp),
      stock: parseInt(newProd.stock, 10),
    });

    if (res.success) {
      addToast(`Added "${newProd.name}" to catalog`, 'success');
      setShowAddModal(false);
      setNewProd({
        name: '',
        generic: '',
        manufacturer: '',
        category: 'antibiotics',
        price: '',
        mrp: '',
        unit: 'Strip/10',
        stock: 100,
        rx: true,
      });
      loadProducts();
    } else {
      addToast(res.error || 'Failed to add product', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from catalog?`)) return;
    const res = await apiDeleteProduct(id);
    if (res.success) {
      addToast(`Deleted "${name}"`, 'info');
      loadProducts();
    } else {
      addToast(res.error || 'Failed to delete product', 'error');
    }
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.manufacturer.toLowerCase().includes(q) || p.generic.toLowerCase().includes(q);
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="portal-layout" id="admin-products">
      <PortalSidebar title="Products" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h4 style={{ color:'var(--navy)', fontFamily:'var(--font-display)' }}>Product Catalog</h4>
            <p style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>{products.length} products in database</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)} id="add-product-btn">
            <Plus size={15} /> Add Product
          </button>
        </div>
        <div className="portal-content">
          <div style={{ display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap', marginBottom:'1.25rem' }}>
            <div className="search-bar" style={{ flex:1, maxWidth:'360px' }}>
              <Search size={16} style={{ color:'var(--gray-400)' }} />
              <input id="admin-product-search" placeholder="Search product, generic, manufacturer..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--gray-400)' }} onClick={()=>setSearch('')}><X size={14}/></button>}
            </div>
            <div className="filter-chips">
              {CATEGORIES.map(c => (
                <button key={c.id} className={`chip${category===c.id?' active':''}`}
                  onClick={()=>setCategory(c.id)} id={`admin-cat-${c.id}`}>{c.icon} {c.label}</button>
              ))}
            </div>
          </div>
          <p style={{ fontSize:'.85rem', color:'var(--gray-500)', marginBottom:'1rem' }}>
            Showing <strong>{filtered.length}</strong> products
          </p>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Generic</th>
                  <th>Manufacturer</th>
                  <th>Category</th>
                  <th>W/S Price</th>
                  <th>MRP</th>
                  <th>Unit</th>
                  <th>Stock</th>
                  <th>Rx</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color:'var(--gray-400)', fontSize:'.8rem' }}>{i+1}</td>
                    <td style={{ fontWeight:700, color:'var(--navy)' }}>{p.name}</td>
                    <td style={{ fontSize:'.82rem', color:'var(--gray-500)' }}>{p.generic}</td>
                    <td>{p.manufacturer}</td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize:'.68rem' }}>
                        {CATEGORIES.find(c=>c.id===p.category)?.label || p.category}
                      </span>
                    </td>
                    <td style={{ color:'var(--teal)', fontWeight:800, fontFamily:'var(--font-display)' }}>₹{Number(p.price).toFixed(2)}</td>
                    <td style={{ color:'var(--gray-400)', textDecoration:'line-through' }}>₹{Number(p.mrp).toFixed(2)}</td>
                    <td style={{ fontSize:'.8rem' }}>{p.unit}</td>
                    <td>
                      <span style={{ fontWeight:700, color: p.stock>200?'var(--green)':p.stock>50?'var(--accent)':'var(--red)' }}>{p.stock}</span>
                    </td>
                    <td>
                      {p.rx
                        ? <span className="badge badge-danger" style={{ fontSize:'.68rem' }}>Rx</span>
                        : <span className="badge badge-success" style={{ fontSize:'.68rem' }}>OTC</span>
                      }
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" title="Delete Product" style={{ color:'var(--red)' }}
                        onClick={() => handleDelete(p.id, p.name)} id={`delete-product-${p.id}`}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" id="add-product-modal-overlay">
          <div className="modal" id="add-product-modal">
            <div className="modal-header">
              <div>
                <h4 style={{ color:'var(--navy)' }}>Add New Product</h4>
                <p style={{ fontSize:'.82rem', color:'var(--gray-400)' }}>Insert into Supabase catalog</p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} id="add-product-form">
              <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Brand Name *</label>
                    <input className="form-control" required placeholder="e.g. Augmentin 625mg"
                      value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} id="new-prod-name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Generic Composition *</label>
                    <input className="form-control" required placeholder="e.g. Amoxicillin + Clavulanic"
                      value={newProd.generic} onChange={e => setNewProd({...newProd, generic: e.target.value})} id="new-prod-generic" />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Manufacturer *</label>
                    <input className="form-control" required placeholder="e.g. Cipla, Sun Pharma"
                      value={newProd.manufacturer} onChange={e => setNewProd({...newProd, manufacturer: e.target.value})} id="new-prod-mfr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})} id="new-prod-cat">
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-3" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Wholesale Price (₹) *</label>
                    <input className="form-control" type="number" step="0.01" min="0" required placeholder="0.00"
                      value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} id="new-prod-price" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MRP (₹) *</label>
                    <input className="form-control" type="number" step="0.01" min="0" required placeholder="0.00"
                      value={newProd.mrp} onChange={e => setNewProd({...newProd, mrp: e.target.value})} id="new-prod-mrp" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Pack</label>
                    <input className="form-control" required placeholder="Strip/10, Bottle/100ml"
                      value={newProd.unit} onChange={e => setNewProd({...newProd, unit: e.target.value})} id="new-prod-unit" />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Initial Stock</label>
                    <input className="form-control" type="number" min="0" required
                      value={newProd.stock} onChange={e => setNewProd({...newProd, stock: e.target.value})} id="new-prod-stock" />
                  </div>
                  <div className="form-group" style={{ display:'flex', alignItems:'center', marginTop:'1.8rem', gap:'.5rem' }}>
                    <input type="checkbox" id="new-prod-rx" checked={newProd.rx}
                      onChange={e => setNewProd({...newProd, rx: e.target.checked})} />
                    <label htmlFor="new-prod-rx" style={{ fontSize:'.88rem', fontWeight:600, color:'var(--navy)', cursor:'pointer' }}>
                      Requires Prescription (Rx)
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-product-btn">
                  <CheckCircle size={15} /> Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
