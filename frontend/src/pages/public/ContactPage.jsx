import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { COMPANY } from '../../data/store';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', botField: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "NET PLUS Medical Wholesale & Distribution",
    "image": "https://netplus-seven.vercel.app/netLogo.jpeg",
    "@id": "https://netplus-seven.vercel.app",
    "url": "https://netplus-seven.vercel.app",
    "telephone": COMPANY.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": COMPANY.address,
      "addressLocality": "Dhanbad",
      "addressRegion": "JH",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "19:00"
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Honeypot check for spam protection
    if (form.botField) {
      setSent(true); // Silently discard but pretend it was successful for bots
      return;
    }

    // Basic inline validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^\+?[0-9\-\s]{10,15}$/;
    if (!phoneRegex.test(form.phone)) {
      setError("Please enter a valid phone number (10-15 digits).");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call for now (since there is no /api/contact endpoint in backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSent(true);
    } catch (err) {
      setError("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Contact Us | NET PLUS Medical Wholesale</title>
        <meta name="description" content="Reach out to NET PLUS for any queries, support, or wholesale order inquiries. We are here Mon-Sat, 9AM to 7PM." />
        <link rel="canonical" href="https://netplus-seven.vercel.app/contact" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      
      <Navbar />
      
      <section className="page-hero" id="contact-hero" style={{ background: '#fff' }}>
        <div className="container">
          <span className="accent-tag">Get In Touch</span>
          <h1 className="page-hero-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800 }}>Contact Us</h1>
          <p className="page-hero-sub" style={{ color: 'var(--gray-500)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto' }}>
            Have a question? Reach out to our team. We're here Mon–Sat, 9AM to 7PM.
          </p>
        </div>
      </section>

      <section className="section" id="contact-section" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="contact-grid">
            {/* Info */}
            <div className="contact-info animate-fade-up">
              <h3 style={{ color: 'var(--navy)', marginBottom: '1.5rem' }}>Contact Information</h3>
              {[
                { icon: <Phone size={20} />, label: 'Phone', value: COMPANY.phone, href: `tel:${COMPANY.phone}` },
                { icon: <Phone size={20} />, label: 'Alternate', value: COMPANY.phone2, href: `tel:${COMPANY.phone2}` },
                { icon: <Mail size={20} />,  label: 'Email',  value: COMPANY.email, href: `mailto:${COMPANY.email}` },
                { icon: <Mail size={20} />,  label: 'Orders', value: COMPANY.email2, href: `mailto:${COMPANY.email2}` },
                { icon: <MapPin size={20} />,label: 'Address',value: COMPANY.address },
                { icon: <Clock size={20} />, label: 'Hours',  value: COMPANY.hours },
              ].map((c, i) => (
                <div key={i} className="contact-info-item">
                  <div className="ci-icon">{c.icon}</div>
                  <div>
                    <div className="ci-label">{c.label}</div>
                    {c.href
                      ? <a href={c.href} className="ci-value link">{c.value}</a>
                      : <div className="ci-value">{c.value}</div>
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="contact-form-card animate-fade-up delay-200">
              {sent ? (
                <div className="contact-success">
                  <CheckCircle size={48} style={{ color: 'var(--green)' }} />
                  <h3 style={{ fontWeight: 800 }}>Message Sent!</h3>
                  <p>Our team will get back to you within 24 business hours.</p>
                  <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name:'',email:'',phone:'',subject:'',message:'', botField: '' }); }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <h3 style={{ color: 'var(--navy)', marginBottom: '1.5rem', fontWeight: 800 }}>Send a Message</h3>
                  
                  {error && (
                    <div style={{ padding: '0.875rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem', fontWeight: '500' }}>
                      <AlertTriangle size={18} /> {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Honeypot field for spam bots */}
                    <input type="text" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" value={form.botField} onChange={e => setForm({...form, botField: e.target.value})} />
                    
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-name">Your Name *</label>
                        <input id="contact-name" className="form-control" required placeholder="Full name"
                          value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-phone">Phone Number *</label>
                        <input id="contact-phone" className="form-control" required placeholder="+91 XXXXX XXXXX" type="tel"
                          value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-email">Email Address *</label>
                      <input id="contact-email" className="form-control" required type="email" placeholder="your@email.com"
                        value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-subject">Subject</label>
                      <input id="contact-subject" className="form-control" placeholder="What is this regarding?"
                        value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-message">Message *</label>
                      <textarea id="contact-message" className="form-control" required placeholder="Write your message here..." rows={5}
                        value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', opacity: loading ? 0.7 : 1 }} id="contact-submit-btn" disabled={loading}>
                      {loading ? (
                        <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff', margin: '0 auto' }} />
                      ) : (
                        <><Send size={16} /> Send Message</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <style>{`
        .page-hero { padding: 6rem 0 4rem; text-align: center; }
        .page-hero-title { color: var(--navy); margin:.75rem 0 1rem; }
        .contact-grid { display:grid; grid-template-columns:1fr 1.4fr; gap:3rem; align-items:start; }
        .contact-info { background:var(--navy); border-radius:var(--radius-xl); padding:2.5rem; }
        .contact-info h3 { color:#fff !important; }
        .contact-info-item { display:flex; align-items:flex-start; gap:1rem; margin-bottom:1.5rem; }
        .ci-icon {
          width:40px; height:40px; background:rgba(0,184,169,.15); border-radius:var(--radius-md);
          display:flex; align-items:center; justify-content:center; color:var(--teal); flex-shrink:0;
        }
        .ci-label { font-size:.72rem; font-weight:700; color:rgba(255,255,255,.4); text-transform:uppercase; letter-spacing:.08em; margin-bottom:.2rem; }
        .ci-value { font-size:.9rem; color:rgba(255,255,255,.8); line-height:1.5; }
        .ci-value.link { text-decoration:none; color:var(--teal-light); }
        .ci-value.link:hover { color:#fff; }
        .contact-form-card { background:#fff; border-radius:var(--radius-xl); padding:2.5rem; box-shadow:var(--shadow-md); border:1px solid var(--gray-100); }
        .contact-success { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; padding:3rem; text-align:center; min-height:300px; }
        .contact-success h3 { color:var(--navy); }
        .contact-success p { color:var(--gray-500); }
        @media (max-width:900px) { .contact-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
