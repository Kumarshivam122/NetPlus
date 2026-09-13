import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { COMPANY } from '../../data/store';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="page-wrapper">
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
                  <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name:'',email:'',phone:'',subject:'',message:'' }); }}>
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <h3 style={{ color: 'var(--navy)', marginBottom: '1.5rem', fontWeight: 800 }}>Send a Message</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Your Name *</label>
                        <input className="form-control" required placeholder="Full name"
                          value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input className="form-control" required placeholder="+91 XXXXX XXXXX" type="tel"
                          value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input className="form-control" required type="email" placeholder="your@email.com"
                        value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input className="form-control" placeholder="What is this regarding?"
                        value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea className="form-control" required placeholder="Write your message here..." rows={5}
                        value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} id="contact-submit-btn">
                      <Send size={16} /> Send Message
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
