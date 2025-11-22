-- Migration: Add gas to energy conversion support
-- Date: 2024-01-01

-- Add new columns to house_config table for gas conversion
ALTER TABLE house_config 
ADD COLUMN IF NOT EXISTS gas_conversion_factor DECIMAL(5,2) DEFAULT 10.5,
ADD COLUMN IF NOT EXISTS meter_type VARCHAR(20) DEFAULT 'gas',
ADD COLUMN IF NOT EXISTS reading_unit VARCHAR(10) DEFAULT 'm³';

-- Update the default configuration to reflect gas meter setup
UPDATE house_config 
SET 
  gas_conversion_factor = 10.5,
  meter_type = 'gas',
  reading_unit = 'm³',
  price_per_kwh = 0.1117,  -- Spanish gas pricing converted to kWh equivalent
  currency = 'EUR',
  expected_monthly_consumption = 364,  -- kWh/month equivalent
  country_code = 'ES'
WHERE id IN (SELECT id FROM house_config LIMIT 1);

-- Add comments for clarity
COMMENT ON COLUMN house_config.gas_conversion_factor IS 'Conversion factor from m³ gas to kWh energy (default: 10.5 for natural gas)';
COMMENT ON COLUMN house_config.meter_type IS 'Type of meter: gas or electricity';
COMMENT ON COLUMN house_config.reading_unit IS 'Unit displayed on the physical meter (m³, kWh, etc.)';

-- Note: 
-- - reading_value in house_readings remains in meter units (m³ for gas)
-- - consumption_since_last is stored in energy units (kWh) for cost calculations
-- - The conversion happens in the application layer
