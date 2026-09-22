import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/about',    label: 'About Us' },
  { to: '/products', label: 'Products' },
  { to: '/brands',   label: 'Brands' },
  { to: '/services', label: 'Services' },
  { to: '/contact',  label: 'Contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open,       setOpen]       = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setDropdownOpen(false); }, [location]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const portalLink = user?.role === 'admin' ? '/admin' : '/portal';
  const portalLabel = user?.role === 'admin' ? 'Admin Panel' : 'My Portal';



  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="main-navbar">
        {/* Top Tier: Logo & Actions */}
        <div className="navbar-top container">
          <Link to="/" className="navbar-brand">
            <img src="/netLogo.jpeg" alt="NET PLUS ENTERPRISES Logo" className="navbar-logo" />
            <div className="navbar-brand-text">
              <span className="brand-name">NET PLUS</span>
              <span className="brand-sub">ENTERPRISES</span>
            </div>
          </Link>

          <div className="navbar-actions">
            {user ? (
              <div className="user-menu" id="user-menu-wrapper">
                <button
                  className="user-menu-btn"
                  onClick={() => setDropdownOpen(prev => !prev)}
                  id="user-menu-btn"
                >
                  <div className="user-avatar">
                    {user.role === 'admin' ? <Shield size={14} /> : (user.storeName?.[0] || user.name?.[0] || 'U')}
                  </div>
                  <span className="user-menu-name">
                    {user.role === 'admin' ? user.name : (user.storeName || user.name)}
                  </span>
                  <ChevronDown size={14} className={`dropdown-arrow${dropdownOpen ? ' open' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown" id="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-header-name">{user.storeName || user.name}</div>
                      <div className="dropdown-header-email">{user.email}</div>
                      {user.status && user.role !== 'admin' && (
                        <span className={`badge badge-${user.status === 'approved' ? 'success' : user.status === 'pending' ? 'warning' : 'danger'}`}
                          style={{ marginTop: '0.25rem', fontSize: '0.7rem' }}>
                          {user.status}
                        </span>
                      )}
                    </div>
                    <Link to={portalLink} className="dropdown-item" id="portal-link">
                      <LayoutDashboard size={15} /> {portalLabel}
                    </Link>
                    <button className="dropdown-item danger" onClick={handleLogout} id="logout-btn">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-outline btn-sm" id="login-btn" style={{ borderRadius: '4px', borderColor: 'var(--navy)', color: 'var(--navy)' }}>
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="register-btn" style={{ borderRadius: '4px' }}>
                  <UserPlus size={15} /> Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="hamburger"
              onClick={() => setOpen(prev => !prev)}
              id="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Bottom Tier: Navigation Links */}
        <div className="navbar-bottom">
          <div className="container">
            <ul className="navbar-links">
              {NAV_LINKS.map(link => (
                <li key={link.to}>
                  <NavLink to={link.to} end className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile Menu — Side Panel */}
        {open && <div className="mobile-backdrop" onClick={() => setOpen(false)} />}
        <div className={`mobile-menu${open ? ' open' : ''}`} id="mobile-menu">
          <div className="mobile-menu-header">
            <div className="mobile-menu-brand">
              <img src="/netLogo.jpeg" alt="NET PLUS" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--navy)', fontSize: '1rem' }}>NET PLUS</span>
            </div>
            <button className="mobile-close-btn" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={20} />
            </button>
          </div>
          <ul className="mobile-links">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <NavLink to={link.to} end className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mobile-actions">
            {user ? (
              <>
                <Link to={portalLink} className="btn btn-primary w-full" id="mobile-portal-link">
                  <LayoutDashboard size={16} /> {portalLabel}
                </Link>
                <button className="btn btn-outline w-full" onClick={handleLogout} id="mobile-logout-btn">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn-ghost w-full" id="mobile-login-btn">
                  <LogIn size={16} /> Login
                </Link>
                <Link to="/register" className="btn btn-primary w-full" id="mobile-register-btn">
                  <UserPlus size={16} /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 500;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }
        .navbar.scrolled {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .navbar-top {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 0;
        }
        .navbar-bottom {
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
        }
        .navbar-bottom .container {
          display: flex; justify-content: center;
        }
        .navbar-brand { display:flex; align-items:center; gap:0.6rem; text-decoration:none; flex-shrink:0; }
        .navbar-logo  { width:42px; height:42px; border-radius:10px; object-fit:cover; box-shadow:0 2px 10px rgba(0,0,0,0.1); }
        .navbar-brand-text { display:flex; flex-direction:column; line-height:1; }
        .brand-name { font-family:var(--font-display); font-size:1.4rem; font-weight:800; color:var(--navy); letter-spacing:-0.02em; }
        .brand-sub  { font-size:0.75rem; font-weight:700; color:var(--teal); letter-spacing:0.1em; text-transform:uppercase; margin-top: 2px; }
        .navbar-links { display:flex; list-style:none; gap:0.5rem; justify-content:center; padding: 0.5rem 0; }
        .navbar-link  { position:relative; color:var(--navy-light); font-size:0.95rem; font-weight:600; padding:0.5rem 0.2rem; margin:0 0.75rem; transition:color 0.2s ease; text-decoration:none; }
        .navbar-link::after { content:''; position:absolute; bottom:-4px; left:0; width:100%; height:2.5px; background:var(--teal); transform:scaleX(0); transition:transform 0.2s ease, background 0.2s ease; transform-origin:center; border-radius: 2px; }
        @media (hover: hover) {
          .navbar-link:hover { color:#1a1a1a; }
          .navbar-link:hover:not(.active)::after { transform:scaleX(1); background: #1a1a1a; opacity: 1; }
        }
        .navbar-link.active { color:var(--navy); font-weight:700; }
        .navbar-link.active::after { transform:scaleX(1); background: var(--teal); opacity: 1; }
        .navbar-actions { display:flex; align-items:center; gap:1rem; flex-shrink:0; }
        .user-menu { position:relative; }
        .user-menu-btn { display:flex; align-items:center; gap:0.5rem; background:#fff; border:1px solid #e2e8f0; border-radius:var(--radius-full); padding:0.4rem 0.9rem 0.4rem 0.4rem; cursor:pointer; transition:var(--transition-fast); color:var(--navy); }
        .user-menu-btn:hover { background:#f8fafc; border-color:var(--teal-light); }
        .user-avatar { width:28px; height:28px; background:var(--teal); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; color:#fff; flex-shrink:0; }
        .user-menu-name { font-size:0.85rem; font-weight:600; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .dropdown-arrow { transition:transform 0.2s ease; }
        .dropdown-arrow.open { transform:rotate(180deg); }
        .user-dropdown { position:absolute; top:calc(100% + 10px); right:0; background:#fff; border-radius:var(--radius-lg); box-shadow:var(--shadow-xl); min-width:220px; overflow:hidden; animation:scaleIn 0.15s ease; border:1px solid #e2e8f0; z-index:200; }
        .dropdown-header { padding:1rem 1.1rem; background:var(--teal); color:#fff; }
        .dropdown-header-name  { font-weight:700; font-size:0.9rem; }
        .dropdown-header-email { font-size:0.75rem; color:rgba(255,255,255,0.8); margin-top:2px; }
        .dropdown-item { display:flex; align-items:center; gap:0.6rem; padding:0.75rem 1.1rem; font-size:0.88rem; font-weight:500; color:var(--navy); cursor:pointer; border:none; background:none; width:100%; text-align:left; text-decoration:none; transition:var(--transition-fast); }
        .dropdown-item:hover { background:#f8fafc; color:var(--teal); }
        .dropdown-item.danger:hover { background:#fef2f2; color:var(--red); }
        .hamburger { display:none; background:none; border:none; color:var(--navy); cursor:pointer; padding:0.6rem; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; }

        /* Mobile side-panel backdrop */
        .mobile-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 998;
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Mobile side-panel menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          max-width: 80vw;
          background: #fff;
          z-index: 999;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 30px rgba(0,0,0,0.12);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }
        .mobile-menu.open {
          transform: translateX(0);
        }
        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--gray-100);
          flex-shrink: 0;
        }
        .mobile-menu-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mobile-close-btn {
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: 8px;
          color: var(--navy);
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .mobile-close-btn:hover {
          background: var(--red);
          border-color: var(--red);
          color: #fff;
        }
        .mobile-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          padding: 0.75rem;
          flex: 1;
        }
        .mobile-link {
          display: block;
          color: var(--navy);
          padding: 0.7rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          font-size: 0.92rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .mobile-link:hover, .mobile-link.active {
          background: var(--cyan);
          color: var(--teal);
          font-weight: 600;
        }
        .mobile-link.active {
          border-left: 3px solid var(--teal);
        }
        .mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--gray-100);
          flex-shrink: 0;
          margin-top: auto;
        }
        @media (max-width:900px) { .navbar-links{display:none} .hamburger{display:flex} .navbar-actions .btn{display:none} .navbar-actions .user-menu{display:none} }
      `}</style>
    </>
  );
}
