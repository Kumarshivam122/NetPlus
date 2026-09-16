import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Award, Users, MapPin, Shield, Building, Package, Users2, Heart } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { COMPANY } from '../../data/store';

export default function AboutPage() {
  return (
    <div className="page-wrapper" style={{ background: '#fff' }}>
      <Helmet>
        <title>About Us | NET PLUS Medical Wholesale</title>
        <meta name="description" content="Learn about NET PLUS ENTERPRISES, Maharashtra's leading B2B pharmaceutical wholesale and distribution company with over 15 years of trust." />
        <link rel="canonical" href={`${import.meta.env.VITE_BASE_URL}/about`} />
      </Helmet>
      <Navbar />
      <main>
      {/* ── NEW HERO SECTION (Reference Image Style) ── */}
      <section className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="about-hero-grid">
            
            {/* Left Content */}
            <div className="animate-fade-up">
              <span className="accent-tag">About Us</span>
              
              <h1 className="hero-heading">
                Trusted Since <span className="title-year">{COMPANY.established}</span>
              </h1>
              
              <p style={{ fontSize: '1.1rem', color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '540px' }}>
                NET PLUS ENTERPRISES — Maharashtra's leading B2B pharmaceutical wholesale & distribution company.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/products" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
                  Explore Products <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn btn-outline" style={{ padding: '0.85rem 2rem', gap: '0.6rem' }}>
                  <Heart size={18} /> Become a Partner
                </Link>
              </div>

              {/* Stats Strip */}
              <div className="stat-strip">
                <div className="stat-strip-item">
                  <div className="stat-strip-icon"><Shield size={20} /></div>
                  <div className="stat-strip-content">
                    <h4>15+</h4>
                    <p>Years of Trust</p>
                  </div>
                </div>
                <div className="stat-strip-item">
                  <div className="stat-strip-icon"><Building size={20} /></div>
                  <div className="stat-strip-content">
                    <h4>10,000 sq. ft.</h4>
                    <p>Warehouse Facility</p>
                  </div>
                </div>
                <div className="stat-strip-item">
                  <div className="stat-strip-icon"><Package size={20} /></div>
                  <div className="stat-strip-content">
                    <h4>500+</h4>
                    <p>Products</p>
                  </div>
                </div>
                <div className="stat-strip-item last-item">
                  <div className="stat-strip-icon"><Users2 size={20} /></div>
                  <div className="stat-strip-content">
                    <h4>1000+</h4>
                    <p>Business Partners</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual (Organic Blob) */}
            <div className="animate-fade-up delay-200">
              <div className="organic-blob-container">
                <div className="organic-blob-bg"></div>
                <div className="floating-badge">
                  <div className="icon-wrap"><Shield size={20} strokeWidth={2.5} /></div>
                  <div className="text">Quality Medicines<br/>for a Healthier<br/>Tomorrow</div>
                </div>
                <div className="organic-blob-img-wrapper">
                  <img src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Pharmacy shelves with boxes" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section className="section" style={{ background: 'var(--off-white)', borderRadius: '40px 40px 0 0', marginTop: '2rem' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }} className="animate-fade-up">
            <span className="accent-tag" style={{ background: '#fef3c7', color: '#b45309' }}>Our Story</span>
            <h2 className="section-title">15+ Years of Trusted Distribution</h2>
            <p style={{ marginBottom: '1.5rem', lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--gray-600)' }}>
              Founded in <strong>{COMPANY.established}</strong>, NET PLUS ENTERPRISES started as a small regional
              medicine distributor in Dhanbad and has grown into one of Jharkhand's most trusted
              wholesale pharmaceutical supply networks.
            </p>
            <p style={{ marginBottom: '1.5rem', lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--gray-600)' }}>
              We work exclusively with <strong>registered medical shops and pharmacies</strong> — ensuring
              medicines reach the right hands through a verified, controlled supply chain.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--gray-600)' }}>
              Our warehouse facilities, cold-chain logistics, and 120+ brand partnerships allow us to
              serve 2,400+ registered retailers across the region with next-day delivery capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="section" style={{ background: 'var(--off-white)', paddingTop: '2rem' }}>
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="accent-tag" style={{ background: '#e0e7ff', color: '#4338ca' }}>Our Values</span>
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

      {/* ── LOCATION ── */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="accent-tag" style={{ background: '#dcfce7', color: '#15803d' }}>Our Location</span>
            <h2 className="section-title">Find Us</h2>
          </div>
          <div className="about-location-grid animate-fade-up">
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <MapPin size={18} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.25rem' }}>Warehouse & Head Office</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>{COMPANY.address}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🕐</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>Business Hours</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>{COMPANY.hours}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--red)', marginTop: '0.2rem' }}>Closed on Sundays & Public Holidays</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
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
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', height: '320px', position: 'relative' }}>
              <iframe
                title="Netplus Enterprises Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116834.00977792683!2d86.35338029511679!3d23.795593848039778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f6a741369527f3%3A0xc4864fa9daff537b!2sDhanbad%2C%20Jharkhand!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <a href="https://share.google/qNprBPLN4rVB1ZyWD" target="_blank" rel="noreferrer" 
                 style={{ 
                   position: 'absolute', top: '50%', left: '50%', 
                   transform: 'translate(-50%, -100%)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', 
                   transition: 'transform 0.2s ease',
                   filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
                 }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'translate(-50%, -110%) scale(1.1)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'translate(-50%, -100%) scale(1)'}
                 title="Open Netplus Enterprises in Google Maps"
              >
                <svg width="42" height="42" viewBox="0 0 24 24" fill="#EA4335" stroke="#c5221f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3" fill="#fff" stroke="none"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer />

      <style>{`
        .about-hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .hero-heading {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: var(--navy);
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }
        .about-location-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 3rem;
          align-items: start;
        }
        .last-item::after { display: none !important; }
        @media (max-width: 1024px) {
          .about-hero-grid { grid-template-columns: 1fr; }
          .organic-blob-container { max-width: 500px; margin-top: 2rem; }
          .stat-strip-item::after { display: none; }
          .about-location-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
