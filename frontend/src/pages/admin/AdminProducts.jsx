import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Trash2, CheckCircle, Edit, Activity, HeartPulse, Stethoscope, Pill, Wind, Smile, TestTube, Cross } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../../data/store';
import { apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminProducts() {
  const categoryIconMap = {
    'antibiotics': <TestTube size={20} color="#333" strokeWidth={1.5} />,
    'cardiovascular': <HeartPulse size={20} color="#333" strokeWidth={1.5} />,
    'diabetes': <Activity size={20} color="#333" strokeWidth={1.5} />,
    'pain': <Pill size={20} color="#333" strokeWidth={1.5} />,
    'vitamins': <Cross size={20} color="#333" strokeWidth={1.5} />,
    'gastro': <Stethoscope size={20} color="#333" strokeWidth={1.5} />,
    'neuro': <Activity size={20} color="#333" strokeWidth={1.5} />,
    'respiratory': <Wind size={20} color="#333" strokeWidth={1.5} />,
    'derma': <Smile size={20} color="#333" strokeWidth={1.5} />,
  };
  const { addToast } = useToast();
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const defaultProdState = {
    name: '', generic: '', manufacturer: '', category: 'antibiotics',
    inStock: true, rx: true, taxIncluded: true, taxPercent: 0,
    discount: 0,
    imageUrl: '',
    pricing: {
      Strips:  { active: true,  size: '10', price: '', mrp: '' },
      Bottles: { active: false, size: '100ml', price: '', mrp: '' },
      Boxes:   { active: false, size: '1', price: '', mrp: '' },
      Pieces:  { active: false, size: '1', price: '', mrp: '' },
    }
  };

  const [newProd, setNewProd] = useState(defaultProdState);

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
    
    const pricingData = {};
    Object.keys(newProd.pricing).forEach(key => {
      if (newProd.pricing[key].active && newProd.pricing[key].price && newProd.pricing[key].mrp) {
        pricingData[key] = {
          price: parseFloat(newProd.pricing[key].price),
          mrp: parseFloat(newProd.pricing[key].mrp),
          size: newProd.pricing[key].size
        };
      }
    });

    if (Object.keys(pricingData).length === 0) {
      addToast('Please enable and set pricing for at least one unit type.', 'error');
      return;
    }

    const firstActiveUnitKey = Object.keys(pricingData)[0];
    const defaultPrice = pricingData[firstActiveUnitKey].price;
    const defaultMrp = pricingData[firstActiveUnitKey].mrp;

    const payload = {
      ...newProd,
      price: defaultPrice,
      mrp: defaultMrp,
      pricing: pricingData,
      stock: newProd.inStock ? 100 : 0,
      unit: `${firstActiveUnitKey.slice(0, -1)}/${newProd.pricing[firstActiveUnitKey].size}`,
      taxIncluded: newProd.taxIncluded,
      taxPercent: parseFloat(newProd.taxPercent) || 0,
      discount: parseFloat(newProd.discount) || 0,
      imageUrl: newProd.imageUrl,
    };

    let res;
    if (editingId) {
      res = await apiUpdateProduct(editingId, payload);
    } else {
      res = await apiCreateProduct(payload);
    }

    if (res.success) {
      addToast(`Successfully ${editingId ? 'updated' : 'added'} "${newProd.name}"`, 'success');
      setShowAddModal(false);
      setEditingId(null);
      setNewProd(defaultProdState);
      loadProducts();
    } else {
      addToast(res.error || `Failed to ${editingId ? 'update' : 'add'} product`, 'error');
    }
  };

  const handleToggleStock = async (product) => {
    const newStock = product.stock > 0 ? 0 : 100;
    const res = await apiUpdateProduct(product.id, { stock: newStock });
    if (res.success) {
      addToast(`Updated stock status for ${product.name}`, 'success');
      loadProducts();
    } else {
      addToast(`Failed to update stock: ${res.error}`, 'error');
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

  const uniqueGenerics = [...new Set(products.map(p => p.generic).filter(Boolean))].sort();
  const uniqueManufacturers = [...new Set(products.map(p => p.manufacturer).filter(Boolean))].sort();

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
                  onClick={()=>setCategory(c.id)} id={`admin-cat-${c.id}`}>{c.label}</button>
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
                  <th>Actions</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Generic</th>
                  <th>Manufacturer</th>
                  <th>Category</th>
                  <th>W/S Price</th>
                  <th>MRP</th>
                  <th>Unit</th>
                  <th>Stock</th>
                  <th>Rx</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color:'var(--gray-400)', fontSize:'.8rem' }}>{i+1}</td>
                    <td style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-ghost btn-sm" title="Edit Product" style={{ color:'var(--teal)' }}
                        onClick={() => {
                          setEditingId(p.id);
                          
                          const mergedPricing = {
                            Strips: { active: !!(p.pricing && p.pricing.Strips), size: p.pricing?.Strips?.size || '10', price: p.pricing?.Strips?.price || '', mrp: p.pricing?.Strips?.mrp || '' },
                            Bottles: { active: !!(p.pricing && p.pricing.Bottles), size: p.pricing?.Bottles?.size || '100ml', price: p.pricing?.Bottles?.price || '', mrp: p.pricing?.Bottles?.mrp || '' },
                            Boxes: { active: !!(p.pricing && p.pricing.Boxes), size: p.pricing?.Boxes?.size || '1', price: p.pricing?.Boxes?.price || '', mrp: p.pricing?.Boxes?.mrp || '' },
                            Pieces: { active: !!(p.pricing && p.pricing.Pieces), size: p.pricing?.Pieces?.size || '1', price: p.pricing?.Pieces?.price || '', mrp: p.pricing?.Pieces?.mrp || '' }
                          };

                          setNewProd({
                            name: p.name, generic: p.generic, manufacturer: p.manufacturer, category: p.category,
                            inStock: p.stock > 0, rx: p.rx, taxIncluded: p.taxIncluded, taxPercent: p.taxPercent || 0,
                            discount: p.discount || 0,
                            imageUrl: p.imageUrl || '',
                            pricing: mergedPricing
                          });
                          setShowAddModal(true);
                        }} id={`edit-product-${p.id}`}>
                        <Edit size={13} />
                      </button>
                      <button className="btn btn-ghost btn-sm" title="Delete Product" style={{ color:'var(--red)' }}
                        onClick={() => handleDelete(p.id, p.name)} id={`delete-product-${p.id}`}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                    <td>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--gray-200)' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                      ) : (
                        <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '4px', border: '1px solid var(--gray-200)', position: 'relative' }}>
                          {categoryIconMap[p.category] || <Activity size={20} color="#333" strokeWidth={1.5} />}
                          <span style={{
                            position: 'absolute', top: '6px', left: '6px', width: '4px', height: '4px',
                            backgroundColor: 'var(--teal)', borderRadius: '50%', opacity: 0.8
                          }}></span>
                        </div>
                      )}
                    </td>
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
                      <button 
                        onClick={() => handleToggleStock(p)}
                        style={{ 
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '0.25rem 0.5rem', borderRadius: '4px',
                          backgroundColor: p.stock > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          transition: 'all 0.2s'
                        }}
                        title="Click to toggle stock status"
                      >
                        {p.stock > 0 ? (
                          <span style={{ fontWeight:700, color: 'var(--green)' }}>● In Stock</span>
                        ) : (
                          <span style={{ fontWeight:700, color: 'var(--red)' }}>● Out of Stock</span>
                        )}
                      </button>
                    </td>
                    <td>
                      {p.rx
                        ? <span className="badge badge-danger" style={{ fontSize:'.68rem' }}>Rx</span>
                        : <span className="badge badge-success" style={{ fontSize:'.68rem' }}>OTC</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" id="add-product-modal-overlay">
          <div className="modal" id="add-product-modal">
            <div className="modal-header">
              <div>
                <h4 style={{ color:'var(--navy)' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h4>
                <p style={{ fontSize:'.82rem', color:'var(--gray-400)' }}>{editingId ? 'Update catalog details' : 'Insert into Supabase catalog'}</p>
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
                    <input className="form-control" required placeholder="e.g. Amoxicillin + Clavulanic" list="generics-list"
                      value={newProd.generic} onChange={e => setNewProd({...newProd, generic: e.target.value})} id="new-prod-generic" />
                    <datalist id="generics-list">
                      {uniqueGenerics.map(g => <option key={g} value={g} />)}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Manufacturer *</label>
                    <input className="form-control" required placeholder="e.g. Cipla, Sun Pharma" list="manufacturers-list"
                      value={newProd.manufacturer} onChange={e => setNewProd({...newProd, manufacturer: e.target.value})} id="new-prod-mfr" />
                    <datalist id="manufacturers-list">
                      {uniqueManufacturers.map(m => <option key={m} value={m} />)}
                    </datalist>
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

                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Image URL (Optional)</label>
                    <input className="form-control" placeholder="https://example.com/image.jpg"
                      value={newProd.imageUrl} onChange={e => setNewProd({...newProd, imageUrl: e.target.value})} id="new-prod-image" />
                    {newProd.imageUrl && (
                      <div style={{ marginTop: '.5rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '.25rem', display: 'inline-block', background: '#fff' }}>
                        <img src={newProd.imageUrl} alt="Preview" style={{ height: '40px', width: '40px', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                </div>



                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Tax Included</label>
                    <select className="form-control" value={newProd.taxIncluded} onChange={e => setNewProd({...newProd, taxIncluded: e.target.value === 'true'})}>
                      <option value="true">Yes (Tax Included in Price)</option>
                      <option value="false">No (Add Tax on top)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax Percentage (%)</label>
                    <input className="form-control" type="number" min="0" step="0.01" disabled={newProd.taxIncluded}
                      value={newProd.taxPercent} onChange={e => setNewProd({...newProd, taxPercent: e.target.value})} />
                  </div>
                </div>

                <div className="form-group" style={{ background:'var(--gray-50)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                  <label className="form-label" style={{ marginBottom:'1rem' }}>Unit Pricing Configuration</label>
                  
                  {['Strips', 'Bottles', 'Boxes', 'Pieces'].map(unitKey => (
                    <div key={unitKey} style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom:'.75rem' }}>
                      <div style={{ width:'100px' }}>
                        <label style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.85rem', fontWeight:600, cursor:'pointer' }}>
                          <input type="checkbox" checked={newProd.pricing[unitKey].active}
                            onChange={e => setNewProd({
                              ...newProd, 
                              pricing: { 
                                ...newProd.pricing, 
                                [unitKey]: { ...newProd.pricing[unitKey], active: e.target.checked }
                              }
                            })} />
                          {unitKey}
                        </label>
                      </div>
                      <div style={{ flex:1 }}>
                        <input className="form-control" type="text" placeholder="Size (e.g. 10, 100ml)"
                          disabled={!newProd.pricing[unitKey].active} required={newProd.pricing[unitKey].active}
                          value={newProd.pricing[unitKey].size}
                          onChange={e => setNewProd({
                            ...newProd, 
                            pricing: { 
                              ...newProd.pricing, 
                              [unitKey]: { ...newProd.pricing[unitKey], size: e.target.value }
                            }
                          })} />
                      </div>
                      <div style={{ flex:1 }}>
                        <input className="form-control" type="number" step="0.01" min="0" placeholder="PTR (₹)"
                          disabled={!newProd.pricing[unitKey].active} required={newProd.pricing[unitKey].active}
                          value={newProd.pricing[unitKey].price}
                          onChange={e => setNewProd({
                            ...newProd, 
                            pricing: { 
                              ...newProd.pricing, 
                              [unitKey]: { ...newProd.pricing[unitKey], price: e.target.value }
                            }
                          })} />
                      </div>
                      <div style={{ flex:1 }}>
                        <input className="form-control" type="number" step="0.01" min="0" placeholder="MRP (₹)"
                          disabled={!newProd.pricing[unitKey].active} required={newProd.pricing[unitKey].active}
                          value={newProd.pricing[unitKey].mrp}
                          onChange={e => setNewProd({
                            ...newProd, 
                            pricing: { 
                              ...newProd.pricing, 
                              [unitKey]: { ...newProd.pricing[unitKey], mrp: e.target.value }
                            }
                          })} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Stock Availability</label>
                    <select className="form-control" value={newProd.inStock} onChange={e => setNewProd({...newProd, inStock: e.target.value === 'true'})}>
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display:'flex', alignItems:'center', marginTop:'1.8rem', gap:'.5rem' }}>
                    <input type="checkbox" id="new-prod-rx" checked={newProd.rx}
                      onChange={e => setNewProd({...newProd, rx: e.target.checked})} />
                    <label htmlFor="new-prod-rx" style={{ fontSize:'.88rem', fontWeight:600, color:'var(--navy)', cursor:'pointer' }}>
                      Requires Prescription (Rx)
                    </label>
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Discount Percentage (%)</label>
                    <input className="form-control" type="number" min="0" step="0.1" placeholder="e.g. 15"
                      value={newProd.discount} onChange={e => setNewProd({...newProd, discount: e.target.value})} id="new-prod-discount" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {editingId && (
                  <button type="button" className="btn btn-outline" style={{ color: 'var(--red)', borderColor: 'var(--red)', marginRight: 'auto' }}
                    onClick={() => {
                      setShowAddModal(false);
                      handleDelete(editingId, newProd.name);
                    }}
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                )}
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
