import React, { useState, useEffect, useRef } from 'react';
import {
  Check, Search, X, Plus, Trash2, CheckCircle, Edit,
  HeartPulse, Activity, Stethoscope, Thermometer, Monitor,
  Upload, Image, Loader, FileText, Wind, Zap, Eye, Gauge
} from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct, apiUploadProductImage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Device types with labels and icons
const DEVICE_TYPES = [
  { id: 'bp_monitor',          label: 'BP Monitor',           icon: HeartPulse },
  { id: 'heart_rate_monitor',  label: 'Heart Rate Monitor',   icon: Activity },
  { id: 'pulse_oximeter',      label: 'Pulse Oximeter',       icon: Wind },
  { id: 'thermometer',         label: 'Digital Thermometer',  icon: Thermometer },
  { id: 'nebulizer',           label: 'Nebulizer',            icon: Wind },
  { id: 'glucometer',          label: 'Glucometer',           icon: Zap },
  { id: 'ecg_machine',         label: 'ECG / EKG Machine',    icon: Activity },
  { id: 'stethoscope',         label: 'Stethoscope',          icon: Stethoscope },
  { id: 'weighing_scale',      label: 'Weighing Scale',       icon: Gauge },
  { id: 'bandage',             label: 'Bandage / Dressing',   icon: Plus },
  { id: 'syringe',             label: 'Syringe / Needle',     icon: Zap },
  { id: 'surgical_instrument', label: 'Surgical Instrument',  icon: Stethoscope },
  { id: 'wheelchair',          label: 'Wheelchair / Mobility', icon: Monitor },
  { id: 'eye_care',            label: 'Eye Care Device',      icon: Eye },
  { id: 'other_device',        label: 'Other Device / Supply', icon: Monitor },
];

const DEVICE_FILTER_CHIPS = [
  { id: 'all', label: 'All Devices' },
  ...DEVICE_TYPES.map(d => ({ id: d.id, label: d.label })),
];

function getDeviceIcon(deviceType) {
  const dt = DEVICE_TYPES.find(d => d.id === deviceType);
  if (dt) {
    const IconComp = dt.icon;
    return <IconComp size={18} color="#333" strokeWidth={1.5} />;
  }
  return <Monitor size={18} color="#333" strokeWidth={1.5} />;
}

