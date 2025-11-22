-- Migration script to convert from single-user to multi-user schema
-- Run this if you have existing data and want to migrate it
-- Otherwise, use supabase-schema.sql for fresh installations

-- Step 1: Add user_id columns (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'house_readings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE house_readings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'house_config' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE house_config ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 2: Add missing columns to house_config
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'house_config' AND column_name = 'base_monthly_fee'
  ) THEN
    ALTER TABLE house_config ADD COLUMN base_monthly_fee DECIMAL(8,2) DEFAULT 14.76;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'house_config' AND column_name = 'expected_annual_consumption'
  ) THEN
    ALTER TABLE house_config ADD COLUMN expected_annual_consumption DECIMAL(10,2) DEFAULT 4370;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'house_config' AND column_name = 'gas_conversion_factor'
  ) THEN
    ALTER TABLE house_config ADD COLUMN gas_conversion_factor DECIMAL(5,2) DEFAULT 10.5;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'house_config' AND column_name = 'meter_type'
  ) THEN
    ALTER TABLE house_config ADD COLUMN meter_type VARCHAR(20) DEFAULT 'gas';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'house_config' AND column_name = 'reading_unit'
  ) THEN
    ALTER TABLE house_config ADD COLUMN reading_unit VARCHAR(10) DEFAULT 'm³';
  END IF;
END $$;

-- Step 3: Drop old policies
DROP POLICY IF EXISTS "Allow all operations on house_readings" ON house_readings;
DROP POLICY IF EXISTS "Allow all operations on house_config" ON house_config;

-- Step 4: Create new RLS policies
CREATE POLICY "Users can view own readings" ON house_readings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readings" ON house_readings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readings" ON house_readings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own readings" ON house_readings
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own config" ON house_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" ON house_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON house_config
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS idx_house_readings_user_id ON house_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_house_config_user_id ON house_config(user_id);

-- Step 6: Make user_id NOT NULL (after assigning existing data to users)
-- NOTE: You'll need to manually assign user_id to existing records before running this
-- ALTER TABLE house_readings ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE house_config ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE house_config ADD CONSTRAINT house_config_user_id_unique UNIQUE (user_id);

