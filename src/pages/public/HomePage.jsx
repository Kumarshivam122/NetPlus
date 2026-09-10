import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Truck, Clock, Star, ChevronRight,
  Lock, UserCheck, Package, Phone, MapPin, Mail
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CATEGORIES, BRANDS, SERVICES, DISTRIBUTION_STATS, COMPANY } from '../../data/store';

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

  const displayCategories = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <div className="page-wrapper" style={{ paddingTop: 0 }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="hero-bg" />
        {/* Animated particles */}
        {[...Array(8)].map((_, i) => (
          <Particle key={i} style={{
            width: `${40 + i * 20}px`, height: `${40 + i * 20}px`,
            top:  `${10 + i * 10}%`,  left: `${5 + i * 12}%`,
            animationDelay: `${i * 0.8}s`, animationDuration: `${4 + i}s`,
            opacity: 0.06 + i * 0.015,
          }} />
        ))}

        <div className="container hero-container">
          <div className="hero-content animate-fade-up">
            <div className="hero-badge">
              <Shield size={13} /> Licensed Pharmaceutical Distributor
            </div>
            <h1 className="hero-title">
              India's Trusted<br />
              <span className="hero-title-accent">Medical Wholesale</span><br />
              Distribution Network
            </h1>
            <p className="hero-subtitle">
              NET PLUS ENTERPRISES supplies medicines and healthcare products to
              verified medical shops and pharmacies — with competitive wholesale
              pricing, cold-chain logistics, and 15+ years of trusted service.
            </p>
            <div className="hero-cta-row">
              <Link to="/register" className="btn btn-primary btn-lg" id="hero-register-btn">
                Register Your Shop <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login-btn">
                Retailer Login
              </Link>
            </div>
            <div className="hero-trust">
              {['CDSCO Licensed', 'GST Registered', 'ISO Certified', 'Cold Chain Ready'].map(t => (
                <span key={t} className="hero-trust-badge"><Star size={10} fill="currentColor" /> {t}</span>
              ))}
            </div>
          </div>

          <div className="hero-visual animate-fade-up delay-300">
            <div className="hero-card-stack">
              <div className="hero-card hero-card-main">
                <div className="hero-card-icon">💊</div>
                <div className="hero-card-title">Wholesale Catalog</div>
                <div className="hero-card-sub">18,000+ products available</div>
                <div className="hero-card-lock">
                  <Lock size={12} /> Private — Login Required
                </div>
              </div>
              <div className="hero-card hero-card-float hero-card-float-1">
                <Truck size={20} style={{ color: 'var(--teal)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy)' }}>Next-Day Delivery</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>All registered zones</div>
                </div>
              </div>
              <div className="hero-card hero-card-float hero-card-float-2">
                <UserCheck size={20} style={{ color: 'var(--green)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy)' }}>2,400+ Retailers</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>Verified & active</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z" fill="var(--gray-50)" />
          </svg>
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
            <p className="section-subtitle">Get verified and access exclusive wholesale prices in 4 simple steps</p>
          </div>
          <div className="how-grid">
            {[
              { step: '01', icon: '📝', title: 'Register',          desc: 'Fill in your shop details — name, address, licence, and upload your documents.' },
              { step: '02', icon: '🔍', title: 'Verification',       desc: 'Our team reviews your drug licence, shop photo, and submitted documents.' },
              { step: '03', icon: '✅', title: 'Get Approved',       desc: 'Receive approval notification. Your retailer portal access is activated.' },
              { step: '04', icon: '🛒', title: 'Order Wholesale',    desc: 'Browse our full catalog with wholesale prices and place orders instantly.' },
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
          <div className="categories-grid">
            {displayCategories.map((cat, i) => (
              <div
                key={cat.id}
                className="cat-card animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="cat-icon">{cat.icon}</div>
                <div className="cat-label">{cat.label}</div>
                <div className="cat-lock"><Lock size={11} /> Login to view prices</div>
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
                Medical wholesale prices, stock availability, and ordering are exclusively
                available to approved medical shops. Register and get verified to unlock access.
              </p>
              <div className="portal-cta-features">
                {[
                  { icon: '💊', text: 'Real-time wholesale prices' },
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
                <div className="cs-value">Nagpur, Maharashtra</div>
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
          background: var(--gradient-hero);
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
          background: linear-gradient(135deg, #f79b5c, #e97f39);
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
          background: linear-gradient(135deg, #e97f39, #f79b5c);
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
          background: linear-gradient(135deg, #e97f39, #f79b5c);
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
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.25rem;
        }
        .cat-card {
          background: var(--gray-50);
          border: 1.5px solid var(--gray-100);
          border-radius: var(--radius-lg);
          padding: 1.5rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .cat-card:hover {
          background: #2d2d6c;
          color: var(--white);
          border-color: #2d2d6c;
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .cat-cat-card:hover .cat-label { color: #fff; }
        .cat-card:hover .cat-label { color: #fff; }
        .cat-card:hover .cat-lock  { color: #4ade80; }
        .cat-icon { font-size: 2rem; margin-bottom: 0.6rem; }
        .cat-label { font-weight: 600; font-size: 0.88rem; color: var(--navy); margin-bottom: 0.4rem; }
        .cat-lock  {
          font-size: 0.68rem; color: var(--gray-400);
          display: flex; align-items: center; justify-content: center; gap: 0.3rem;
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
          background: #2d2d6c;
          padding: 3rem 0;
        }
        .contact-strip-grid {
          display: flex; align-items: center; justify-content: space-between;
          gap: 2rem; flex-wrap: wrap;
        }
        .contact-strip-item {
          display: flex; align-items: center; gap: 1rem; flex: 1;
        }
        .contact-strip-divider {
          width: 1px; height: 50px;
          background: rgba(255,255,255,0.1);
        }
        .cs-label { font-size: 0.72rem; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
        .cs-value { font-size: 0.95rem; color: #fff; font-weight: 600; text-decoration: none; }
        .cs-value:hover { color: var(--teal-light); }

        @media (max-width: 1024px) {
          .hero-container { grid-template-columns: 1fr; }
          .hero-visual { display: none; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .how-grid { grid-template-columns: repeat(2, 1fr); }
          .how-arrow { display: none; }
          .categories-grid { grid-template-columns: repeat(3, 1fr); }
          .portal-cta-card { grid-template-columns: 1fr; }
          .portal-cta-visual { display: none; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .how-grid { grid-template-columns: 1fr; }
          .categories-grid { grid-template-columns: repeat(2, 1fr); }
          .portal-cta-card { padding: 2rem; }
          .contact-strip-divider { display: none; }
          .contact-strip-grid { gap: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
