-- Fix orders_status enum in MySQL
-- Run this SQL script directly in your MySQL database

-- Step 1: Convert status column to VARCHAR temporarily
ALTER TABLE orders 
MODIFY COLUMN status VARCHAR(50);

-- Step 2: Update any old status values
UPDATE orders 
SET status = 'assembly' 
WHERE status = 'cutting';

UPDATE orders 
SET status = 'qa' 
WHERE status = 'qc';

-- Step 3: Convert back to ENUM with correct values
ALTER TABLE orders 
MODIFY COLUMN status ENUM(
  'payment_pending',
  'pending',
  'designing',
  'ripping',
  'heatpress',
  'assembly',
  'qa',
  'packing',
  'done',
  'shipping',
  'delivered',
  'cancelled'
) DEFAULT 'payment_pending';

