-- Migration script to update email constraint
-- This allows multiple NULL emails while enforcing uniqueness for non-NULL values

-- Drop the existing UNIQUE constraint on email column
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Create a unique partial index for non-NULL emails only
-- This allows multiple NULL emails while enforcing uniqueness for actual email addresses
CREATE UNIQUE INDEX IF NOT EXISTS unique_email_not_null ON users (email) WHERE email IS NOT NULL;
