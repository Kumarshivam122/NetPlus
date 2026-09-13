import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { BRANDS } from '../../data/store';
import { Search, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function BrandsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const brandLogos = {
    'Cipla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Cipla_logo.svg/320px-Cipla_logo.svg.png',
    'Sun Pharma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sun_Pharma_logo.svg/320px-Sun_Pharma_logo.svg.png',
    'Abbott': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Abbott_Laboratories_logo.svg/320px-Abbott_Laboratories_logo.svg.png',
    "Dr. Reddy's": 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dr._Reddy%27s_Laboratories_logo.svg/320px-Dr._Reddy%27s_Laboratories_logo.svg.png',
    'Alkem': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Alkem_Laboratories_Logo.svg/320px-Alkem_Laboratories_Logo.svg.png',
    'Mankind': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Mankind_Pharma_logo.svg/320px-Mankind_Pharma_logo.svg.png',
    'Zydus': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Zydus_Lifesciences_logo.svg/320px-Zydus_Lifesciences_logo.svg.png',
    'Intas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Intas_Pharmaceuticals_logo.svg/320px-Intas_Pharmaceuticals_logo.svg.png',
    'Torrent Pharma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Torrent_Pharmaceuticals_Logo.svg/320px-Torrent_Pharmaceuticals_Logo.svg.png'
  };

  const domainFallbacks = {
    'Cipla': 'cipla.com',
    'Sun Pharma': 'sunpharma.com',
    'Abbott': 'abbott.com',
    "Dr. Reddy's": 'drreddys.com',
    'Alkem': 'alkemlabs.com',
    'Mankind': 'mankindpharma.com',
    'Zydus': 'zyduslife.com',
    'Intas': 'intaspharma.com',
    'Torrent Pharma': 'torrentpharma.com'
  };

  const categories = ['All', 'Pharmaceutical', 'Healthcare', 'Surgical'];

  const filteredBrands = BRANDS.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      <section className="brands-hero">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div className="brands-hero-content" style={{ flex: '1 1 500px' }}>
            <h1 className="brands-hero-title">Brands We <span>Distribute</span></h1>
            <p className="brands-hero-sub">
              We work with trusted pharmaceutical manufacturers and authorized brands to ensure genuine and high-quality products for your business.
            </p>
            
            <div className="brands-search-bar">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search for a brand..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="search-btn"><Search size={18} /></button>
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

      <section className="section" style={{ paddingTop: '2rem', paddingBottom: '6rem', background: '#fafbfc' }}>
        <div className="container">
          <h2 style={{ textAlign: 'left', marginBottom: '2.5rem', color: 'var(--navy)', fontSize: '1.8rem', fontWeight: '800' }}>
            Our Featured Brands
          </h2>
          <div className="brands-showcase-grid">
            {filteredBrands.map((b, i) => (
              <div key={b.id} className="brand-showcase-card animate-fade-up" style={{ animationDelay: `${i*0.05}s` }}>
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
                  <ChevronRight size={20} className="brand-arrow" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <style>{`
        .brands-hero { padding: 5rem 0; background: #fff; position: relative; overflow: hidden; }
        .brands-hero-title { font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 800; color: var(--navy); margin-bottom: 1rem; line-height: 1.2; }
        .brands-hero-title span { color: var(--teal); }
        .brands-hero-sub { color: var(--gray-500); font-size: 1.1rem; line-height: 1.6; margin-bottom: 2.5rem; max-width: 500px; }
        
        .brands-search-bar { 
          display: flex; align-items: center; background: #fff; border: 1px solid var(--gray-200); 
          border-radius: 50px; padding: 0.5rem 0.5rem 0.5rem 1.5rem; margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05); max-width: 480px; transition: 0.3s;
        }
        .brands-search-bar:focus-within { border-color: var(--teal); box-shadow: 0 4px 20px rgba(0, 184, 169, 0.15); }
        .brands-search-bar input { flex: 1; border: none; outline: none; padding: 0.5rem; font-size: 1rem; color: var(--navy); }
        .search-icon { color: var(--gray-400); }
        .search-btn { background: var(--teal); color: #fff; border: none; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .search-btn:hover { background: var(--teal-dark); transform: scale(1.05); }
        
        .brands-filters { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .filter-pill { 
          padding: 0.6rem 1.5rem; border-radius: 50px; border: 1.5px solid var(--gray-200);
          background: #fff; color: var(--gray-600); font-weight: 600; font-size: 0.9rem;
          cursor: pointer; transition: 0.2s ease;
        }
        .filter-pill:hover { border-color: var(--teal); color: var(--teal); }
        .filter-pill.active { background: var(--teal); color: #fff; border-color: var(--teal); }
        
        .brands-hero-image { 
          height: 380px; width: 100%;
          background: url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800') center/cover; 
          border-radius: 20px 100px 20px 20px; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        
        .brands-showcase-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
        }
        .brand-showcase-card {
          background: #fff; border-radius: var(--radius-lg);
          padding: 1.25rem 1.25rem 1rem 1.25rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
          border: 1px solid var(--gray-100); transition: var(--transition);
          display: flex; flex-direction: column; gap: 1rem;
          cursor: pointer;
        }
        .brand-showcase-card:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 15px 35px rgba(0,0,0,0.08); 
          border-color: var(--teal-light);
        }
        
        .brand-logo-container {
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.5rem;
        }
        .brand-logo-container img {
          max-width: 130px; max-height: 60px; object-fit: contain; 
          filter: grayscale(100%) opacity(0.85); transition: 0.4s ease;
        }
        .brand-showcase-card:hover .brand-logo-container img { 
          filter: grayscale(0%) opacity(1); transform: scale(1.05);
        }
        
        .brand-logo-fallback { font-size: 1.8rem; font-weight: 900; letter-spacing: -0.5px; text-align: center; width: 100%; }
        
        .brand-card-bottom { display: flex; align-items: flex-end; justify-content: space-between; margin-top: auto; border-top: 1px solid var(--gray-50); padding-top: 1rem; }
        .brand-name { font-weight: 800; color: var(--navy); font-size: 1.15rem; margin-bottom: 0.25rem; }
        .brand-category { font-size: 0.9rem; color: var(--gray-500); font-weight: 500; }
        .brand-arrow { color: var(--gray-300); transition: 0.3s; }
        .brand-showcase-card:hover .brand-arrow { color: var(--teal); transform: translateX(5px); }
        
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
