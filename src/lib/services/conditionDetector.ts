/**
 * Condition Detector - Improves condition assessment from AI reason
 * Extracts condition-related keywords and adjusts price accordingly
 */

export type ConditionGrade = 'deadstock' | 'excellent' | 'good' | 'fair' | 'poor';

export interface ConditionAnalysis {
  grade: ConditionGrade;
  confidence: number;
  factors: string[];
  priceAdjustment: number; // Multiplier (0.4 to 1.5)
}

/**
 * Keywords for each condition level
 */
const CONDITION_KEYWORDS = {
  deadstock: [
    'deadstock', 'nwt', 'new with tags', '새제품', '미사용',
    'unworn', 'mint', 'brand new', '태그 부착'
  ],
  excellent: [
    'excellent', 'near mint', '최상', '극상', 'pristine',
    'like new', '거의 새것', '사용감 없', '매우 깨끗'
  ],
  good: [
    'good', 'normal', '일반', '양호', 'gently used',
    '약간의 사용감', '전반적으로 깨끗', 'light wear'
  ],
  fair: [
    'fair', 'used', '사용감', '눈에 띄', 'visible wear',
    '색 바램', 'fading', '약간의 손상', 'minor damage'
  ],
  poor: [
    'poor', 'damaged', '손상', '얼룩', 'stains',
    'heavy wear', '많이', '찢어', 'torn', 'holes'
  ]
};

/**
 * Negative indicators (lower condition)
 */
const DAMAGE_INDICATORS = [
  '손상', '얼룩', 'stain', 'hole', '구멍', 'tear', '찢어',
  'rip', 'crack', 'broken', '깨진', '벗겨', 'peeling',
  'fade', '바램', 'discolor', '변색', 'worn out'
];

/**
 * Positive indicators (higher condition)
 */
const PRISTINE_INDICATORS = [
  '깨끗', 'clean', '상태 좋', 'well-kept', '보관',
  'mint', '최상', 'pristine', '새것', 'fresh'
];

/**
 * Analyze condition from reason text
 */
export function analyzeCondition(reason: string): ConditionAnalysis {
  const lowerReason = reason.toLowerCase();
  let bestMatch: ConditionGrade = 'good'; // default
  let matchScore = 0;
  const factors: string[] = [];

  // Check each condition level
  for (const [grade, keywords] of Object.entries(CONDITION_KEYWORDS)) {
    const matches = keywords.filter(kw => lowerReason.includes(kw.toLowerCase()));
    if (matches.length > matchScore) {
      matchScore = matches.length;
      bestMatch = grade as ConditionGrade;
      factors.push(...matches);
    }
  }

  // Check damage indicators
  const damageCount = DAMAGE_INDICATORS.filter(kw =>
    lowerReason.includes(kw.toLowerCase())
  ).length;

  // Check pristine indicators
  const pristineCount = PRISTINE_INDICATORS.filter(kw =>
    lowerReason.includes(kw.toLowerCase())
  ).length;

  // Adjust grade based on indicators
  if (damageCount > 2) {
    // Multiple damage indicators -> lower grade
    if (bestMatch === 'excellent') bestMatch = 'good';
    if (bestMatch === 'good') bestMatch = 'fair';
    factors.push(`${damageCount} damage indicators`);
  }

  if (pristineCount > 2 && damageCount === 0) {
    // Multiple pristine indicators, no damage -> higher grade
    if (bestMatch === 'good') bestMatch = 'excellent';
    factors.push(`${pristineCount} pristine indicators`);
  }

  // Calculate confidence based on how explicit the condition mention is
  let confidence = 50; // base
  if (matchScore > 0) confidence += matchScore * 15;
  if (damageCount > 0 || pristineCount > 0) confidence += 10;
  confidence = Math.min(90, confidence);

  // Get price adjustment multiplier
  const priceAdjustment = getPriceAdjustment(bestMatch);

  return {
    grade: bestMatch,
    confidence,
    factors,
    priceAdjustment
  };
}

/**
 * Get price adjustment multiplier for condition
 */
function getPriceAdjustment(grade: ConditionGrade): number {
  const adjustments = {
    deadstock: 1.5,  // +50%
    excellent: 1.2,  // +20%
    good: 1.0,       // baseline
    fair: 0.7,       // -30%
    poor: 0.4        // -60%
  };

  return adjustments[grade];
}

/**
 * Apply condition-based price adjustment
 */
export function applyConditionAdjustment(
  basePrice: number,
  condition: ConditionAnalysis
): number {
  return Math.round(basePrice * condition.priceAdjustment);
}

/**
 * Get human-readable condition description
 */
export function getConditionDescription(grade: ConditionGrade): {
  ko: string;
  en: string;
  emoji: string;
} {
  const descriptions = {
    deadstock: {
      ko: '미사용 새제품',
      en: 'Deadstock / New with Tags',
      emoji: '✨'
    },
    excellent: {
      ko: '최상 (사용감 거의 없음)',
      en: 'Excellent / Near Mint',
      emoji: '⭐'
    },
    good: {
      ko: '양호 (일반 중고)',
      en: 'Good / Gently Used',
      emoji: '👍'
    },
    fair: {
      ko: '보통 (눈에 띄는 사용감)',
      en: 'Fair / Visible Wear',
      emoji: '👌'
    },
    poor: {
      ko: '불량 (손상/얼룩)',
      en: 'Poor / Damaged',
      emoji: '⚠️'
    }
  };

  return descriptions[grade];
}