function getDeviceLabel(deviceType) {
  const dt = DEVICE_TYPES.find(d => d.id === deviceType);
  return dt ? dt.label : (deviceType || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function AdminDevices() {
  const { addToast } = useToast();
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageMode, setImageMode] = useState('upload');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

  const defaultDeviceState = {
    name: '',
    manufacturer: '',
    description: '',
    deviceType: '',
    imageUrl: '',
    inStock: true,
    taxIncluded: true,
    taxPercent: 0,
    discount: 0,
    pricing: {
      Pieces: { active: true, size: '1', price: '', mrp: '' },
      Boxes:  { active: false, size: '1', price: '', mrp: '' },
    }
  };

  const [newDevice, setNewDevice] = useState(defaultDeviceState);

  const loadDevices = () => {
    apiGetProducts().then(res => {
      if (res && res.length > 0) {
        // Filter only devices category
        setDevices(res.filter(p => p.category === 'devices'));
      } else {
        setDevices([]);
      }
    });
  };

  useEffect(() => { loadDevices(); }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!newDevice.deviceType) {
      addToast('Please select a device type.', 'error');
      return;
    }

    const pricingData = {};
    Object.keys(newDevice.pricing).forEach(key => {
      if (newDevice.pricing[key].active && newDevice.pricing[key].price && newDevice.pricing[key].mrp) {
        pricingData[key] = {
          price: parseFloat(newDevice.pricing[key].price),
          mrp: parseFloat(newDevice.pricing[key].mrp),
          size: newDevice.pricing[key].size
        };
      }
    });

    if (Object.keys(pricingData).length === 0) {
      addToast('Please set pricing for at least one unit type.', 'error');
      return;
    }

    const firstKey = Object.keys(pricingData)[0];
    const defaultPrice = pricingData[firstKey].price;
    const defaultMrp = pricingData[firstKey].mrp;

    const payload = {
      name: newDevice.name,
      generic: getDeviceLabel(newDevice.deviceType), // use device label as generic
      manufacturer: newDevice.manufacturer,
      category: 'devices',
      price: defaultPrice,
      mrp: defaultMrp,
      pricing: pricingData,
      stock: newDevice.inStock ? 100 : 0,
      unit: `${firstKey.slice(0, -1)}/${newDevice.pricing[firstKey].size}`,
      rx: false, // devices don't need prescription
      taxIncluded: newDevice.taxIncluded,
      taxPercent: parseFloat(newDevice.taxPercent) || 0,
      discount: parseFloat(newDevice.discount) || 0,
      imageUrl: newDevice.imageUrl,
      description: newDevice.description?.trim() || '',
      deviceType: newDevice.deviceType,
    };

    let res;
    if (editingId) {
      res = await apiUpdateProduct(editingId, payload);
    } else {
      res = await apiCreateProduct(payload);
    }

    if (res.success) {
      addToast(`Successfully ${editingId ? 'updated' : 'added'} "${newDevice.name}"`, 'success');
      setShowAddModal(false);
      setEditingId(null);
      setNewDevice(defaultDeviceState);
      loadDevices();
    } else {
      addToast(res.error || `Failed to ${editingId ? 'update' : 'add'} device`, 'error');
    }
  };

  const handleToggleStock = async (device) => {
    const newStock = device.stock > 0 ? 0 : 100;
    const res = await apiUpdateProduct(device.id, { stock: newStock });
    if (res.success) {
      addToast(`Updated stock for ${device.name}`, 'success');
      loadDevices();
    } else {
      addToast(`Failed to update stock: ${res.error}`, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from devices catalog?`)) return;
    const res = await apiDeleteProduct(id);
    if (res.success) {
      addToast(`Deleted "${name}"`, 'info');
      loadDevices();
    } else {
      addToast(res.error || 'Failed to delete device', 'error');
    }
  };

  const filtered = devices.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || (d.manufacturer || '').toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q);
    const dType = d.deviceType || d.pricing?.deviceType || '';
    const matchFilter = deviceFilter === 'all' || dType === deviceFilter;
    return matchSearch && matchFilter;
  });

  const uniqueManufacturers = [...new Set(devices.map(d => d.manufacturer).filter(Boolean))].sort();

  // Stats
  const totalDevices = devices.length;
  const inStockCount = devices.filter(d => d.stock > 0).length;
  const outOfStockCount = totalDevices - inStockCount;
  const typeCounts = {};
  devices.forEach(d => {
    const t = d.deviceType || d.pricing?.deviceType || 'other_device';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  return (
    <div className="portal-layout" id="admin-devices">
      <PortalSidebar title="Devices" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h4 style={{ color:'var(--navy)', fontFamily:'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Monitor size={20} style={{ color: 'var(--teal)' }} /> Medical Devices & Supplies
            </h4>
            <p style={{ fontSize:'0.875rem', color:'var(--gray-400)' }}>{totalDevices} devices in catalog</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditingId(null); setNewDevice(defaultDeviceState); setShowAddModal(true); }} id="add-device-btn">
            <Plus size={15} /> Add Device
          </button>
        </div>

        <div className="portal-content">
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #0d9488, #0694a2)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', color: '#fff' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{totalDevices}</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Total Devices</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', color: '#fff' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{inStockCount}</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>In Stock</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', color: '#fff' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{outOfStockCount}</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Out of Stock</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', color: '#fff' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{Object.keys(typeCounts).length}</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Device Types</div>
            </div>
          </div>

          {/* Search & Filters */}
          <div style={{ display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap', marginBottom:'1.25rem' }}>
            <div className="search-bar" style={{ flex:1, maxWidth:'360px' }}>
              <Search size={16} style={{ color:'var(--gray-400)' }} />
              <input id="admin-device-search" placeholder="Search device name, manufacturer..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--gray-400)' }} aria-label="Clear search" onClick={()=>setSearch('')}><X size={16} aria-hidden="true"/></button>}
            </div>
            <div className="filter-chips" style={{ overflowX: 'auto', maxWidth: '100%', flexWrap: 'wrap' }}>
              {DEVICE_FILTER_CHIPS.slice(0, 8).map(c => (
                <button key={c.id} className={`chip${deviceFilter===c.id?' active':''}`}
                  onClick={()=>setDeviceFilter(c.id)} id={`admin-dev-${c.id}`}>{c.label}</button>
              ))}
              {deviceFilter !== 'all' && !DEVICE_FILTER_CHIPS.slice(0, 8).find(c => c.id === deviceFilter) && (
                <button className="chip active">{getDeviceLabel(deviceFilter)}</button>
              )}
            </div>
          </div>
          <p style={{ fontSize:'.85rem', color:'var(--gray-500)', marginBottom:'1rem' }}>
            Showing <strong>{filtered.length}</strong> device{filtered.length !== 1 ? 's' : ''}
          </p>

          {/* Devices Grid (Card Layout) */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--gray-400)' }}>
              <Monitor size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <h4 style={{ color: 'var(--gray-500)', marginBottom: '0.5rem' }}>No devices found</h4>
              <p style={{ fontSize: '0.875rem' }}>
                {devices.length === 0
                  ? 'Click "Add Device" to add your first medical device or supply.'
                  : 'No devices match your current search or filter.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {filtered.map(d => {
                const dType = d.deviceType || d.pricing?.deviceType || '';
                return (
                  <div key={d.id} style={{
                    background: '#fff', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)', overflow: 'hidden',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1rem 0.5rem', borderBottom: '1px solid var(--gray-100)' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(13,148,136,0.08), rgba(6,148,162,0.12))',
                        flexShrink: 0, border: '1px solid rgba(13,148,136,0.15)',
                      }}>
                        {d.imageUrl ? (
                          <img src={d.imageUrl} alt={d.name} style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '4px' }}
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>'; }} />
                        ) : getDeviceIcon(dType)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem', lineHeight: 1.3 }}>{d.name}</div>
                        {dType && (
                          <span style={{
                            display: 'inline-block', fontSize: '0.7rem', fontWeight: 600,
                            color: '#fff', background: 'linear-gradient(135deg, #0d9488, #0694a2)',
                            borderRadius: '4px', padding: '1px 7px', marginTop: '3px', letterSpacing: '0.3px'
                          }}>
                            {getDeviceLabel(dType)}
                          </span>
                        )}
                      </div>
                      <div style={{
                        padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700,
                        background: d.stock > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: d.stock > 0 ? 'var(--green)' : 'var(--red)',
                      }}>
                        {d.stock > 0 ? '● In Stock' : '● Out'}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '0.75rem 1rem' }}>
                      {d.manufacturer && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                          <strong>Manufacturer:</strong> {d.manufacturer}
                        </div>
                      )}
                      {(d.description || d.pricing?.description) && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '0.5rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {d.description || d.pricing?.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--font-display)' }}>₹{Number(d.price).toFixed(2)}</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--gray-400)', textDecoration: 'line-through', marginLeft: '6px' }}>₹{Number(d.mrp).toFixed(2)}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{d.unit}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div style={{ display: 'flex', borderTop: '1px solid var(--gray-100)' }}>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1, borderRadius: 0, color: 'var(--teal)', fontSize: '0.82rem', padding: '0.6rem' }}
                        onClick={() => {
                          setEditingId(d.id);
                          const mergedPricing = {
                            Pieces: { active: !!(d.pricing?.Pieces), size: d.pricing?.Pieces?.size || '1', price: d.pricing?.Pieces?.price || '', mrp: d.pricing?.Pieces?.mrp || '' },
                            Boxes: { active: !!(d.pricing?.Boxes), size: d.pricing?.Boxes?.size || '1', price: d.pricing?.Boxes?.price || '', mrp: d.pricing?.Boxes?.mrp || '' },
                          };
                          setNewDevice({
                            name: d.name,
                            manufacturer: d.manufacturer || '',
                            description: d.description || d.pricing?.description || '',
                            deviceType: d.deviceType || d.pricing?.deviceType || '',
                            imageUrl: d.imageUrl || '',
                            inStock: d.stock > 0,
                            taxIncluded: d.taxIncluded,
                            taxPercent: d.taxPercent || 0,
                            discount: d.discount || 0,
                            pricing: mergedPricing,
                          });
                          setShowAddModal(true);
                        }} id={`edit-device-${d.id}`}>
                        <Edit size={13} style={{ marginRight: '4px' }} /> Edit
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1, borderRadius: 0, color: d.stock > 0 ? 'var(--green)' : 'var(--orange, #f59e0b)', fontSize: '0.82rem', padding: '0.6rem', borderLeft: '1px solid var(--gray-100)' }}
                        onClick={() => handleToggleStock(d)} title="Toggle stock status">
                        {d.stock > 0 ? '✓ In Stock' : '↻ Restock'}
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1, borderRadius: 0, color: 'var(--red)', fontSize: '0.82rem', padding: '0.6rem', borderLeft: '1px solid var(--gray-100)' }}
                        onClick={() => handleDelete(d.id, d.name)} id={`delete-device-${d.id}`}>
                        <Trash2 size={13} style={{ marginRight: '4px' }} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Device Modal */}
      {showAddModal && (
        <div className="modal-overlay" id="add-device-modal-overlay">
          <div className="modal" id="add-device-modal">
            <div className="modal-header">
              <div>
                <h4 style={{ color:'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Monitor size={18} style={{ color: 'var(--teal)' }} />
                  {editingId ? 'Edit Device' : 'Add Medical Device / Supply'}
                </h4>
                <p style={{ fontSize:'0.875rem', color:'var(--gray-400)' }}>
                  {editingId ? 'Update device details' : 'Add a new device or medical supply to the catalog'}
                </p>
              </div>
              <button onClick={() => { setShowAddModal(false); setEditingId(null); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} id="add-device-form">
              <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

                {/* Device Type Selection */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                    <Monitor size={15} style={{ color: 'var(--teal)' }} />
                    Device Type *
                  </label>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '0.5rem', maxHeight: '200px', overflowY: 'auto',
                    padding: '0.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)',
                  }}>
                    {DEVICE_TYPES.map(dt => {
                      const IconComp = dt.icon;
                      const isSelected = newDevice.deviceType === dt.id;
                      return (
                        <button key={dt.id} type="button"
                          onClick={() => setNewDevice({ ...newDevice, deviceType: dt.id })}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '0.5rem 0.65rem', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500,
                            border: isSelected ? '2px solid var(--teal)' : '1px solid var(--gray-200)',
                            background: isSelected ? 'rgba(13,148,136,0.08)' : '#fff',
                            color: isSelected ? 'var(--teal-dark, #0d9488)' : 'var(--gray-600)',
                            transition: 'all 0.15s ease',
                          }}>
                          <IconComp size={14} />
                          {dt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Name & Manufacturer */}
                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-device-name">Product Name *</label>
                    <input className="form-control" required placeholder="e.g. Omron HEM-7120 BP Monitor"
                      value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} id="new-device-name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-device-mfr">Manufacturer / Brand *</label>
                    <input className="form-control" required placeholder="e.g. Omron, Dr. Morepen, Beurer" list="device-mfr-list"
                      value={newDevice.manufacturer} onChange={e => setNewDevice({...newDevice, manufacturer: e.target.value})} id="new-device-mfr" />
                    <datalist id="device-mfr-list">
                      {uniqueManufacturers.map(m => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                </div>

                {/* Product Image */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Product Image (Optional)</label>
                    <div style={{ display: 'flex', gap: '2px', background: 'var(--gray-100)', borderRadius: '6px', padding: '2px' }}>
                      <button type="button" onClick={() => setImageMode('upload')}
                        style={{
                          padding: '4px 10px', fontSize: '0.82rem', fontWeight: 600, border: 'none', borderRadius: '5px', cursor: 'pointer',
                          background: imageMode === 'upload' ? '#fff' : 'transparent',
                          color: imageMode === 'upload' ? 'var(--navy)' : 'var(--gray-400)',
                          boxShadow: imageMode === 'upload' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.2s'
                        }}>
                        <Upload size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Upload
                      </button>
                      <button type="button" onClick={() => setImageMode('url')}
                        style={{
                          padding: '4px 10px', fontSize: '0.82rem', fontWeight: 600, border: 'none', borderRadius: '5px', cursor: 'pointer',
                          background: imageMode === 'url' ? '#fff' : 'transparent',
                          color: imageMode === 'url' ? 'var(--navy)' : 'var(--gray-400)',
                          boxShadow: imageMode === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.2s'
                        }}>
                        <Image size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> URL
                      </button>
                    </div>
                  </div>

                  {imageMode === 'upload' ? (
                    <div>
                      <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 20 * 1024) { addToast('Image must be under 20KB', 'error'); return; }
                          setImageUploading(true);
                          const res = await apiUploadProductImage(file);
                          setImageUploading(false);
                          if (res.success && res.url) {
                            setNewDevice(prev => ({ ...prev, imageUrl: res.url }));
                            addToast('Image uploaded!', 'success');
                          } else { addToast(res.error || 'Failed to upload image', 'error'); }
                          e.target.value = '';
                        }} />
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={async (e) => {
                          e.preventDefault(); setDragOver(false);
                          const file = e.dataTransfer.files?.[0];
                          if (!file) return;
                          if (!file.type.match(/image\/(jpeg|png|webp)/)) { addToast('Only JPG, PNG, WebP images allowed', 'error'); return; }
                          if (file.size > 20 * 1024) { addToast('Image must be under 20KB', 'error'); return; }
                          setImageUploading(true);
                          const res = await apiUploadProductImage(file);
                          setImageUploading(false);
                          if (res.success && res.url) { setNewDevice(prev => ({ ...prev, imageUrl: res.url })); addToast('Image uploaded!', 'success'); }
                          else { addToast(res.error || 'Failed to upload image', 'error'); }
                        }}
                        onClick={() => !imageUploading && fileInputRef.current?.click()}
                        style={{
                          border: `2px dashed ${dragOver ? 'var(--teal)' : 'var(--gray-200)'}`,
                          borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center',
                          cursor: imageUploading ? 'wait' : 'pointer',
                          background: dragOver ? 'rgba(0,128,128,0.04)' : 'var(--gray-50)',
                          transition: 'all 0.2s ease',
                        }}>
                        {imageUploading ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                            <Loader size={22} color="var(--teal)" style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>Uploading...</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3rem' }}>
                            <Upload size={20} color="var(--gray-400)" />
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)' }}>Click to upload or drag & drop</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>JPG, PNG, WebP — Max 20KB</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <input className="form-control" placeholder="https://example.com/device-image.jpg"
                      value={newDevice.imageUrl} onChange={e => setNewDevice({...newDevice, imageUrl: e.target.value})} id="new-device-image" />
                  )}

                  {newDevice.imageUrl && (
                    <div style={{ marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <div style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '.25rem', background: '#fff' }}>
                        <img src={newDevice.imageUrl} alt="Preview" style={{ height: '40px', width: '40px', objectFit: 'contain' }}
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Image set</p>
                      <button type="button" onClick={() => setNewDevice({...newDevice, imageUrl: ''})}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', marginLeft: 'auto' }}><X size={16} /></button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label" htmlFor="new-device-description" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} style={{ color: 'var(--teal)' }} />
                    About the Device (Optional)
                  </label>
                  <textarea id="new-device-description" className="form-control" rows={3}
                    placeholder="e.g. Digital upper arm blood pressure monitor with hypertension indicator. Features irregular heartbeat detection, 60-reading memory, and large LCD display."
                    value={newDevice.description}
                    onChange={e => setNewDevice({ ...newDevice, description: e.target.value })}
                    style={{ minHeight: '72px', resize: 'vertical', lineHeight: 1.5, fontSize: '0.9rem' }} />
                  {newDevice.description && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--teal-dark)', fontWeight: 600, marginTop: '2px', display: 'block', textAlign: 'right' }}>
                      {newDevice.description.length} chars
                    </span>
                  )}
                </div>

                {/* Tax & Discount */}
                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-device-tax-incl">Tax Included</label>
                    <select id="new-device-tax-incl" className="form-control" value={newDevice.taxIncluded} onChange={e => setNewDevice({...newDevice, taxIncluded: e.target.value === 'true'})}>
                      <option value="true">Yes (Tax Included in Price)</option>
                      <option value="false">No (Add Tax on top)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-device-tax-pct">Tax Percentage (%)</label>
                    <input id="new-device-tax-pct" className="form-control" type="number" min="0" step="0.01" disabled={newDevice.taxIncluded}
                      value={newDevice.taxPercent} onChange={e => setNewDevice({...newDevice, taxPercent: e.target.value})} />
                  </div>
                </div>

                {/* Pricing */}
                <div className="form-group" style={{ background:'var(--gray-50)', padding:'1rem', borderRadius:'var(--radius-md)' }}>
                  <label className="form-label" style={{ marginBottom:'1rem' }}>Unit Pricing Configuration</label>
                  {['Pieces', 'Boxes'].map(unitKey => (
                    <div key={unitKey} style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom:'.75rem' }}>
                      <div style={{ width:'90px' }}>
                        <label style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.85rem', fontWeight:600, cursor:'pointer' }}>
                          <input type="checkbox" checked={newDevice.pricing[unitKey].active}
                            onChange={e => setNewDevice({
                              ...newDevice,
                              pricing: { ...newDevice.pricing, [unitKey]: { ...newDevice.pricing[unitKey], active: e.target.checked } }
                            })} />
                          {unitKey}
                        </label>
                      </div>
                      <div style={{ flex:1 }}>
                        <input className="form-control" type="text" placeholder="Size (e.g. 1, 10)"
                          disabled={!newDevice.pricing[unitKey].active} required={newDevice.pricing[unitKey].active}
                          value={newDevice.pricing[unitKey].size}
                          onChange={e => setNewDevice({
                            ...newDevice,
                            pricing: { ...newDevice.pricing, [unitKey]: { ...newDevice.pricing[unitKey], size: e.target.value } }
                          })} />
                      </div>
                      <div style={{ flex:1 }}>
                        <input className="form-control" type="number" step="0.01" min="0" placeholder="W/S Price (₹)"
                          disabled={!newDevice.pricing[unitKey].active} required={newDevice.pricing[unitKey].active}
                          value={newDevice.pricing[unitKey].price}
                          onChange={e => setNewDevice({
                            ...newDevice,
                            pricing: { ...newDevice.pricing, [unitKey]: { ...newDevice.pricing[unitKey], price: e.target.value } }
                          })} />
                      </div>
                      <div style={{ flex:1 }}>
                        <input className="form-control" type="number" step="0.01" min="0" placeholder="MRP (₹)"
                          disabled={!newDevice.pricing[unitKey].active} required={newDevice.pricing[unitKey].active}
                          value={newDevice.pricing[unitKey].mrp}
                          onChange={e => setNewDevice({
                            ...newDevice,
                            pricing: { ...newDevice.pricing, [unitKey]: { ...newDevice.pricing[unitKey], mrp: e.target.value } }
                          })} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stock & Discount */}
                <div className="grid grid-2" style={{ gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-device-stock">Stock Availability</label>
                    <select id="new-device-stock" className="form-control" value={newDevice.inStock} onChange={e => setNewDevice({...newDevice, inStock: e.target.value === 'true'})}>
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-device-discount">Discount (%)</label>
                    <input className="form-control" type="number" min="0" step="0.1" placeholder="e.g. 10"
                      value={newDevice.discount} onChange={e => setNewDevice({...newDevice, discount: e.target.value})} id="new-device-discount" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                {editingId && (
                  <button type="button" className="btn btn-outline" style={{ color: 'var(--red)', borderColor: 'var(--red)', marginRight: 'auto' }}
                    onClick={() => { setShowAddModal(false); handleDelete(editingId, newDevice.name); }}>
                    <Trash2 size={15} /> Delete
                  </button>
                )}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowAddModal(false); setEditingId(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-device-btn">
                  <CheckCircle size={15} /> {editingId ? 'Update Device' : 'Save Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
