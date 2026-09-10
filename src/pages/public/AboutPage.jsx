import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Award, Users, MapPin } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { COMPANY } from '../../data/store';

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Page Hero */}
      <section className="page-hero" id="about-hero">
        <div className="container">
          <span className="section-tag animate-fade-up">About Us</span>
          <h1 className="page-hero-title animate-fade-up delay-100">
            Trusted Since {COMPANY.established}
          </h1>
          <p className="page-hero-sub animate-fade-up delay-200">
            NET PLUS ENTERPRISES — Maharashtra's leading B2B pharmaceutical wholesale & distribution company.
          </p>
        </div>
      </section>

      {/* About Story */}
      <section className="section" id="about-story">
        <div className="container">
          <div className="about-grid">
            <div className="animate-fade-up">
              <span className="section-tag">Our Story</span>
              <h2 className="section-title" style={{ textAlign: 'left' }}>
                15+ Years of Trusted Pharmaceutical Distribution
              </h2>
              <p style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
                Founded in <strong>{COMPANY.established}</strong>, NET PLUS ENTERPRISES started as a small regional
                medicine distributor in Nagpur and has grown into one of Maharashtra's most trusted
                wholesale pharmaceutical supply networks.
              </p>
              <p style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
                We work exclusively with <strong>registered medical shops and pharmacies</strong> — ensuring
                medicines reach the right hands through a verified, controlled supply chain.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                Our warehouse facilities, cold-chain logistics, and 120+ brand partnerships allow us to
                serve 2,400+ registered retailers across the region with next-day delivery capabilities.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary" id="about-register-btn">
                  Join as Retailer <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="btn btn-outline" id="about-contact-btn">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="about-highlights animate-fade-up delay-200">
              {[
                { icon: '🏭', title: '10,000 sq. ft.', sub: 'Warehouse Facility' },
                { icon: '🌡️', title: 'Cold Chain',     sub: 'Temperature Controlled Storage' },
                { icon: '🚚', title: 'Next-Day',        sub: 'Pan-City Delivery Network' },
                { icon: '🔒', title: 'CDSCO Licensed',  sub: 'Drug Lic No: ' + COMPANY.dlNo },
              ].map((h, i) => (
                <div key={i} className="about-highlight-card">
                  <span style={{ fontSize: '2rem' }}>{h.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{h.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{h.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: 'var(--off-white)' }} id="our-values">
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-tag">Our Values</span>
            <h2 className="section-title">What Drives Us</h2>
          </div>
          <div className="grid grid-3">
            {[
              { icon: <Award size={28} />, title: 'Quality Assurance',     desc: 'Every product is sourced from authorized manufacturers with valid batch records and expiry tracking.' },
              { icon: <Users size={28} />, title: 'Retailer First',         desc: 'We exist to serve medical shops. Our portal, pricing, and processes are designed around retailer convenience.' },
              { icon: <CheckCircle size={28}/>, title: 'Regulatory Compliance', desc: 'Strictly licensed under CDSCO and FSSAI norms. No gray-market sourcing. Full documentation on all stock.' },
            ].map((v, i) => (
              <div key={i} className="service-card animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="service-icon-wrap" style={{ color: 'var(--teal)' }}>{v.icon}</div>
                <h4 className="service-title">{v.title}</h4>
                <p className="service-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section" id="location">
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-tag">Our Location</span>
            <h2 className="section-title">Find Us</h2>
          </div>
          <div className="about-location-grid animate-fade-up">
            <div className="about-location-info">
              <div className="location-item">
                <MapPin size={18} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.25rem' }}>Warehouse & Head Office</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>{COMPANY.address}</div>
                </div>
              </div>
              <div className="location-item">
                <span style={{ fontSize: '1.2rem' }}>🕐</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>Business Hours</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>{COMPANY.hours}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--red)', marginTop: '0.2rem' }}>Closed on Sundays & Public Holidays</div>
                </div>
              </div>
              <div className="location-item">
                <span style={{ fontSize: '1.2rem' }}>📋</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>Licenses</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.8 }}>
                    Drug Lic: {COMPANY.dlNo}<br />
                    GSTIN: {COMPANY.gstin}
                  </div>
                </div>
              </div>
            </div>
            <div className="map-embed">
              <div style={{
                background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
                borderRadius: 'var(--radius-xl)',
                height: '320px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', gap: '1rem',
              }}>
                <MapPin size={40} style={{ color: 'var(--teal)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>NET PLUS ENTERPRISES</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Nagpur, Maharashtra</div>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                    className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem' }}>
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .page-hero {
          background: var(--gradient-hero);
          padding: calc(var(--nav-height) + 3rem) 0 4rem;
          text-align: center;
          position: relative;
        }
        .page-hero-title { color: #fff; margin: 0.75rem 0 1rem; }
        .page-hero-sub { color: rgba(255,255,255,0.65); font-size: 1.1rem; max-width: 560px; margin: 0 auto; }
        .page-hero .section-tag { color: var(--teal-light); border-color: rgba(0,184,169,0.3); background: rgba(0,184,169,0.1); }
        .about-grid {
          display: grid; grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem; align-items: start;
        }
        .about-highlights { display: flex; flex-direction: column; gap: 1rem; }
        .about-highlight-card {
          display: flex; align-items: center; gap: 1rem;
          background: var(--gray-50);
          border: 1.5px solid var(--gray-100);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          transition: var(--transition);
        }
        .about-highlight-card:hover {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(0,184,169,0.1);
        }
        .about-location-grid {
          display: grid; grid-template-columns: 1fr 1.2fr; gap: 3rem; align-items: start;
        }
        .location-item { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .map-embed { border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-lg); }
        @media (max-width: 900px) {
          .about-grid, .about-location-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
