import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Shield, FileText } from 'lucide-react';
import { COMPANY } from '../data/store';

// Social brand SVG icons (lucide-react doesn't include brand icons)
const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="var(--navy)" opacity="0.08" />
        </svg>
      </div>

      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand-col">
            <div className="footer-logo-wrap">
              <img src="/netLogo.jpeg" alt="NET PLUS ENTERPRISES" className="footer-logo" />
              <div>
                <div className="footer-brand-name">NET PLUS</div>
                <div className="footer-brand-sub">ENTERPRISES</div>
              </div>
            </div>
            <p className="footer-desc">
              Trusted pharmaceutical wholesale distributor serving registered medical shops since {COMPANY.established}.
              Licensed, regulated, and committed to quality supply.
            </p>
            <div className="footer-license">
              <Shield size={13} style={{ color: 'var(--teal)' }} />
              <span>[ Drug Lic: <strong>{COMPANY.dlNo}</strong> ]</span>
            </div>
            <div className="footer-license">
              <FileText size={13} style={{ color: 'var(--teal)' }} />
              <span>[ GSTIN: <strong>{COMPANY.gstin}</strong> ]</span>
            </div>
            <div className="footer-social">
              <a href="#" className="social-btn" aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" className="social-btn" aria-label="Instagram"><InstagramIcon /></a>
              <a href="#" className="social-btn" aria-label="YouTube"><YoutubeIcon /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              {[
                { to: '/',         l: 'Home' },
                { to: '/about',    l: 'About Us' },
                { to: '/products', l: 'Product Categories' },
                { to: '/brands',   l: 'Our Brands' },
                { to: '/services', l: 'Services' },
                { to: '/contact',  l: 'Contact Us' },
              ].map(i => (
                <li key={i.to}><Link to={i.to} className="footer-link">{i.l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Portal */}
          <div className="footer-col">
            <h4 className="footer-col-title">Retailer Portal</h4>
            <ul className="footer-links">
              <li><Link to="/register" className="footer-link">Register Your Shop</Link></li>
              <li><Link to="/login"    className="footer-link">Login to Portal</Link></li>
              <li><Link to="/portal"   className="footer-link">Browse Wholesale Prices</Link></li>
              <li><Link to="/portal/enquiries" className="footer-link">Submit Enquiry</Link></li>
              <li><Link to="/pending"  className="footer-link">Check Registration Status</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact Info</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={14} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: '2px' }} />
                <span>{COMPANY.address}</span>
              </li>
              <li>
                <Phone size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a>
              </li>
              <li>
                <Phone size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                <a href={`tel:${COMPANY.phone2}`}>{COMPANY.phone2}</a>
              </li>
              <li>
                <Mail size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </li>
              <li>
                <Clock size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                <span>{COMPANY.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} <strong>NET PLUS ENTERPRISES</strong>. All rights reserved. | Unauthorized access is prohibited.</p>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
            This is a private B2B portal. Medicine prices visible only to approved registered retailers.
          </p>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: #ffffff;
          color: var(--navy);
          padding: 4rem 0 0;
          position: relative;
          border-top: 1px solid #e2e8f0;
        }
        .footer-wave { display: none; }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 3rem;
          padding-bottom: 3rem;
        }
        .footer-logo-wrap {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .footer-logo {
          width: 48px; height: 48px; border-radius: 10px;
          object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .footer-brand-name {
          font-family: var(--font-display);
          font-size: 1.15rem; font-weight: 800;
          color: var(--navy); letter-spacing: 0.06em;
        }
        .footer-brand-sub {
          font-size: 0.58rem; color: var(--teal);
          font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .footer-desc {
          font-size: 0.85rem; line-height: 1.65;
          color: var(--navy-light);
          margin-bottom: 0.85rem;
        }
        .footer-license {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.78rem; color: var(--navy-light);
          margin-bottom: 0.3rem;
        }
        .footer-license strong { color: var(--navy); }
        .footer-social { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .social-btn {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex; align-items: center; justify-content: center;
          color: var(--navy-light);
          transition: var(--transition-fast);
          text-decoration: none;
        }
        .social-btn:hover { background: var(--teal); color: #fff; }
        .footer-col-title {
          font-size: 0.95rem; font-weight: 800;
          color: var(--navy); letter-spacing: 0.03em;
          margin-bottom: 1.2rem; text-transform: uppercase;
          position: relative; padding-bottom: 0.6rem;
        }
        .footer-col-title::after {
          content: ''; position: absolute;
          bottom: 0; left: 0;
          width: 32px; height: 2px;
          background: var(--teal); border-radius: 1px;
        }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
        .footer-link {
          font-size: 0.88rem; color: var(--navy-light); font-weight: 500;
          text-decoration: none;
          transition: var(--transition-fast);
          display: inline-block;
        }
        .footer-link:hover { color: var(--teal); transform: translateX(3px); }
        .footer-contact-list {
          list-style: none; display: flex;
          flex-direction: column; gap: 0.85rem;
        }
        .footer-contact-list li {
          display: flex; align-items: flex-start;
          gap: 0.75rem; font-size: 0.88rem; font-weight: 500;
          color: var(--navy-light);
        }
        .footer-contact-list a {
          color: var(--navy-light);
          text-decoration: none;
          transition: var(--transition-fast);
        }
        .footer-contact-list a:hover { color: var(--teal); }
        .footer-bottom {
          border-top: 1px solid #e2e8f0;
          padding: 1.5rem 0;
          text-align: center;
          font-size: 0.85rem; font-weight: 500;
          color: var(--navy-light);
        }
        .footer-bottom strong { color: var(--navy); }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>
    </footer>
  );
}
