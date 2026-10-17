import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Pill, Mail, Phone, Calendar, CheckCircle2, 
  Clock, AlertCircle, Trash2, Search, Filter, RefreshCw, 
  ExternalLink, Send, Building, User, FileText, Check, ChevronDown
} from 'lucide-react';
import PortalSidebar from '../../components/PortalSidebar';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import { apiGetEnquiries, apiUpdateEnquiryStatus, apiDeleteEnquiry } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAdminNotifications } from '../../context/AdminNotificationContext';

export default function AdminEnquiries() {
  const { addToast } = useToast();
  const {
    pendingEnquiriesCount,
    latestEnquiry,
    isLiveSyncing,
    refreshAll
  } = useAdminNotifications();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all | medicine_request | contact | pending | resolved
  const [searchTerm, setSearchTerm] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await apiGetEnquiries();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
      addToast('Failed to load enquiries', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setStatusUpdatingId(id);
    try {
      const updated = await apiUpdateEnquiryStatus(id, newStatus);
      if (updated) {
        setEnquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        addToast(`Marked as ${newStatus}`, 'success');
        refreshAll();
      } else {
        addToast('Failed to update status', 'danger');
      }
    } catch (err) {
      addToast(err.message || 'Error updating status', 'danger');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete this enquiry from "${title}"?`)) return;
    try {
      const ok = await apiDeleteEnquiry(id);
      if (ok) {
        setEnquiries(prev => prev.filter(item => item.id !== id));
        addToast('Enquiry deleted successfully', 'info');
        refreshAll();
      } else {
        addToast('Failed to delete enquiry', 'danger');
      }
    } catch (err) {
      addToast('Error deleting enquiry', 'danger');
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = enquiries.length;
    const medicineRequests = enquiries.filter(e => e.type === 'medicine_request').length;
    const contactQueries = enquiries.filter(e => e.type === 'contact').length;
    const pending = enquiries.filter(e => !e.status || e.status === 'pending').length;
    const resolved = enquiries.filter(e => e.status === 'resolved').length;
    return { total, medicineRequests, contactQueries, pending, resolved };
  }, [enquiries]);

  // Filtered and searched data
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(item => {
      // Type or status filter
      if (filterType === 'medicine_request' && item.type !== 'medicine_request') return false;
      if (filterType === 'contact' && item.type !== 'contact') return false;
      if (filterType === 'pending' && item.status === 'resolved') return false;
      if (filterType === 'resolved' && item.status !== 'resolved') return false;

      // Search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const searchable = [
          item.medicineName,
          item.name,
          item.pharmacyName,
          item.email,
          item.phone,
          item.subject,
          item.message,
          item.notes,
          item.dlNumber
        ].filter(Boolean).join(' ').toLowerCase();

        return searchable.includes(term);
      }

      return true;
    });
  }, [enquiries, filterType, searchTerm]);

  const cleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="portal-layout" id="admin-enquiries-page">
      <PortalSidebar title="Enquiries" />

      <main className="portal-main">
        {/* Topbar */}
        <div className="portal-topbar">
          <div>
            <h1 style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 700 }}>
              Enquiries & Medicine Requests
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '2px' }}>
              Review customer contact messages and retailer special medicine requests
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AdminNotificationBell />
            <button 
              className="btn btn-outline" 
              onClick={() => { fetchEnquiries(); refreshAll(); }}
              disabled={loading}
              title="Refresh messages"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={15} className={loading || isLiveSyncing ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="portal-content">
          {/* Enquiry Notification Message Banner */}
          {pendingEnquiriesCount > 0 && (
            <div className="admin-notification-alert enquiry-alert" role="status" style={{ marginBottom: '1.5rem' }}>
              <div className="alert-icon-wrapper pulse-icon">
                <MessageSquare size={22} />
              </div>
              <div className="alert-content">
                <div className="alert-title">
                  <strong>New Enquiry & Medicine Request Alert</strong>
                  <span className="alert-badge">{pendingEnquiriesCount} Unresolved</span>
                  <span className="live-sync-badge"><span className="pulse-dot"></span> Live Sync Active</span>
                </div>
                <p className="alert-desc">
                  {latestEnquiry ? (
                    <>
                      Latest {latestEnquiry.type === 'medicine_request' ? 'Medicine Request' : 'Customer Query'}: <strong>{latestEnquiry.medicineName || latestEnquiry.subject || latestEnquiry.name || 'Inquiry'}</strong> from <strong>{latestEnquiry.pharmacyName || latestEnquiry.name || 'User'}</strong> ({latestEnquiry.phone || latestEnquiry.email || 'Contact provided'}).
                    </>
                  ) : (
                    'New customer contact inquiries or medicine availability requests have been submitted.'
                  )}
                </p>
              </div>
              <div className="alert-actions">
                <button 
                  type="button"
                  className={`btn btn-sm ${filterType === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilterType(filterType === 'pending' ? 'all' : 'pending')}
                >
                  {filterType === 'pending' ? 'Show All Messages' : `View Pending Messages (${pendingEnquiriesCount})`}
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => { fetchEnquiries(); refreshAll(); }}
                  title="Sync enquiries and requests"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={14} className={isLiveSyncing ? 'spin-icon' : ''} /> Sync
                </button>
              </div>
            </div>
          )}
          {/* Stats Cards */}
          <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterType('all')}>
              <div className="stat-icon teal"><MessageSquare size={22} /></div>
              <div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Messages</div>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterType('pending')}>
              <div className="stat-icon accent"><Clock size={22} /></div>
              <div>
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">Pending Action</div>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterType('medicine_request')}>
              <div className="stat-icon navy"><Pill size={22} /></div>
              <div>
                <div className="stat-value">{stats.medicineRequests}</div>
                <div className="stat-label">Medicine Requests</div>
              </div>
            </div>

            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterType('contact')}>
              <div className="stat-icon green"><Mail size={22} /></div>
              <div>
                <div className="stat-value">{stats.contactQueries}</div>
                <div className="stat-label">Contact Queries</div>
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="table-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Filter Tabs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  { id: 'all', label: `All (${stats.total})` },
                  { id: 'pending', label: `Pending (${stats.pending})` },
                  { id: 'medicine_request', label: `Medicine Requests (${stats.medicineRequests})` },
                  { id: 'contact', label: `Contact Support (${stats.contactQueries})` },
                  { id: 'resolved', label: `Resolved (${stats.resolved})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`btn btn-sm ${filterType === tab.id ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilterType(tab.id)}
                    style={{ borderRadius: '20px', padding: '0.35rem 0.85rem' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, medicine, email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '36px', height: '38px', borderRadius: '20px', fontSize: '0.875rem' }}
                />
              </div>
            </div>
          </div>

          {/* Enquiries List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--gray-500)' }}>Loading enquiries and requests...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="table-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--gray-500)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gray-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--gray-400)' }}>
                <MessageSquare size={32} />
              </div>
              <h3 style={{ color: 'var(--navy)', marginBottom: '0.5rem', fontWeight: 600 }}>No Messages Found</h3>
              <p style={{ maxWidth: '420px', margin: '0 auto', fontSize: '0.9rem' }}>
                {searchTerm ? 'No results matched your search query. Try clearing the search term.' : 'There are currently no enquiries or medicine requests in this category.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredEnquiries.map(item => {
                const isMedRequest = item.type === 'medicine_request';
                const isPending = !item.status || item.status === 'pending';
                const isResolved = item.status === 'resolved';
                const formattedDate = item.createdAt 
                  ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Recent';

                const targetPhone = item.phone ? cleanPhone(item.phone) : '';
                const waPhone = targetPhone.startsWith('91') ? targetPhone : `91${targetPhone}`;

                return (
                  <div 
                    key={item.id} 
                    className="table-card"
                    style={{
                      padding: '1.5rem',
                      borderLeft: `5px solid ${isMedRequest ? 'var(--teal)' : 'var(--blue)'}`,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {isMedRequest ? (
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '5px', 
                            background: '#e6fffa', 
                            color: '#0d9488', 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.78rem', 
                            fontWeight: 700, 
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase'
                          }}>
                            <Pill size={14} /> Medicine Request
                          </span>
                        ) : (
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '5px', 
                            background: '#ebf8ff', 
                            color: '#2b6cb0', 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.78rem', 
                            fontWeight: 700, 
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase'
                          }}>
                            <Mail size={14} /> Contact Query
                          </span>
                        )}

                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          background: isResolved ? '#e6f4ea' : isPending ? '#fef3c7' : '#e0f2fe',
                          color: isResolved ? '#137333' : isPending ? '#b45309' : '#0369a1'
                        }}>
                          {isResolved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          {item.status ? item.status.toUpperCase() : 'PENDING'}
                        </span>

                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {formattedDate}
                        </span>
                      </div>

                      {/* Actions Toolbar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {/* Status Toggle Button */}
                        {isPending ? (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleStatusChange(item.id, 'resolved')}
                            disabled={statusUpdatingId === item.id}
                            style={{ borderColor: 'var(--green)', color: 'var(--green)', fontSize: '0.8rem' }}
                          >
                            <Check size={14} /> Mark Resolved
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleStatusChange(item.id, 'pending')}
                            disabled={statusUpdatingId === item.id}
                            style={{ fontSize: '0.8rem' }}
                          >
                            <Clock size={14} /> Mark Pending
                          </button>
                        )}

                        {/* WhatsApp Reply */}
                        {item.phone && (
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                              isMedRequest 
                                ? `Hello ${item.name || item.pharmacyName || ''}, regarding your medicine request for "${item.medicineName}" on NET PLUS:` 
                                : `Hello ${item.name || ''}, regarding your enquiry on NET PLUS:`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm"
                            style={{ background: '#25D366', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                            title="Chat on WhatsApp"
                          >
                            <Send size={13} /> WhatsApp
                          </a>
                        )}

                        {/* Direct Call */}
                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            className="btn btn-sm btn-outline"
                            title={`Call ${item.phone}`}
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <Phone size={14} />
                          </a>
                        )}

                        {/* Email */}
                        {item.email && (
                          <a
                            href={`mailto:${item.email}?subject=${encodeURIComponent(
                              isMedRequest ? `NET PLUS: Medicine Request Update (${item.medicineName})` : `NET PLUS: Re: ${item.subject || 'Your Inquiry'}`
                            )}`}
                            className="btn btn-sm btn-outline"
                            title={`Email ${item.email}`}
                            style={{ padding: '0.35rem 0.6rem' }}
                          >
                            <Mail size={14} />
                          </a>
                        )}

                        {/* Delete */}
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleDelete(item.id, item.name || item.medicineName || 'this enquiry')}
                          style={{ borderColor: '#fecaca', color: '#dc2626', padding: '0.35rem 0.6rem' }}
                          title="Delete enquiry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Content Section */}
                    {isMedRequest ? (
                      <div>
                        {/* Medicine Title & Details */}
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)' }}>
                              💊 {item.medicineName}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--gray-600)', fontWeight: 600 }}>
                              Requested Quantity: <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{item.quantity || 'Not specified'}</span>
                            </div>
                          </div>

                          {item.urgency && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                              <strong>Urgency / Expected Delivery:</strong> {item.urgency}
                            </div>
                          )}

                          {item.notes && (
                            <div style={{ fontSize: '0.9rem', color: 'var(--gray-700)', background: '#fff', padding: '0.75rem', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                              <strong>Retailer Notes:</strong> {item.notes}
                            </div>
                          )}
                        </div>

                        {/* Retailer Info Strip */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                          {item.pharmacyName && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Building size={14} color="var(--teal)" />
                              <strong>Pharmacy:</strong> {item.pharmacyName}
                            </div>
                          )}
                          {item.name && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <User size={14} color="var(--teal)" />
                              <strong>Contact:</strong> {item.name}
                            </div>
                          )}
                          {item.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Phone size={14} color="var(--teal)" />
                              <strong>Phone:</strong> <a href={`tel:${item.phone}`} style={{ color: 'inherit' }}>{item.phone}</a>
                            </div>
                          )}
                          {item.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Mail size={14} color="var(--teal)" />
                              <strong>Email:</strong> <a href={`mailto:${item.email}`} style={{ color: 'inherit' }}>{item.email}</a>
                            </div>
                          )}
                          {item.dlNumber && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <FileText size={14} color="var(--teal)" />
                              <strong>DL No:</strong> {item.dlNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Contact Message Content */}
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                          {item.subject && (
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                              {item.subject}
                            </div>
                          )}
                          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--gray-700)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {item.message}
                          </p>
                        </div>

                        {/* Sender Details */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                          {item.name && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <User size={14} color="var(--blue)" />
                              <strong>Sender:</strong> {item.name}
                            </div>
                          )}
                          {item.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Phone size={14} color="var(--blue)" />
                              <strong>Phone:</strong> <a href={`tel:${item.phone}`} style={{ color: 'inherit' }}>{item.phone}</a>
                            </div>
                          )}
                          {item.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Mail size={14} color="var(--blue)" />
                              <strong>Email:</strong> <a href={`mailto:${item.email}`} style={{ color: 'inherit' }}>{item.email}</a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
