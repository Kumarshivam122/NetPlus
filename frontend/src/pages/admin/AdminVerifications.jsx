import React, { useState, useCallback, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, Trash2, Clock, X, Phone, MapPin, FileText, Store, ExternalLink } from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import { apiGetAllUsers, apiUpdateUserStatus, apiDeleteUser } from '../../services/api';
import { useToast } from '../../context/ToastContext';

function UserDetailModal({ user: u, onClose, onStatusChange }) {
  return (
    <div className="modal-overlay" id="user-detail-overlay">
      <div className="modal" style={{ maxWidth:'620px' }} id="user-detail-modal">
        <div className="modal-header">
          <div>
            <h4 style={{ color:'var(--navy)' }}>Retailer Details</h4>
            <p style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>ID: {u.id}</p>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--gray-400)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
          {/* Left: Store */}
          <div>
            <div className="detail-section-title"><Store size={14} /> Store Information</div>
            {[
              ['Store Name',    u.storeName || '—'],
              ['Store Type',    u.storeType || '—'],
              ['Drug Licence',  u.licenceNo || '—'],
              ['GSTIN',         u.gstin || '—'],
            ].map(([k,v]) => (
              <div key={k} className="detail-row">
                <span>{k}</span><strong>{v}</strong>
              </div>
            ))}
          </div>
          {/* Right: Contact */}
          <div>
            <div className="detail-section-title"><Phone size={14} /> Contact Information</div>
            {[
              ['Owner Name',    u.ownerName || '—'],
              ['Phone',         u.phone || '—'],
              ['Alt Phone',     u.alternatePhone || '—'],
              ['Email',         u.email || '—'],
            ].map(([k,v]) => (
              <div key={k} className="detail-row">
                <span>{k}</span><strong style={{ wordBreak:'break-all' }}>{v}</strong>
              </div>
            ))}
          </div>
          {/* Full-width: Address */}
          <div style={{ gridColumn:'span 2' }}>
            <div className="detail-section-title"><MapPin size={14} /> Address</div>
            <div style={{ background:'var(--gray-50)', borderRadius:'var(--radius-md)', padding:'.85rem', fontSize:'.88rem', color:'var(--gray-600)', lineHeight:1.6 }}>
              {u.storeAddress ? `${u.storeAddress}, ${u.city || ''}, ${u.state || ''} – ${u.pincode || ''}` : 'Address not provided'}
            </div>
          </div>
          {/* Documents */}
          <div style={{ gridColumn:'span 2' }}>
            <div className="detail-section-title"><FileText size={14} /> Submitted Documents</div>
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <div className="doc-thumb">
                <FileText size={28} style={{ color: u.licenceFileName ? 'var(--teal)' : 'var(--gray-300)' }} />
                <div className="doc-thumb-name">Drug Licence</div>
                <div className="doc-thumb-file">{u.licenceFileName || 'Not Uploaded'}</div>
                {u.licenceFileUrl && (
                  <a href={u.licenceFileUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:'.75rem', color:'var(--teal)', display:'flex', alignItems:'center', gap:'.2rem', marginTop:'.2rem' }}>
                    View File <ExternalLink size={12} />
                  </a>
                )}
              </div>
              
              <div className="doc-thumb">
                <FileText size={28} style={{ color: u.licenceFile2Name ? 'var(--teal)' : 'var(--gray-300)' }} />
                <div className="doc-thumb-name">Drug Licence (Page 2)</div>
                <div className="doc-thumb-file">{u.licenceFile2Name || 'Not Uploaded'}</div>
                {u.licenceFile2Url && (
                  <a href={u.licenceFile2Url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:'.75rem', color:'var(--teal)', display:'flex', alignItems:'center', gap:'.2rem', marginTop:'.2rem' }}>
                    View File <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="doc-thumb">
                <FileText size={28} style={{ color: u.gstinFileName ? 'var(--teal)' : 'var(--gray-300)' }} />
                <div className="doc-thumb-name">GSTIN Document</div>
                <div className="doc-thumb-file">{u.gstinFileName || 'Not Uploaded'}</div>
                {u.gstinFileUrl && (
                  <a href={u.gstinFileUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:'.75rem', color:'var(--teal)', display:'flex', alignItems:'center', gap:'.2rem', marginTop:'.2rem' }}>
                    View File <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="doc-thumb">
                <Store size={28} style={{ color: u.shopPhotoName ? 'var(--navy)' : 'var(--gray-300)' }} />
                <div className="doc-thumb-name">Shop Photo</div>
                <div className="doc-thumb-file">{u.shopPhotoName || 'Not Uploaded'}</div>
                {u.shopPhotoUrl && (
                  <a href={u.shopPhotoUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:'.75rem', color:'var(--teal)', display:'flex', alignItems:'center', gap:'.2rem', marginTop:'.2rem' }}>
                    View Photo <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <span className={`badge badge-${
            u.status === 'approved' ? 'success' : 
            u.status === 'pending' ? 'warning' : 
            u.status === 'onboarding' ? 'info' : 'danger'
          }`} style={{ marginRight:'auto' }}>
            Status: {u.status}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
          
          {u.status === 'pending' && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => onStatusChange(u.id,'approved')} id="approve-user-btn">
                <CheckCircle size={14} /> Approve
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onStatusChange(u.id,'rejected')} id="reject-user-btn">
                <XCircle size={14} /> Reject
              </button>
            </>
          )}

          {u.status === 'onboarding' && (
            <span style={{ fontSize: '.8rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>
              Waiting for user to submit details...
            </span>
          )}

          {(u.status === 'approved' || u.status === 'rejected') && (
            <button className="btn btn-ghost btn-sm" style={{ color:'var(--gray-400)' }}
              onClick={() => onStatusChange(u.id,'pending')}>
              <Clock size={14} /> Mark Pending
            </button>
          )}
        </div>
      </div>
      <style>{`
        .detail-section-title { display:flex; align-items:center; gap:.4rem; font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--teal-dark); margin-bottom:.6rem; }
        .detail-row { display:flex; justify-content:space-between; padding:.35rem 0; border-bottom:1px solid var(--gray-100); font-size:.85rem; }
        .detail-row span { color:var(--gray-400); }
        .detail-row strong { color:var(--navy); max-width:55%; text-align:right; }
        .doc-thumb { display:flex; flex-direction:column; align-items:center; background:var(--gray-50); border:1.5px solid var(--gray-100); border-radius:var(--radius-md); padding:1rem; gap:.4rem; min-width:120px; }
        .doc-thumb-name { font-weight:600; font-size:.82rem; color:var(--navy); }
        .doc-thumb-file { font-size:.68rem; color:var(--gray-400); word-break:break-all; text-align:center; }
      `}</style>
    </div>
  );
}

