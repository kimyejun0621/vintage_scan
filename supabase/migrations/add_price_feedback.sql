-- User feedback system for price accuracy
-- Collects actual sale prices to improve AI estimates

CREATE TABLE IF NOT EXISTS price_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Product info
  brand TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT,
  era TEXT,
  condition TEXT,

  -- Price data
  ai_estimated_krw INTEGER NOT NULL,
  actual_sold_krw INTEGER, -- User-reported actual sale price
  marketplace TEXT, -- Where it was sold (ebay, grailed, local, etc.)

  -- Feedback metadata
  user_id UUID, -- Optional: link to user if authenticated
  feedback_type TEXT CHECK (feedback_type IN ('too_high', 'accurate', 'too_low', 'sold')),
  notes TEXT, -- User comments

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Analysis metadata (for learning)
  analysis_data JSONB -- Store full analysis result for ML training
);

-- Indexes
CREATE INDEX idx_price_feedback_brand ON price_feedback(brand);
CREATE INDEX idx_price_feedback_type ON price_feedback(feedback_type);
CREATE INDEX idx_price_feedback_created ON price_feedback(created_at);

-- View for aggregating feedback
CREATE OR REPLACE VIEW price_feedback_summary AS
SELECT
  brand,
  product_type,
  COUNT(*) as feedback_count,
  AVG(CASE
    WHEN actual_sold_krw IS NOT NULL
    THEN (actual_sold_krw - ai_estimated_krw)::FLOAT / ai_estimated_krw * 100
    ELSE NULL
  END) as avg_error_percent,
  COUNT(CASE WHEN feedback_type = 'accurate' THEN 1 END) as accurate_count,
  COUNT(CASE WHEN feedback_type = 'too_high' THEN 1 END) as too_high_count,
  COUNT(CASE WHEN feedback_type = 'too_low' THEN 1 END) as too_low_count,
  COUNT(CASE WHEN actual_sold_krw IS NOT NULL THEN 1 END) as sold_count
FROM price_feedback
GROUP BY brand, product_type;

-- Function to submit feedback
CREATE OR REPLACE FUNCTION submit_price_feedback(
  p_brand TEXT,
  p_product_name TEXT,
  p_ai_estimated_krw INTEGER,
  p_actual_sold_krw INTEGER DEFAULT NULL,
  p_feedback_type TEXT DEFAULT NULL,
  p_marketplace TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_analysis_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO price_feedback (
    brand,
    product_name,
    ai_estimated_krw,
    actual_sold_krw,
    feedback_type,
    marketplace,
    notes,
    analysis_data
  ) VALUES (
    p_brand,
    p_product_name,
    p_ai_estimated_krw,
    p_actual_sold_krw,
    p_feedback_type,
    p_marketplace,
    p_notes,
    p_analysis_data
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get accuracy stats
CREATE OR REPLACE FUNCTION get_price_accuracy_stats(p_brand TEXT DEFAULT NULL)
RETURNS TABLE (
  brand TEXT,
  total_feedback INTEGER,
  avg_error_percent NUMERIC,
  accuracy_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pf.brand,
    COUNT(*)::INTEGER as total_feedback,
    ROUND(AVG(CASE
      WHEN pf.actual_sold_krw IS NOT NULL
      THEN ABS((pf.actual_sold_krw - pf.ai_estimated_krw)::NUMERIC / pf.ai_estimated_krw * 100)
      ELSE NULL
    END), 2) as avg_error_percent,
    ROUND(
      (COUNT(CASE WHEN pf.feedback_type = 'accurate' THEN 1 END)::NUMERIC /
       NULLIF(COUNT(*), 0) * 100),
      2
    ) as accuracy_rate
  FROM price_feedback pf
  WHERE p_brand IS NULL OR pf.brand = p_brand
  GROUP BY pf.brand;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE price_feedback IS 'User feedback on price estimates - used to improve AI accuracy over time';
COMMENT ON FUNCTION submit_price_feedback IS 'Submit user feedback on price estimate accuracy';
COMMENT ON FUNCTION get_price_accuracy_stats IS 'Get accuracy statistics for price estimates';
