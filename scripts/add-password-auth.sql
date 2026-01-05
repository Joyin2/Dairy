-- Add password_hash column to app_users table for authentication
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);

-- Sample: Update existing users to have a default hashed password (development only)
-- Password: "admin123" (bcrypt hash)
-- In production, users should set their own passwords
UPDATE app_users 
SET password_hash = '$2a$10$rZ5LvVvQKZqJqxKX6yQxGeGQPqVqYQFJXvLvQKZqJqxKX6yQxGeGQ'
WHERE password_hash IS NULL AND role = 'admin';
