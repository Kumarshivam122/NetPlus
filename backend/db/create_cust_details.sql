-- Create the cust_details table
CREATE TABLE IF NOT EXISTS cust_details (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  store_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  gstin VARCHAR(50),
  licence_no VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert existing retailers into cust_details (avoiding duplicates)
INSERT INTO cust_details (
  user_id, store_name, owner_name, phone, email, city, state, pincode, gstin, licence_no, created_at
)
SELECT 
  id, store_name, owner_name, phone, email, city, state, pincode, gstin, licence_no, created_at
FROM users
WHERE role = 'retailer' 
AND id NOT IN (SELECT user_id FROM cust_details);
