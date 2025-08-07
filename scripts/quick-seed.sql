-- Quick seed script for production database
-- Run this in your database console

-- Create test user
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'user_test_001',
  'test@example.com',
  'Test User',
  '$2a$12$LQv3c1yqBwEHxv68JaMCOeHrHDJOWOaHSm5J6VfHLkqU5/Oo.lHiq', -- test123
  'USER',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create admin user  
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'user_admin_001', 
  'admin@pinegenie.com',
  'Admin User',
  '$2a$12$LQv3c1yqBwEHxv68JaMCOeHrHDJOWOaHSm5J6VfHLkqU5/Oo.lHiq', -- admin123
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create demo user
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt") 
VALUES (
  'user_demo_001',
  'demo@pinegenie.com',
  'Demo User', 
  '$2a$12$LQv3c1yqBwEHxv68JaMCOeHrHDJOWOaHSm5J6VfHLkqU5/Oo.lHiq', -- demo123
  'USER',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;