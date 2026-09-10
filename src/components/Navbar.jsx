import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const portalLink = user?.role === 'admin' ? '/admin' : '/portal';
  const portalLabel = user?.role === 'admin' ? 'Admin Panel' : 'My Portal';

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className={`navbar${(scrolled || location.pathname !== '/') ? ' scrolled' : ''}`} id="main-navbar">
        <div className="container navbar-inner">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <img src="/netLogo.jpeg" alt="NET PLUS ENTERPRISES Logo" className="navbar-logo" />
            <div className="navbar-brand-text">
              <span className="brand-name">NET PLUS</span>
              <span className="brand-sub">ENTERPRISES</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="navbar-links">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to} className={`navbar-link${isActive(link.to) ? ' active' : ''}`}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side */}
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
              <>
                <Link to="/login"    className="btn btn-ghost btn-sm" id="login-btn">
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="register-btn">
                  <UserPlus size={15} /> Register
                </Link>
              </>
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

        {/* Mobile Menu */}
        <div className={`mobile-menu${open ? ' open' : ''}`} id="mobile-menu">
          <ul className="mobile-links">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to} className={`mobile-link${isActive(link.to) ? ' active' : ''}`}>
                  {link.label}
                </Link>
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
          z-index: 500; height: var(--nav-height);
          transition: var(--transition);
          background: rgba(29,18,80,0.15);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .navbar.scrolled {
          background: rgba(29,18,80,0.97);
          box-shadow: 0 4px 24px rgba(0,0,0,0.35);
        }
        .navbar-inner { display:flex; align-items:center; height:100%; gap:2rem; }
        .navbar-brand { display:flex; align-items:center; gap:0.6rem; text-decoration:none; flex-shrink:0; }
        .navbar-logo  { width:42px; height:42px; border-radius:10px; object-fit:cover; box-shadow:0 2px 10px rgba(0,0,0,0.3); }
        .navbar-brand-text { display:flex; flex-direction:column; line-height:1; }
        .brand-name { font-family:var(--font-display); font-size:1.05rem; font-weight:800; color:#fff; letter-spacing:0.04em; }
        .brand-sub  { font-size:0.58rem; font-weight:700; color:#FF9A3C; letter-spacing:0.14em; text-transform:uppercase; }
        .navbar-links { display:flex; list-style:none; gap:0.25rem; flex:1; justify-content:center; }
        .navbar-link  { color:rgba(255,255,255,0.8); font-size:0.9rem; font-weight:500; padding:0.45rem 0.85rem; border-radius:var(--radius-full); transition:var(--transition-fast); text-decoration:none; }
        .navbar-link:hover  { color:#fff; background:rgba(255,255,255,0.1); }
        .navbar-link.active { color:#FF9A3C; background:rgba(244,121,33,0.2); }
        .navbar-actions { display:flex; align-items:center; gap:0.6rem; flex-shrink:0; }
        .user-menu { position:relative; }
        .user-menu-btn { display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); border-radius:var(--radius-full); padding:0.4rem 0.9rem 0.4rem 0.4rem; cursor:pointer; transition:var(--transition-fast); color:#fff; }
        .user-menu-btn:hover { background:rgba(255,255,255,0.18); }
        .user-avatar { width:28px; height:28px; background:linear-gradient(135deg,#F47921,#D4661A); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; color:#fff; flex-shrink:0; }
        .user-menu-name { font-size:0.85rem; font-weight:600; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .dropdown-arrow { transition:transform 0.2s ease; }
        .dropdown-arrow.open { transform:rotate(180deg); }
        .user-dropdown { position:absolute; top:calc(100% + 10px); right:0; background:#fff; border-radius:var(--radius-lg); box-shadow:var(--shadow-xl); min-width:220px; overflow:hidden; animation:scaleIn 0.15s ease; border:1px solid #FFF0E0; z-index:200; }
        .dropdown-header { padding:1rem 1.1rem; background:linear-gradient(135deg,#2D2D75,#3B3B9E); color:#fff; }
        .dropdown-header-name  { font-weight:700; font-size:0.9rem; }
        .dropdown-header-email { font-size:0.75rem; color:rgba(255,255,255,0.6); margin-top:2px; }
        .dropdown-item { display:flex; align-items:center; gap:0.6rem; padding:0.75rem 1.1rem; font-size:0.88rem; font-weight:500; color:#4A3C32; cursor:pointer; border:none; background:none; width:100%; text-align:left; text-decoration:none; transition:var(--transition-fast); }
        .dropdown-item:hover { background:#FFFBF7; color:#2D2D75; }
        .dropdown-item.danger:hover { background:rgba(224,48,48,0.06); color:#E03030; }
        .hamburger { display:none; background:none; border:none; color:#fff; cursor:pointer; padding:0.3rem; }
        .mobile-menu { display:none; flex-direction:column; background:#1A1250; border-top:1px solid rgba(255,255,255,0.1); padding:1rem; gap:0.25rem; max-height:0; overflow:hidden; transition:max-height 0.3s ease, padding 0.3s ease; }
        .mobile-menu.open { display:flex; max-height:600px; }
        .mobile-links { list-style:none; display:flex; flex-direction:column; gap:0.2rem; }
        .mobile-link { display:block; color:rgba(255,255,255,0.8); padding:0.65rem 1rem; border-radius:var(--radius-md); font-weight:500; font-size:0.95rem; text-decoration:none; transition:var(--transition-fast); }
        .mobile-link:hover,.mobile-link.active { background:rgba(244,121,33,0.15); color:#FF9A3C; }
        .mobile-actions { display:flex; flex-direction:column; gap:0.6rem; margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.1); }
        @media (max-width:900px) { .navbar-links{display:none} .hamburger{display:block} .navbar-actions .btn{display:none} .navbar-actions .user-menu{display:none} }
        .navbar-inner {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 2rem;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .navbar-logo {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          object-fit: cover;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .navbar-brand-text { display: flex; flex-direction: column; line-height: 1; }
        .brand-name {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.04em;
        }
        .brand-sub {
          font-size: 0.6rem;
          font-weight: 600;
          color: var(--teal-light);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .navbar-links {
          display: flex;
          list-style: none;
          gap: 0.25rem;
          flex: 1;
          justify-content: center;
        }
        .navbar-link {
          color: rgba(255,255,255,0.78);
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-full);
          transition: var(--transition-fast);
          text-decoration: none;
          position: relative;
        }
        .navbar-link:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .navbar-link.active { color: #000; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }
        .user-menu { position: relative; }
        .user-menu-btn {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: var(--radius-full);
          padding: 0.4rem 0.9rem 0.4rem 0.4rem;
          cursor: pointer;
          transition: var(--transition-fast);
          color: #fff;
        }
        .user-menu-btn:hover { background: rgba(255,255,255,0.18); }
        .user-avatar {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #F47921, #D4661A);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .user-menu-name { font-size: 0.85rem; font-weight: 600; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dropdown-arrow { transition: transform 0.2s ease; }
        .dropdown-arrow.open { transform: rotate(180deg); }
        .user-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #fff;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          min-width: 220px;
          overflow: hidden;
          animation: scaleIn 0.15s ease;
          border: 1px solid var(--gray-100);
          z-index: 200;
        }
        .dropdown-header {
          padding: 1rem 1.1rem;
          background: linear-gradient(135deg, #2D2D75, #3B3B9E);
          color: #fff;
        }
        .dropdown-header-name { font-weight: 700; font-size: 0.9rem; }
        .dropdown-header-email { font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-top: 2px; }
        .dropdown-item {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.75rem 1.1rem;
          font-size: 0.88rem; font-weight: 500;
          color: var(--gray-700);
          cursor: pointer; border: none; background: none;
          width: 100%; text-align: left;
          text-decoration: none;
          transition: var(--transition-fast);
        }
        .dropdown-item:hover { background: var(--gray-50); color: var(--navy); }
        .dropdown-item.danger:hover { background: rgba(229,57,53,0.06); color: var(--red); }
        .hamburger {
          display: none;
          background: none; border: none;
          color: #fff; cursor: pointer;
          padding: 0.3rem;
        }
        .mobile-menu {
          display: none;
          flex-direction: column;
          background: var(--navy);
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 1rem;
          gap: 0.25rem;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
        }
        .mobile-menu.open {
          display: flex;
          max-height: 600px;
        }
        .mobile-links { list-style: none; display: flex; flex-direction: column; gap: 0.2rem; }
        .mobile-link {
          display: block;
          color: rgba(255,255,255,0.8);
          padding: 0.65rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 500; font-size: 0.95rem;
          text-decoration: none;
          transition: var(--transition-fast);
        }
        .mobile-link:hover, .mobile-link.active {
          background: rgba(255,255,255,0.1); color: #fff;
        }
        .mobile-actions {
          display: flex; flex-direction: column; gap: 0.6rem;
          margin-top: 0.75rem; padding-top: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 900px) {
          .navbar-links { display: none; }
          .hamburger   { display: block; }
          .navbar-actions .btn { display: none; }
          .navbar-actions .user-menu { display: none; }
        }
      `}</style>
    </>
  );
}
