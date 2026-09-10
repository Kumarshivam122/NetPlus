import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ClipboardList, Users, LogOut,
  ChevronLeft, ChevronRight, Bell, Menu, Shield, Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RETAILER_NAV = [
  { to: '/portal',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portal/products',    icon: Package,          label: 'Browse Products' },
  { to: '/portal/orders',   icon: ClipboardList,    label: 'My Orders' },
];

const ADMIN_NAV = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',        icon: Users,            label: 'Manage Retailers' },
  { to: '/admin/products',     icon: Package,          label: 'Products' },
  { to: '/admin/orders',    icon: ClipboardList,    label: 'Orders' },
];

export default function PortalSidebar({ title }) {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'admin' ? ADMIN_NAV : RETAILER_NAV;

  const isActive = (to) =>
    to === '/portal' || to === '/admin'
      ? location.pathname === to
      : location.pathname.startsWith(to);

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
        .portal-sidebar { width:260px; min-height:100vh; background:linear-gradient(180deg,#1A1250 0%,#2D2D75 100%); display:flex; flex-direction:column; position:fixed; top:0; left:0; z-index:200; transition:width var(--transition); overflow:hidden; }
        .portal-sidebar.collapsed { width: 68px; }
        
        .sb-header { padding:1.25rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); position:relative; }
        .sb-brand { display:flex; align-items:center; gap:0.6rem; overflow:hidden; }
        .sb-logo { width:36px; height:36px; border-radius:8px; object-fit:cover; flex-shrink:0; }
        .sb-brand-name { font-family:var(--font-display); font-size:0.95rem; font-weight:800; color:#fff; white-space:nowrap; }
        .sb-brand-sub  { font-size:0.62rem; color:#FF9A3C; letter-spacing:0.1em; text-transform:uppercase; white-space:nowrap; }
        .sb-collapse-btn { position:absolute; right:-12px; top:50%; transform:translateY(-50%); width:24px; height:24px; background:#F47921; color:#fff; border:none; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(244,121,33,0.5); z-index:10; }
        
        .sb-user { display:flex; align-items:center; gap:0.75rem; padding:1rem; border-bottom:1px solid rgba(255,255,255,0.06); }
        .sb-user-avatar { width:36px; height:36px; background:linear-gradient(135deg,#F47921,#D4661A); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
        .sb-user-name { font-size:0.82rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sb-user-role { font-size:0.68rem; margin-top:2px; white-space:nowrap; }
        .sb-user-role.admin   { color:var(--teal-light); }
        .sb-user-role.retailer{ color:rgba(255,255,255,0.45); }
        
        .sb-nav { flex:1; padding:0.75rem 0.5rem; display:flex; flex-direction:column; gap:0.2rem; overflow-y:auto; }
        .sb-link { display:flex; align-items:center; gap:0.75rem; padding:0.7rem 0.75rem; color:rgba(255,255,255,0.6); font-size:0.88rem; font-weight:500; border-radius:var(--radius-md); transition:var(--transition-fast); text-decoration:none; border:none; background:none; cursor:pointer; width:100%; white-space:nowrap; }
        .sb-link:hover { color:#fff; background:rgba(255,255,255,0.08); }
        .sb-link.active { color:#FF9A3C; background:rgba(244,121,33,0.18); border-right: 3px solid #F47921; }
        .sb-link-icon { flex-shrink:0; }
        
        .sb-footer { padding:0.75rem 0.5rem; border-top:1px solid rgba(255,255,255,0.08); }
        .sb-logout { color:rgba(255,100,100,0.7); }
        .sb-logout:hover { background:rgba(229,57,53,0.12); color:#ff6b6b; }
        
        /* Mobile */
        .sb-mobile-overlay { display:none; position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); }
        .mobile-sidebar { position:relative; width:260px !important; }
        .sb-mobile-topbar { display:none; position:fixed; top:0; left:0; right:0; height:56px; background:#fff; border-bottom:1px solid var(--gray-100); box-shadow:var(--shadow-sm); z-index:100; align-items:center; justify-content:space-between; padding:0 1rem; }
        .sb-mobile-menu-btn, .sb-mobile-notif-btn { background:none; border:none; cursor:pointer; color:var(--navy); padding:0.3rem; display:flex; align-items:center; justify-content:center; }
        
        @media(max-width:768px){.portal-sidebar{display:none}.sb-mobile-overlay{display:block}.sb-mobile-topbar{display:flex}}
      `}</style>
    </>
  );
}
