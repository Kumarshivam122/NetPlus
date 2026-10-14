import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ClipboardList, Users, LogOut,
  ChevronLeft, ChevronRight, Menu, X, Shield, Store, Home, UserCheck, ShoppingBag, Tag, MessageSquare, Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const RETAILER_NAV = [
  { to: '/',                   icon: Home,             label: 'Back to Site' },
  { to: '/portal',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portal/products',    icon: Package,          label: 'Browse Products' },
  { to: '/portal/cart',        icon: ShoppingBag,      label: 'Cart' },
  { to: '/portal/orders',      icon: ClipboardList,    label: 'My Orders' },
  { to: '/portal/request',     icon: MessageSquare,    label: 'Request Medicine' },
];

const ADMIN_NAV = [
  { to: '/',                   icon: Home,            label: 'Back to Site' },
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/verifications',icon: UserCheck,       label: 'Verifications' },
  { to: '/admin/users',        icon: Users,           label: 'All Users' },
  { to: '/admin/customers',    icon: Store,           label: 'Customer Details' },
  { to: '/admin/products',     icon: Package,         label: 'Products' },
  { to: '/admin/devices',      icon: Monitor,         label: 'Medical Devices' },
  { to: '/admin/orders',       icon: ClipboardList,   label: 'Orders' },
  { to: '/admin/coupons',      icon: Tag,             label: 'Coupons' },
];

export default function PortalSidebar({ title }) {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'admin' ? ADMIN_NAV : RETAILER_NAV;

  const isActive = (to) => {
    if (to === '/' || to === '/portal' || to === '/admin') {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const renderSidebarContent = ({ isMobile = false }) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <>
        {/* Brand */}
        <div className="sb-brand" id={isMobile ? 'mobile-sidebar-brand' : 'sidebar-brand'}>
          <img src="/netLogo.jpeg" alt="NET PLUS" className="sb-logo" />
          {!isCollapsed && (
            <div>
              <div className="sb-brand-name">NET PLUS</div>
              <div className="sb-brand-sub">{user?.role === 'admin' ? 'Admin Panel' : 'Retailer Portal'}</div>
            </div>
          )}
          {isMobile ? (
            <button
              type="button"
              className="sb-close-btn"
              onClick={() => setMobileOpen(false)}
              id="mobile-sidebar-close-btn"
              aria-label="Close sidebar menu"
            >
              <X size={20} />
            </button>
          ) : (
            <button
              type="button"
              className="sb-collapse-btn"
              onClick={() => setCollapsed(c => !c)}
              id="sidebar-collapse-btn"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {/* User info */}
        <div className="sb-user" id={isMobile ? 'mobile-sidebar-user' : 'sidebar-user'}>
          <div className="sb-user-avatar">
            {user?.role === 'admin' ? <Shield size={18} /> : <Store size={18} />}
          </div>
          {!isCollapsed && (
            <div className="sb-user-info">
              <div className="sb-user-name" title={user?.storeName || user?.name}>
                {user?.storeName || user?.name || 'User'}
              </div>
              <div className={`sb-user-role ${user?.role || 'retailer'}`}>
                {user?.role === 'admin' ? 'Administrator' : 'Retailer'}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sb-nav" aria-label="Portal Navigation">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sb-link${active ? ' active' : ''}`}
                id={`${isMobile ? 'mobile-' : ''}nav-${item.label.toLowerCase().replace(/\s+/g,'-')}`}
                title={isCollapsed ? item.label : undefined}
                onClick={() => {
                  if (isMobile) setMobileOpen(false);
                }}
              >
                <Icon size={18} className="sb-link-icon" />
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && item.to === '/portal/cart' && cart?.length > 0 && (
                  <span style={{ marginLeft:'auto', background:'var(--red)', color:'#fff', fontSize:'.8rem', fontWeight:800, padding:'.1rem .5rem', borderRadius:'20px' }}>
                    {cart.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="sb-footer">
          <button
            type="button"
            className="sb-link sb-logout"
            onClick={() => {
              if (isMobile) setMobileOpen(false);
              handleLogout();
            }}
            id={isMobile ? 'mobile-sidebar-logout-btn' : 'sidebar-logout-btn'}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={18} className="sb-link-icon" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`portal-sidebar-desktop${collapsed ? ' collapsed' : ''}`} id="portal-sidebar">
        {renderSidebarContent({ isMobile: false })}
      </aside>

      {/* Mobile Backdrop Overlay */}
      <div
        className={`sb-mobile-overlay${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />

      {/* Mobile Drawer */}
      <aside
        className={`sb-mobile-drawer${mobileOpen ? ' open' : ''}`}
        id="portal-mobile-sidebar"
        aria-label="Mobile Navigation"
        aria-hidden={!mobileOpen}
      >
        {renderSidebarContent({ isMobile: true })}
      </aside>

      {/* Mobile Topbar */}
      <header className="sb-mobile-topbar" id="mobile-topbar">
        <button
          type="button"
          className="sb-mobile-menu-btn"
          onClick={() => setMobileOpen(prev => !prev)}
          id="mobile-sidebar-btn"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="sb-mobile-title-wrap">
          <img src="/netLogo.jpeg" alt="NET PLUS" className="sb-mobile-logo" />
          <span className="sb-mobile-title">
            {title || (user?.role === 'admin' ? 'Admin Panel' : 'Retailer Portal')}
          </span>
        </div>

        <button
          type="button"
          className="sb-mobile-notif-btn"
          id="mobile-notif-btn"
          aria-label="Portal home"
          onClick={() => {
            setMobileOpen(false);
            navigate(user?.role === 'admin' ? '/admin' : '/portal');
          }}
        >
          {user?.role === 'admin' ? <Shield size={19} /> : <Store size={19} />}
        </button>
      </header>

      <style>{`
        /* ── Desktop Sidebar ── */
        .portal-sidebar-desktop {
          width: 260px;
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 200;
          overflow: hidden;
          border-right: 1px solid var(--gray-200);
          transition: width 0.2s ease;
        }
        .portal-sidebar-desktop.collapsed {
          width: 76px;
        }

        .sb-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
          padding: 1.25rem;
          position: relative;
          border-bottom: 1px solid var(--gray-200);
        }
        .sb-logo {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .sb-brand-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--navy);
          white-space: nowrap;
          line-height: 1.1;
        }
        .sb-brand-sub {
          font-size: 0.8rem;
          color: var(--teal);
          white-space: nowrap;
          font-weight: 700;
          margin-top: 0.15rem;
        }

        .sb-collapse-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          background: #fff;
          color: var(--navy);
          border: 1px solid var(--gray-300);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background-color 0.15s, color 0.15s, border-color 0.15s;
        }
        .sb-collapse-btn:hover {
          color: var(--teal);
          border-color: var(--teal);
          background: var(--cyan);
        }
        .portal-sidebar-desktop.collapsed .sb-collapse-btn {
          right: 22px;
        }

        .sb-close-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          background: var(--gray-100);
          color: var(--navy);
          border: 1px solid var(--gray-300);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: background-color 0.15s, color 0.15s, border-color 0.15s;
        }
        .sb-close-btn:hover, .sb-close-btn:active {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }

        .sb-user {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--gray-200);
          background: var(--off-white);
        }
        .sb-user-avatar {
          width: 42px;
          height: 42px;
          background: var(--teal);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }
        .sb-user-info {
          min-width: 0;
          flex: 1;
        }
        .sb-user-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--navy);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sb-user-role {
          font-size: 0.82rem;
          margin-top: 2px;
          white-space: nowrap;
          font-weight: 600;
        }
        .sb-user-role.admin { color: var(--teal); }
        .sb-user-role.retailer { color: var(--gray-500); }

        .sb-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .sb-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          min-height: 46px;
          padding: 0.65rem 1rem;
          color: var(--navy-mid);
          font-size: 0.98rem;
          font-weight: 500;
          border-radius: 8px;
          text-decoration: none;
          border: none;
          border-left: 4px solid transparent;
          background: transparent;
          cursor: pointer;
          width: 100%;
          white-space: nowrap;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: background-color 0.15s, color 0.15s, border-left-color 0.15s;
        }
        .sb-link:hover {
          color: var(--teal-dark);
          background: var(--gray-100);
        }
        .sb-link.active {
          color: var(--teal-dark);
          background: var(--cyan);
          font-weight: 700;
          border-left-color: var(--teal);
        }
        .sb-link-icon {
          flex-shrink: 0;
          color: inherit;
        }

        .sb-footer {
          padding: 0.85rem;
          border-top: 1px solid var(--gray-200);
          background: #ffffff;
        }
        .sb-logout {
          color: var(--red);
          justify-content: center;
          border: 1px solid #fecaca;
          border-left-width: 1px;
          background: #fff;
          font-weight: 600;
        }
        .sb-logout:hover, .sb-logout:active {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }

        /* ── Mobile Overlay & Drawer ── */
        .sb-mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 998;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .sb-mobile-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .sb-mobile-drawer {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 290px;
          max-width: 84vw;
          height: 100%;
          height: 100dvh;
          background: #ffffff;
          flex-direction: column;
          z-index: 999;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.2);
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        .sb-mobile-drawer.open {
          transform: translateX(0);
        }

        .sb-mobile-topbar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: #ffffff;
          border-bottom: 1px solid var(--gray-200);
          z-index: 100;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .sb-mobile-menu-btn, .sb-mobile-notif-btn {
          background: #ffffff;
          border: 1px solid var(--gray-300);
          border-radius: 8px;
          cursor: pointer;
          color: var(--navy);
          min-width: 42px;
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: background-color 0.15s, transform 0.1s;
        }
        .sb-mobile-menu-btn:hover, .sb-mobile-notif-btn:hover {
          background: var(--gray-100);
        }
        .sb-mobile-menu-btn:active, .sb-mobile-notif-btn:active {
          transform: scale(0.94);
        }
        .sb-mobile-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
        }
        .sb-mobile-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .sb-mobile-title {
          font-weight: 700;
          font-size: 1rem;
          color: var(--navy);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 768px) {
          .portal-sidebar-desktop {
            display: none !important;
          }
          .sb-mobile-overlay {
            display: block;
          }
          .sb-mobile-drawer {
            display: flex;
          }
          .sb-mobile-topbar {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}

