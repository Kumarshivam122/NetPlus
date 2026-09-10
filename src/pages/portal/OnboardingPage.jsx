import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, MapPin, Phone, FileText, Upload, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiSubmitOnboarding, apiUploadDocument } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OnboardingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [form, setForm] = useState({
    storeName: '',
    storeAddress: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    phone: '',
    alternatePhone: '',
    licenceNo: '',
  });
  
  const [fileData, setFileData] = useState({ file: null, name: '', raw: null });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setF = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrors(err => ({ ...err, licenceFile: '' }));
    const reader = new FileReader();
    reader.onload = (ev) => setFileData({ file: ev.target.result, name: file.name, raw: file });
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.storeName) e.storeName = 'Store name is required';
    if (!form.storeAddress) e.storeAddress = 'Address is required';
    if (!form.city) e.city = 'City is required';
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required';
    if (!form.phone || !/^\d{10}$/.test(form.phone)) e.phone = 'Valid 10-digit phone required';
    if (!form.licenceNo) e.licenceNo = 'Drug licence number is required';
    if (!fileData.raw) e.licenceFile = 'Please upload your shop licence';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let licenceUrl = fileData.file;
      if (fileData.raw) {
        const path = `licences/${user.id}-${Date.now()}-${fileData.name}`;
        const uploadedUrl = await apiUploadDocument(fileData.raw, path);
        if (uploadedUrl) licenceUrl = uploadedUrl;
      }
      const finalData = { ...form, licenceFile: licenceUrl };
      const res = await apiSubmitOnboarding(user.id, user.email, finalData);
      if (res.success) {
        await login({ ...user, ...finalData, status: 'pending' });
        addToast('Shop details submitted successfully!', 'success');
        navigate('/pending');
      } else {
        addToast(res.error || 'Failed to submit details', 'error');
      }
    } catch (err) {
      addToast('An error occurred. Please try again.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page" id="onboarding-page">
      <div className="auth-split-left">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="auth-back-btn"><ArrowLeft size={16} /> Back</a>
        <div className="auth-brand">
          <img src="/netLogo.jpeg" alt="NET PLUS ENTERPRISES" className="auth-logo" />
          <div className="auth-brand-name">NET PLUS ENTERPRISES</div>
          <div className="auth-brand-sub">Medical Wholesale & Distribution</div>
        </div>
        <div className="auth-quote">
          <p>"Complete your store profile to get verified and access wholesale pricing."</p>
        </div>
        <div className="auth-left-features">
          {['Fill in your store details', 'Upload your shop licence', 'Get verified by admin'].map((f, i) => (
            <div key={i} className="auth-left-feat"><span>✅</span> {f}</div>
          ))}
        </div>
        <div className="auth-admin-hint">
          <Shield size={14} />
          <span>Your account will be reviewed within 24 hours after submission.</span>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-card animate-scale-in" style={{ maxWidth: '480px' }}>
          <div className="auth-form-header">
            <h2>Complete Profile</h2>
            <p>Fill in your shop details to get verified</p>
          </div>

          <form onSubmit={handleSubmit} id="onboarding-form">
            {/* Store Details */}
            <div className="onb-section-title"><Store size={14} /> Store Details</div>

            <div className="form-group">
              <label className="form-label">Retailer / Store Name *</label>
              <input className="form-control" type="text" placeholder="e.g. Apollo Pharmacy"
                value={form.storeName} onChange={e => setF('storeName', e.target.value)} id="onb-store-name" />
              {errors.storeName && <div className="field-error">{errors.storeName}</div>}
            </div>

            <div className="onb-row">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-control" type="tel" placeholder="10-digit mobile" maxLength={10}
                  value={form.phone} onChange={e => setF('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} id="onb-phone" />
                {errors.phone && <div className="field-error">{errors.phone}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Alternate Phone</label>
                <input className="form-control" type="tel" placeholder="Optional" maxLength={10}
                  value={form.alternatePhone} onChange={e => setF('alternatePhone', e.target.value.replace(/\D/g, '').slice(0, 10))} id="onb-alt-phone" />
              </div>
            </div>

            {/* Location */}
            <div className="onb-section-title" style={{ marginTop: '1.25rem' }}><MapPin size={14} /> Location</div>

            <div className="form-group">
              <label className="form-label">Full Store Address *</label>
              <input className="form-control" type="text" placeholder="Street address, landmark"
                value={form.storeAddress} onChange={e => setF('storeAddress', e.target.value)} id="onb-address" />
              {errors.storeAddress && <div className="field-error">{errors.storeAddress}</div>}
            </div>

            <div className="onb-row onb-row-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-control" type="text" placeholder="City"
                  value={form.city} onChange={e => setF('city', e.target.value)} id="onb-city" />
                {errors.city && <div className="field-error">{errors.city}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-control" value={form.state} onChange={e => setF('state', e.target.value)} id="onb-state">
                  {['Maharashtra','Gujarat','Karnataka','Delhi','Tamil Nadu','Uttar Pradesh','Rajasthan','West Bengal','Madhya Pradesh','Kerala','Andhra Pradesh','Telangana','Bihar','Punjab','Haryana','Odisha','Assam','Jharkhand','Goa','Chhattisgarh','Uttarakhand','Himachal Pradesh','Jammu & Kashmir'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input className="form-control" type="text" placeholder="6 digits" maxLength={6}
                  value={form.pincode} onChange={e => setF('pincode', e.target.value.replace(/\D/g, ''))} id="onb-pincode" />
                {errors.pincode && <div className="field-error">{errors.pincode}</div>}
              </div>
            </div>

            {/* Documents */}
            <div className="onb-section-title" style={{ marginTop: '1.25rem' }}><FileText size={14} /> Documents</div>

            <div className="form-group">
              <label className="form-label">Drug Licence Number *</label>
              <input className="form-control" type="text" placeholder="e.g. MH-MZ-123456"
                value={form.licenceNo} onChange={e => setF('licenceNo', e.target.value.toUpperCase())} id="onb-licence" />
              {errors.licenceNo && <div className="field-error">{errors.licenceNo}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Upload Shop Licence *</label>
              <div className="onb-upload" onClick={() => document.getElementById('licence-upload').click()}>
                <input type="file" id="licence-upload" style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleFile} />
                {fileData.file ? (
                  <>
                    <CheckCircle size={24} color="var(--teal)" />
                    <div className="onb-upload-name">{fileData.name}</div>
                    <div className="onb-upload-hint">Click to change file</div>
                  </>
                ) : (
                  <>
                    <Upload size={24} color="var(--gray-400)" />
                    <div className="onb-upload-name">Click to upload licence</div>
                    <div className="onb-upload-hint">Supports JPG, PNG, PDF</div>
                  </>
                )}
              </div>
              {errors.licenceFile && <div className="field-error">{errors.licenceFile}</div>}
            </div>

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', height: '48px' }} disabled={loading} id="onb-submit-btn">
              {loading ? <span className="btn-spinner" /> : <><CheckCircle size={16} /> Submit for Verification</>}
            </button>
          </form>

          <p className="auth-note">
            Your details will be reviewed by the NET PLUS team before approval.
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .auth-split-left {
          background: var(--gradient-hero);
          padding: 3rem;
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        .auth-split-left::before {
          content:'';
          position:absolute; inset:0;
          background:radial-gradient(ellipse 80% 80% at 20% 80%, rgba(22,163,74,0.2) 0%, transparent 70%);
        }
        .auth-back-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          color: rgba(255,255,255,0.6); font-size: 0.85rem; font-weight: 500;
          text-decoration: none; transition: var(--transition-fast);
          position: relative; z-index: 2;
        }
        .auth-back-btn:hover { color: #fff; }
        .auth-brand {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center; position: relative; z-index: 2;
        }
        .auth-logo { width: 90px; height: 90px; border-radius: 18px; margin-bottom: 1rem; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        .auth-brand-name { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: #fff; letter-spacing: 0.05em; }
        .auth-brand-sub  { font-size: 0.8rem; color: var(--teal-light); font-weight: 500; margin-top: 0.3rem; }
        .auth-quote {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-lg); padding: 1.25rem;
          color: rgba(255,255,255,0.65); font-size: 0.88rem; font-style: italic; line-height: 1.6;
          margin: 1.5rem 0; position: relative; z-index: 2;
        }
        .auth-left-features { display: flex; flex-direction: column; gap: 0.6rem; position: relative; z-index: 2; }
        .auth-left-feat { font-size: 0.85rem; color: rgba(255,255,255,0.7); display: flex; gap: 0.5rem; align-items: center; }
        .auth-admin-hint {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(249,168,37,0.1); border: 1px solid rgba(249,168,37,0.2);
          border-radius: var(--radius-md); padding: 0.75rem 1rem;
          color: rgba(249,168,37,0.85); font-size: 0.78rem; font-weight: 500;
          margin-top: 1.5rem; position: relative; z-index: 2;
        }
        .auth-split-right {
          background: var(--gray-50);
          display: flex; align-items: center; justify-content: center;
          padding: 2rem; overflow-y: auto;
        }
        .auth-form-card {
          background: #fff; border-radius: var(--radius-xl);
          padding: 2.5rem; width: 100%; max-width: 480px;
          box-shadow: var(--shadow-xl); border: 1px solid var(--gray-100);
        }
        .auth-form-header { margin-bottom: 1.75rem; }
        .auth-form-header h2 { color: var(--navy); font-size: 1.6rem; margin-bottom: 0.3rem; }
        .auth-form-header p  { color: var(--gray-500); font-size: 0.9rem; }
        .auth-note { text-align: center; font-size: 0.75rem; color: var(--gray-400); margin-top: 1rem; }

        .onb-section-title {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--teal-dark);
          margin-bottom: 0.75rem; padding-bottom: 0.4rem;
          border-bottom: 1px solid var(--gray-100);
        }
        .onb-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .onb-row-3 { grid-template-columns: 1fr 1fr 1fr; }

        .onb-upload {
          cursor: pointer; border: 2px dashed var(--gray-200); border-radius: var(--radius-md);
          padding: 1.25rem; text-align: center; transition: var(--transition-fast);
          display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
        }
        .onb-upload:hover { border-color: var(--teal); background: rgba(13,148,136,0.03); }
        .onb-upload-name { font-weight: 600; font-size: 0.85rem; color: var(--navy); }
        .onb-upload-hint { font-size: 0.75rem; color: var(--gray-400); }

        .field-error { color: var(--red); font-size: 0.78rem; margin-top: 0.2rem; }

        .btn-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        .animate-scale-in { animation: scaleIn 0.4s ease-out forwards; }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-split-left { display: none; }
          .onb-row-3 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
