const { Pool } = require('pg');
require('dotenv').config();

const IMAGES = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop', // Pills
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&h=300&fit=crop', // Capsules
  'https://images.unsplash.com/photo-1550572017-edb9b47a1f59?w=300&h=300&fit=crop', // Bottle
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=300&fit=crop', // Pharmacy box
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop'  // Cream/tube
];

const CATEGORIES = ['antibiotics', 'cardiovascular', 'diabetes', 'gastro', 'pain', 'vitamins', 'respiratory', 'neuro', 'derma', 'surgical'];
const MANUFACTURERS = ['Cipla', 'Sun Pharma', 'Pfizer', 'Lupin', 'Dr. Reddy\'s', 'Mankind Pharma', 'Abbott India', 'Torrent Pharma', 'Alkem', 'Zydus'];

function generateMockProducts(count) {
  const products = [];
  for (let i = 1; i <= count; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const manufacturer = MANUFACTURERS[Math.floor(Math.random() * MANUFACTURERS.length)];
    const imageUrl = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    const rx = Math.random() > 0.3; // 70% Rx
    
    let unit = 'Strip/10';
    let price = Math.floor(Math.random() * 200) + 20;
    let mrp = price + Math.floor(Math.random() * 50) + 10;
    
    // Assign reasonable unit and sizing
    if (category === 'derma') unit = 'Tube/15g';
    if (category === 'surgical') unit = 'Box/50';
    if (category === 'respiratory') unit = 'Inhaler/200md';
    if (category === 'vitamins') unit = 'Bottle/30';
    
    const pricingData = {};
    const unitKey = unit.startsWith('Strip') ? 'Strips' : unit.startsWith('Bottle') ? 'Bottles' : unit.startsWith('Box') ? 'Boxes' : 'Pieces';
    const sizeStr = unit.split('/')[1] || '1';
    
    // Fill all configs as inactive initially
    ['Strips', 'Bottles', 'Boxes', 'Pieces'].forEach(k => {
      pricingData[k] = { active: false, size: '1', price: '', mrp: '' };
    });
    
    // Make the determined unit active
    pricingData[unitKey] = {
      active: true,
      size: sizeStr,
      price: price.toString(),
      mrp: mrp.toString()
    };
    
    products.push({
      name: `MedProduct ${Math.floor(Math.random() * 1000) + i} ${Math.floor(Math.random() * 500) + 10}mg`,
      generic: `Generic Compound ${String.fromCharCode(65 + (i % 26))} ${i}`,
      manufacturer,
      category,
      price,
      mrp,
      taxIncluded: true,
      taxPercent: 5,
      unit,
      stock: Math.floor(Math.random() * 1000) + 50,
      rx,
      imageUrl,
      pricing: pricingData
    });
  }
  return products;
}

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Generating 50 products...');
    const products = generateMockProducts(50);
    
    for (const p of products) {
      await pool.query(
        `INSERT INTO products (name, generic, manufacturer, category, price, mrp, tax_included, tax_percent, unit, stock, rx, image_url, pricing)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [p.name, p.generic, p.manufacturer, p.category, p.price, p.mrp, p.taxIncluded, p.taxPercent, p.unit, p.stock, p.rx, p.imageUrl, JSON.stringify(p.pricing)]
      );
    }
    
    console.log('✅ 50 Products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding products:', error);
    process.exit(1);
  }
}

run();
