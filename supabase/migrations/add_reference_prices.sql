-- Reference price database for vintage items
-- This provides AI with real market data for better price estimation

CREATE TABLE IF NOT EXISTS reference_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL CHECK (brand IN ('levis', 'supreme', 'stussy')),
  product_type TEXT NOT NULL, -- 'jeans', 'tshirt', 'hoodie', 'jacket', etc.
  era_start INTEGER NOT NULL, -- Start year (e.g., 1990)
  era_end INTEGER NOT NULL, -- End year (e.g., 1999)
  condition TEXT NOT NULL CHECK (condition IN ('deadstock', 'excellent', 'good', 'fair', 'poor')),

  -- Price range in USD
  min_price_usd INTEGER NOT NULL,
  avg_price_usd INTEGER NOT NULL,
  max_price_usd INTEGER NOT NULL,

  -- Additional factors
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'very_rare', 'grail')),
  notes TEXT, -- Special notes (e.g., "Valencia production", "Box logo", etc.)

  -- Metadata
  sample_count INTEGER DEFAULT 0, -- Number of samples this is based on
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure logical price ordering
  CONSTRAINT price_order CHECK (min_price_usd <= avg_price_usd AND avg_price_usd <= max_price_usd),
  CONSTRAINT era_order CHECK (era_start <= era_end)
);

-- Indexes for fast lookup
CREATE INDEX idx_reference_prices_brand ON reference_prices(brand);
CREATE INDEX idx_reference_prices_era ON reference_prices(era_start, era_end);
CREATE INDEX idx_reference_prices_brand_era ON reference_prices(brand, era_start, era_end);
CREATE INDEX idx_reference_prices_product_type ON reference_prices(product_type);

