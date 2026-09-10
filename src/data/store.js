// =============================================
//   NET PLUS ENTERPRISES — Central Data Store
// =============================================

export const COMPANY = {
  name: 'NET PLUS ENTERPRISES',
  tagline: 'Trusted Medical Wholesale & Distribution',
  shortName: 'NET PLUS',
  phone: '+91 98765 43210',
  phone2: '+91 91234 56789',
  email: 'info@netplusenterprises.com',
  email2: 'orders@netplusenterprises.com',
  address: '14/B, Pharma Industrial Estate, Sector-12, Nagpur, Maharashtra - 440001',
  gstin: 'MH-27-GST-001234',
  dlNo: 'MH-20-DL-WHL-001234',
  hours: 'Mon–Sat: 9:00 AM – 7:00 PM',
  established: '2009',
};

export const CATEGORIES = [
  { id: 'all',           label: 'All Products',          icon: '💊' },
  { id: 'antibiotics',   label: 'Antibiotics',            icon: '🦠' },
  { id: 'cardiovascular',label: 'Cardiovascular',         icon: '❤️' },
  { id: 'diabetes',      label: 'Diabetes Care',          icon: '🩸' },
  { id: 'pain',          label: 'Pain & Fever',           icon: '🌡️' },
  { id: 'vitamins',      label: 'Vitamins & Supplements', icon: '🌿' },
  { id: 'gastro',        label: 'Gastro Care',            icon: '🫁' },
  { id: 'neuro',         label: 'Neurology',              icon: '🧠' },
  { id: 'respiratory',   label: 'Respiratory',            icon: '💨' },
  { id: 'derma',         label: 'Dermatology',            icon: '🧴' },
  { id: 'surgical',      label: 'Surgical Supplies',      icon: '🩺' },
];

export const BRANDS = [
  { id: 1, name: 'Cipla',           country: 'India', logo: '💊', color: '#1a73e8' },
  { id: 2, name: 'Sun Pharma',      country: 'India', logo: '☀️', color: '#f4a900' },
  { id: 3, name: 'Abbott India',    country: 'India', logo: '🔬', color: '#e00' },
  { id: 4, name: 'Pfizer',          country: 'USA',   logo: '🧬', color: '#0054a6' },
  { id: 5, name: "Dr. Reddy's",     country: 'India', logo: '🏥', color: '#c00' },
  { id: 6, name: 'Lupin',           country: 'India', logo: '💉', color: '#6b21a8' },
  { id: 7, name: 'Alembic Pharma',  country: 'India', logo: '⚗️', color: '#0f766e' },
  { id: 8, name: 'Mankind Pharma',  country: 'India', logo: '👨‍⚕️', color: '#ea580c' },
  { id: 9, name: 'Torrent Pharma',  country: 'India', logo: '⚡', color: '#7c3aed' },
  { id: 10, name: 'Zydus Lifesciences', country: 'India', logo: '🔵', color: '#0369a1' },
];

