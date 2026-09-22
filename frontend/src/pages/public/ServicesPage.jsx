import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { SERVICES } from '../../data/store';

export default function ServicesPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <section className="page-hero" id="services-hero" style={{ background: '#fff' }}>
        <div className="container">
          <span className="accent-tag">What We Offer</span>
          <h1 className="page-hero-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800 }}>Our Services</h1>
          <p className="page-hero-sub" style={{ color: 'var(--gray-500)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto' }}>
            Comprehensive pharmaceutical distribution services designed for medical shops and pharmacies.
          </p>
        </div>
      </section>
      <section className="section" id="services-list" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="grid grid-3">
            {SERVICES.map((s, i) => (
              <div key={i} className="service-big-card animate-fade-up" style={{ animationDelay: `${i*0.1}s` }}>
                <div className="sbc-icon">{s.icon}</div>
                <h3 className="sbc-title">{s.title}</h3>
                <p className="sbc-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <style>{`
        .page-hero { padding: 6rem 0 4rem; text-align: center; }
        .page-hero-title { color: var(--navy); margin:.75rem 0 1rem; }
        .service-big-card {
          background:#fff; border-radius:var(--radius-xl); padding:2.5rem 2rem;
          box-shadow:var(--shadow-sm); border:1.5px solid var(--gray-100); transition:var(--transition);
        }
        .service-big-card:hover { box-shadow:var(--shadow-lg); transform:translateY(-5px); border-color:var(--teal); }
        .sbc-icon { font-size:3rem; margin-bottom:1.25rem; }
        .sbc-title { color:var(--navy); font-size:1.15rem; margin-bottom:.75rem; font-weight: 700; }
        .sbc-desc  { color:var(--gray-500); font-size:.9rem; line-height:1.75; }
      `}</style>
    </div>
  );
}
