-- Manual migration to add missing columns to UserCart table
-- Run this if prisma db push fails due to foreign key constraint issues

USE rfm_db;

-- Check if columns already exist before adding
SET @dbname = DATABASE();
SET @tablename = 'UserCart';

-- Add size column if not exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'size');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE UserCart ADD COLUMN size VARCHAR(20) NULL AFTER quantity;', 
  'SELECT "Column size already exists" AS msg;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add color column if not exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'color');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE UserCart ADD COLUMN color VARCHAR(50) NULL AFTER size;', 
  'SELECT "Column color already exists" AS msg;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add customizationData column if not exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'customizationData');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE UserCart ADD COLUMN customizationData JSON NULL AFTER color;', 
  'SELECT "Column customizationData already exists" AS msg;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add customDesignId column if not exists
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'customDesignId');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE UserCart ADD COLUMN customDesignId INT NULL AFTER customizationData;', 
  'SELECT "Column customDesignId already exists" AS msg;');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the changes
DESCRIBE UserCart;

SELECT 'Migration completed successfully!' AS status;
