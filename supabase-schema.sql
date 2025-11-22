-- Multi-user schema with authentication
-- Each user has their own readings and configuration

-- House readings table (user-specific)
CREATE TABLE house_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reading_value DECIMAL(10,2) NOT NULL,
  photo_url TEXT,
  reading_date TIMESTAMP WITH TIME ZONE NOT NULL,
  confidence_score DECIMAL(3,2),
  consumption_since_last DECIMAL(10,2) DEFAULT 0,
  cost_since_last DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- House configuration (user-specific)
CREATE TABLE house_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  price_per_kwh DECIMAL(8,4) NOT NULL DEFAULT 0.1117,
  base_monthly_fee DECIMAL(8,2) NOT NULL DEFAULT 14.76,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  expected_monthly_consumption DECIMAL(10,2) DEFAULT 364,
  expected_annual_consumption DECIMAL(10,2) DEFAULT 4370,
  country_code VARCHAR(2) DEFAULT 'ES',
  gas_conversion_factor DECIMAL(5,2) DEFAULT 10.5,
  meter_type VARCHAR(20) DEFAULT 'gas',
  reading_unit VARCHAR(10) DEFAULT 'm³',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE house_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
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

-- Create indexes for better performance
CREATE INDEX idx_house_readings_user_id ON house_readings(user_id);
CREATE INDEX idx_house_readings_date ON house_readings(reading_date DESC);
CREATE INDEX idx_house_readings_created_at ON house_readings(created_at DESC);
CREATE INDEX idx_house_config_user_id ON house_config(user_id);
