-- Add name and bio columns to users table
ALTER TABLE users ADD COLUMN name VARCHAR(100);
ALTER TABLE users ADD COLUMN bio TEXT;
