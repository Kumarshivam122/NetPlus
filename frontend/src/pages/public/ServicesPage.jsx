import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ServiceIcon from '../../components/ServiceIcon';
import { SERVICES } from '../../data/store';

export default function ServicesPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <section className="page-hero" id="services-hero">
        <div className="container">
          <ol className="breadcrumb" aria-label="Breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li aria-current="page">Services</li>
          </ol>
          <h1 className="page-hero-title">Our Services</h1>
          <p className="page-hero-sub">
            Comprehensive pharmaceutical distribution services designed for medical shops and pharmacies.
          </p>
        </div>
      </section>
      <section className="section" id="services-list">
        <div className="container">
          <div className="sp-grid">
            {SERVICES.map((s, i) => (
              <div key={i} className="sp-item">
                <span className="sp-icon"><ServiceIcon name={s.icon} size={28} /></span>
                <h2 className="sp-title">{s.title}</h2>
                <p className="sp-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <style>{`
        .sp-grid { display: grid; grid-template-columns: repeat(3, 1fr); background: #fff; border-top: 1px solid var(--gray-200); border-left: 1px solid var(--gray-200); }
        .sp-item { padding: 1.75rem; border-right: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200); }
        .sp-icon { display: inline-flex; color: var(--primary); margin-bottom: 0.9rem; }
        .sp-title { color: var(--ink); font-size: 1.15rem; margin-bottom: 0.4rem; font-weight: 700; }
        .sp-desc  { color: var(--gray-500); font-size: 1rem; line-height: 1.7; }
        @media (max-width: 1024px) { .sp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .sp-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
