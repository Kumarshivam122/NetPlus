const fs = require('fs');
const path = require('path');
const supabase = require('../db/supabase');

const dataDir = path.join(__dirname, '../data');
const dataFile = path.join(dataDir, 'enquiries.json');

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf8');
  }
}

function readLocalEnquiries() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading local enquiries file:', err);
    return [];
  }
}

function writeLocalEnquiries(list) {
  ensureDataFile();
  try {
    fs.writeFileSync(dataFile, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local enquiries file:', err);
  }
}

const Enquiry = {
  async create(data) {
    const now = new Date().toISOString();
    const isMedicine = data.type === 'medicine_request' || !!data.medicineName;
    const prefix = isMedicine ? 'REQ-' : 'ENQ-';
    const id = data.id || (prefix + Date.now());

    const entry = {
      id,
      type: isMedicine ? 'medicine_request' : 'contact',
      name: data.name || data.userName || (isMedicine ? 'Retailer Request' : 'Customer'),
      email: data.email || '',
      phone: data.phone || '',
      subject: data.subject || (isMedicine ? `Medicine Request: ${data.medicineName}` : 'General Inquiry'),
      message: data.message || data.notes || '',
      medicineName: data.medicineName || null,
      notes: data.notes || null,
      userId: data.userId || null,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    // 1. Try Supabase if table exists
    try {
      const { data: dbData, error } = await supabase
        .from('enquiries')
        .insert([{
          enquiry_id: id,
          type: entry.type,
          name: entry.name,
          email: entry.email,
          phone: entry.phone,
          subject: entry.subject,
          message: entry.message,
          medicine_name: entry.medicineName,
          status: entry.status,
          created_at: now
        }])
        .select()
        .single();

      if (!error && dbData) {
        // Successfully saved in Supabase
        entry._dbId = dbData.id;
      }
    } catch (e) {
      // Table might not exist yet in Supabase, fallback to local storage
    }

    // 2. Persist locally to guarantee zero data loss
    const local = readLocalEnquiries();
    local.unshift(entry);
    writeLocalEnquiries(local);

    return entry;
  },

  async find(query = {}) {
    // 1. Check Supabase first
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(row => ({
          id: row.enquiry_id || row.id,
          type: row.type || (row.medicine_name ? 'medicine_request' : 'contact'),
          name: row.name,
          email: row.email,
          phone: row.phone,
          subject: row.subject,
          message: row.message,
          medicineName: row.medicine_name,
          notes: row.message,
          status: row.status || 'pending',
          createdAt: row.created_at
        }));
      }
    } catch (e) {
      // Supabase table not present, fall through
    }

    // 2. Fall back to local file
    const local = readLocalEnquiries();
    if (query.type) {
      return local.filter(e => e.type === query.type);
    }
    return local;
  },

  async findById(id) {
    const list = await this.find({});
    return list.find(e => String(e.id) === String(id)) || null;
  },

  async updateStatus(id, status) {
    const now = new Date().toISOString();

    // 1. Try Supabase
    try {
      await supabase
        .from('enquiries')
        .update({ status, updated_at: now })
        .eq('enquiry_id', id);
    } catch (e) {}

    // 2. Update local
    const local = readLocalEnquiries();
    const idx = local.findIndex(e => String(e.id) === String(id));
    if (idx !== -1) {
      local[idx].status = status;
      local[idx].updatedAt = now;
      writeLocalEnquiries(local);
      return local[idx];
    }
    return null;
  },

  async delete(id) {
    // 1. Try Supabase
    try {
      await supabase
        .from('enquiries')
        .delete()
        .eq('enquiry_id', id);
    } catch (e) {}

    // 2. Update local
    const local = readLocalEnquiries();
    const filtered = local.filter(e => String(e.id) !== String(id));
    writeLocalEnquiries(filtered);
    return true;
  }
};

module.exports = Enquiry;
