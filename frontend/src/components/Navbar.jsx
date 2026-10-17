import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard, Shield, ChevronDown, Search, ShoppingCart, Phone, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { COMPANY } from '../data/store';

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
  const cartCtx   = useCart();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open,       setOpen]       = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query,      setQuery]      = useState('');

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

  // Header search: takes the visitor to the product list for their account type.
  // Signed-out visitors see the public category page; retailers/admins see their catalog.
  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    const base = user?.role === 'admin' ? '/admin/products' : user ? '/portal/products' : '/products';
    navigate(q ? `${base}?q=${encodeURIComponent(q)}` : base);
  };

  const portalLink = user?.role === 'admin' ? '/admin' : '/portal';
  const portalLabel = user?.role === 'admin' ? 'Admin Panel' : 'My Portal';
  const cartCount = Array.isArray(cartCtx?.cart) ? cartCtx.cart.length : 0;
  const showCart = user?.role !== 'admin';

  return (
    <>
      {/* Utility strip: contact details, always visible to new visitors */}
      <div className="util-bar">
        <div className="container util-bar-inner">
          <span className="util-text">Wholesale medicines for registered medical shops &amp; pharmacies</span>
          <div className="util-contact">
            <a href={`tel:${COMPANY.phone}`} className="util-link"><Phone size={14} aria-hidden="true" /> Call {COMPANY.phone}</a>
            <span className="util-link"><Clock size={14} aria-hidden="true" /> {COMPANY.hours}</span>
          </div>
        </div>
      </div>

      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="main-navbar" aria-label="Main">
        {/* Main row: logo, search, account, cart */}
        <div className="navbar-main container">
          <Link to="/" className="navbar-brand" aria-label="NET PLUS Enterprises - Home">
            <img src="/netLogo.jpeg" alt="" className="navbar-logo" />
            <div className="navbar-brand-text">
              <span className="brand-name">NET PLUS</span>
              <span className="brand-sub">ENTERPRISES</span>
            </div>
          </Link>

          <form className="nav-search" role="search" onSubmit={handleSearch}>
            <label htmlFor="nav-search-input" className="sr-only">Search medicines, brands or manufacturers</label>
            <Search size={20} className="nav-search-icon" aria-hidden="true" />
            <input
              id="nav-search-input"
              type="search"
              className="nav-search-input"
              placeholder="Search medicines or brands"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="nav-search-btn" id="nav-search-btn">Search</button>
          </form>

          <div className="navbar-actions">
            {user ? (
              <div className="user-menu" id="user-menu-wrapper">
                <button
                  className="user-menu-btn"
                  onClick={() => setDropdownOpen(prev => !prev)}
                  id="user-menu-btn"
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                >
                  <div className="user-avatar">
                    {user.role === 'admin' ? <Shield size={16} /> : (user.storeName?.[0] || user.name?.[0] || 'U')}
                  </div>
                  <span className="user-menu-name">
                    {user.role === 'admin' ? user.name : (user.storeName || user.name)}
                  </span>
                  <ChevronDown size={16} className={`dropdown-arrow${dropdownOpen ? ' open' : ''}`} aria-hidden="true" />
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown" id="user-dropdown" role="menu">
                    <div className="dropdown-header">
                      <div className="dropdown-header-name">{user.storeName || user.name}</div>
                      <div className="dropdown-header-email">{user.email}</div>
                      {user.status && user.role !== 'admin' && (
                        <span className={`badge badge-${user.status === 'approved' ? 'success' : user.status === 'pending' ? 'warning' : 'danger'}`}
                          style={{ marginTop: '0.4rem' }}>
                          {user.status}
                        </span>
                      )}
                    </div>
                    <Link to={portalLink} className="dropdown-item" id="portal-link" role="menuitem">
                      <LayoutDashboard size={16} /> {portalLabel}
                    </Link>
                    <button className="dropdown-item danger" onClick={handleLogout} id="logout-btn" role="menuitem">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth">
                <Link to="/login" className="btn btn-outline btn-sm" id="login-btn">
                  <LogIn size={16} aria-hidden="true" /> Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="register-btn">
                  <UserPlus size={16} aria-hidden="true" /> Register
                </Link>
              </div>
            )}

            {showCart && (
              <Link to="/portal/cart" className="nav-cart" id="nav-cart-link"
                aria-label={cartCount > 0 ? `Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Cart, empty'}>
                <ShoppingCart size={20} aria-hidden="true" />
                <span className="nav-cart-label">Cart</span>
                {cartCount > 0 && <span className="nav-cart-count" aria-hidden="true">{cartCount}</span>}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="hamburger"
              onClick={() => setOpen(prev => !prev)}
              id="mobile-menu-btn"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              <span>Menu</span>
            </button>
          </div>
        </div>

        {/* Navigation row */}
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
              <img src="/netLogo.jpeg" alt="" style={{ width: '36px', height: '36px', borderRadius: '6px' }} />
              <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1.05rem' }}>NET PLUS</span>
            </div>
            <button className="mobile-close-btn" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={22} />
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
                <Link to="/login"    className="btn btn-outline w-full" id="mobile-login-btn">
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

      <a href={`tel:${COMPANY.phone}`} className="float-call" aria-label={`Call us on ${COMPANY.phone}`}>
        <Phone size={20} aria-hidden="true" /> Call us
      </a>

      <style>{`
        /* ── Contact strip ── */
        .util-bar { background: var(--footer-bg); color: #e3e5f3; font-size: 0.85rem; }
        .util-bar-inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 36px; }
        .util-text { font-weight: 500; }
        .util-contact { display: flex; align-items: center; gap: 1.5rem; }
        .util-link { display: inline-flex; align-items: center; gap: 0.4rem; color: #e3e5f3; font-weight: 500; }
        a.util-link:hover { color: #fff; text-decoration: underline; }

        /* ── Header (sticky, in normal page flow) ── */
        .navbar { position: sticky; top: 0; z-index: 500; background: #ffffff; }
        .navbar.scrolled { box-shadow: 0 2px 8px rgba(17,24,39,0.18); }

        .navbar-main {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 1.5rem;
          padding-top: 0.85rem; padding-bottom: 0.85rem;
        }
        .navbar-brand { display: flex; align-items: center; gap: 0.65rem; text-decoration: none; flex-shrink: 0; }
        .navbar-logo  { width: 48px; height: 48px; border-radius: 4px; object-fit: cover; }
        .navbar-brand-text { display: flex; flex-direction: column; line-height: 1.1; }
        .brand-name { font-size: 1.4rem; font-weight: 800; color: var(--ink); letter-spacing: 0; }
        .brand-sub  { font-size: 0.72rem; font-weight: 700; color: var(--primary); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 3px; }

        /* Search */
        .nav-search {
          display: flex; align-items: stretch;
          width: 100%; max-width: 680px; justify-self: center;
          min-height: 46px;
          background: #fff;
          border: 2px solid var(--primary);
          border-radius: 4px;
          overflow: hidden;
        }
        .nav-search:focus-within { box-shadow: 0 0 0 3px rgba(60,60,143,0.25); }
        .nav-search-icon { align-self: center; margin-left: 0.8rem; color: var(--gray-500); flex-shrink: 0; }
        .nav-search-input {
          flex: 1; min-width: 0;
          border: none; outline: none; background: transparent;
          padding: 0 0.75rem;
          font-family: var(--font-primary); font-size: 1rem; color: var(--ink);
        }
        .nav-search-input::placeholder { color: var(--gray-400); }
        .nav-search-btn { border: none; background: var(--cta); color: #fff; padding: 0 1.5rem; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
        .nav-search-btn:hover { background: var(--cta-dark); }

        /* Phone-only floating Call button */
        .float-call { display: none; }

        /* Account + cart */
        .navbar-actions { display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0; }
        .nav-auth { display: flex; gap: 0.5rem; }
        .nav-cart {
          position: relative;
          display: inline-flex; align-items: center; gap: 0.5rem;
          min-height: 44px; padding: 0.35rem 0.9rem;
          background: #fff; color: var(--ink);
          border: 1px solid var(--gray-300); border-radius: 4px;
          font-weight: 600; font-size: 0.95rem;
        }
        .nav-cart:hover { border-color: var(--primary); color: var(--primary); }
        .nav-cart-count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 22px; height: 22px; padding: 0 6px;
          background: var(--accent-dark); color: #fff;
          border-radius: 3px; font-size: 0.8rem; font-weight: 700;
        }

        .user-menu { position: relative; }
        .user-menu-btn {
          display: flex; align-items: center; gap: 0.5rem;
          min-height: 44px; padding: 0.25rem 0.7rem 0.25rem 0.35rem;
          background: #fff; color: var(--ink);
          border: 1px solid var(--gray-300); border-radius: 4px;
          cursor: pointer;
        }
        .user-menu-btn:hover { border-color: var(--primary); }
        .user-avatar { width: 32px; height: 32px; background: var(--primary); border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 700; color: #fff; flex-shrink: 0; text-transform: uppercase; }
        .user-menu-name { font-size: 0.95rem; font-weight: 600; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dropdown-arrow.open { transform: rotate(180deg); }
        .user-dropdown { position: absolute; top: calc(100% + 6px); right: 0; background: #fff; border-radius: 4px; box-shadow: var(--shadow-lg); min-width: 240px; overflow: hidden; border: 1px solid var(--gray-200); z-index: 200; }
        .dropdown-header { padding: 0.9rem 1.1rem; background: var(--gray-50); border-bottom: 1px solid var(--gray-200); }
        .dropdown-header-name  { font-weight: 700; font-size: 0.95rem; color: var(--ink); }
        .dropdown-header-email { font-size: 0.85rem; color: var(--gray-500); margin-top: 2px; word-break: break-all; }
        .dropdown-item { display: flex; align-items: center; gap: 0.6rem; min-height: 46px; padding: 0.7rem 1.1rem; font-size: 0.95rem; font-weight: 500; color: var(--ink); cursor: pointer; border: none; background: none; width: 100%; text-align: left; text-decoration: none; }
        .dropdown-item:hover { background: var(--gray-100); color: var(--primary); }
        .dropdown-item.danger { color: var(--red); }
        .dropdown-item.danger:hover { background: #fce4e4; color: #991b1b; }

        .hamburger {
          display: none;
          align-items: center; gap: 0.4rem;
          min-height: 44px; padding: 0.35rem 0.8rem;
          background: #fff; color: var(--ink);
          border: 1px solid var(--gray-300); border-radius: 4px;
          font-size: 0.95rem; font-weight: 600;
          cursor: pointer;
        }

        /* ── Navigation bar ── */
        .navbar-bottom { background: var(--primary); }
        .navbar-links { display: flex; justify-content: center; list-style: none; flex-wrap: wrap; }
        .navbar-link {
          display: inline-flex; align-items: center;
          min-height: 46px; padding: 0 1.25rem;
          color: #fff; font-size: 0.95rem; font-weight: 600;
          border-bottom: 3px solid transparent;
          text-decoration: none;
        }
        .navbar-link:hover { background: var(--primary-dark); }
        .navbar-link.active { background: var(--primary-dark); border-bottom-color: var(--accent); }

        /* ── Mobile side panel ── */
        .mobile-backdrop { position: fixed; inset: 0; background: rgba(17,24,39,0.55); z-index: 998; }
        .mobile-menu {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 300px; max-width: 85vw;
          background: #fff;
          z-index: 999;
          display: flex; flex-direction: column;
          box-shadow: var(--shadow-xl);
          transform: translateX(100%);
          visibility: hidden;
          transition: transform 0.18s ease, visibility 0s linear 0.18s;
          overflow-y: auto;
        }
        .mobile-menu.open { transform: translateX(0); visibility: visible; transition-delay: 0s; }
        .mobile-menu-header { display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1.25rem; background: var(--primary); flex-shrink: 0; }
        .mobile-menu-brand { display: flex; align-items: center; gap: 0.6rem; }
        .mobile-menu-brand span { color: #fff !important; }
        .mobile-close-btn { background: transparent; border: 1px solid rgba(255,255,255,0.7); border-radius: 4px; color: #fff; cursor: pointer; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
        .mobile-close-btn:hover { background: rgba(255,255,255,0.15); }
        .mobile-links { list-style: none; display: flex; flex-direction: column; padding: 0.5rem 0; flex: 1; }
        .mobile-link {
          display: flex; align-items: center; min-height: 50px;
          color: var(--ink); padding: 0.6rem 1.25rem;
          font-weight: 600; font-size: 1.02rem;
          text-decoration: none;
          border-bottom: 1px solid var(--gray-200);
          border-left: 4px solid transparent;
        }
        .mobile-link:hover { background: var(--gray-100); }
        .mobile-link.active { background: var(--primary-tint); color: var(--primary); border-left-color: var(--accent); }
        .mobile-actions { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem 1.25rem; border-top: 1px solid var(--gray-200); flex-shrink: 0; margin-top: auto; }

        /* ── Tablet / phone ── */
        @media (max-width: 900px) {
          .float-call { display: inline-flex; align-items: center; gap: 0.45rem; position: fixed; right: 14px; bottom: 16px; z-index: 450; min-height: 48px; padding: 0 1.1rem; background: var(--cta); color: #fff; border-radius: 4px; font-weight: 600; font-size: 0.95rem; box-shadow: var(--shadow-lg); }
          .float-call:hover { background: var(--cta-dark); }
          .util-bar { display: none; }
          .navbar-bottom { display: none; }
          .navbar { border-bottom: 3px solid var(--primary); }
          .navbar-main {
            grid-template-columns: minmax(0, 1fr) auto;
            grid-template-areas: "brand actions" "search search";
            gap: 0.7rem 1rem;
            padding-top: 0.65rem; padding-bottom: 0.75rem;
          }
          .navbar-brand { grid-area: brand; min-width: 0; }
          .navbar-actions { grid-area: actions; }
          .nav-search { grid-area: search; max-width: none; }
          .hamburger { display: inline-flex; }
          .nav-auth, .user-menu { display: none; }
          .navbar-logo { width: 42px; height: 42px; }
          .brand-name { font-size: 1.25rem; }
          .brand-name, .brand-sub { white-space: nowrap; }
        }
        @media (max-width: 480px) {
          .navbar-actions { gap: 0.4rem; }
          .nav-cart, .hamburger { padding: 0.35rem 0.6rem; gap: 0.35rem; font-size: 0.9rem; }
          .nav-search-btn { padding: 0 0.9rem; }
          .brand-name { font-size: 1.1rem; }
          .brand-sub { font-size: 0.6rem; letter-spacing: 0.08em; }
          .navbar-logo { width: 38px; height: 38px; }
          .navbar-brand { gap: 0.5rem; }
        }
        @media (max-width: 360px) {
          .brand-sub { display: none; }
        }
      `}</style>
    </>
  );
}
