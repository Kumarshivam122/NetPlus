import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ChevronRight, ChevronLeft, Check, Phone, MapPin, Mail, Clock,
  Pill, Store, Syringe, ShieldCheck
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ServiceIcon from '../../components/ServiceIcon';
import { CATEGORIES, BRANDS, SERVICES, DISTRIBUTION_STATS, COMPANY, photo } from '../../data/store';
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

// Banner slides: photo + short caption + a link to an existing page
const BANNERS = [
  {
    src: photo(13119976, 1600, 800), pos: '50% 62%',
    alt: 'Pharmacist arranging medicines on a pharmacy shelf',
    title: 'Wholesale medicines for your pharmacy',
    text: 'Genuine stock from authorised manufacturers, supplied to registered medical shops.',
    cta: { label: 'Browse Categories', to: '/products' },
  },
  {
    src: photo(31112251, 1600, 800), pos: '50% 50%',
    alt: 'Warehouse aisle with labelled storage bins',
    title: 'Organised storage, dependable delivery',
    text: 'Next-day delivery to registered pharmacies in the city and surrounding districts.',
    cta: { label: 'Our Services', to: '/services' },
  },
  {
    src: photo(14797864, 1600, 800), pos: '50% 45%',
    alt: 'Pharmacist working at a computer in a pharmacy',
    title: 'Order from the retailer portal',
    text: 'Registered retailers can view PTR, check live stock and place orders online.',
    cta: { label: 'Register Your Shop', to: '/register' },
  },
  {
    src: photo(8657368, 1600, 800), pos: '50% 40%',
    alt: 'Pharmacist helping a customer in a pharmacy',
    title: `Trusted by medical shops since ${COMPANY.established}`,
    text: 'A licensed wholesale distributor of pharmaceuticals and healthcare products.',
    cta: { label: 'About Us', to: '/about' },
  },
];

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

  const banners = BANNERS;
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

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>NET PLUS | Medical Wholesale & Distribution</title>
        <meta name="description" content="Trusted B2B pharmaceutical supplier for registered medical shops and pharmacies. Access PTR (Price to Retailer), live stock, and seamless ordering." />
        <link rel="canonical" href={`${import.meta.env.VITE_BASE_URL}/`} />
        <link rel="preload" href={banners[0].src} as="image" />
      </Helmet>
      <Navbar />

      <h1 className="sr-only">NET PLUS Enterprises — Medical Wholesale &amp; Distribution</h1>

      {/* ── BANNER ── */}
      <section className="hero-section" aria-label="Featured">
        <div className="container">
          <div className="hero-wrap">
            <button className="hero-nav prev" onClick={prevBanner} aria-label="Previous banner">
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <div
              className="hero-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTransitionEnd={handleTransitionEnd}
            >
              {extendedBanners.map((banner, index) => {
                const isClone = index === 0 || index === extendedBanners.length - 1;
                return (
                  <div key={index} className="hero-slide" aria-hidden={isClone}>
                    <img src={banner.src} alt={isClone ? '' : banner.alt} className="hero-slide-img" style={{ objectPosition: banner.pos }} />
                    <div className="hero-caption">
                      <p className="hero-title">{banner.title}</p>
                      <p className="hero-text">{banner.text}</p>
                      <Link to={banner.cta.to} className="btn btn-primary" tabIndex={isClone ? -1 : undefined}>
                        {banner.cta.label} <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="hero-nav next" onClick={nextBanner} aria-label="Next banner">
              <ChevronRight size={22} aria-hidden="true" />
            </button>
            <div className="hero-dots">
              {banners.map((_, i) => {
                const isActive = (currentIndex === 0 && i === banners.length - 1) ||
                                 (currentIndex === extendedBanners.length - 1 && i === 0) ||
                                 (currentIndex - 1 === i);
                return (
                  <button
                    key={i}
                    className={`hero-dot${isActive ? ' active' : ''}`}
                    aria-label={`Show banner ${i + 1} of ${banners.length}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => {
                      setIsTransitioning(true);
                      setCurrentIndex(i + 1);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <section className="ql-section" aria-label="Quick links">
        <div className="container">
          <div className="ql-grid">
            <Link to="/products" className="ql-item">
              <span className="ql-icon" aria-hidden="true"><Pill size={24} strokeWidth={1.75} /></span>
              <span className="ql-text"><strong>Buy Medicines &amp; Essentials</strong><small>Next day delivery</small></span>
              <ChevronRight size={20} className="ql-arrow" aria-hidden="true" />
            </Link>
            <Link to="/portal" className="ql-item">
              <span className="ql-icon" aria-hidden="true"><Store size={24} strokeWidth={1.75} /></span>
              <span className="ql-text"><strong>Register Your Shop</strong><small>Apply now</small></span>
              <ChevronRight size={20} className="ql-arrow" aria-hidden="true" />
            </Link>
            <Link to="/products" className="ql-item">
              <span className="ql-icon" aria-hidden="true"><Syringe size={24} strokeWidth={1.75} /></span>
              <span className="ql-text"><strong>Surgical Supplies</strong><small>Bulk pricing</small></span>
              <ChevronRight size={20} className="ql-arrow" aria-hidden="true" />
            </Link>
            <Link to="/products" className="ql-item">
              <span className="ql-icon" aria-hidden="true"><ShieldCheck size={24} strokeWidth={1.75} /></span>
              <span className="ql-text"><strong>Generic Alternatives</strong><small>Explore catalog</small></span>
              <ChevronRight size={20} className="ql-arrow" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="section" id="product-categories">
        <div className="container">
          <div className="head-row">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/products" className="head-link" id="view-all-cats-btn">
              View All Categories <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <p className="section-subtitle" style={{ marginBottom: '1.25rem' }}>
            45,000+ pharmaceutical and healthcare products across 10+ categories.{' '}
            <strong style={{ color: 'var(--ink)' }}>Prices are visible only to approved retailers.</strong>
          </p>
          <div className="cat-grid">
            {displayCategories.map((cat) => (
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
        </div>
      </section>

      {/* ── FIGURES ── */}
      <section className="stats-band" id="stats-section" aria-label="NET PLUS at a glance">
        <div className="container">
          <div className="stats-band-grid">
            {DISTRIBUTION_STATS.map((s, i) => (
              <div key={i} className="stats-band-item">
                <div className="stats-band-value">
                  <Counter
                    target={s.value}
                    suffix={s.value.includes('+') ? '+' : ''}
                  />
                </div>
                <div className="stats-band-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works for Medical Shop Owners</h2>
          <p className="section-subtitle" style={{ marginBottom: '1.5rem' }}>Get verified and access exclusive PTR (Price to Retailer) in 4 simple steps.</p>
          <ol className="how-row">
            {[
              { step: '1', title: 'Register',       desc: 'Fill in your shop details — name, address, licence, and upload your documents.' },
              { step: '2', title: 'Verification',   desc: 'Our team reviews your drug licence, shop photo, and submitted documents.' },
              { step: '3', title: 'Get Approved',   desc: 'Receive approval notification. Your retailer portal access is activated.' },
              { step: '4', title: 'Order Wholesale', desc: 'Browse our full catalog with PTR (Price to Retailer) and place orders instantly.' },
            ].map((s, i) => (
              <li key={i} className="how-item">
                <span className="how-num"><span className="sr-only">Step </span>{s.step}</span>
                <h3 className="how-title">{s.title}</h3>
                <p className="how-desc">{s.desc}</p>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/register" className="btn btn-primary btn-lg" id="how-register-btn">
              Start Registration <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section services-section" id="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle" style={{ marginBottom: '1.5rem' }}>End-to-end pharmaceutical distribution with quality assurance.</p>
          <div className="svc-grid">
            {SERVICES.map((s, i) => (
              <div key={i} className="svc-item">
                <span className="svc-icon"><ServiceIcon name={s.icon} /></span>
                <h3 className="svc-title">{s.title}</h3>
                <p className="svc-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS ── */}
      <section className="section" id="brands-section">
        <div className="container">
          <div className="head-row">
            <h2 className="section-title">Brands We Distribute</h2>
            <Link to="/brands" className="head-link">
              View All Brands <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="brand-grid">
            {BRANDS.map((b) => (
              <div key={b.id} className="brand-cell">
                <img src={b.logo} alt={b.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIVATE PORTAL ── */}
      <section className="cta-band" id="portal-cta">
        <div className="container cta-band-inner">
          <div className="cta-copy">
            <h2>Wholesale Access for Registered Retailers Only</h2>
            <p>
              Medical PTR (Price to Retailer), stock availability, and ordering are exclusively
              available to approved medical shops. Register and get verified to unlock access.
            </p>
            <ul className="cta-list">
              {[
                'Real-time PTR (Price to Retailer)',
                'Live stock availability',
                'One-click order system',
                'Doorstep delivery',
              ].map((text, i) => (
                <li key={i}><Check size={18} aria-hidden="true" /> {text}</li>
              ))}
            </ul>
          </div>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-light btn-lg" id="cta-register-btn">
              Register Your Shop <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" id="cta-login-btn">
              Already registered? Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT STRIP ── */}
      <section className="contact-strip" id="contact-strip" aria-label="Contact details">
        <div className="container">
          <div className="contact-strip-grid">
            <div className="contact-strip-item">
              <Phone size={22} aria-hidden="true" />
              <div>
                <div className="cs-label">Call Us</div>
                <a href={`tel:${COMPANY.phone}`} className="cs-value">{COMPANY.phone}</a>
              </div>
            </div>
            <div className="contact-strip-item">
              <Mail size={22} aria-hidden="true" />
              <div>
                <div className="cs-label">Email Us</div>
                <a href={`mailto:${COMPANY.email}`} className="cs-value">{COMPANY.email}</a>
              </div>
            </div>
            <div className="contact-strip-item">
              <Clock size={22} aria-hidden="true" />
              <div>
                <div className="cs-label">Business Hours</div>
                <div className="cs-value">{COMPANY.hours}</div>
              </div>
            </div>
            <div className="contact-strip-item">
              <MapPin size={22} aria-hidden="true" />
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
        /* Section heading with a link on the right */
        .head-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--gray-200); margin-bottom: 1rem; }
        .head-row .section-title { border-bottom: 0; margin-bottom: 0; padding-bottom: 0.7rem; }
        .head-link { display: inline-flex; align-items: center; gap: 0.35rem; padding-bottom: 0.7rem; color: var(--primary); font-weight: 600; font-size: 0.95rem; }
        .head-link:hover { text-decoration: underline; }

        /* ── Banner ── */
        .hero-section { padding: 1.25rem 0 0; background: #fff; }
        .hero-wrap { position: relative; overflow: hidden; border: 1px solid var(--gray-200); border-radius: 4px; background: #fff; }
        .hero-track { display: flex; width: 100%; }
        .hero-slide { flex: 0 0 100%; min-width: 0; position: relative; display: flex; flex-direction: column; }
        .hero-slide-img { display: block; width: 100%; aspect-ratio: 3 / 1; object-fit: cover; background: var(--gray-100); }
        .hero-caption { position: absolute; left: 2.25rem; top: 50%; transform: translateY(-50%); max-width: 440px; background: #fff; padding: 1.5rem 1.75rem; border-left: 4px solid var(--accent); }
        .hero-title { font-size: 1.6rem; font-weight: 700; color: var(--ink); line-height: 1.2; margin-bottom: 0.6rem; }
        .hero-text { font-size: 1rem; color: var(--navy-light); margin-bottom: 1rem; }
        .hero-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 5; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid var(--gray-300); border-radius: 4px; color: var(--ink); cursor: pointer; }
        .hero-nav:hover { background: var(--primary); border-color: var(--primary); color: #fff; }
        .hero-nav.prev { left: 0.6rem; }
        .hero-nav.next { right: 0.6rem; }
        .hero-dots { display: flex; justify-content: center; align-items: center; gap: 0.2rem; min-height: 40px; background: #fff; border-top: 1px solid var(--gray-200); }
        .hero-dot { width: 26px; height: 26px; padding: 0; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .hero-dot::before { content: ''; width: 12px; height: 12px; border-radius: 2px; border: 2px solid var(--primary); background: #fff; }
        .hero-dot.active::before { background: var(--primary); }

        /* ── Quick links ── */
        .ql-section { padding: 1.25rem 0 0.5rem; }
        .ql-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--gray-200); border-radius: 4px; background: #fff; }
        .ql-item { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.1rem; border-right: 1px solid var(--gray-200); color: var(--ink); min-width: 0; }
        .ql-item:last-child { border-right: none; }
        .ql-item:hover { background: var(--primary-tint); }
        .ql-icon { width: 44px; height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--primary); border: 1px solid var(--primary-line); border-radius: 4px; background: #fff; }
        .ql-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
        .ql-text strong { font-size: 0.98rem; font-weight: 700; }
        .ql-text small { font-size: 0.85rem; color: var(--gray-500); margin-top: 2px; }
        .ql-arrow { color: var(--gray-400); flex-shrink: 0; }
        .ql-item:hover .ql-arrow { color: var(--primary); }

        /* ── Figures band ── */
        .stats-band { background: var(--primary); color: #fff; padding: 2.25rem 0; }
        .stats-band-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .stats-band-item { text-align: center; padding: 0.25rem 1rem; border-right: 1px solid rgba(255,255,255,0.25); }
        .stats-band-item:last-child { border-right: none; }
        .stats-band-value { font-size: 2.4rem; font-weight: 700; line-height: 1.1; color: #fff; }
        .stats-band-label { font-size: 0.95rem; margin-top: 0.35rem; color: #e1e3f5; font-weight: 500; }

        /* ── How it works ── */
        .how-row { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--gray-200); border-radius: 4px; background: #fff; }
        .how-item { padding: 1.4rem 1.4rem 1.5rem; border-right: 1px solid var(--gray-200); }
        .how-item:last-child { border-right: none; }
        .how-num { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 4px; background: var(--primary); color: #fff; font-weight: 700; font-size: 1rem; margin-bottom: 0.85rem; }
        .how-title { font-size: 1.1rem; margin-bottom: 0.35rem; }
        .how-desc { font-size: 0.95rem; color: var(--gray-500); line-height: 1.6; }

        /* ── Services ── */
        .services-section { background: var(--off-white); border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200); }
        .svc-grid { display: grid; grid-template-columns: repeat(3, 1fr); background: #fff; border-top: 1px solid var(--gray-200); border-left: 1px solid var(--gray-200); }
        .svc-item { padding: 1.5rem; border-right: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200); }
        .svc-icon { display: inline-flex; color: var(--primary); margin-bottom: 0.75rem; }
        .svc-title { font-size: 1.08rem; margin-bottom: 0.35rem; }
        .svc-desc { font-size: 0.95rem; color: var(--gray-500); line-height: 1.6; }

        /* ── Brands ── */
        .brand-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.75rem; }
        .brand-cell { display: flex; align-items: center; justify-content: center; height: 112px; padding: 0.75rem; background: #fff; border: 1px solid var(--gray-200); border-radius: 4px; }
        .brand-cell:hover { border-color: var(--primary); }
        .brand-cell img { max-width: 100%; max-height: 76px; width: auto; height: auto; object-fit: contain; }

        /* ── Private portal band ── */
        .cta-band { background: var(--footer-bg); color: #fff; padding: 2.75rem 0; border-top: 4px solid var(--accent); }
        .cta-band-inner { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2.5rem; align-items: center; }
        .cta-copy h2 { color: #fff; margin-bottom: 0.7rem; }
        .cta-copy p { color: #d6d9ee; font-size: 1rem; line-height: 1.7; margin-bottom: 1.1rem; max-width: 640px; }
        .cta-list { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 0.55rem 1.5rem; max-width: 640px; }
        .cta-list li { display: flex; align-items: center; gap: 0.5rem; color: #fff; font-size: 0.95rem; font-weight: 500; }
        .cta-list svg { color: var(--accent); flex-shrink: 0; }
        .cta-actions { display: flex; flex-direction: column; gap: 0.75rem; }

        /* ── Contact strip ── */
        .contact-strip { background: #fff; padding: 2rem 0; border-bottom: 1px solid var(--gray-200); }
        .contact-strip-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--gray-200); border-radius: 4px; }
        .contact-strip-item { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border-right: 1px solid var(--gray-200); min-width: 0; color: var(--primary); }
        .contact-strip-item:last-child { border-right: none; }
        .contact-strip-item svg { flex-shrink: 0; }
        .cs-label { font-size: 0.78rem; color: var(--gray-500); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.1rem; }
        .cs-value { font-size: 0.9rem; color: var(--ink); font-weight: 600; overflow-wrap: anywhere; }
        a.cs-value:hover { color: var(--primary); text-decoration: underline; }

        @media (max-width: 1024px) {
          .ql-grid { grid-template-columns: repeat(2, 1fr); }
          .ql-item:nth-child(2) { border-right: none; }
          .ql-item:nth-child(-n+2) { border-bottom: 1px solid var(--gray-200); }
          .stats-band-grid { grid-template-columns: repeat(2, 1fr); row-gap: 1.5rem; }
          .stats-band-item:nth-child(2) { border-right: none; }
          .how-row { grid-template-columns: repeat(2, 1fr); }
          .how-item:nth-child(2) { border-right: none; }
          .how-item:nth-child(-n+2) { border-bottom: 1px solid var(--gray-200); }
          .svc-grid { grid-template-columns: repeat(2, 1fr); }
          .brand-grid { grid-template-columns: repeat(4, 1fr); }
          .cta-band-inner { grid-template-columns: 1fr; gap: 1.5rem; }
          .contact-strip-grid { grid-template-columns: repeat(2, 1fr); }
          .contact-strip-item:nth-child(2) { border-right: none; }
          .contact-strip-item:nth-child(-n+2) { border-bottom: 1px solid var(--gray-200); }
        }
        @media (max-width: 760px) {
          .hero-slide-img { aspect-ratio: 16 / 9; }
          .hero-caption { position: static; transform: none; max-width: none; padding: 1rem 1rem 1.1rem; border-left: 0; border-top: 4px solid var(--accent); }
          .hero-title { font-size: 1.2rem; }
          .hero-nav { top: auto; bottom: 0; transform: none; border-color: var(--gray-300); }
          .hero-nav:hover { background: #fff; border-color: var(--gray-300); color: var(--ink); }
          .hero-dots { min-height: 48px; }
          .hero-nav.prev { left: 0.5rem; bottom: 4px; }
          .hero-nav.next { right: 0.5rem; bottom: 4px; }
        }
        @media (max-width: 640px) {
          .section { padding: 2.25rem 0; }
          .ql-grid, .how-row, .contact-strip-grid { grid-template-columns: 1fr; }
          .ql-item, .how-item, .contact-strip-item { border-right: none; border-bottom: 1px solid var(--gray-200); }
          .ql-item:last-child, .how-item:last-child, .contact-strip-item:last-child { border-bottom: none; }
          .stats-band-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-band-value { font-size: 1.9rem; }
          .svc-grid { grid-template-columns: 1fr; }
          .brand-grid { grid-template-columns: repeat(2, 1fr); }
          .cta-list { grid-template-columns: 1fr; }
          .head-row { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
