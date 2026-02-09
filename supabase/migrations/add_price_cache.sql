-- Create price_cache table for storing market price data
CREATE TABLE IF NOT EXISTS price_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  brand TEXT NOT NULL,
  price_data JSONB NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('ebay', 'grailed', 'ai', 'exchange_rate')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  listing_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(search_query, source)
);

-- Create indexes for efficient querying
CREATE INDEX idx_price_cache_search ON price_cache(search_query, brand);
CREATE INDEX idx_price_cache_expires ON price_cache(expires_at);
CREATE INDEX idx_price_cache_source ON price_cache(source);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_price_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM price_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE price_cache IS 'Caches market price data from various sources (eBay, Grailed, etc.) to reduce API calls and improve response time';
COMMENT ON COLUMN price_cache.search_query IS 'Normalized search query used to fetch this price data';
COMMENT ON COLUMN price_cache.price_data IS 'JSON object containing price information from the source';
COMMENT ON COLUMN price_cache.source IS 'Price data source: ebay, grailed, ai, or exchange_rate';
COMMENT ON COLUMN price_cache.confidence IS 'Confidence score (0-100) for this price data';
COMMENT ON COLUMN price_cache.listing_count IS 'Number of listings used to calculate this price';
