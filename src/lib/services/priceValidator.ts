/**
 * Price Validator - Prevents extreme price estimates
 * Adds sanity checks and confidence adjustments
 */

export interface ValidationResult {
  originalPrice: number;
  adjustedPrice: number;
  wasAdjusted: boolean;
  reason?: string;
  confidence: number;
}

/**
 * Brand-specific price limits (USD)
 */
const PRICE_LIMITS = {
  levis: {
    jeans: { min: 20, max: 600, typical_max: 300 },
    jacket: { min: 40, max: 800, typical_max: 400 },
    shirt: { min: 15, max: 200, typical_max: 100 }
  },
  supreme: {
    tshirt: { min: 25, max: 2000, typical_max: 600 },
    hoodie: { min: 50, max: 3000, typical_max: 1000 },
    jacket: { min: 100, max: 5000, typical_max: 2000 }
  },
  stussy: {
    tshirt: { min: 15, max: 400, typical_max: 200 },
    hoodie: { min: 30, max: 500, typical_max: 250 },
    jacket: { min: 40, max: 600, typical_max: 300 }
  }
};

/**
 * Detect product type from name
 */
function detectProductType(productName: string): string {
  const lower = productName.toLowerCase();
  if (lower.includes('jean') || lower.includes('501') || lower.includes('denim')) return 'jeans';
  if (lower.includes('hoodie')) return 'hoodie';
  if (lower.includes('jacket') || lower.includes('trucker')) return 'jacket';
  if (lower.includes('tee') || lower.includes('t-shirt')) return 'tshirt';
  if (lower.includes('shirt')) return 'shirt';
  return 'tshirt'; // default
}

/**
 * Validate and adjust price if needed
 */
export function validatePrice(
  brand: string,
  productName: string,
  priceUSD: number,
  confidence: number,
  era?: string
): ValidationResult {
  const productType = detectProductType(productName);
  const limits = (PRICE_LIMITS as any)[brand.toLowerCase()]?.[productType];

  if (!limits) {
    // Unknown brand/product, use general limits
    return {
      originalPrice: priceUSD,
      adjustedPrice: priceUSD,
      wasAdjusted: false,
      confidence
    };
  }

  let adjustedPrice = priceUSD;
  let wasAdjusted = false;
  let adjustedConfidence = confidence;
  let reason = '';

  // Check if price is too low
  if (priceUSD < limits.min) {
    adjustedPrice = limits.min;
    wasAdjusted = true;
    adjustedConfidence = Math.max(30, confidence - 20);
    reason = `Price too low ($${priceUSD} < $${limits.min}), adjusted to minimum`;
  }

  // Check if price is too high
  if (priceUSD > limits.max) {
    adjustedPrice = limits.typical_max; // Use typical max, not absolute max
    wasAdjusted = true;
    adjustedConfidence = Math.max(40, confidence - 15);
    reason = `Price too high ($${priceUSD} > $${limits.max}), adjusted to typical range`;
  }

  // Check for unrealistic high prices (even within limits)
  if (priceUSD > limits.typical_max) {
    // Only allow if it's vintage/rare
    const isVintage = era && (
      era.includes('1960') || era.includes('1970') ||
      era.includes('1980') || era.includes('Big E') ||
      era.includes('1994') || era.includes('1995')
    );

    if (!isVintage) {
      adjustedPrice = limits.typical_max;
      wasAdjusted = true;
      adjustedConfidence = Math.max(50, confidence - 10);
      reason = `Price high for non-vintage ($${priceUSD}), adjusted to typical range`;
    }
  }

  // Check for suspiciously round numbers (AI might be guessing)
  if (priceUSD % 50 === 0 && priceUSD > 100) {
    adjustedConfidence = Math.max(50, confidence - 5);
    reason = reason || 'Suspiciously round number, confidence reduced';
  }

  return {
    originalPrice: priceUSD,
    adjustedPrice,
    wasAdjusted,
    reason,
    confidence: Math.round(adjustedConfidence)
  };
}

/**
 * Validate price consistency
 * Check if KRW and USD prices are consistent
 */
export function validatePriceConsistency(
  priceUSD: number,
  priceKRW: number,
  expectedRate: number = 1330
): { isConsistent: boolean; suggestedKRW?: number } {
  const expectedKRW = Math.round(priceUSD * expectedRate);
  const deviation = Math.abs(priceKRW - expectedKRW) / expectedKRW;

  // Allow 10% deviation
  if (deviation > 0.1) {
    return {
      isConsistent: false,
      suggestedKRW: expectedKRW
    };
  }

  return { isConsistent: true };
}

/**
 * Adjust confidence based on analysis quality
 */
export function adjustConfidenceByQuality(
  reason: string,
  confidence: number
): number {
  let adjusted = confidence;

  // Boost confidence if reason is detailed
  const hasSpecificDetails = (
    reason.includes('케어라벨') ||
    reason.includes('Valencia') ||
    reason.includes('Turkish') ||
    reason.includes('Big E') ||
    reason.includes('박스로고') ||
    reason.includes('택')
  );

  if (hasSpecificDetails) {
    adjusted += 5;
  }

  // Reduce confidence if reason is vague
  const isVague = (
    reason.includes('보입니다') ||
    reason.includes('추정됩니다') ||
    reason.includes('것 같습니다')
  );

  const vaguePhrases = (reason.match(/보입니다|추정됩니다|것 같습니다/g) || []).length;
  if (vaguePhrases > 2) {
    adjusted -= 10;
  }

  // Reduce confidence if no price justification
  const hasPriceJustification = (
    reason.includes('가격') ||
    reason.includes('기본가') ||
    reason.includes('컨디션') ||
    reason.includes('$')
  );

  if (!hasPriceJustification) {
    adjusted -= 5;
  }

  return Math.min(95, Math.max(30, Math.round(adjusted)));
}
