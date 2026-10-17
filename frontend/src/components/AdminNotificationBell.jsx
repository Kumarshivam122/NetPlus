import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing, ClipboardList, UserCheck, MessageSquare, Volume2, VolumeX, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAdminNotifications } from '../context/AdminNotificationContext';

export default function AdminNotificationBell({ style }) {
  const {
    pendingOrdersCount,
    latestOrder,
    pendingVerificationsCount,
    latestVerification,
    pendingEnquiriesCount,
    latestEnquiry,
    totalAlertsCount,
    isLiveSyncing,
    soundEnabled,
    toggleSound,
    refreshAll
  } = useAdminNotifications();

  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="admin-bell-container" ref={bellRef} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button
        type="button"
        className="admin-bell-btn"
        onClick={() => setOpen(prev => !prev)}
        aria-label={`Notifications, ${totalAlertsCount} pending alerts`}
        aria-expanded={open}
        title="Admin Notifications"
        style={{
          position: 'relative',
          background: totalAlertsCount > 0 ? '#eff6ff' : 'var(--gray-50, #f8fafc)',
          border: '1px solid ' + (totalAlertsCount > 0 ? '#bfdbfe' : 'var(--gray-200, #e2e8f0)'),
          color: totalAlertsCount > 0 ? '#1d4ed8' : 'var(--navy-mid, #334155)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: totalAlertsCount > 0 ? '0 2px 8px rgba(29, 78, 216, 0.15)' : 'none'
        }}
      >
        {totalAlertsCount > 0 ? (
          <BellRing size={19} className="pulse-icon" />
        ) : (
          <Bell size={19} />
        )}

        {totalAlertsCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#dc2626',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
              minWidth: '20px',
              height: '20px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #fff',
              boxShadow: '0 2px 5px rgba(220, 38, 38, 0.4)'
            }}
          >
            {totalAlertsCount > 99 ? '99+' : totalAlertsCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="admin-bell-dropdown"
          style={{
            position: 'absolute',
            top: '48px',
            right: '0',
            width: '360px',
            maxWidth: '90vw',
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid var(--gray-200, #e2e8f0)',
            boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.07)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeInDown 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.15rem',
            background: '#f8fafc',
            borderBottom: '1px solid var(--gray-200, #e2e8f0)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--navy, #0f172a)', fontSize: '0.95rem' }}>Notifications</span>
              {totalAlertsCount > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '12px' }}>
                  {totalAlertsCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={toggleSound}
                title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: soundEnabled ? 'var(--teal, #0d9488)' : 'var(--gray-400, #94a3b8)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px'
                }}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                type="button"
                onClick={refreshAll}
                title="Refresh all data"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--gray-500, #64748b)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px'
                }}
              >
                <RefreshCw size={15} className={isLiveSyncing ? 'spin-icon' : ''} />
              </button>
            </div>
          </div>

          {/* List of alerts */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.5rem 0' }}>
            {totalAlertsCount === 0 ? (
              <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--gray-500, #64748b)' }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.5rem', opacity: 0.8 }} />
                <div style={{ fontWeight: 600, color: 'var(--navy, #0f172a)', fontSize: '0.92rem' }}>All Caught Up!</div>
                <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>No pending orders, verifications, or enquiries.</div>
              </div>
            ) : (
              <>
                {/* 1. Orders Item */}
                <Link
                  to="/admin/orders"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '0.75rem 1.15rem',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f1f5f9',
                    background: pendingOrdersCount > 0 ? '#f0fdf4' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = pendingOrdersCount > 0 ? '#f0fdf4' : 'transparent'}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ClipboardList size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy, #0f172a)' }}>
                        Retailer Orders
                      </span>
                      {pendingOrdersCount > 0 && (
                        <span style={{ background: '#0284c7', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                          {pendingOrdersCount} PENDING
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--gray-600, #475569)', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {latestOrder 
                        ? `Latest: Order #${latestOrder.orderId} from ${latestOrder.userName || 'Retailer'}`
                        : `${pendingOrdersCount} orders waiting for review & approval`}
                    </p>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" style={{ marginTop: '10px' }} />
                </Link>

                {/* 2. Verifications Item */}
                <Link
                  to="/admin/verifications"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '0.75rem 1.15rem',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f1f5f9',
                    background: pendingVerificationsCount > 0 ? '#fffbeb' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = pendingVerificationsCount > 0 ? '#fffbeb' : 'transparent'}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <UserCheck size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy, #0f172a)' }}>
                        Verifications
                      </span>
                      {pendingVerificationsCount > 0 && (
                        <span style={{ background: '#d97706', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                          {pendingVerificationsCount} PENDING
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--gray-600, #475569)', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {latestVerification
                        ? `Latest: ${latestVerification.storeName || latestVerification.name} (${latestVerification.city || 'Store'})`
                        : `${pendingVerificationsCount} retailers waiting for license verification`}
                    </p>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" style={{ marginTop: '10px' }} />
                </Link>

                {/* 3. Enquiries & Requests Item */}
                <Link
                  to="/admin/enquiries"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '0.75rem 1.15rem',
                    textDecoration: 'none',
                    background: pendingEnquiriesCount > 0 ? '#f0fdf4' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = pendingEnquiriesCount > 0 ? '#f0fdf4' : 'transparent'}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MessageSquare size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy, #0f172a)' }}>
                        Enquiries &amp; Requests
                      </span>
                      {pendingEnquiriesCount > 0 && (
                        <span style={{ background: '#16a34a', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                          {pendingEnquiriesCount} PENDING
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--gray-600, #475569)', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {latestEnquiry
                        ? `Latest: ${latestEnquiry.type === 'medicine_request' ? latestEnquiry.medicineName : latestEnquiry.subject} from ${latestEnquiry.name}`
                        : `${pendingEnquiriesCount} enquiries awaiting response`}
                    </p>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" style={{ marginTop: '10px' }} />
                </Link>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1.15rem',
            background: '#f8fafc',
            borderTop: '1px solid var(--gray-200, #e2e8f0)',
            fontSize: '0.78rem',
            color: 'var(--gray-500, #64748b)'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span className="pulse-dot"></span> Live Sync Enabled
            </span>
            <span>Auto-polls every 12s</span>
          </div>
        </div>
      )}
    </div>
  );
}
