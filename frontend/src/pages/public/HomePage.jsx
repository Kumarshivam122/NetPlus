import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Shield, Truck, Clock, Star, ChevronRight,
  Lock, UserCheck, Package, Phone, MapPin, Mail,
  Activity, HeartPulse, Stethoscope, Pill, Wind, Smile, TestTube, Cross
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CATEGORIES, BRANDS, SERVICES, DISTRIBUTION_STATS, COMPANY } from '../../data/store';
import { useAuth } from '../../context/AuthContext';

// Animated counter
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const numericTarget = parseInt(target.replace(/[^0-9]/g, ''));
        const increment = numericTarget / 60;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= numericTarget) { setCount(numericTarget); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 25);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Floating particle
function Particle({ style }) {
  return <div className="hero-particle" style={style} />;
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const banners = ['/banner.jpg', '/banner2.jpg', '/banner3.jpg', '/banner4.jpg'];
  const extendedBanners = [banners[banners.length - 1], ...banners, banners[0]];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = () => {
    if (currentIndex >= extendedBanners.length - 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };
  
  const prevBanner = () => {
    if (currentIndex <= 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(extendedBanners.length - 2);
    } else if (currentIndex === extendedBanners.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    }
  };

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextBanner();
    } else if (isRightSwipe) {
      prevBanner();
    }
    // Clear touch states to prevent double sliding
    setTouchStart(null);
    setTouchEnd(null);
  };

  const displayCategories = CATEGORIES.filter(c => c.id !== 'all');

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

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>NET PLUS | Medical Wholesale & Distribution</title>
        <meta name="description" content="Trusted B2B pharmaceutical supplier for registered medical shops and pharmacies. Access PTR (Price to Retailer), live stock, and seamless ordering." />
        <link rel="canonical" href="https://netplus-seven.vercel.app/" />
        <link rel="preload" href="/banner.jpg" as="image" />
      </Helmet>
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="hero-banner-section">
        <div className="container">
          <div className="hero-banner-wrapper animate-fade-up">
            <button className="banner-nav-btn prev" onClick={prevBanner}>
              <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }}/>
            </button>
            <div 
              className="hero-banner-track"
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTransitionEnd={handleTransitionEnd}
            >
              {extendedBanners.map((banner, index) => (
                <img 
                  key={index}
                  src={banner} 
                  alt={`Wholesale Medicines Banner ${index}`} 
                  className="hero-banner-img" 
                />
              ))}
            </div>
            <button className="banner-nav-btn next" onClick={nextBanner}>
              <ChevronRight size={24} />
            </button>
            <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
              {banners.map((_, i) => {
                const isActive = (currentIndex === 0 && i === banners.length - 1) || 
                                 (currentIndex === extendedBanners.length - 1 && i === 0) || 
                                 (currentIndex - 1 === i);
                return (
                  <button 
                    key={i} 
                    onClick={() => {
                      setIsTransitioning(true);
                      setCurrentIndex(i + 1);
                    }}
                    style={{ 
                      width: isActive ? '24px' : '8px', 
                      height: '8px', 
                      borderRadius: '4px', 
                      background: isActive ? 'var(--teal)' : 'rgba(0,0,0,0.2)',
                      border: 'none', cursor: 'pointer', transition: 'var(--transition)'
                    }} 
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK ACTION CARDS ── */}
      <section className="quick-actions-section">
        <div className="container">
          <div className="quick-actions-grid">
            <Link to="/products" className="qa-card" style={{ background: '#e6f7ec' }}>
              <div className="qa-icon" style={{ color: '#22A355' }}>💊</div>
              <div className="qa-content">
                <div className="qa-title">Buy Medicines & Essentials</div>
                <div className="qa-subtitle" style={{ color: '#166534' }}>NEXT DAY DELIVERY</div>
              </div>
              <ChevronRight size={20} className="qa-arrow" />
            </Link>

            <Link to="/portal" className="qa-card" style={{ background: '#fdf6db' }}>
              <div className="qa-icon" style={{ color: '#d97706' }}>🩺</div>
              <div className="qa-content">
                <div className="qa-title">Register Your Shop</div>
                <div className="qa-subtitle" style={{ color: '#92400e' }}>APPLY NOW</div>
              </div>
              <ChevronRight size={20} className="qa-arrow" />
            </Link>

            <Link to="/products" className="qa-card" style={{ background: '#fce8f3' }}>
              <div className="qa-icon" style={{ color: '#db2777' }}>✂️</div>
              <div className="qa-content">
                <div className="qa-title">Surgical Supplies</div>
                <div className="qa-subtitle" style={{ color: '#9d174d' }}>BULK PRICING</div>
              </div>
              <ChevronRight size={20} className="qa-arrow" />
            </Link>

            <Link to="/products" className="qa-card" style={{ background: '#fae8e4' }}>
              <div className="qa-icon" style={{ color: '#ea580c' }}>🛡️</div>
              <div className="qa-content">
                <div className="qa-title">Generic Alternatives</div>
                <div className="qa-subtitle" style={{ color: '#9a3412' }}>EXPLORE CATALOG</div>
              </div>
              <ChevronRight size={20} className="qa-arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS TICKER ── */}
      <section className="stats-section" id="stats-section">
        <div className="container">
          <div className="stats-grid">
            {DISTRIBUTION_STATS.map((s, i) => (
              <div key={i} className="stat-item animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-emoji">{s.icon}</div>
                <div className="stat-number">
                  <Counter
                    target={s.value}
                    suffix={s.value.includes('+') ? '+' : ''}
                  />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section how-section" id="how-it-works">
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">For Medical Shop Owners</h2>
            <p className="section-subtitle">Get verified and access exclusive PTR (Price to Retailer) in 4 simple steps</p>
          </div>
          <div className="how-grid">
            {[
              { step: '01', icon: '📝', title: 'Register',          desc: 'Fill in your shop details — name, address, licence, and upload your documents.' },
              { step: '02', icon: '🔍', title: 'Verification',       desc: 'Our team reviews your drug licence, shop photo, and submitted documents.' },
              { step: '03', icon: '✅', title: 'Get Approved',       desc: 'Receive approval notification. Your retailer portal access is activated.' },
              { step: '04', icon: '🛒', title: 'Order Wholesale',    desc: 'Browse our full catalog with PTR (Price to Retailer) and place orders instantly.' },
            ].map((s, i) => (
              <div key={i} className="how-card animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="how-step">{s.step}</div>
                <div className="how-icon">{s.icon}</div>
                <h4 className="how-title">{s.title}</h4>
                <p className="how-desc">{s.desc}</p>
                {i < 3 && <div className="how-arrow"><ChevronRight size={20} /></div>}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/register" className="btn btn-primary btn-lg" id="how-register-btn">
              Start Registration <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRODUCT CATEGORIES ── */}
      <section className="section categories-section" id="product-categories">
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-tag">Our Catalog</span>
            <h2 className="section-title">Product Categories</h2>
            <p className="section-subtitle">
              18,000+ pharmaceutical and healthcare products across 10+ categories.
              <br />
              <span style={{ color: 'var(--teal)', fontWeight: 600 }}>Prices visible only to approved retailers.</span>
            </p>
          </div>
          <div className="professional-categories-grid">
            {displayCategories.map((cat, i) => (
              <div
                key={cat.id}
                className="horizontal-cat-card animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
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
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/products" className="btn btn-outline" id="view-all-cats-btn">
              View All Categories <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section services-section" id="services-section">
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-tag">What We Offer</span>
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">End-to-end pharmaceutical distribution with quality assurance</p>
          </div>
          <div className="grid grid-3">
            {SERVICES.map((s, i) => (
              <div key={i} className="service-card animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="service-icon-wrap">
                  <span className="service-icon">{s.icon}</span>
                </div>
                <h4 className="service-title">{s.title}</h4>
                <p className="service-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS MARQUEE ── */}
      <section className="brands-section" id="brands-section">
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-tag">Our Partners</span>
            <h2 className="section-title">Brands We Distribute</h2>
          </div>
        </div>
        <div className="brands-marquee-wrap">
          <div className="brands-marquee">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <div key={i} className="brand-pill">
                <span className="brand-pill-icon">{b.logo}</span>
                <div>
                  <div className="brand-pill-name">{b.name}</div>
                  <div className="brand-pill-country">{b.country}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIVATE PORTAL CTA ── */}
      <section className="section portal-cta-section" id="portal-cta">
        <div className="container">
          <div className="portal-cta-card animate-fade-up">
            <div className="portal-cta-content">
              <div className="portal-cta-badge"><Lock size={14} /> Private B2B Portal</div>
              <h2 className="portal-cta-title">Wholesale Access for Registered Retailers Only</h2>
              <p className="portal-cta-desc">
                Medical PTR (Price to Retailer), stock availability, and ordering are exclusively
                available to approved medical shops. Register and get verified to unlock access.
              </p>
              <div className="portal-cta-features">
                {[
                  { icon: '💊', text: 'Real-time PTR (Price to Retailer)' },
                  { icon: '📦', text: 'Live stock availability' },
                  { icon: '📋', text: 'One-click order system' },
                  { icon: '🚚', text: 'Doorstep delivery' },
                ].map((f, i) => (
                  <div key={i} className="portal-cta-feature">
                    <span>{f.icon}</span> {f.text}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">
                  Register Your Shop <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" id="cta-login-btn">
                  Already registered? Login
                </Link>
              </div>
            </div>
            <div className="portal-cta-visual">
              <div className="portal-mock">
                <div className="portal-mock-header">
                  <div className="mock-dot red" /><div className="mock-dot amber" /><div className="mock-dot green" />
                  <div className="mock-url">🔒 portal.netplusenterprises.com</div>
                </div>
                <div className="portal-mock-body">
                  <div className="mock-row"><span className="mock-label">Augmentin 625mg</span><span className="mock-blur">₹ ●●●.●●</span></div>
                  <div className="mock-row"><span className="mock-label">Metformin 500mg</span><span className="mock-blur">₹ ●●●.●●</span></div>
                  <div className="mock-row"><span className="mock-label">Dolo 650mg</span><span className="mock-blur">₹ ●●.●●</span></div>
                  <div className="mock-row"><span className="mock-label">Cetirizine 10mg</span><span className="mock-blur">₹ ●●.●●</span></div>
                  <div className="mock-overlay">
                    <Lock size={28} />
                    <div>Login required to view prices</div>
                    <Link to="/login" className="btn btn-primary btn-sm" id="mock-login-btn">Login Now</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT STRIP ── */}
      <section className="contact-strip" id="contact-strip">
        <div className="container">
          <div className="contact-strip-grid">
            <div className="contact-strip-item">
              <Phone size={22} style={{ color: 'var(--teal)' }} />
              <div>
                <div className="cs-label">Call Us</div>
                <a href={`tel:${COMPANY.phone}`} className="cs-value">{COMPANY.phone}</a>
              </div>
            </div>
            <div className="contact-strip-divider" />
            <div className="contact-strip-item">
              <Mail size={22} style={{ color: 'var(--teal)' }} />
              <div>
                <div className="cs-label">Email Us</div>
                <a href={`mailto:${COMPANY.email}`} className="cs-value">{COMPANY.email}</a>
              </div>
            </div>
            <div className="contact-strip-divider" />
            <div className="contact-strip-item">
              <Clock size={22} style={{ color: 'var(--teal)' }} />
              <div>
                <div className="cs-label">Business Hours</div>
                <div className="cs-value">{COMPANY.hours}</div>
              </div>
            </div>
            <div className="contact-strip-divider" />
            <div className="contact-strip-item">
              <MapPin size={22} style={{ color: 'var(--teal)' }} />
              <div>
                <div className="cs-label">Location</div>
                <div className="cs-value">Dhanbad, Jharkhand</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          background: var(--cyan);
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 70% 40%, rgba(0,184,169,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 70%, rgba(6,200,232,0.1) 0%, transparent 60%);
        }
        .hero-container {
          flex: 1;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          gap: 4rem;
          padding-top: calc(var(--nav-height) + 3rem);
          padding-bottom: 6rem;
          position: relative; z-index: 2;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(22,163,74,0.15);
          border: 1px solid rgba(22,163,74,0.3);
          color: #4ade80;
          font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.06em;
          padding: 0.4rem 1rem; border-radius: var(--radius-full);
          margin-bottom: 1.5rem;
        }
        .hero-title {
          color: #fff; font-size: clamp(2rem, 4.5vw, 3.4rem);
          line-height: 1.1; margin-bottom: 1.5rem;
        }
        .hero-title-accent {
          background: var(--gradient-primary);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          color: rgba(255,255,255,0.65);
          font-size: 1.05rem; line-height: 1.7;
          max-width: 520px; margin-bottom: 2.5rem;
        }
        .hero-cta-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .hero-trust { display: flex; flex-wrap: wrap; gap: 0.6rem; }
        .hero-trust-badge {
          display: inline-flex; align-items: center; gap: 0.3rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          font-size: 0.72rem; font-weight: 500;
          padding: 0.3rem 0.7rem; border-radius: var(--radius-full);
        }
        .hero-particle {
          position: absolute; border-radius: 50%;
          background: rgba(0,184,169,0.12);
          animation: float 5s ease-in-out infinite;
          pointer-events: none;
        }
        /* Hero Visual */
        .hero-visual { display: flex; align-items: center; justify-content: center; }
        .hero-card-stack { position: relative; width: 320px; height: 360px; }
        .hero-card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: var(--radius-xl);
          padding: 2rem;
        }
        .hero-card-main {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          animation: float 4s ease-in-out infinite;
        }
        .hero-card-icon { font-size: 3.5rem; margin-bottom: 1rem; }
        .hero-card-title { color: #fff; font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; }
        .hero-card-sub   { color: rgba(255,255,255,0.55); font-size: 0.82rem; margin-top: 0.3rem; }
        .hero-card-lock  {
          display: flex; align-items: center; gap: 0.4rem;
          color: var(--teal-light); font-size: 0.75rem; font-weight: 600;
          background: rgba(0,184,169,0.15); border-radius: var(--radius-full);
          padding: 0.35rem 0.75rem; margin-top: 1.25rem;
        }
        .hero-card-float {
          position: absolute;
          background: #fff; padding: 0.85rem 1.1rem;
          display: flex; align-items: center; gap: 0.75rem;
          box-shadow: var(--shadow-xl);
          animation: float 3s ease-in-out infinite;
        }
        .hero-card-float-1 { bottom: 20px; left: -50px; animation-delay: 0.5s; border-radius: var(--radius-md); }
        .hero-card-float-2 { top: 20px;    right: -50px; animation-delay: 1s;   border-radius: var(--radius-md); }
        .hero-wave { position: relative; z-index: 2; margin-top: auto; line-height: 0; }
        .hero-wave svg { display: block; width: 100%; height: 80px; }

        /* ── Stats ── */
        .stats-section {
          background: #fff;
          padding: 3.5rem 0;
          box-shadow: var(--shadow-sm);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }
        .stat-item {
          text-align: center;
          padding: 1.5rem;
          border-right: 1px solid var(--gray-100);
        }
        .stat-item:last-child { border-right: none; }
        .stat-emoji { font-size: 2rem; margin-bottom: 0.5rem; }
        .stat-number {
          font-family: var(--font-display);
          font-size: 2.4rem; font-weight: 900;
          background: var(--gradient-primary);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label { font-size: 0.85rem; color: var(--gray-500); font-weight: 500; margin-top: 0.25rem; }

        /* ── How it works ── */
        .how-section { background: var(--off-white); }
        .how-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          position: relative;
        }
        .how-card {
          background: #fff;
          border-radius: var(--radius-xl);
          padding: 2rem 1.5rem;
          text-align: center;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-100);
          transition: var(--transition);
          position: relative;
        }
        .how-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-6px); }
        .how-step {
          display: inline-block;
          font-family: var(--font-display); font-size: 2.5rem; font-weight: 900;
          background: var(--gradient-primary);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }
        .how-icon { font-size: 2rem; margin-bottom: 0.75rem; }
        .how-title { color: var(--navy); font-size: 1.05rem; margin-bottom: 0.5rem; }
        .how-desc  { font-size: 0.85rem; color: var(--gray-500); line-height: 1.6; }
        .how-arrow {
          position: absolute; right: -20px; top: 50%;
          transform: translateY(-50%);
          color: var(--teal); background: #fff;
          border-radius: 50%; box-shadow: var(--shadow-sm);
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          z-index: 2;
        }

        /* ── Categories ── */
        .categories-section { background: #fff; }
        .professional-categories-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
          margin-top: 1rem;
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

        /* ── Services ── */
        .services-section { background: var(--off-white); }
        .service-card {
          background: #fff;
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--gray-100);
          transition: var(--transition);
        }
        .service-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-5px); }
        .service-icon-wrap {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, rgba(22,163,74,0.12), rgba(74,222,128,0.12));
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem; margin-bottom: 1rem;
        }
        .service-title { color: var(--navy); font-size: 1rem; margin-bottom: 0.5rem; }
        .service-desc  { font-size: 0.85rem; color: var(--gray-500); line-height: 1.65; }

        /* ── Brands marquee ── */
        .brands-section { padding: 4rem 0; background: #fff; overflow: hidden; }
        .brands-marquee-wrap { overflow: hidden; margin-top: 2rem; }
        .brands-marquee {
          display: flex; gap: 1.25rem;
          animation: marquee 28s linear infinite;
          width: max-content;
        }
        .brands-marquee:hover { animation-play-state: paused; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .brand-pill {
          display: flex; align-items: center; gap: 0.75rem;
          background: var(--gray-50);
          border: 1.5px solid var(--gray-100);
          border-radius: var(--radius-full);
          padding: 0.75rem 1.4rem;
          flex-shrink: 0;
          transition: var(--transition-fast);
          cursor: default;
        }
        .brand-pill:hover { border-color: var(--teal); background: rgba(0,184,169,0.05); }
        .brand-pill-icon  { font-size: 1.4rem; }
        .brand-pill-name  { font-weight: 700; font-size: 0.88rem; color: var(--navy); }
        .brand-pill-country { font-size: 0.72rem; color: var(--gray-400); }

        /* ── Portal CTA ── */
        .portal-cta-section { background: var(--off-white); }
        .portal-cta-card {
          background: var(--gradient-primary);
          border-radius: var(--radius-xl);
          padding: 4rem;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem;
          align-items: center;
          overflow: hidden;
          position: relative;
        }
        .portal-cta-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(0,184,169,0.2) 0%, transparent 70%);
        }
        .portal-cta-content { position: relative; z-index: 2; }
        .portal-cta-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: #4ade80;
          font-size: 0.78rem; font-weight: 600;
          padding: 0.4rem 1rem; border-radius: var(--radius-full);
          margin-bottom: 1.25rem;
        }
        .portal-cta-title {
          color: #fff; font-size: clamp(1.4rem, 2.5vw, 2rem);
          margin-bottom: 1rem;
        }
        .portal-cta-desc { color: rgba(255,255,255,0.65); font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.5rem; }
        .portal-cta-features {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;
        }
        .portal-cta-feature {
          display: flex; align-items: center; gap: 0.5rem;
          color: rgba(255,255,255,0.75); font-size: 0.85rem; font-weight: 500;
          background: rgba(255,255,255,0.06);
          padding: 0.6rem 0.9rem; border-radius: var(--radius-md);
        }
        /* Portal mock */
        .portal-cta-visual { position: relative; z-index: 2; }
        .portal-mock {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .portal-mock-header {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.75rem 1rem;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .mock-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mock-dot.red   { background: #ff5f57; }
        .mock-dot.amber { background: #febc2e; }
        .mock-dot.green { background: #28c840; }
        .mock-url { margin-left: 0.5rem; font-size: 0.72rem; color: rgba(255,255,255,0.4); }
        .portal-mock-body { padding: 1.5rem; position: relative; }
        .mock-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.65rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mock-label { font-size: 0.82rem; color: rgba(255,255,255,0.65); }
        .mock-blur  { font-size: 0.9rem; color: var(--teal-light); font-weight: 700; filter: blur(5px); }
        .mock-overlay {
          position: absolute; inset: 0;
          background: rgba(20,83,45,0.82);
          backdrop-filter: blur(2px);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.75rem; color: #fff; font-size: 0.85rem; font-weight: 600;
          border-radius: 0 0 var(--radius-xl) var(--radius-xl);
        }

        /* ── Contact Strip ── */
        .contact-strip {
          background: #ffffff;
          padding: 3rem 0;
          border-top: 1px solid #e2e8f0;
        }
        .contact-strip-grid {
          display: flex; align-items: stretch; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap;
        }
        .contact-strip-item {
          display: flex; align-items: center; gap: 1rem; flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 1.25rem 1.5rem;
          border-radius: var(--radius-lg);
          transition: var(--transition-fast);
        }
        .contact-strip-item:hover { border-color: var(--teal); box-shadow: var(--shadow-sm); }
        .contact-strip-divider { display: none; }
        .cs-label { font-size: 0.75rem; color: var(--navy-light); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
        .cs-value { font-size: 0.95rem; color: var(--navy); font-weight: 700; text-decoration: none; transition: color 0.2s; }
        .cs-value:hover { color: var(--teal); }

        @media (max-width: 1024px) {
          .hero-container { grid-template-columns: 1fr; }
          .hero-visual { display: none; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .how-grid { grid-template-columns: repeat(2, 1fr); }
          .how-arrow { display: none; }
          .professional-categories-grid { grid-template-columns: repeat(3, 1fr); }
          .portal-cta-card { grid-template-columns: 1fr; }
          .portal-cta-visual { display: none; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .how-grid { grid-template-columns: 1fr; }
          .professional-categories-grid { grid-template-columns: repeat(2, 1fr); }
          .portal-cta-card { padding: 2rem; }
          .contact-strip-divider { display: none; }
          .contact-strip-grid { gap: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
