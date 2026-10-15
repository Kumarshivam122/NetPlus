import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Shield, FileText } from 'lucide-react';
import { COMPANY } from '../data/store';

// Social brand SVG icons (lucide-react doesn't include brand icons)
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02l5.75-3.02-5.75-3.02v6.04z"
    />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
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
              <Shield size={16} style={{ color: '#c9cde8', flexShrink: 0 }} aria-hidden="true" />
              <span>Drug Lic: <strong>{COMPANY.dlNo}</strong></span>
            </div>
            <div className="footer-license">
              <FileText size={16} style={{ color: '#c9cde8', flexShrink: 0 }} aria-hidden="true" />
              <span>GSTIN: <strong>{COMPANY.gstin}</strong></span>
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
              <li><Link to="/portal"   className="footer-link">Browse PTR (Price to Retailer)</Link></li>
              <li><Link to="/contact" className="footer-link">Submit Enquiry</Link></li>
              <li><Link to="/pending"  className="footer-link">Check Registration Status</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact Info</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={18} style={{ color: '#c9cde8', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                <span>{COMPANY.address}</span>
              </li>
              <li>
                <Phone size={18} style={{ color: '#c9cde8', flexShrink: 0 }} aria-hidden="true" />
                <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a>
              </li>
              <li>
                <Phone size={18} style={{ color: '#c9cde8', flexShrink: 0 }} aria-hidden="true" />
                <a href={`tel:${COMPANY.phone2}`}>{COMPANY.phone2}</a>
              </li>
              <li>
                <Mail size={18} style={{ color: '#c9cde8', flexShrink: 0 }} aria-hidden="true" />
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </li>
              <li>
                <Clock size={18} style={{ color: '#c9cde8', flexShrink: 0 }} aria-hidden="true" />
                <span>{COMPANY.hours}</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {year} <strong>NET PLUS ENTERPRISES</strong>. All rights reserved. | Unauthorized access is prohibited.</p>
          <p className="footer-note">
            This is a private B2B portal. Medicine prices visible only to approved registered retailers.
          </p>
        </div>
      </div>

      <style>{`
        .site-footer { background: var(--footer-bg); color: #d6d9ee; padding: 3rem 0 0; border-top: 4px solid var(--accent); }
        .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.3fr; gap: 2.5rem; padding-bottom: 2.5rem; }
        .footer-logo-wrap { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
        .footer-logo { width: 48px; height: 48px; border-radius: 4px; object-fit: cover; background: #fff; }
        .footer-brand-name { font-size: 1.2rem; font-weight: 800; color: #fff; line-height: 1.1; }
        .footer-brand-sub { font-size: 0.72rem; color: #c9cde8; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
        .footer-desc { font-size: 0.95rem; line-height: 1.65; color: #d6d9ee; margin-bottom: 0.85rem; }
        .footer-license { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #d6d9ee; margin-bottom: 0.4rem; }
        .footer-license strong { color: #fff; }
        .footer-social { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .social-btn {
          width: 44px; height: 44px; border-radius: 4px;
          background: transparent; border: 1px solid rgba(255,255,255,0.45);
          display: flex; align-items: center; justify-content: center;
          color: #fff; text-decoration: none;
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .social-btn:hover { background: #fff; color: var(--primary); }
        .footer-col-title {
          font-size: 0.95rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.04em;
          margin-bottom: 1rem; padding-bottom: 0.6rem;
          border-bottom: 1px solid rgba(255,255,255,0.2);
          position: relative;
        }
        .footer-col-title::after { content: ''; position: absolute; left: 0; bottom: -1px; width: 40px; height: 3px; background: var(--accent); }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.1rem; }
        .footer-link { display: inline-block; padding: 0.35rem 0; font-size: 0.95rem; color: #d6d9ee; font-weight: 500; text-decoration: none; }
        .footer-link:hover { color: #fff; text-decoration: underline; }
        .footer-contact-list { list-style: none; display: flex; flex-direction: column; gap: 0.85rem; }
        .footer-contact-list li { display: flex; align-items: flex-start; gap: 0.7rem; font-size: 0.95rem; color: #d6d9ee; }
        .footer-contact-list a { color: #d6d9ee; text-decoration: none; word-break: break-word; }
        .footer-contact-list a:hover { color: #fff; text-decoration: underline; }
        .footer-bottom { background: var(--footer-bg-dark); padding: 1.1rem 0; text-align: center; font-size: 0.9rem; color: #c9cde8; }
        .footer-bottom p { color: #c9cde8; }
        .footer-bottom strong { color: #fff; }
        .footer-note { font-size: 0.85rem; margin-top: 0.25rem; }
        @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px)  { .footer-grid { grid-template-columns: 1fr; gap: 2rem; } }
      `}</style>
    </footer>
  );
}
