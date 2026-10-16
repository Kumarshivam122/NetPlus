import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { BRANDS } from '../../data/store';
import { Search, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function BrandsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // Logo files live in /public/brands (placeholders until you add the official artwork — see brands/README.txt)
  const brandLogos = Object.fromEntries(BRANDS.map(b => [b.name, b.logo]));

  const domainFallbacks = {
    'Cipla': 'cipla.com',
    'Sun Pharma': 'sunpharma.com',
    'Abbott': 'abbott.com',
    "Dr. Reddy's": 'drreddys.com',
    'Alkem': 'alkemlabs.com',
    'Mankind': 'mankindpharma.com',
    'Zydus': 'zyduslife.com',
    'Intas': 'intaspharma.com',
    'Torrent Pharma': 'torrentpharma.com',
    'Pfizer': 'pfizer.com',
    'Lupin': 'lupin.com',
    'Alembic Pharma': 'alembicpharmaceuticals.com',
    'Hindustan Syringes': 'hmdhealthcare.com',
    'P&G': 'pg.com'
  };

  const categories = ['All', 'Pharmaceutical', 'Healthcare', 'Surgical'];

  const filteredBrands = BRANDS.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      <section className="brands-hero">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <div className="brands-hero-content" style={{ flex: '1 1 500px' }}>
            <ol className="breadcrumb" aria-label="Breadcrumb">
              <li><Link to="/">Home</Link></li>
              <li aria-current="page">Brands</li>
            </ol>
            <h1 className="brands-hero-title">Brands We <span>Distribute</span></h1>
            <p className="brands-hero-sub">
              We work with over 50 trusted pharmaceutical manufacturers and authorized brands to ensure genuine and high-quality products for your business.
            </p>

            <div className="brands-search-bar">
              <label htmlFor="brand-search" className="sr-only">Search for a brand</label>
              <Search size={20} className="search-icon" aria-hidden="true" />
              <input
                id="brand-search"
                type="text"
                placeholder="Search for a brand"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="button" className="search-btn">Search</button>
            </div>

            <div className="brands-filters">
              {categories.map(c => (
                <button 
                  key={c} 
                  className={`filter-pill ${filter === c ? 'active' : ''}`}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          
          <div className="brands-hero-image-wrapper" style={{ flex: '1 1 400px', position: 'relative' }}>
            <div className="brands-hero-image"></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'left', marginBottom: '1.5rem', color: 'var(--navy)', fontSize: '1.6rem', fontWeight: '700' }}>
            Our Featured Brands
          </h2>
          <div className="brands-showcase-grid">
            {filteredBrands.map((b) => (
              <a key={b.id} href="/portal/products" className="brand-showcase-card" onClick={handleActionClick}>
                <div className="brand-logo-container">
                  <img 
                    src={brandLogos[b.name] || `https://logo.clearbit.com/${domainFallbacks[b.name]}`} 
                    alt={b.name}
                    onError={(e) => {
                      if (!e.target.dataset.retried) {
                        e.target.dataset.retried = 'true';
                        e.target.src = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domainFallbacks[b.name]}&size=128`;
                      } else {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="brand-logo-fallback" style={{ display: 'none', color: b.color, fontWeight: 800, fontSize: '1.5rem', textAlign: 'center' }}>
                    {b.name}
                  </div>
                </div>
                <div className="brand-card-bottom">
                  <div>
                    <h3 className="brand-name">{b.name}</h3>
                    <p className="brand-category">Pharmaceuticals</p>
                  </div>
                  <ChevronRight size={20} className="brand-arrow" aria-hidden="true" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <style>{`
        .brands-hero { padding: 2rem 0 2.5rem; background: #fff; border-bottom: 1px solid var(--gray-200); }
        .brands-hero-title { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; color: var(--navy); margin-bottom: 0.75rem; line-height: 1.2; }
        .brands-hero-title span { color: var(--teal); }
        .brands-hero-sub { color: var(--navy-light); font-size: 1.05rem; line-height: 1.6; margin-bottom: 1.5rem; max-width: 540px; }

        .brands-search-bar {
          display: flex; align-items: stretch; background: #fff; border: 2px solid var(--teal);
          border-radius: 8px; overflow: hidden; margin-bottom: 1.25rem;
          max-width: 480px; min-height: 48px;
        }
        .brands-search-bar:focus-within { box-shadow: 0 0 0 3px rgba(60,60,143,0.25); }
        .brands-search-bar input { flex: 1; min-width: 0; border: none; outline: none; padding: 0 0.75rem; font-size: 1rem; color: var(--navy); font-family: inherit; }
        .brands-search-bar input::placeholder { color: var(--gray-400); }
        .search-icon { color: var(--teal); align-self: center; margin-left: 0.8rem; flex-shrink: 0; }
        .search-btn { background: var(--teal); color: #fff; border: none; padding: 0 1.4rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
        .search-btn:hover { background: var(--teal-dark); }

        .brands-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .filter-pill {
          min-height: 40px; padding: 0.4rem 1.1rem; border-radius: var(--radius-full); border: 1px solid var(--gray-300);
          background: #fff; color: var(--navy-mid); font-weight: 500; font-size: 0.95rem;
          cursor: pointer;
        }
        .filter-pill:hover { border-color: var(--teal); background: var(--cyan); color: var(--teal-dark); }
        .filter-pill.active { background: var(--teal); color: #fff; border-color: var(--teal); }

        .brands-hero-image {
          height: 320px; width: 100%;
          background: url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800') center/cover;
          border-radius: var(--radius-lg);
          border: 1px solid var(--gray-200);
        }

        .brands-showcase-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
        }
        .brand-showcase-card {
          background: #fff; border-radius: var(--radius-lg);
          padding: 1.25rem 1.25rem 1rem 1.25rem;
          border: 1px solid var(--gray-200);
          display: flex; flex-direction: column; gap: 1rem;
          cursor: pointer; color: inherit; text-decoration: none;
        }
        .brand-showcase-card:hover { border-color: var(--teal); box-shadow: var(--shadow-md); }

        .brand-logo-container {
          display: flex; align-items: center; justify-content: center;
          min-height: 96px; margin-bottom: 0.5rem;
        }
        .brand-logo-container img {
          max-width: 100%; max-height: 84px; object-fit: contain;
        }

        .brand-logo-fallback { font-size: 1.5rem; font-weight: 800; text-align: center; width: 100%; }

        .brand-card-bottom { display: flex; align-items: flex-end; justify-content: space-between; margin-top: auto; border-top: 1px solid var(--gray-200); padding-top: 1rem; }
        .brand-name { font-weight: 700; color: var(--navy); font-size: 1.1rem; margin-bottom: 0.2rem; }
        .brand-category { font-size: 0.95rem; color: var(--gray-500); font-weight: 500; }
        .brand-arrow { color: var(--teal); }
        
        @media (max-width: 1024px) { 
          .brands-showcase-grid { grid-template-columns: repeat(3,1fr); } 
        }
        @media (max-width: 768px) {
          .brands-hero-image-wrapper { display: none; }
        }
        @media (max-width: 640px)  { 
          .brands-showcase-grid { grid-template-columns: 1fr; } 
        }
      `}</style>
    </div>
  );
}
