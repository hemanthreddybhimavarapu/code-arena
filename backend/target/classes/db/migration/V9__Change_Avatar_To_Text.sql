-- Change avatar column in users table from VARCHAR(255) to TEXT to support Base64 images
ALTER TABLE users ALTER COLUMN avatar TYPE TEXT;