export const PRODUCTS = [
  { id: 1,  name: 'Augmentin 625mg',     generic: 'Amoxicillin + Clavulanic Acid', manufacturer: 'Pfizer',          category: 'antibiotics',    price: 285.50, mrp: 350.00, unit: 'Strip/10',    stock: 450, rx: true  },
  { id: 2,  name: 'Azithral 500mg',      generic: 'Azithromycin',                  manufacturer: 'Alembic Pharma',  category: 'antibiotics',    price: 98.20,  mrp: 125.00, unit: 'Strip/5',     stock: 890, rx: true  },
  { id: 3,  name: 'Metformin 500mg SR',  generic: 'Metformin HCl',                 manufacturer: 'Sun Pharma',      category: 'diabetes',       price: 45.80,  mrp: 62.00,  unit: 'Strip/15',    stock: 1200,rx: true  },
  { id: 4,  name: 'Amlodipine 5mg',      generic: 'Amlodipine Besylate',           manufacturer: 'Cipla',           category: 'cardiovascular', price: 38.50,  mrp: 55.00,  unit: 'Strip/15',    stock: 680, rx: true  },
  { id: 5,  name: 'Dolo 650mg',          generic: 'Paracetamol',                   manufacturer: 'Mankind Pharma',  category: 'pain',           price: 28.90,  mrp: 38.00,  unit: 'Strip/15',    stock: 2500,rx: false },
  { id: 6,  name: 'Pantoprazole 40mg',   generic: 'Pantoprazole Sodium',           manufacturer: 'Alembic Pharma',  category: 'gastro',         price: 52.40,  mrp: 72.00,  unit: 'Strip/15',    stock: 980, rx: true  },
  { id: 7,  name: 'Becosules Capsules',  generic: 'Multivitamin + Minerals',       manufacturer: 'Pfizer',          category: 'vitamins',       price: 112.00, mrp: 148.00, unit: 'Bottle/20',   stock: 760, rx: false },
  { id: 8,  name: 'Telmisartan 40mg',    generic: 'Telmisartan',                   manufacturer: "Dr. Reddy's",     category: 'cardiovascular', price: 88.30,  mrp: 118.00, unit: 'Strip/14',    stock: 540, rx: true  },
  { id: 9,  name: 'Cetirizine 10mg',     generic: 'Cetirizine HCl',               manufacturer: 'Cipla',           category: 'respiratory',    price: 22.50,  mrp: 32.00,  unit: 'Strip/10',    stock: 1800,rx: false },
  { id: 10, name: 'Atorvastatin 10mg',   generic: 'Atorvastatin Calcium',          manufacturer: 'Lupin',           category: 'cardiovascular', price: 66.70,  mrp: 92.00,  unit: 'Strip/15',    stock: 720, rx: true  },
  { id: 11, name: 'Amitriptyline 25mg',  generic: 'Amitriptyline HCl',            manufacturer: 'Sun Pharma',      category: 'neuro',          price: 44.20,  mrp: 62.00,  unit: 'Strip/10',    stock: 390, rx: true  },
  { id: 12, name: 'Calamine Lotion',     generic: 'Calamine + Zinc Oxide',         manufacturer: "Dr. Reddy's",     category: 'derma',          price: 68.00,  mrp: 95.00,  unit: 'Bottle/100ml',stock: 320, rx: false },
  { id: 13, name: 'Salbutamol Inhaler',  generic: 'Salbutamol Sulphate',           manufacturer: 'Cipla',           category: 'respiratory',    price: 145.00, mrp: 195.00, unit: '200 doses',   stock: 280, rx: true  },
  { id: 14, name: 'Ondansetron 4mg',     generic: 'Ondansetron HCl',              manufacturer: 'Abbott India',    category: 'gastro',         price: 36.80,  mrp: 52.00,  unit: 'Strip/10',    stock: 640, rx: true  },
  { id: 15, name: 'Glimepiride 2mg',     generic: 'Glimepiride',                  manufacturer: 'Abbott India',    category: 'diabetes',       price: 78.50,  mrp: 108.00, unit: 'Strip/15',    stock: 490, rx: true  },
  { id: 16, name: 'Surgical Gloves',     generic: 'Latex Sterile Gloves',         manufacturer: 'Hindustan Syr.',  category: 'surgical',       price: 320.00, mrp: 450.00, unit: 'Box/100',     stock: 180, rx: false },
  { id: 17, name: 'Clonazepam 0.5mg',   generic: 'Clonazepam',                   manufacturer: 'Torrent Pharma',  category: 'neuro',          price: 62.00,  mrp: 88.00,  unit: 'Strip/10',    stock: 340, rx: true  },
  { id: 18, name: 'Esomeprazole 40mg',   generic: 'Esomeprazole Magnesium',       manufacturer: 'Lupin',           category: 'gastro',         price: 74.00,  mrp: 105.00, unit: 'Strip/14',    stock: 580, rx: true  },
  { id: 19, name: 'Vitamin D3 60K',      generic: 'Cholecalciferol 60000 IU',     manufacturer: 'Mankind Pharma',  category: 'vitamins',       price: 44.00,  mrp: 65.00,  unit: 'Strip/4 caps',stock: 1100,rx: false },
  { id: 20, name: 'Betamethasone Cream', generic: 'Betamethasone Valerate',       manufacturer: 'Zydus Lifesciences', category: 'derma',      price: 56.00,  mrp: 82.00,  unit: 'Tube/15g',   stock: 260, rx: true  },
];

export const SERVICES = [
  { icon: '🚚', title: 'Pan-City Distribution',   desc: 'Reliable next-day delivery to all registered pharmacies within the city and surrounding districts.' },
  { icon: '🌡️', title: 'Cold Chain Logistics',    desc: 'Temperature-controlled storage and transport for insulin, vaccines, biologics, and temperature-sensitive medicines.' },
  { icon: '📦', title: 'Bulk & Emergency Supply', desc: 'Handle bulk purchase orders and urgent/emergency medicine requests with priority fulfillment.' },
  { icon: '🔒', title: 'Regulated & Compliant',   desc: 'Fully licensed under CDSCO norms. All products sourced from authorized manufacturers with verified batch records.' },
  { icon: '💳', title: 'Flexible Credit Terms',   desc: 'Competitive credit periods for verified retailers with clean payment history and good standing.' },
  { icon: '📊', title: 'Expiry Monitoring',        desc: 'Proactive expiry tracking. We notify clients of near-expiry stock and offer seamless return processing.' },
];

export const DISTRIBUTION_STATS = [
  { value: '2,400+', label: 'Registered Pharmacies',    icon: '🏪' },
  { value: '18,000+',label: 'Products in Catalog',      icon: '💊' },
  { value: '120+',   label: 'Brands & Manufacturers',   icon: '🏭' },
  { value: '15+',    label: 'Years in Business',         icon: '📅' },
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
//   ORDERS
// =============================================
export function getOrders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]'); }
  catch { return []; }
}

export function submitOrder(order) {
  const list = getOrders();
  const entry = {
    id: 'ORD-' + Date.now(),
    ...order,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(list));
  return entry;
}

export function updateOrderStatus(id, status) {
  const list = getOrders();
  const idx = list.findIndex(e => e.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(list));
  }
}