export default function AdminVerifications() {
  const { addToast } = useToast();
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);

  const reload = useCallback(async () => {
    const list = await apiGetAllUsers();
    // Only display retailers in the verifications tab who are either pending or onboarding
    const verifications = (list || []).filter(u => u.role !== 'admin' && (u.status === 'pending' || u.status === 'onboarding'));
    setUsers(verifications);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleStatus = useCallback(async (id, status) => {
    await apiUpdateUserStatus(id, status);
    addToast(`User status updated to "${status}"`, status === 'approved' ? 'success' : 'warning');
    await reload();
    setSelected(prev => prev ? { ...prev, status } : null);
  }, [addToast, reload]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete retailer "${name}"? This cannot be undone.`)) return;
    await apiDeleteUser(id);
    addToast(`${name} has been deleted.`, 'info');
    reload();
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.storeName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || u.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="portal-layout" id="admin-verifications">
      <PortalSidebar title="Verifications" />
      <main className="portal-main">
        <div className="portal-topbar">
          <div>
            <h4 style={{ color:'var(--navy)', fontFamily:'var(--font-display)' }}>Verification Requests</h4>
            <p style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>{users.length} retailers waiting for approval</p>
          </div>
        </div>
        <div className="portal-content">
          {/* Filters */}
          <div style={{ display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap', marginBottom:'1.5rem' }}>
            <div className="search-bar" style={{ flex:1, maxWidth:'360px' }}>
              <Search size={16} style={{ color:'var(--gray-400)' }} />
              <input id="user-search" placeholder="Search store, email, city..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--gray-400)' }}
                onClick={()=>setSearch('')}><X size={14}/></button>}
            </div>
            <div className="filter-chips">
              {[
                { val:'all',        label:'All Requests' },
                { val:'pending',    label:'⏳ Action Required' },
                { val:'onboarding', label:'🆕 Incomplete Profile' }
              ].map(f => (
                <button key={f.val} className={`chip${filter===f.val?' active':''}`}
                  onClick={()=>setFilter(f.val)} id={`admin-filter-${f.val}`}>{f.label}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'var(--gray-400)' }}>
              <p>No retailers found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Owner</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Licence</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight:700, color:'var(--navy)' }}>{u.storeName || '—'}</td>
                      <td>{u.ownerName}</td>
                      <td>{u.phone || '—'}</td>
                      <td>{u.city}</td>
                      <td style={{ fontSize:'.8rem', color:'var(--gray-500)' }}>{u.licenceNo || '-'}</td>
                      <td>
                        <span className={`badge badge-${
                          u.status === 'approved' ? 'success' : 
                          u.status === 'pending' ? 'warning' : 
                          u.status === 'onboarding' ? 'info' : 'danger'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ fontSize:'.78rem', color:'var(--gray-400)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'.35rem' }}>
                          <button className="btn btn-ghost btn-sm" title="View Details"
                            onClick={() => setSelected(u)} id={`view-${u.id}`}>
                            <Eye size={13} />
                          </button>
                          {u.status === 'pending' && (
                            <button className="btn btn-primary btn-sm" title="Approve"
                              onClick={() => handleStatus(u.id,'approved')} id={`approve-${u.id}`}>
                              <CheckCircle size={13} />
                            </button>
                          )}
                          {u.status === 'pending' && (
                            <button className="btn btn-danger btn-sm" title="Reject"
                              onClick={() => handleStatus(u.id,'rejected')} id={`reject-${u.id}`}>
                              <XCircle size={13} />
                            </button>
                          )}
                          <button className="btn btn-ghost btn-sm" title="Delete" style={{ color:'var(--red)' }}
                            onClick={() => handleDelete(u.id, u.storeName)} id={`delete-${u.id}`}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(id, status) => { handleStatus(id, status); setSelected(null); }}
        />
      )}
    </div>
  );
}
