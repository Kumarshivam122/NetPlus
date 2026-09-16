import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Lock, ArrowRight, Activity, HeartPulse, Stethoscope, Pill, Wind, Smile, TestTube, Cross } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CATEGORIES } from '../../data/store';
import { useAuth } from '../../context/AuthContext';

export default function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const categoryIconMap = {
    'antibiotics': <TestTube size={28} color="#333" strokeWidth={1.5} />,
    'cardiovascular': <HeartPulse size={28} color="#333" strokeWidth={1.5} />,
    'diabetes': <Activity size={28} color="#333" strokeWidth={1.5} />,
    'pain': <Pill size={28} color="#333" strokeWidth={1.5} />,
    'vitamins': <Cross size={28} color="#333" strokeWidth={1.5} />,
    'gastro': <Stethoscope size={28} color="#333" strokeWidth={1.5} />,
    'neuro': <Activity size={28} color="#333" strokeWidth={1.5} />,
    'respiratory': <Wind size={28} color="#333" strokeWidth={1.5} />,
    'derma': <Smile size={28} color="#333" strokeWidth={1.5} />,
  };

  const handleActionClick = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/register');
    } else if (user.role === 'admin') {
      navigate('/admin/products');
    } else if (user.status === 'pending') {
      navigate('/pending');
    } else if (!user.storeName) {
      navigate('/onboarding');
    } else {
      navigate('/portal/products');
    }
  };
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Wholesale Pharmaceutical Products | NET PLUS</title>
        <meta name="description" content="Browse 18,000+ pharmaceutical products across 10+ therapeutic categories at PTR (Price to Retailer). Exclusive for verified medical shops." />
        <link rel="canonical" href={`${import.meta.env.VITE_BASE_URL}/products`} />
      </Helmet>
      <Navbar />
      <section className="page-hero" id="products-hero" style={{ background: '#fff' }}>
        <div className="container">
          <span className="accent-tag">Our Catalog</span>
          <h1 className="page-hero-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800 }}>Product Categories</h1>
          <p className="page-hero-sub" style={{ color: 'var(--gray-500)', fontSize: '1.1rem' }}>
            18,000+ pharmaceutical products across 10+ therapeutic categories.
            PTR (Price to Retailer) is <strong style={{ color: 'var(--teal-dark)' }}>private</strong> — visible only to approved retailers.
          </p>
        </div>
      </section>

      <section className="section" id="products-categories">
        <div className="container">
          <div className="professional-categories-grid">
            {CATEGORIES.filter(c => c.id !== 'all').map((cat, i) => (
              <div 
                key={cat.id} 
                className="horizontal-cat-card animate-fade-up" 
                style={{ animationDelay: `${i * 0.06}s`, cursor: 'pointer' }}
                onClick={handleActionClick}
              >
                <div className="horizontal-cat-icon">
                  {categoryIconMap[cat.id] || <Activity size={28} color="#333" strokeWidth={1.5} />}
                  <span className="icon-accent-dot"></span>
                </div>
                <div className="horizontal-cat-label">{cat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register CTA */}
      <section className="section" style={{ background: 'var(--off-white)', paddingTop: '2rem' }} id="products-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-header">
            <h2 className="section-title">Want Access to PTR (Price to Retailer)?</h2>
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
        .page-hero { padding: 6rem 0 4rem; text-align: center; }
        .professional-categories-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .horizontal-cat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .horizontal-cat-card:hover {
          border-color: var(--teal);
          box-shadow: 0 4px 15px rgba(13, 148, 136, 0.1);
        }
        .horizontal-cat-icon {
          background: #f8fafc;
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }
        .icon-accent-dot {
          position: absolute;
          top: 14px;
          left: 14px;
          width: 8px;
          height: 8px;
          background-color: var(--teal);
          border-radius: 50%;
          opacity: 0.8;
        }
        .horizontal-cat-label {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--navy);
          line-height: 1.2;
        }
        @media (max-width: 1024px) { .professional-categories-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 640px)  { .professional-categories-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>
    </div>
  );
}
