import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, MapPin, Phone, FileText, Upload, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiSubmitOnboarding, apiUploadDocument } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const STATE_CITY_MAP = {
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Navi Mumbai', 'Solapur'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Gandhidham', 'Anand'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Tiruppur', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Thoothukkudi'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Alappuzha', 'Palakkad', 'Malappuram', 'Manjeri', 'Thalassery'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Ajitgarh', 'Hoshiarpur', 'Batala', 'Pathankot', 'Moga'],
  'Haryana': ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Raurkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Baleshwar', 'Bhadrak', 'Baripada', 'Jharsuguda'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Diphu', 'Dhubri'],
  'Goa': ['Panaji', 'Vasco da Gama', 'Margao', 'Mapusa', 'Ponda'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Chirmiri', 'Dhamtari'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Ramnagar', 'Pithoragarh', 'Manglaur'],
  'Himachal Pradesh': ['Shimla', 'Solan', 'Dharamshala', 'Baddi', 'Nahan', 'Mandi', 'Paonta Sahib', 'Sundarnagar', 'Chamba', 'Una'],
  'Jammu & Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramula', 'Kathua', 'Sopore', 'Bandipore', 'Rajouri', 'Udhampur', 'Poonch']
};

export default function OnboardingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [form, setForm] = useState({
    storeName: '',
    storeAddress: '',
    city: '',
    state: 'Jharkhand',
    pincode: '',
    phone: '',
    alternatePhone: '',
    licenceNo: '',
    gstin: '',
  });
  
  const [licenceFile, setLicenceFile] = useState({ file: null, name: '', raw: null });
  const [licenceFile2, setLicenceFile2] = useState({ file: null, name: '', raw: null });
  const [shopPhoto, setShopPhoto] = useState({ file: null, name: '', raw: null });
  const [gstinFile, setGstinFile] = useState({ file: null, name: '', raw: null });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setF = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const handleFileChange = (e, setFileState, errorKey) => {
    const file = e.target.files[0];
    if (!file) return;
    if (errorKey) setErrors(err => ({ ...err, [errorKey]: '' }));
    const reader = new FileReader();
    reader.onload = (ev) => setFileState({ file: ev.target.result, name: file.name, raw: file });
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
    if (!form.gstin) e.gstin = 'GSTIN number is required';
    if (!licenceFile.raw) e.licenceFile = 'Please upload your drug licence (Page 1)';
    if (!shopPhoto.raw) e.shopPhoto = 'Please upload a photo of your medical store';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let finalLicenceUrl = licenceFile.file;
      let licenceFileName = licenceFile.name;
      if (licenceFile.raw) {
        const path = `licences/${user.id}-${Date.now()}-${licenceFile.name}`;
        const uploadedUrl = await apiUploadDocument(licenceFile.raw, path);
        if (uploadedUrl) finalLicenceUrl = uploadedUrl;
      }

      let licenceFile2Url = licenceFile2.file;
      let licenceFile2Name = licenceFile2.name;
      if (licenceFile2.raw) {
        const path = `licences/${user.id}-${Date.now()}-2-${licenceFile2.name}`;
        const uploadedUrl = await apiUploadDocument(licenceFile2.raw, path);
        if (uploadedUrl) licenceFile2Url = uploadedUrl;
      }

      let shopPhotoUrl = shopPhoto.file;
      let shopPhotoName = shopPhoto.name;
      if (shopPhoto.raw) {
        const path = `shopphotos/${user.id}-${Date.now()}-${shopPhoto.name}`;
        const uploadedUrl = await apiUploadDocument(shopPhoto.raw, path);
        if (uploadedUrl) shopPhotoUrl = uploadedUrl;
      }

      let gstinFileUrl = gstinFile.file;
      let gstinFileName = gstinFile.name;
      if (gstinFile.raw) {
        const path = `gstin/${user.id}-${Date.now()}-${gstinFile.name}`;
        const uploadedUrl = await apiUploadDocument(gstinFile.raw, path);
        if (uploadedUrl) gstinFileUrl = uploadedUrl;
      }

      const finalData = { 
        ...form, 
        ownerName: user.name, 
        licenceFileUrl: finalLicenceUrl,
        licenceFileName,
        licenceFile2Url,
        licenceFile2Name,
        shopPhotoUrl,
        shopPhotoName,
        gstinFileUrl,
        gstinFileName
      };
      const res = await apiSubmitOnboarding(finalData);
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
      <div className="auth-full-container animate-scale-in">
        
        <div className="auth-full-header">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} className="auth-back-btn" style={{ position: 'absolute', left: 0, top: 0 }}><ArrowLeft size={16} /> Back</a>
          <img src="/netLogo.jpeg" alt="NET PLUS ENTERPRISES" className="auth-logo-small" />
          <div className="auth-brand-name-dark">NET PLUS ENTERPRISES</div>
          <div className="auth-brand-sub-dark">Medical Wholesale & Distribution</div>
        </div>

        <div className="auth-info-banner">
          <div className="banner-quote">
            "Complete your profile to get verified and access wholesale pricing."
          </div>
          <div className="banner-features">
            {['Fill store details', 'Upload drug licence', 'Admin verification'].map((f, i) => (
              <div key={i} className="banner-feat"><CheckCircle size={14} color="var(--teal)" /> {f}</div>
            ))}
          </div>
        </div>

        <div className="auth-form-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
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
                <input className="form-control" type="tel" inputMode="tel" placeholder="10-digit mobile" maxLength={10}
                  value={form.phone} onChange={e => setF('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} id="onb-phone" />
                {errors.phone && <div className="field-error">{errors.phone}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Alternate Phone</label>
                <input className="form-control" type="tel" inputMode="tel" placeholder="Optional" maxLength={10}
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
                <label className="form-label">State</label>
                <select className="form-control" value={form.state} onChange={e => { setF('state', e.target.value); setF('city', ''); }} id="onb-state">
                  {Object.keys(STATE_CITY_MAP).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <select className="form-control" value={form.city} onChange={e => setF('city', e.target.value)} id="onb-city" required>
                  <option value="" disabled>Select City</option>
                  {(STATE_CITY_MAP[form.state] || []).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <div className="field-error">{errors.city}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input className="form-control" type="text" placeholder="6 digits" maxLength={6}
                  value={form.pincode} onChange={e => setF('pincode', e.target.value.replace(/\D/g, ''))} id="onb-pincode" 
                  pattern="^[1-9][0-9]{5}$" title="Please enter a valid 6-digit Indian PIN code." required
                />
                {errors.pincode && <div className="field-error">{errors.pincode}</div>}
              </div>
            </div>

            {/* Documents */}
            <div className="onb-section-title" style={{ marginTop: '1.25rem' }}><FileText size={14} /> Documents</div>

            <div className="onb-row">
              <div className="form-group">
                <label className="form-label">Drug Licence Number *</label>
                <input className="form-control" type="text" placeholder="e.g. MH-MZ-123456"
                  value={form.licenceNo} onChange={e => setF('licenceNo', e.target.value.toUpperCase())} id="onb-licence" />
                {errors.licenceNo && <div className="field-error">{errors.licenceNo}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN Number *</label>
                <input className="form-control" type="text" placeholder="e.g. 22AAAAA0000A1Z5"
                  value={form.gstin} onChange={e => setF('gstin', e.target.value.toUpperCase())} id="onb-gstin" />
                {errors.gstin && <div className="field-error">{errors.gstin}</div>}
              </div>
            </div>

            <div className="onb-row">
              <div className="form-group">
                <label className="form-label">Upload Drug Licence (Page 1) *</label>
                <div className="onb-upload" onClick={() => document.getElementById('licence-upload').click()}>
                  <input type="file" id="licence-upload" style={{ display: 'none' }} accept="image/*,.pdf" onChange={e => handleFileChange(e, setLicenceFile, 'licenceFile')} />
                  {licenceFile.file ? (
                    <>
                      <CheckCircle size={24} color="var(--teal)" />
                      <div className="onb-upload-name">{licenceFile.name}</div>
                      <div className="onb-upload-hint">Click to change</div>
                    </>
                  ) : (
                    <>
                      <Upload size={24} color="var(--gray-400)" />
                      <div className="onb-upload-name">Upload Page 1</div>
                    </>
                  )}
                </div>
                {errors.licenceFile && <div className="field-error">{errors.licenceFile}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Upload Drug Licence (Page 2) (Optional)</label>
                <div className="onb-upload" onClick={() => document.getElementById('licence2-upload').click()}>
                  <input type="file" id="licence2-upload" style={{ display: 'none' }} accept="image/*,.pdf" onChange={e => handleFileChange(e, setLicenceFile2, null)} />
                  {licenceFile2.file ? (
                    <>
                      <CheckCircle size={24} color="var(--teal)" />
                      <div className="onb-upload-name">{licenceFile2.name}</div>
                      <div className="onb-upload-hint">Click to change</div>
                    </>
                  ) : (
                    <>
                      <Upload size={24} color="var(--gray-400)" />
                      <div className="onb-upload-name">Upload Page 2</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="onb-row">
              <div className="form-group">
                <label className="form-label">GSTIN Document (Optional)</label>
                <div className="onb-upload" onClick={() => document.getElementById('gstin-upload').click()}>
                  <input type="file" id="gstin-upload" style={{ display: 'none' }} accept="image/*,.pdf" onChange={e => handleFileChange(e, setGstinFile, null)} />
                  {gstinFile.file ? (
                    <>
                      <CheckCircle size={24} color="var(--teal)" />
                      <div className="onb-upload-name">{gstinFile.name}</div>
                      <div className="onb-upload-hint">Click to change</div>
                    </>
                  ) : (
                    <>
                      <Upload size={24} color="var(--gray-400)" />
                      <div className="onb-upload-name">Upload GSTIN</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Medical Store Photo *</label>
              <div className="onb-upload" onClick={() => document.getElementById('shop-photo-upload').click()}>
                <input type="file" id="shop-photo-upload" style={{ display: 'none' }} accept="image/*" onChange={e => handleFileChange(e, setShopPhoto, 'shopPhoto')} />
                {shopPhoto.file ? (
                  <>
                    <CheckCircle size={24} color="var(--teal)" />
                    <div className="onb-upload-name">{shopPhoto.name}</div>
                    <div className="onb-upload-hint">Click to change</div>
                  </>
                ) : (
                  <>
                    <Upload size={24} color="var(--gray-400)" />
                    <div className="onb-upload-name">Upload store photo</div>
                    <div className="onb-upload-hint">Front view of medical store</div>
                  </>
                )}
              </div>
              {errors.shopPhoto && <div className="field-error">{errors.shopPhoto}</div>}
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
          display: flex;
          align-items: flex-start;
          justify-content: center;
          background: var(--gray-50);
          padding: 3rem 1rem;
          overflow-y: auto;
        }
        .auth-full-container {
          width: 100%;
          max-width: 700px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
        }
        .auth-full-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          padding-top: 1rem;
        }
        .auth-logo-small {
          width: 70px; height: 70px; border-radius: 14px; margin-bottom: 0.75rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .auth-brand-name-dark { font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--navy); }
        .auth-brand-sub-dark { font-size: 0.8rem; color: var(--gray-500); font-weight: 500; margin-top: 0.2rem; }

        .auth-info-banner {
          background: #fff;
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          border: 1px solid var(--gray-200);
          box-shadow: var(--shadow-sm);
        }
        .banner-quote {
          font-style: italic; color: var(--gray-600); font-size: 0.9rem;
          text-align: center; margin-bottom: 1rem;
        }
        .banner-features {
          display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap;
        }
        .banner-feat {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.8rem; color: var(--navy); font-weight: 500;
        }

        .auth-back-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          color: var(--gray-500); font-size: 0.85rem; font-weight: 500;
          text-decoration: none; transition: var(--transition-fast);
        }
        .auth-back-btn:hover { color: var(--navy); }
        .auth-form-card {
          background: #fff; border-radius: var(--radius-xl);
          padding: 2.5rem; width: 100%;
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
          .auth-page { padding: 1rem; }
          .onb-row-3 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .onb-row { grid-template-columns: 1fr; }
          .onb-row-3 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
