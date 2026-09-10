import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CATEGORIES } from '../../data/store';

export default function ProductsPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <section className="page-hero" id="products-hero">
        <div className="container">
          <span className="section-tag">Our Catalog</span>
          <h1 className="page-hero-title">Product Categories</h1>
          <p className="page-hero-sub">
            18,000+ pharmaceutical products across 10+ therapeutic categories.
            Wholesale prices are <strong style={{ color: 'var(--teal-light)' }}>private</strong> — visible only to approved retailers.
          </p>
        </div>
      </section>

      <section className="section" id="products-categories">
        <div className="container">
          <div className="pub-cat-grid">
            {CATEGORIES.filter(c => c.id !== 'all').map((cat, i) => (
              <div key={cat.id} className="pub-cat-card animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="pub-cat-icon">{cat.icon}</div>
                <h3 className="pub-cat-name">{cat.label}</h3>
                <p className="pub-cat-desc">Browse a wide selection of {cat.label.toLowerCase()} medications and healthcare products.</p>
                <div className="pub-cat-lock">
                  <Lock size={12} />
                  <span>Login to view wholesale prices</span>
                </div>
                <Link to="/login" className="btn btn-outline btn-sm" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                  Login to Access <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register CTA */}
      <section className="section" style={{ background: 'var(--off-white)', paddingTop: '2rem' }} id="products-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-header">
            <h2 className="section-title">Want Access to Wholesale Prices?</h2>
            <p className="section-subtitle">Register your medical shop and get verified to unlock the full catalog.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" id="products-register-btn">
              Register Your Shop <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg" id="products-login-btn">
              Already Registered? Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <style>{`
        .page-hero {
          background: var(--gradient-hero);
          padding: calc(var(--nav-height) + 3rem) 0 4rem;
          text-align: center;
        }
        .page-hero-title { color: #fff; margin: 0.75rem 0 1rem; }
        .page-hero-sub { color: rgba(255,255,255,0.65); font-size: 1.05rem; max-width: 560px; margin: 0 auto; }
        .page-hero .section-tag { color: var(--teal-light); border-color: rgba(0,184,169,0.3); background: rgba(0,184,169,0.1); }
        .pub-cat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .pub-cat-card {
          background: #fff;
          border-radius: var(--radius-xl);
          padding: 2rem 1.5rem;
          text-align: center;
          box-shadow: var(--shadow-sm);
          border: 1.5px solid var(--gray-100);
          transition: var(--transition);
        }
        .pub-cat-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-5px); border-color: var(--teal); }
        .pub-cat-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .pub-cat-name { color: var(--navy); font-size: 1rem; margin-bottom: 0.5rem; }
        .pub-cat-desc { font-size: 0.82rem; color: var(--gray-500); line-height: 1.6; margin-bottom: 0.75rem; }
        .pub-cat-lock {
          display: flex; align-items: center; justify-content: center; gap: 0.35rem;
          font-size: 0.72rem; color: var(--gray-400); font-weight: 500;
          background: var(--gray-50); padding: 0.35rem 0.75rem; border-radius: var(--radius-full);
        }
        @media (max-width: 1024px) { .pub-cat-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 640px)  { .pub-cat-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>
    </div>
  );
}
