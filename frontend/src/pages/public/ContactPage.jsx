import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { COMPANY } from '../../data/store';
import { apiSubmitContactQuery } from '../../services/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', botField: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "NET PLUS Medical Wholesale & Distribution",
    "image": `${import.meta.env.VITE_BASE_URL}/netLogo.jpeg`,
    "@id": `${import.meta.env.VITE_BASE_URL}`,
    "url": `${import.meta.env.VITE_BASE_URL}`,
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

    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiSubmitContactQuery({
        name: form.name,
        email: form.email,
        phone: cleanPhone,
        subject: form.subject,
        message: form.message
      });

      if (data && (data.success !== false)) {
        setSent(true);
      } else {
        setError((data && data.message) || "Failed to send message. Please try again later.");
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      setError(err.message || "Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Contact Us | NET PLUS Medical Wholesale</title>
        <meta name="description" content="Reach out to NET PLUS for any queries, support, or wholesale order inquiries. We are here Mon-Sat, 9AM to 7PM." />
        <link rel="canonical" href={`${import.meta.env.VITE_BASE_URL}/contact`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      
      <Navbar />
      
      <section className="page-hero" id="contact-hero">
        <div className="container">
          <ol className="breadcrumb" aria-label="Breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li aria-current="page">Contact Us</li>
          </ol>
          <h1 className="page-hero-title">Contact Us</h1>
          <p className="page-hero-sub">
            Have a question? Reach out to our team. We're here Mon–Sat, 9AM to 7PM.
          </p>
        </div>
      </section>

      <section className="section" id="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Info */}
            <div className="contact-info">
              <h2 className="contact-card-title">Contact Information</h2>
              {[
                { icon: <Phone size={20} />, label: 'Mobile', value: COMPANY.phone, href: `tel:${COMPANY.phone}` },
                { icon: <Phone size={20} />, label: 'Telephone', value: COMPANY.phone2, href: `tel:${COMPANY.phone2.replace(/\s+/g, '')}` },
                { icon: <Mail size={20} />,  label: 'Email',  value: COMPANY.email, href: `mailto:${COMPANY.email}` },
                { icon: <Mail size={20} />,  label: 'Orders', value: COMPANY.email2, href: `mailto:${COMPANY.email2}` },
                { icon: <MapPin size={20} />,label: 'Address',value: COMPANY.address },
                { icon: <Clock size={20} />, label: 'Hours',  value: COMPANY.hours },
              ].map((c, i) => (
                <div key={i} className="contact-info-item">
                  <div className="ci-icon" aria-hidden="true">{c.icon}</div>
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
            <div className="contact-form-card">
              {sent ? (
                <div className="contact-success" role="status">
                  <CheckCircle size={48} style={{ color: 'var(--green)' }} aria-hidden="true" />
                  <h2 style={{ fontWeight: 700 }}>Message Sent!</h2>
                  <p>Our team will get back to you within 24 business hours.</p>
                  <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name:'',email:'',phone:'',subject:'',message:'', botField: '' }); }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="contact-card-title">Send a Message</h2>

                  {error && (
                    <div role="alert" style={{ padding: '0.875rem 1rem', background: '#fde8e8', color: '#9b1c1c', border: '1px solid #f5b5b5', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.95rem', fontWeight: '500' }}>
                      <AlertTriangle size={18} aria-hidden="true" /> {error}
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
                        <input 
                          id="contact-phone" 
                          className="form-control" 
                          required 
                          placeholder="10-digit mobile number" 
                          type="tel"
                          maxLength={10}
                          value={form.phone} 
                          onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                        />
                        <small style={{ color: 'var(--gray-500)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                          Must be exactly 10 digits
                        </small>
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
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} id="contact-submit-btn" disabled={loading}>
                      {loading ? (
                        <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }} /> Sending...</>
                      ) : (
                        <><Send size={16} aria-hidden="true" /> Send Message</>
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
        .contact-grid { display:grid; grid-template-columns:1fr 1.4fr; gap:2rem; align-items:start; }
        .contact-card-title { font-size:1.3rem; color:var(--navy); margin-bottom:1.5rem; font-weight:700; }
        .contact-info { background:var(--off-white); border:1px solid var(--gray-200); border-radius:var(--radius-lg); padding:2rem; }
        .contact-info-item { display:flex; align-items:flex-start; gap:1rem; margin-bottom:1.25rem; }
        .contact-info-item:last-child { margin-bottom:0; }
        .ci-icon {
          width:44px; height:44px; background:var(--cyan); border-radius:var(--radius-lg);
          display:flex; align-items:center; justify-content:center; color:var(--teal); flex-shrink:0;
        }
        .ci-label { font-size:.8rem; font-weight:700; color:var(--gray-500); text-transform:uppercase; letter-spacing:.04em; margin-bottom:.15rem; }
        .ci-value { font-size:1rem; color:var(--navy); line-height:1.5; }
        .ci-value.link { text-decoration:none; color:var(--teal); font-weight:600; }
        .ci-value.link:hover { text-decoration:underline; }
        .contact-form-card { background:#fff; border-radius:var(--radius-lg); padding:2rem; border:1px solid var(--gray-200); }
        .contact-success { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; padding:3rem; text-align:center; min-height:300px; }
        .contact-success h2 { color:var(--navy); }
        .contact-success p { color:var(--gray-500); }
        @media (max-width:900px) { .contact-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
