// =============================================
//   NET PLUS ENTERPRISES — Central Data Store
// =============================================

export const COMPANY = {
  name: 'NET PLUS ENTERPRISES',
  tagline: 'Trusted Medical Wholesale & Distribution',
  shortName: 'NET PLUS',
  phone: '+91 96612 42464',
  phone2: '0326 228 0299',
  email: 'netplusenterprises@gmail.com',
  email2: 'netplusenterprises@gmail.com',
  address: 'Kushberia More, Asan Bani, Near HP Petrol Pump, Dhanbad, Jharkhand',
  gstin: '20CGEPG9949Q1ZS',
  dlNo: 'JH-Dh3-145689',
  hours: 'Mon–Sat: 9:00 AM – 7:00 PM',
  established: '2023',
};

// Stock photography (Pexels, free for commercial use). Replace with your own product shots whenever you have them.
export const photo = (id, w = 480, h = 360) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export const CATEGORIES = [
  { id: 'all',           label: 'All Products' },
  { id: 'antibiotics',   label: 'Antibiotics',            image: photo(7033798)  },
  { id: 'cardiovascular',label: 'Cardiovascular',         image: photo(14906846) },
  { id: 'diabetes',      label: 'Diabetes Care',          image: photo(1001897)  },
  { id: 'pain',          label: 'Pain & Fever',           image: photo(3923157)  },
  { id: 'vitamins',      label: 'Vitamins & Supplements', image: photo(13787562) },
  { id: 'gastro',        label: 'Gastro Care',            image: photo(208512)   },
  { id: 'neuro',         label: 'Neurology',              image: photo(16051954) },
  { id: 'respiratory',   label: 'Respiratory',            image: photo(29702937) },
  { id: 'derma',         label: 'Dermatology',            image: photo(8015462)  },
  { id: 'surgical',      label: 'Surgical Supplies',      image: photo(5207024)  },
  { id: 'devices',        label: 'Medical Devices',        image: photo(4386466)  },
];

// `logo` is the image file in /public/brands (one cropped logo per brand).
// To change a logo, replace the file with the same name (or edit the path here).
export const BRANDS = [
  { id: 1,  name: 'Cipla',               country: 'India', logo: '/brands/cipla.png',              color: '#00629b' },
  { id: 2,  name: 'Sun Pharma',          country: 'India', logo: '/brands/sun-pharma.png',         color: '#e8710a' },
  { id: 3,  name: 'Abbott',              country: 'USA',   logo: '/brands/abbott.png',             color: '#0a5aa8' },
  { id: 4,  name: "Dr. Reddy's",         country: 'India', logo: '/brands/dr-reddys.png',          color: '#5b2a8a' },
  { id: 5,  name: 'Alkem',               country: 'India', logo: '/brands/alkem.png',              color: '#0054a6' },
  { id: 6,  name: 'Mankind',             country: 'India', logo: '/brands/mankind.png',            color: '#1b3b9a' },
  { id: 7,  name: 'Zydus',               country: 'India', logo: '/brands/zydus.png',              color: '#1b3b8a' },
  { id: 8,  name: 'Intas',               country: 'India', logo: '/brands/intas.png',              color: '#1f6fb8' },
  { id: 9,  name: 'Torrent Pharma',      country: 'India', logo: '/brands/torrent.png',            color: '#1d2f7a' },
  { id: 10, name: 'Pfizer',              country: 'USA',   logo: '/brands/pfizer.png',             color: '#0093d0' },
  { id: 11, name: 'Lupin',               country: 'India', logo: '/brands/lupin.png',              color: '#1f8a3b' },
  { id: 12, name: 'Alembic Pharma',      country: 'India', logo: '/brands/alembic.png',            color: '#0b4aa8' },
  { id: 13, name: 'Hindustan Syringes',  country: 'India', logo: '/brands/hindustan-syringes.png', color: '#1269b8' },
  { id: 14, name: 'P&G',                 country: 'USA',   logo: '/brands/pg.png',                 color: '#0a4ea1' },
];

