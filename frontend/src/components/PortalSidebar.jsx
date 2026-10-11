import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ClipboardList, Users, LogOut,
  ChevronLeft, ChevronRight, Bell, Menu, Shield, Store, Home, UserCheck, ShoppingBag, Tag, MessageSquare
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

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="sb-brand" id="sidebar-brand">
        <img src="/netLogo.jpeg" alt="NET PLUS" className="sb-logo" />
        {!collapsed && (
          <div>
            <div className="sb-brand-name">NET PLUS</div>
            <div className="sb-brand-sub">{user?.role === 'admin' ? 'Admin Panel' : 'Retailer Portal'}</div>
          </div>
        )}
        <button className="sb-collapse-btn" onClick={() => setCollapsed(c => !c)} id="sidebar-collapse-btn" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User info */}
      <div className="sb-user" id="sidebar-user">
        <div className="sb-user-avatar">
          {user?.role === 'admin' ? <Shield size={16} /> : <Store size={16} />}
        </div>
        {!collapsed && (
          <div className="sb-user-info">
            <div className="sb-user-name">{user?.storeName || user?.name}</div>
            <div className={`sb-user-role ${user?.role}`}>
              {user?.role === 'admin' ? 'Administrator' : 'Retailer'}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sb-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`sb-link${isActive(item.to) ? ' active' : ''}`}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g,'-')}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="sb-link-icon" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.to === '/portal/cart' && cart?.length > 0 && (
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
        <button className="sb-link sb-logout" onClick={handleLogout} id="sidebar-logout-btn" title={collapsed ? 'Sign Out' : undefined}>
          <LogOut size={18} className="sb-link-icon" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`portal-sidebar${collapsed ? ' collapsed' : ''}`} id="portal-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="sb-mobile-overlay" onClick={() => setMobileOpen(false)}>
          <aside className="portal-sidebar mobile-sidebar" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile Topbar */}
      <div className="sb-mobile-topbar" id="mobile-topbar">
        <button className="sb-mobile-menu-btn" onClick={() => setMobileOpen(true)} id="mobile-sidebar-btn" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/netLogo.jpeg" alt="" style={{ width: 32, borderRadius: 8 }} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>
            {title || 'Portal'}
          </span>
        </div>
        <button className="sb-mobile-notif-btn" id="mobile-notif-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
      </div>

      <style>{`
        .portal-sidebar { width:260px; min-height:100vh; background:#fff; display:flex; flex-direction:column; position:fixed; top:0; left:0; z-index:200; overflow:hidden; border-right: 1px solid var(--gray-200); }
        .portal-sidebar.collapsed { width: 76px; }

        .sb-brand { display:flex; align-items:center; gap:0.75rem; overflow:hidden; padding: 1.25rem; position: relative; border-bottom: 1px solid var(--gray-200); }
        .sb-logo { width:40px; height:40px; border-radius:8px; object-fit:cover; flex-shrink:0; }
        .sb-brand-name { font-size:1.1rem; font-weight:800; color:var(--navy); white-space:nowrap; line-height: 1.1; }
        .sb-brand-sub  { font-size:0.8rem; color:var(--teal); white-space:nowrap; font-weight: 700; margin-top: 0.15rem; }
        .sb-collapse-btn { position:absolute; right:8px; top:50%; transform:translateY(-50%); width:32px; height:32px; background:#fff; color:var(--navy); border:1px solid var(--gray-300); border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; }
        .sb-collapse-btn:hover { color: var(--teal); border-color: var(--teal); background: var(--cyan); }
        .portal-sidebar.collapsed .sb-collapse-btn { right: 22px; }

        .sb-user { display:flex; align-items:center; gap:0.85rem; padding:1rem 1.25rem; border-bottom:1px solid var(--gray-200); background: var(--off-white); }
        .sb-user-avatar { width:42px; height:42px; background:var(--teal); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
        .sb-user-name { font-size:0.95rem; font-weight:700; color:var(--navy); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sb-user-role { font-size:0.85rem; margin-top:2px; white-space:nowrap; font-weight: 600; }
        .sb-user-role.admin   { color:var(--teal); }
        .sb-user-role.retailer{ color:var(--gray-500); }

        .sb-nav { flex:1; padding:1rem 0.75rem; display:flex; flex-direction:column; gap:0.25rem; overflow-y:auto; }
        .sb-link { display:flex; align-items:center; gap:0.85rem; min-height:46px; padding:0.6rem 1rem; color:var(--navy-mid); font-size:1rem; font-weight:500; border-radius:8px; text-decoration:none; border:none; border-left:4px solid transparent; background:transparent; cursor:pointer; width:100%; white-space:nowrap; }
        .sb-link:hover { color:var(--teal-dark); background:var(--gray-100); }
        .sb-link.active { color:var(--teal-dark); background:var(--cyan); font-weight: 700; border-left-color: var(--teal); }
        .sb-link-icon { flex-shrink:0; color: inherit; }

        .sb-footer { padding:0.75rem; border-top:1px solid var(--gray-200); }
        .sb-logout { color:var(--red); justify-content: center; border: 1px solid #f0b8b8; border-left-width: 1px; background: #fff; }
        .sb-logout:hover { background:#fde8e8; color:#9b1c1c; }

        /* Mobile */
        .sb-mobile-overlay { display:none; position:fixed; inset:0; z-index:300; background:rgba(18,22,24,0.5); }
        .mobile-sidebar { position:relative; width:280px !important; }
        .sb-mobile-topbar { display:none; position:fixed; top:0; left:0; right:0; height:60px; background:#fff; border-bottom:1px solid var(--gray-200); z-index:100; align-items:center; justify-content:space-between; padding:0 1rem; }
        .sb-mobile-menu-btn, .sb-mobile-notif-btn { background:#fff; border:1px solid var(--gray-300); border-radius: 8px; cursor:pointer; color:var(--navy); min-width:44px; min-height:44px; display:flex; align-items:center; justify-content:center; }
        .sb-mobile-menu-btn:hover, .sb-mobile-notif-btn:hover { background: var(--gray-100); }

        @media(max-width:768px){.portal-sidebar{display:none}.sb-mobile-overlay{display:block}.sb-mobile-topbar{display:flex}}
      `}</style>
    </>
  );
}
