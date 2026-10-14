import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CATEGORIES } from '../../data/store';
import { useAuth } from '../../context/AuthContext';

export default function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // The header search sends visitors here as /products?q=term
  const searchTerm = (searchParams.get('q') || '').trim();

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

  const visibleCategories = CATEGORIES
    .filter(c => c.id !== 'all')
    .filter(c => !searchTerm || c.label.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Wholesale Pharmaceutical Products | NET PLUS</title>
        <meta name="description" content="Browse 45,000+ pharmaceutical products across 10+ therapeutic categories at PTR (Price to Retailer). Exclusive for verified medical shops." />
        <link rel="canonical" href={`${import.meta.env.VITE_BASE_URL}/products`} />
      </Helmet>
      <Navbar />
      <section className="page-hero" id="products-hero">
        <div className="container">
          <ol className="breadcrumb" aria-label="Breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li aria-current="page">Products</li>
          </ol>
          <h1 className="page-hero-title">{searchTerm ? `Search results for "${searchTerm}"` : 'Product Categories'}</h1>
          <p className="page-hero-sub">
            45,000+ pharmaceutical products across 10+ therapeutic categories.
            PTR (Price to Retailer) is <strong style={{ color: 'var(--ink)' }}>private</strong> — visible only to approved retailers.
          </p>
        </div>
      </section>

      <section className="section" id="products-categories">
        <div className="container">
          {visibleCategories.length > 0 ? (
            <div className="cat-grid">
              {visibleCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className="cat-tile"
                  onClick={handleActionClick}
                >
                  <span className="cat-img"><img src={cat.image} alt="" loading="lazy" /></span>
                  <span className="cat-name">{cat.label}</span>
                  <span className="cat-link">View products</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="products-empty">
              <Lock size={30} aria-hidden="true" />
              <h2>No category matches "{searchTerm}"</h2>
              <p>
                Individual medicines, brands and prices are available only inside the retailer portal.
                Register your shop or log in to search the full catalog.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                <Link to="/products" className="btn btn-outline" id="products-clear-search-btn">Show all categories</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Register CTA */}
      <section className="section" style={{ background: 'var(--off-white)', borderTop: '1px solid var(--gray-200)' }} id="products-cta">
        <div className="container">
          <div className="products-cta">
            <div>
              <h2 className="products-cta-title">Want Access to PTR (Price to Retailer)?</h2>
              <p>Register your medical shop and get verified to unlock the full catalog.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-cta btn-lg" id="products-register-btn">
                Register Your Shop <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg" id="products-login-btn">
                Already Registered? Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <style>{`
        .products-empty {
          text-align: center; max-width: 560px; margin: 1rem auto;
          padding: 2.25rem 1.5rem;
          background: #fff; border: 1px solid var(--gray-200); border-radius: 4px;
          color: var(--navy-light);
        }
        .products-empty h2 { font-size: 1.25rem; margin: 0.75rem 0 0.5rem; }
        .products-cta {
          display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;
          background: #fff; border: 1px solid var(--gray-200); border-left: 4px solid var(--accent); border-radius: 4px;
          padding: 1.5rem 1.75rem;
        }
        .products-cta-title { font-size: 1.3rem; margin-bottom: 0.25rem; }
      `}</style>
    </div>
  );
}
