import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { BRANDS } from '../../data/store';

export default function BrandsPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <section className="page-hero" id="brands-hero">
        <div className="container">
          <span className="section-tag">Our Partners</span>
          <h1 className="page-hero-title">Brands We Distribute</h1>
          <p className="page-hero-sub">120+ authorized pharmaceutical manufacturers and brands in our distribution network.</p>
        </div>
      </section>
      <section className="section" id="brands-list">
        <div className="container">
          <div className="brands-showcase-grid">
            {BRANDS.map((b, i) => (
              <div key={b.id} className="brand-showcase-card animate-fade-up" style={{ animationDelay: `${i*0.07}s` }}>
                <div className="brand-showcase-icon" style={{ background: b.color + '18', border: `2px solid ${b.color}22` }}>
                  <span style={{ fontSize: '2.4rem' }}>{b.logo}</span>
                </div>
                <div className="brand-showcase-name">{b.name}</div>
                <div className="brand-showcase-country">🌏 {b.country}</div>
                <div className="brand-showcase-badge" style={{ background: b.color + '14', color: b.color }}>Authorized Partner</div>
              </div>
            ))}
          </div>
          <div className="brands-note animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <span>🏭</span>
            <p>And <strong>110+ more brands</strong> available in our wholesale catalog. Log in to the retailer portal for the complete product list.</p>
          </div>
        </div>
      </section>
      <Footer />
      <style>{`
        .page-hero { background: var(--gradient-hero); padding: calc(var(--nav-height) + 3rem) 0 4rem; text-align: center; }
        .page-hero-title { color: #fff; margin: 0.75rem 0 1rem; }
        .page-hero-sub { color: rgba(255,255,255,0.65); font-size: 1.05rem; max-width: 560px; margin: 0 auto; }
        .page-hero .section-tag { color: var(--teal-light); border-color: rgba(0,184,169,0.3); background: rgba(0,184,169,0.1); }
        .brands-showcase-grid {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.5rem;
        }
        .brand-showcase-card {
          background: #fff; border-radius: var(--radius-xl);
          padding: 2rem 1rem; text-align: center;
          box-shadow: var(--shadow-sm); border: 1.5px solid var(--gray-100);
          transition: var(--transition);
        }
        .brand-showcase-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .brand-showcase-icon {
          width: 80px; height: 80px; border-radius: var(--radius-lg);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
        }
        .brand-showcase-name    { font-weight: 800; color: var(--navy); font-size: 0.95rem; }
        .brand-showcase-country { font-size: 0.75rem; color: var(--gray-400); margin: 0.25rem 0 0.6rem; }
        .brand-showcase-badge   { display: inline-block; font-size: 0.68rem; font-weight: 700; padding: 0.25rem 0.7rem; border-radius: var(--radius-full); }
        .brands-note {
          margin-top: 3rem; background: var(--off-white); border-radius: var(--radius-xl);
          padding: 2rem; display: flex; align-items: center; gap: 1.25rem;
          border: 1.5px dashed var(--gray-200); font-size: 0.95rem; color: var(--gray-600);
        }
        .brands-note span { font-size: 2rem; }
        @media (max-width: 1024px) { .brands-showcase-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 640px)  { .brands-showcase-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>
    </div>
  );
}