export const PRODUCTS = [
  { id: 1,  name: 'Augmentin 625mg',     generic: 'Amoxicillin + Clavulanic Acid', manufacturer: 'Pfizer',          category: 'antibiotics',    price: 285.50, mrp: 350.00, unit: 'Strip/10',    stock: 450, rx: true,  description: 'Broad-spectrum penicillin antibiotic with beta-lactamase inhibitor. Used for bacterial infections of the respiratory tract, ear, nose, throat, skin, and urinary tract.', scheme: { enabled: true, minQty: 9, freeQty: 1 } },
  { id: 2,  name: 'Azithral 500mg',      generic: 'Azithromycin',                  manufacturer: 'Alembic Pharma',  category: 'antibiotics',    price: 98.20,  mrp: 125.00, unit: 'Strip/5',     stock: 890, rx: true,  description: 'Macrolide antibiotic indicated for bacterial infections including pneumonia, bronchitis, sinus, and throat infections.', scheme: { enabled: true, minQty: 5, freeQty: 1 } },
  { id: 3,  name: 'Metformin 500mg SR',  generic: 'Metformin HCl',                 manufacturer: 'Sun Pharma',      category: 'diabetes',       price: 45.80,  mrp: 62.00,  unit: 'Strip/15',    stock: 1200,rx: true,  description: 'Sustained-release biguanide anti-diabetic medication used alongside diet and exercise to lower blood sugar in type 2 diabetes.' },
  { id: 4,  name: 'Amlodipine 5mg',      generic: 'Amlodipine Besylate',           manufacturer: 'Cipla',           category: 'cardiovascular', price: 38.50,  mrp: 55.00,  unit: 'Strip/15',    stock: 680, rx: true,  description: 'Calcium channel blocker used to treat high blood pressure (hypertension) and chest pain (angina).' },
  { id: 5,  name: 'Dolo 650mg',          generic: 'Paracetamol',                   manufacturer: 'Mankind Pharma',  category: 'pain',           price: 28.90,  mrp: 38.00,  unit: 'Strip/15',    stock: 2500,rx: false, description: 'Fast-acting analgesic and antipyretic medication formulated to relieve headache, toothache, muscle aches, and fever.', scheme: { enabled: true, minQty: 10, freeQty: 1 } },
  { id: 6,  name: 'Pantoprazole 40mg',   generic: 'Pantoprazole Sodium',           manufacturer: 'Alembic Pharma',  category: 'gastro',         price: 52.40,  mrp: 72.00,  unit: 'Strip/15',    stock: 980, rx: true,  description: 'Proton pump inhibitor (PPI) that decreases stomach acid production. Indicated for GERD, heartburn, and peptic ulcers.' },
  { id: 7,  name: 'Becosules Capsules',  generic: 'Multivitamin + Minerals',       manufacturer: 'Pfizer',          category: 'vitamins',       price: 112.00, mrp: 148.00, unit: 'Bottle/20',   stock: 760, rx: false, description: 'Comprehensive B-complex vitamin formula with Vitamin C to support energy metabolism and boost overall immunity.' },
  { id: 8,  name: 'Telmisartan 40mg',    generic: 'Telmisartan',                   manufacturer: "Dr. Reddy's",     category: 'cardiovascular', price: 88.30,  mrp: 118.00, unit: 'Strip/14',    stock: 540, rx: true,  description: 'Angiotensin II receptor antagonist (ARB) used for the management of essential hypertension and cardiovascular risk reduction.' },
  { id: 9,  name: 'Cetirizine 10mg',     generic: 'Cetirizine HCl',               manufacturer: 'Cipla',           category: 'respiratory',    price: 22.50,  mrp: 32.00,  unit: 'Strip/10',    stock: 1800,rx: false, description: 'Second-generation antihistamine that provides fast 24-hour relief from allergies, hay fever, sneezing, and watery eyes.' },
  { id: 10, name: 'Atorvastatin 10mg',   generic: 'Atorvastatin Calcium',          manufacturer: 'Lupin',           category: 'cardiovascular', price: 66.70,  mrp: 92.00,  unit: 'Strip/15',    stock: 720, rx: true,  description: 'Statin lipid-lowering medication used to reduce low-density lipoprotein (LDL) cholesterol and prevent heart attack or stroke.' },
  { id: 11, name: 'Amitriptyline 25mg',  generic: 'Amitriptyline HCl',            manufacturer: 'Sun Pharma',      category: 'neuro',          price: 44.20,  mrp: 62.00,  unit: 'Strip/10',    stock: 390, rx: true,  description: 'Tricyclic medication used in the management of neuropathic pain, migraine prophylaxis, and mood balance.' },
  { id: 12, name: 'Calamine Lotion',     generic: 'Calamine + Zinc Oxide',         manufacturer: "Dr. Reddy's",     category: 'derma',          price: 68.00,  mrp: 95.00,  unit: 'Bottle/100ml',stock: 320, rx: false, description: 'Soothing topical anti-pruritic preparation to soothe skin irritation, sunburn, insect bites, and allergic rashes.' },
  { id: 13, name: 'Salbutamol Inhaler',  generic: 'Salbutamol Sulphate',           manufacturer: 'Cipla',           category: 'respiratory',    price: 145.00, mrp: 195.00, unit: '200 doses',   stock: 280, rx: true,  description: 'Fast-acting bronchodilator aerosol inhaler used for the relief and prevention of bronchospasm in asthma and COPD.' },
  { id: 14, name: 'Ondansetron 4mg',     generic: 'Ondansetron HCl',              manufacturer: 'Abbott India',    category: 'gastro',         price: 36.80,  mrp: 52.00,  unit: 'Strip/10',    stock: 640, rx: true,  description: 'Serotonin 5-HT3 receptor antagonist antiemetic used to prevent nausea and vomiting.' },
  { id: 15, name: 'Glimepiride 2mg',     generic: 'Glimepiride',                  manufacturer: 'Abbott India',    category: 'diabetes',       price: 78.50,  mrp: 108.00, unit: 'Strip/15',    stock: 490, rx: true,  description: 'Second-generation sulfonylurea that stimulates the pancreas to produce more insulin for type 2 diabetes management.' },
  { id: 16, name: 'Surgical Gloves',     generic: 'Latex Sterile Gloves',         manufacturer: 'Hindustan Syr.',  category: 'surgical',       price: 320.00, mrp: 450.00, unit: 'Box/100',     stock: 180, rx: false, description: 'Powder-free, sterile surgical latex examination gloves providing high tactile sensitivity and tear resistance.' },
  { id: 17, name: 'Clonazepam 0.5mg',   generic: 'Clonazepam',                   manufacturer: 'Torrent Pharma',  category: 'neuro',          price: 62.00,  mrp: 88.00,  unit: 'Strip/10',    stock: 340, rx: true,  description: 'Benzodiazepine class medication indicated for anxiety disorders and seizure control.' },
  { id: 18, name: 'Esomeprazole 40mg',   generic: 'Esomeprazole Magnesium',       manufacturer: 'Lupin',           category: 'gastro',         price: 74.00,  mrp: 105.00, unit: 'Strip/14',    stock: 580, rx: true,  description: 'S-enantiomer of omeprazole that provides targeted acid suppression for erosive esophagitis and acid reflux.' },
  { id: 19, name: 'Vitamin D3 60K',      generic: 'Cholecalciferol 60000 IU',     manufacturer: 'Mankind Pharma',  category: 'vitamins',       price: 44.00,  mrp: 65.00,  unit: 'Strip/4 caps',stock: 1100,rx: false, description: 'High-potency weekly Vitamin D3 supplement for bone health, calcium absorption, and immune support.' },
  { id: 20, name: 'Betamethasone Cream', generic: 'Betamethasone Valerate',       manufacturer: 'Zydus Lifesciences', category: 'derma',      price: 56.00,  mrp: 82.00,  unit: 'Tube/15g',   stock: 260, rx: true,  description: 'Potent topical corticosteroid cream used to reduce inflammation, swelling, and itching in eczema and psoriasis.' },
];

