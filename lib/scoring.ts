export type ReviewSignal = {
  source: 'google' | 'yelp' | 'chamber' | 'other';
  rating?: number | null;
  text: string;
  date?: string | null;
};

export type CompanySummary = {
  company: string;
  positives: string[];
  complaints: string[];
  reliabilityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  confidence: 'Low' | 'Medium' | 'High';
  verdict: string;
  evidenceCount: number;
};

const POSITIVE_PATTERNS = [
  { pattern: /prompt|on time|timely|early/i, label: 'Prompt / timely service' },
  { pattern: /efficient|quick|fast/i, label: 'Efficient execution' },
  { pattern: /recommend|happy|great job|great service/i, label: 'Strong satisfaction / recommendation' },
  { pattern: /property lines|clean to the limits|attention to detail/i, label: 'Attention to detail' },
  { pattern: /improve|trying to improve/i, label: 'Shows improvement effort' }
];

const NEGATIVE_PATTERNS = [
  { pattern: /no show|did not show|didn't show|never came|never show up|missed/i, label: 'Missed visits / no-shows', penalty: 25 },
  { pattern: /no answer|don'?t answer|never answer|not answering|no-one answer|call and call/i, label: 'Poor communication / unreachable', penalty: 18 },
  { pattern: /refund|take your money|took .* money|scam|billing|quote/i, label: 'Billing / refund issues', penalty: 16 },
  { pattern: /late|not on time|inconsistent timing|3pm/i, label: 'Late or inconsistent timing', penalty: 10 },
  { pattern: /not properly cleaned|only do the upper part|won't go all the way|incomplete/i, label: 'Incomplete clearing', penalty: 12 },
  { pattern: /driver|training|respectful|unprofessional|mad right away/i, label: 'Driver / professionalism issues', penalty: 9 },
  { pattern: /can'?t access|unable to leave|stuck|cannot get out/i, label: 'Customer stranded / access blocked', penalty: 20 }
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function uniqueTop(items: string[], max = 5): string[] {
  return [...new Set(items)].slice(0, max);
}

function extractAggregateReviewCount(text: string): number {
  const match = text.match(/from\s+(\d+)\s+reviews/i);
  return match ? Number(match[1]) : 0;
}

function ratingTo100(rating: number): number {
  return clamp(Math.round(((rating - 1) / 4) * 100), 0, 100);
}

export function summarizeCompany(company: string, reviews: ReviewSignal[]): CompanySummary {
  const evidenceCount = reviews.length;

  const positives: string[] = [];
  const complaints: string[] = [];

  let patternScore = 65;
  let aggregateReviewCount = 0;

  const ratings = reviews
    .map((r) => r.rating)
    .filter((r): r is number => typeof r === 'number');

  for (const review of reviews) {
    const text = (review.text ?? '').trim();

    aggregateReviewCount += extractAggregateReviewCount(text);

    if (text.length > 0) {
      for (const rule of POSITIVE_PATTERNS) {
        if (rule.pattern.test(text)) {
          positives.push(rule.label);
          patternScore += 4;
        }
      }

      for (const rule of NEGATIVE_PATTERNS) {
        if (rule.pattern.test(text)) {
          complaints.push(rule.label);
          patternScore -= rule.penalty;
        }
      }
    }
  }

  patternScore = clamp(Math.round(patternScore), 5, 95);

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : null;

  const ratingScore = avgRating != null ? ratingTo100(avgRating) : null;

  let score = patternScore;

  if (ratingScore != null) {
    if (aggregateReviewCount >= 200) {
      score = Math.round(ratingScore * 0.8 + patternScore * 0.2);
    } else if (aggregateReviewCount >= 50) {
      score = Math.round(ratingScore * 0.7 + patternScore * 0.3);
    } else if (aggregateReviewCount >= 10) {
      score = Math.round(ratingScore * 0.6 + patternScore * 0.4);
    } else {
      score = Math.round(ratingScore * 0.45 + patternScore * 0.55);
    }
  }

  if (complaints.length >= 2) {
    score -= 8;
  }
  if (complaints.length >= 4) {
    score -= 10;
  }

  score = clamp(Math.round(score), 5, 95);

  const confidence: CompanySummary['confidence'] =
    aggregateReviewCount >= 100 || evidenceCount >= 20
      ? 'High'
      : aggregateReviewCount >= 20 || evidenceCount >= 5
        ? 'Medium'
        : 'Low';

  const riskLevel: CompanySummary['riskLevel'] =
    score >= 80 ? 'low' :
    score >= 60 ? 'medium' :
    score >= 35 ? 'high' :
    'very-high';

  let verdict = 'Mixed signals based on available evidence.';

  if (riskLevel === 'low') {
    verdict =
      aggregateReviewCount >= 100
        ? 'Strong public reputation backed by substantial review volume.'
        : 'Strong reliability signal across available evidence.';
  } else if (riskLevel === 'medium') {
    verdict =
      aggregateReviewCount >= 50
        ? 'Solid public reputation, though detailed reliability evidence is still somewhat limited.'
        : 'Promising, but evidence is mixed or limited.';
  } else if (riskLevel === 'high') {
    verdict = 'Meaningful reliability risk; use caution.';
  } else {
    verdict = 'High probability of service failure based on repeated complaints.';
  }

  return {
    company,
    positives: uniqueTop(positives, 5),
    complaints: uniqueTop(complaints, 7),
    reliabilityScore: score,
    riskLevel,
    confidence,
    verdict,
    evidenceCount
  };
}