-- Function to find matching reference price
CREATE OR REPLACE FUNCTION get_reference_price(
  p_brand TEXT,
  p_product_type TEXT,
  p_year INTEGER,
  p_condition TEXT DEFAULT 'good'
)
RETURNS TABLE (
  avg_price_usd INTEGER,
  min_price_usd INTEGER,
  max_price_usd INTEGER,
  rarity TEXT,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rp.avg_price_usd,
    rp.min_price_usd,
    rp.max_price_usd,
    rp.rarity,
    rp.notes
  FROM reference_prices rp
  WHERE
    rp.brand = p_brand
    AND rp.product_type = p_product_type
    AND p_year BETWEEN rp.era_start AND rp.era_end
    AND rp.condition = p_condition
  ORDER BY rp.sample_count DESC, rp.last_updated DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Insert sample reference data for Levi's 501
INSERT INTO reference_prices (brand, product_type, era_start, era_end, condition, min_price_usd, avg_price_usd, max_price_usd, rarity, notes, sample_count) VALUES
-- Levi's 501 - 1960s-70s Big E era
('levis', 'jeans', 1960, 1970, 'excellent', 250, 350, 500, 'very_rare', 'Big E red tab, extremely rare', 15),
('levis', 'jeans', 1960, 1970, 'good', 180, 250, 350, 'very_rare', 'Big E red tab', 25),
('levis', 'jeans', 1960, 1970, 'fair', 100, 150, 220, 'very_rare', 'Big E red tab, heavy wear', 10),

-- Levi's 501 - 1980s 501XX era
('levis', 'jeans', 1980, 1989, 'deadstock', 200, 280, 400, 'rare', '501XX model, deadstock', 8),
('levis', 'jeans', 1980, 1989, 'excellent', 150, 200, 280, 'rare', '501XX model', 35),
('levis', 'jeans', 1980, 1989, 'good', 100, 150, 220, 'rare', '501XX model', 50),
('levis', 'jeans', 1980, 1989, 'fair', 60, 90, 130, 'rare', '501XX model, visible wear', 20),

-- Levi's 501 - 1990s Valencia/Turkish era
('levis', 'jeans', 1990, 1999, 'excellent', 120, 160, 220, 'common', 'Valencia or Turkish production', 60),
('levis', 'jeans', 1990, 1999, 'good', 80, 120, 180, 'common', 'Valencia or Turkish production', 100),
('levis', 'jeans', 1990, 1999, 'fair', 50, 75, 110, 'common', 'Normal vintage wear', 40),

-- Levi's 501 - 2000s
('levis', 'jeans', 2000, 2009, 'excellent', 60, 85, 120, 'common', 'Early 2000s', 45),
('levis', 'jeans', 2000, 2009, 'good', 40, 60, 90, 'common', 'Early 2000s', 70),
('levis', 'jeans', 2000, 2009, 'fair', 25, 40, 60, 'common', 'Heavy use', 30),

-- Levi's 501 - 2010-present Modern
('levis', 'jeans', 2010, 2024, 'excellent', 40, 60, 85, 'common', 'Modern production', 80),
('levis', 'jeans', 2010, 2024, 'good', 30, 45, 65, 'common', 'Modern production', 90),
('levis', 'jeans', 2010, 2024, 'fair', 20, 30, 45, 'common', 'Modern, worn', 50),

-- Supreme Box Logo - 1994-2000 Early era
('supreme', 'tshirt', 1994, 2000, 'deadstock', 500, 750, 1200, 'grail', 'Early box logo, deadstock', 5),
('supreme', 'tshirt', 1994, 2000, 'excellent', 350, 500, 750, 'grail', 'Early box logo', 12),
('supreme', 'tshirt', 1994, 2000, 'good', 250, 350, 500, 'grail', 'Early box logo, used', 20),

('supreme', 'hoodie', 1994, 2000, 'excellent', 600, 900, 1500, 'grail', 'Early box logo hoodie', 8),
('supreme', 'hoodie', 1994, 2000, 'good', 400, 600, 900, 'grail', 'Early box logo hoodie', 15),

-- Supreme - 2001-2005 Mid era
('supreme', 'tshirt', 2001, 2005, 'excellent', 200, 300, 450, 'very_rare', 'Mid-era box logo', 25),
('supreme', 'tshirt', 2001, 2005, 'good', 130, 200, 300, 'very_rare', 'Mid-era box logo', 40),

('supreme', 'hoodie', 2001, 2005, 'excellent', 300, 450, 700, 'very_rare', 'Mid-era box logo hoodie', 18),
('supreme', 'hoodie', 2001, 2005, 'good', 200, 300, 450, 'very_rare', 'Mid-era box logo hoodie', 30),

-- Supreme - 2006-2010
('supreme', 'tshirt', 2006, 2010, 'excellent', 100, 150, 230, 'rare', 'Mid 2000s', 50),
('supreme', 'tshirt', 2006, 2010, 'good', 70, 100, 150, 'rare', 'Mid 2000s', 70),

('supreme', 'hoodie', 2006, 2010, 'excellent', 150, 220, 350, 'rare', 'Mid 2000s hoodie', 40),
('supreme', 'hoodie', 2006, 2010, 'good', 100, 150, 220, 'rare', 'Mid 2000s hoodie', 55),

-- Supreme - 2011-2020 Recent
('supreme', 'tshirt', 2011, 2020, 'excellent', 60, 90, 140, 'common', 'Recent season', 100),
('supreme', 'tshirt', 2011, 2020, 'good', 45, 65, 95, 'common', 'Recent season', 120),

('supreme', 'hoodie', 2011, 2020, 'excellent', 100, 150, 220, 'common', 'Recent season hoodie', 80),
('supreme', 'hoodie', 2011, 2020, 'good', 70, 100, 150, 'common', 'Recent season hoodie', 100),

-- Supreme - 2021-present Current
('supreme', 'tshirt', 2021, 2024, 'excellent', 40, 60, 90, 'common', 'Current season', 150),
('supreme', 'tshirt', 2021, 2024, 'good', 30, 45, 65, 'common', 'Current season', 100),

('supreme', 'hoodie', 2021, 2024, 'excellent', 70, 100, 150, 'common', 'Current season hoodie', 120),
('supreme', 'hoodie', 2021, 2024, 'good', 50, 70, 100, 'common', 'Current season hoodie', 90),

-- Stussy - 1990s Early old school
('stussy', 'tshirt', 1990, 1995, 'excellent', 120, 180, 280, 'very_rare', 'Old school logo, early 90s', 15),
('stussy', 'tshirt', 1990, 1995, 'good', 80, 120, 180, 'very_rare', 'Old school logo', 25),
('stussy', 'tshirt', 1990, 1995, 'fair', 50, 75, 110, 'very_rare', 'Old school, worn', 12),

-- Stussy - 1995-2000 Late 90s
('stussy', 'tshirt', 1995, 2000, 'excellent', 80, 115, 170, 'rare', 'Late 90s', 30),
('stussy', 'tshirt', 1995, 2000, 'good', 55, 80, 120, 'rare', 'Late 90s', 50),
('stussy', 'tshirt', 1995, 2000, 'fair', 35, 50, 75, 'rare', 'Late 90s, worn', 20),

-- Stussy - 2000s
('stussy', 'tshirt', 2000, 2009, 'excellent', 50, 75, 110, 'common', '2000s production', 60),
('stussy', 'tshirt', 2000, 2009, 'good', 35, 50, 75, 'common', '2000s production', 80),
('stussy', 'tshirt', 2000, 2009, 'fair', 25, 35, 50, 'common', '2000s, worn', 40),

-- Stussy - 2010-present Modern
('stussy', 'tshirt', 2010, 2024, 'excellent', 30, 45, 65, 'common', 'Modern production', 100),
('stussy', 'tshirt', 2010, 2024, 'good', 20, 30, 45, 'common', 'Modern production', 120),
('stussy', 'tshirt', 2010, 2024, 'fair', 15, 20, 30, 'common', 'Modern, worn', 60);

-- Add comment
COMMENT ON TABLE reference_prices IS 'Reference price database for vintage clothing - provides AI with real market data for price estimation';
COMMENT ON FUNCTION get_reference_price IS 'Lookup function to find matching reference price based on brand, product type, year, and condition';
