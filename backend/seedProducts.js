const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const PRODUCTS = [
  { name: 'Augmentin 625mg',     generic: 'Amoxicillin + Clavulanic Acid', manufacturer: 'Pfizer',          category: 'antibiotics',    price: 285.50, mrp: 350.00, unit: 'Strip/10',    stock: 450, rx: true  },
  { name: 'Azithral 500mg',      generic: 'Azithromycin',                  manufacturer: 'Alembic Pharma',  category: 'antibiotics',    price: 98.20,  mrp: 125.00, unit: 'Strip/5',     stock: 890, rx: true  },
  { name: 'Metformin 500mg SR',  generic: 'Metformin HCl',                 manufacturer: 'Sun Pharma',      category: 'diabetes',       price: 45.80,  mrp: 62.00,  unit: 'Strip/15',    stock: 1200,rx: true  },
  { name: 'Amlodipine 5mg',      generic: 'Amlodipine Besylate',           manufacturer: 'Cipla',           category: 'cardiovascular', price: 38.50,  mrp: 55.00,  unit: 'Strip/15',    stock: 680, rx: true  },
  { name: 'Dolo 650mg',          generic: 'Paracetamol',                   manufacturer: 'Mankind Pharma',  category: 'pain',           price: 28.90,  mrp: 38.00,  unit: 'Strip/15',    stock: 2500,rx: false },
  { name: 'Pantoprazole 40mg',   generic: 'Pantoprazole Sodium',           manufacturer: 'Alembic Pharma',  category: 'gastro',         price: 52.40,  mrp: 72.00,  unit: 'Strip/15',    stock: 980, rx: true  },
  { name: 'Becosules Capsules',  generic: 'Multivitamin + Minerals',       manufacturer: 'Pfizer',          category: 'vitamins',       price: 112.00, mrp: 148.00, unit: 'Bottle/20',   stock: 760, rx: false },
  { name: 'Telmisartan 40mg',    generic: 'Telmisartan',                   manufacturer: "Dr. Reddy's",     category: 'cardiovascular', price: 88.30,  mrp: 118.00, unit: 'Strip/14',    stock: 540, rx: true  },
  { name: 'Cetirizine 10mg',     generic: 'Cetirizine HCl',               manufacturer: 'Cipla',           category: 'respiratory',    price: 22.50,  mrp: 32.00,  unit: 'Strip/10',    stock: 1800,rx: false },
  { name: 'Atorvastatin 10mg',   generic: 'Atorvastatin Calcium',          manufacturer: 'Lupin',           category: 'cardiovascular', price: 66.70,  mrp: 92.00,  unit: 'Strip/15',    stock: 720, rx: true  },
  { name: 'Amitriptyline 25mg',  generic: 'Amitriptyline HCl',            manufacturer: 'Sun Pharma',      category: 'neuro',          price: 44.20,  mrp: 62.00,  unit: 'Strip/10',    stock: 390, rx: true  },
  { name: 'Calamine Lotion',     generic: 'Calamine + Zinc Oxide',         manufacturer: "Dr. Reddy's",     category: 'derma',          price: 68.00,  mrp: 95.00,  unit: 'Bottle/100ml',stock: 320, rx: false },
  { name: 'Salbutamol Inhaler',  generic: 'Salbutamol Sulphate',           manufacturer: 'Cipla',           category: 'respiratory',    price: 145.00, mrp: 195.00, unit: '200 doses',   stock: 280, rx: true  },
  { name: 'Ondansetron 4mg',     generic: 'Ondansetron HCl',              manufacturer: 'Abbott India',    category: 'gastro',         price: 36.80,  mrp: 52.00,  unit: 'Strip/10',    stock: 640, rx: true  },
  { name: 'Glimepiride 2mg',     generic: 'Glimepiride',                  manufacturer: 'Abbott India',    category: 'diabetes',       price: 78.50,  mrp: 108.00, unit: 'Strip/15',    stock: 490, rx: true  },
  { name: 'Surgical Gloves',     generic: 'Latex Sterile Gloves',         manufacturer: 'Hindustan Syr.',  category: 'surgical',       price: 320.00, mrp: 450.00, unit: 'Box/100',     stock: 180, rx: false },
  { name: 'Clonazepam 0.5mg',   generic: 'Clonazepam',                   manufacturer: 'Torrent Pharma',  category: 'neuro',          price: 62.00,  mrp: 88.00,  unit: 'Strip/10',    stock: 340, rx: true  },
  { name: 'Esomeprazole 40mg',   generic: 'Esomeprazole Magnesium',       manufacturer: 'Lupin',           category: 'gastro',         price: 74.00,  mrp: 105.00, unit: 'Strip/14',    stock: 580, rx: true  },
  { name: 'Vitamin D3 60K',      generic: 'Cholecalciferol 60000 IU',     manufacturer: 'Mankind Pharma',  category: 'vitamins',       price: 44.00,  mrp: 65.00,  unit: 'Strip/4 caps',stock: 1100,rx: false },
  { name: 'Betamethasone Cream', generic: 'Betamethasone Valerate',       manufacturer: 'Zydus Lifesciences', category: 'derma',      price: 56.00,  mrp: 82.00,  unit: 'Tube/15g',   stock: 260, rx: true  },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Connecting to PostgreSQL...');
    
    // Clear existing products
    await pool.query('TRUNCATE products RESTART IDENTITY CASCADE');
    console.log('Cleared existing products');

    // Insert all products
    for (const p of PRODUCTS) {
      await pool.query(
        `INSERT INTO products (name, generic, manufacturer, category, price, mrp, unit, stock, rx)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [p.name, p.generic, p.manufacturer, p.category, p.price, p.mrp, p.unit, p.stock, p.rx]
      );
    }

    console.log('✅ 20 Products seeded successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    await pool.end();
    process.exit(1);
  }
}

seed();
