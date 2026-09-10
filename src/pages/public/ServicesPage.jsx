import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { SERVICES } from '../../data/store';

export default function ServicesPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <section className="page-hero" id="services-hero">
        <div className="container">
          <span className="section-tag">What We Offer</span>
          <h1 className="page-hero-title">Our Services</h1>
          <p className="page-hero-sub">Comprehensive pharmaceutical distribution services designed for medical shops and pharmacies.</p>
        </div>
      </section>
      <section className="section" id="services-list">
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
        .page-hero { background: var(--gradient-hero); padding: calc(var(--nav-height)+3rem) 0 4rem; text-align: center; }
        .page-hero-title { color:#fff; margin:.75rem 0 1rem; }
        .page-hero-sub { color:rgba(255,255,255,.65); font-size:1.05rem; max-width:560px; margin:0 auto; }
        .page-hero .section-tag { color:var(--teal-light); border-color:rgba(0,184,169,.3); background:rgba(0,184,169,.1); }
        .service-big-card {
          background:#fff; border-radius:var(--radius-xl); padding:2.5rem 2rem;
          box-shadow:var(--shadow-sm); border:1.5px solid var(--gray-100); transition:var(--transition);
        }
        .service-big-card:hover { box-shadow:var(--shadow-lg); transform:translateY(-5px); border-color:var(--teal); }
        .sbc-icon { font-size:3rem; margin-bottom:1.25rem; }
        .sbc-title { color:var(--navy); font-size:1.15rem; margin-bottom:.75rem; }
        .sbc-desc  { color:var(--gray-500); font-size:.9rem; line-height:1.75; }
      `}</style>
    </div>
  );
}