// `icon` is the name of a line icon (see components/ServiceIcon.jsx)
export const SERVICES = [
  { icon: 'truck',        title: 'Pan-City Distribution',   desc: 'Reliable next-day delivery to all registered pharmacies within the city and surrounding districts.' },
  { icon: 'thermometer',  title: 'Cold Chain Logistics',    desc: 'Temperature-controlled storage and transport for insulin, vaccines, biologics, and temperature-sensitive medicines.' },
  { icon: 'package',      title: 'Bulk & Emergency Supply', desc: 'Handle bulk purchase orders and urgent/emergency medicine requests with priority fulfillment.' },
  { icon: 'shield',       title: 'Regulated & Compliant',   desc: 'Fully licensed under CDSCO norms. All products sourced from authorized manufacturers with verified batch records.' },
  { icon: 'credit-card',  title: 'Flexible Credit Terms',   desc: 'Competitive credit periods for verified retailers with clean payment history and good standing.' },
  { icon: 'calendar',     title: 'Expiry Monitoring',       desc: 'Proactive expiry tracking. We notify clients of near-expiry stock and offer seamless return processing.' },
];

export const DISTRIBUTION_STATS = [
  { value: '50+',     label: 'Registered Pharmacies' },
  { value: '3,000+',  label: 'Products in Catalog' },
  { value: '50+',     label: 'Brands & Manufacturers' },
  { value: '3+',      label: 'Years in Business' },
];

