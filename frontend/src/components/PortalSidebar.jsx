import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ClipboardList, Users, LogOut,
  ChevronLeft, ChevronRight, Bell, Menu, Shield, Store, Home, UserCheck, ShoppingBag, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const RETAILER_NAV = [
  { to: '/',                   icon: Home,             label: 'Back to Site' },
  { to: '/portal',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portal/products',    icon: Package,          label: 'Browse Products' },
  { to: '/portal/cart',        icon: ShoppingBag,      label: 'Cart' },
  { to: '/portal/orders',      icon: ClipboardList,    label: 'My Orders' },
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
        <button className="sb-collapse-btn" onClick={() => setCollapsed(c => !c)} id="sidebar-collapse-btn">
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
              {user?.role === 'admin' ? '⚡ Administrator' : '🏪 Retailer'}
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
                <span style={{ marginLeft:'auto', background:'var(--red)', color:'#fff', fontSize:'.7rem', fontWeight:800, padding:'.1rem .45rem', borderRadius:'20px' }}>
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
        <button className="sb-mobile-menu-btn" onClick={() => setMobileOpen(true)} id="mobile-sidebar-btn">
          <Menu size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/netLogo.jpeg" alt="" style={{ width: 32, borderRadius: 8 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>
            {title || 'Portal'}
          </span>
        </div>
        <button className="sb-mobile-notif-btn" id="mobile-notif-btn">
          <Bell size={20} />
        </button>
      </div>

      <style>{`
        .portal-sidebar { width:260px; min-height:100vh; background:#fff; display:flex; flex-direction:column; position:fixed; top:0; left:0; z-index:200; transition:width var(--transition); overflow:hidden; border-right: 1px solid var(--gray-100); }
        .portal-sidebar.collapsed { width: 76px; }
        
        .sb-header { padding:1.5rem 1.25rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--gray-50); position:relative; }
        .sb-brand { display:flex; align-items:center; gap:0.75rem; overflow:hidden; padding: 1.25rem; }
        .sb-logo { width:40px; height:40px; border-radius:10px; object-fit:cover; flex-shrink:0; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
        .sb-brand-name { font-family:var(--font-display); font-size:1.1rem; font-weight:800; color:var(--navy); white-space:nowrap; letter-spacing: -0.02em; }
        .sb-brand-sub  { font-size:0.65rem; color:var(--teal); letter-spacing:0.12em; text-transform:uppercase; white-space:nowrap; font-weight: 700; margin-top: 0.1rem; }
        .sb-collapse-btn { position:absolute; right:-14px; top:50%; transform:translateY(-50%); width:28px; height:28px; background:#fff; color:var(--navy); border:1px solid var(--gray-200); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.05); z-index:10; transition: var(--transition); }
        .sb-collapse-btn:hover { transform: translateY(-50%) scale(1.1); color: var(--teal); border-color: var(--teal); }
        
        .sb-user { display:flex; align-items:center; gap:0.85rem; padding:1.25rem; border-bottom:1px solid var(--gray-50); background: var(--gray-50); }
        .sb-user-avatar { width:42px; height:42px; background:linear-gradient(135deg, var(--teal), var(--cyan)); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; box-shadow: 0 4px 12px rgba(0,184,169,0.2); }
        .sb-user-name { font-size:0.9rem; font-weight:700; color:var(--navy); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sb-user-role { font-size:0.7rem; margin-top:3px; white-space:nowrap; font-weight: 600; }
        .sb-user-role.admin   { color:var(--teal); }
        .sb-user-role.retailer{ color:var(--gray-500); }
        
        .sb-nav { flex:1; padding:1.25rem 0.85rem; display:flex; flex-direction:column; gap:0.4rem; overflow-y:auto; }
        .sb-link { display:flex; align-items:center; gap:0.85rem; padding:0.85rem 1rem; color:var(--gray-500); font-size:0.92rem; font-weight:600; border-radius:var(--radius-lg); transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); text-decoration:none; border:none; background:transparent; cursor:pointer; width:100%; white-space:nowrap; }
        .sb-link:hover { color:var(--navy); background:var(--gray-50); transform: translateX(4px); }
        .sb-link.active { color:var(--teal); background:rgba(0,184,169,0.08); font-weight: 700; transform: translateX(4px); }
        .sb-link-icon { flex-shrink:0; transition: var(--transition); color: inherit; }
        .sb-link:hover .sb-link-icon { transform: scale(1.1); color: var(--teal); }
        .sb-link.active .sb-link-icon { color: var(--teal); transform: scale(1.1); }
        
        .sb-footer { padding:1rem 0.85rem; border-top:1px solid var(--gray-50); }
        .sb-logout { color:var(--red); justify-content: center; background: rgba(229,57,53,0.05); }
        .sb-logout:hover { background:rgba(229,57,53,0.1); color:var(--red); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(229,57,53,0.1); }
        .sb-logout.active { transform: none; box-shadow: none; }
        
        /* Mobile */
        .sb-mobile-overlay { display:none; position:fixed; inset:0; z-index:300; background:rgba(15, 23, 42, 0.6); backdrop-filter:blur(4px); }
        .mobile-sidebar { position:relative; width:280px !important; }
        .sb-mobile-topbar { display:none; position:fixed; top:0; left:0; right:0; height:60px; background:#fff; border-bottom:1px solid var(--gray-100); box-shadow:var(--shadow-sm); z-index:100; align-items:center; justify-content:space-between; padding:0 1.25rem; }
        .sb-mobile-menu-btn, .sb-mobile-notif-btn { background:var(--gray-50); border:1px solid var(--gray-100); border-radius: var(--radius-md); cursor:pointer; color:var(--navy); padding:0.4rem; display:flex; align-items:center; justify-content:center; transition: var(--transition); }
        .sb-mobile-menu-btn:hover, .sb-mobile-notif-btn:hover { background: var(--gray-100); transform: translateY(-1px); }
        
        @media(max-width:768px){.portal-sidebar{display:none}.sb-mobile-overlay{display:block}.sb-mobile-topbar{display:flex}}
      `}</style>
    </>
  );
}
