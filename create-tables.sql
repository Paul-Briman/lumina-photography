-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS galleries CASCADE;
DROP TABLE IF EXISTS photographers CASCADE;

-- Create photographers table
CREATE TABLE photographers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  reset_token TEXT,
  reset_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create galleries table
CREATE TABLE galleries (
  id SERIAL PRIMARY KEY,
  photographer_id INTEGER NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  download_pin TEXT,
  cover_photo_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create photos table
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  gallery_id INTEGER NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create invoices table
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  gallery_id INTEGER NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  pdf_path TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert demo user (password: password123)
INSERT INTO photographers (email, business_name, password_hash) VALUES 
('demo@example.com', 'Demo Photography', '');

-- Create demo gallery
INSERT INTO galleries (photographer_id, title, client_name, share_token, download_pin) VALUES 
(1, 'Summer Wedding 2024', 'Alice & Bob', 'demo-token-123', '1234');

-- Insert sample photos
INSERT INTO photos (gallery_id, filename, storage_path, size) VALUES 
(1, 'wedding-1.jpg', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000', 1024000),
(1, 'wedding-2.jpg', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1000', 1024000);

-- Insert sample invoice
INSERT INTO invoices (gallery_id, invoice_number, amount, status) VALUES 
(1, 'INV-001', 150000, 'pending');