// =============================================
//   AUTH — Two Fixed Admins + Retailer Accounts
// =============================================
const STORAGE_KEY_USERS     = 'np_users';
const STORAGE_KEY_AUTH      = 'np_auth';
const STORAGE_KEY_ORDERS    = 'np_orders';

// Two fixed admin accounts — cannot be changed from UI
const FIXED_ADMINS = [
  {
    id: 'admin-001',
    email: 'admin@netplusenterprises.com',
    password: 'Admin@2024',
    role: 'admin',
    name: 'Admin One',
    status: 'approved',
  },
  {
    id: 'admin-002',
    email: 'manager@netplusenterprises.com',
    password: 'Manager@2024',
    role: 'admin',
    name: 'Admin Two',
    status: 'approved',
  },
];

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]'); }
  catch { return []; }
}
function saveUsers(u) { localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(u)); }

// Registration — for medical shops only
export function register(data) {
  const users = getUsers();
  if (users.find(u => u.email === data.email)) {
    return { success: false, error: 'This email is already registered.' };
  }
  // Only check phone duplicates for real phone numbers, not placeholders
  if (data.phone && data.phone !== '—' && data.phone.length >= 10 && users.find(u => u.phone === data.phone)) {
    return { success: false, error: 'This phone number is already registered.' };
  }
  const user = {
    id: 'retailer-' + Date.now(),
    ...data,
    role: 'retailer',
    status: 'onboarding',   // Must complete shop details first
    registeredAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return { success: true, user };
}

// Login — check admins first, then retailers
export function login(email, password) {
  const admin = FIXED_ADMINS.find(a => a.email === email && a.password === password);
  if (admin) {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(admin));
    return { success: true, user: admin };
  }
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { success: false, error: 'Invalid email or password.' };
  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
  return { success: true, user };
}

export function logout() { localStorage.removeItem(STORAGE_KEY_AUTH); }

export function getAuth() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_AUTH) || 'null'); }
  catch { return null; }
}

export function getAllUsers() { return getUsers(); }

export function updateUserStatus(userId, status) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return false;
  users[idx].status = status;
  saveUsers(users);
  const auth = getAuth();
  if (auth && auth.id === userId) {
    auth.status = status;
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(auth));
  }
  return true;
}

export function deleteUser(userId) {
  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);
}

// =============================================
//   ORDERS & DELIVERY HELPERS
// =============================================

// Calculate expected delivery date: 2 business days after order creation, skipping Sunday
export function computeExpectedDelivery(createdDate) {
  const d = createdDate ? new Date(createdDate) : new Date();
  const est = new Date(d);
  est.setDate(est.getDate() + 2);
  if (est.getDay() === 0) { // Sunday is non-transit
    est.setDate(est.getDate() + 1);
  }
  return est;
}

export function formatDeliveryDate(dateInput) {
  if (!dateInput) return 'Within 2 business days';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Within 2 business days';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  if (diffDays === 0) return `Today (${formattedDate})`;
  if (diffDays === 1) return `Tomorrow (${formattedDate})`;
  if (diffDays === 2) return `In 2 Days (${formattedDate})`;
  return formattedDate;
}

export function formatDeliveredDate(dateInput) {
  if (!dateInput) return 'Delivered';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Delivered';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function getOrders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]'); }
  catch { return []; }
}

export function submitOrder(order) {
  const list = getOrders();
  const orderId = order.orderId || ('ORD-' + Date.now());
  const now = new Date().toISOString();
  const estDelivery = computeExpectedDelivery(now).toISOString();
  const entry = {
    id: orderId,
    orderId: orderId,
    ...order,
    status: 'pending',
    submittedAt: now,
    createdAt: now,
    expectedDeliveryDate: estDelivery,
  };
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(list));
  return entry;
}

export function updateOrderStatus(id, status) {
  const list = getOrders();
  const idx = list.findIndex(e => e.id === id || e.orderId === id);
  if (idx !== -1) {
    list[idx].status = status;
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(list));
  }
}

export function clearOrders() {
  try {
    localStorage.removeItem(STORAGE_KEY_ORDERS);
  } catch (e) {}
}

// Ensure fresh start cleanup for cached client orders
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem('np_orders_fresh_v1')) {
      localStorage.removeItem(STORAGE_KEY_ORDERS);
      localStorage.setItem('np_orders_fresh_v1', 'true');
    }
  } catch (e) {}
}

