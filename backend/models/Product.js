const supabase = require('../db/supabase');

function formatProduct(row) {
  if (!row) return null;
  const pricing = typeof row.pricing === 'string' ? JSON.parse(row.pricing) : row.pricing || null;
  const description = row.description || (pricing && pricing.description) || '';
  const deviceType = (pricing && pricing.deviceType) || '';
  const scheme = row.scheme || (pricing && pricing.scheme) || null;

  return {
    ...row,
    _id: row.id,
    price: Number(row.price),
    mrp: Number(row.mrp),
    taxIncluded: row.tax_included,
    taxPercent: Number(row.tax_percent),
    imageUrl: row.image_url,
    description,
    deviceType,
    scheme,
    pricing
  };
}

function formatProducts(rows) {
  return rows.map(formatProduct);
}

const Product = {
  async find(query = {}) {
    let q = supabase.from('products').select('*');
    // Apply query filters here if needed in the future

    const { data, error } = await q.order('name', { ascending: true });
    
    if (error) throw error;
    return formatProducts(data || []);
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return formatProduct(data || null);
  },

  async create(data) {
    let pricingData = data.pricing ? (typeof data.pricing === 'object' ? { ...data.pricing } : JSON.parse(data.pricing)) : {};
    if (data.description !== undefined && data.description !== null) {
      pricingData.description = String(data.description).trim();
    }
    if (data.deviceType !== undefined && data.deviceType !== null) {
      pricingData.deviceType = String(data.deviceType).trim();
    }
    if (data.scheme !== undefined && data.scheme !== null) {
      pricingData.scheme = data.scheme;
    }

    const insertData = {
      name: data.name,
      generic: data.generic,
      manufacturer: data.manufacturer,
      category: data.category,
      price: data.price,
      mrp: data.mrp,
      tax_included: data.taxIncluded !== undefined ? data.taxIncluded : true,
      tax_percent: data.taxPercent || 0,
      unit: data.unit || 'Strip/10',
      stock: data.stock || 0,
      rx: data.rx || false,
      image_url: data.imageUrl || null,
      pricing: Object.keys(pricingData).length > 0 ? pricingData : null
    };

    const { data: result, error } = await supabase
      .from('products')
      .insert([insertData])
      .select()
      .single();
      
    if (error) throw error;
    return formatProduct(result);
  },

  async deleteOne(query) {
    const id = query._id || query.id;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },

  async update(id, data) {
    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.generic !== undefined) updateData.generic = data.generic;
    if (data.manufacturer !== undefined) updateData.manufacturer = data.manufacturer;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.mrp !== undefined) updateData.mrp = data.mrp;
    if (data.taxIncluded !== undefined) updateData.tax_included = data.taxIncluded;
    if (data.taxPercent !== undefined) updateData.tax_percent = data.taxPercent;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.rx !== undefined) updateData.rx = data.rx;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;

    if (data.pricing !== undefined || data.description !== undefined || data.deviceType !== undefined || data.scheme !== undefined) {
      let pricingData = {};
      if (data.pricing !== undefined) {
        pricingData = typeof data.pricing === 'object' ? { ...data.pricing } : JSON.parse(data.pricing);
      } else {
        const existing = await this.findById(id);
        pricingData = existing?.pricing ? { ...existing.pricing } : {};
      }

      if (data.description !== undefined) {
        pricingData.description = String(data.description).trim();
      }
      if (data.deviceType !== undefined) {
        pricingData.deviceType = String(data.deviceType).trim();
      }
      if (data.scheme !== undefined) {
        pricingData.scheme = data.scheme;
      }
      updateData.pricing = pricingData;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date().toISOString();
    } else {
      return this.findById(id);
    }

    const { data: result, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return formatProduct(result || null);
  },
};

module.exports = Product;
