import { NextRequest, NextResponse } from 'next/server';
import {
  fetchGoogleBusinesses,
  fetchYelpBusinesses,
  type ProviderBusiness
} from '@/lib/providers';
import { summarizeCompany } from '@/lib/scoring';

type ReviewSource = 'google' | 'yelp' | 'chamber' | 'other';

function toReviewSource(source: string): ReviewSource {
  if (source === 'google') return 'google';
  if (source === 'yelp') return 'yelp';
  if (source === 'chamber') return 'chamber';
  return 'other';
}

function normalizedName(name: string) {
  return name.trim().toLowerCase().replace(/[®™]/g, '').replace(/\s+/g, ' ');
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);

    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}

function mergeBusinesses(businesses: ProviderBusiness[]) {
  const byName = new Map<string, ProviderBusiness[]>();

  for (const b of businesses) {
    const key = normalizedName(b.name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key)!.push(b);
  }

  const merged = [];

  for (const [, group] of byName.entries()) {
    const allReviews = group.flatMap((g) => {
      const source = toReviewSource(g.source);

      const realReviews = (g.reviews ?? []).map((r) => ({
        text: r.text ?? '',
        rating: r.rating ?? null,
        source
      }));

      // If no actual review text is available, synthesize one signal from aggregate data
      // so evidence count / confidence are not zero while source review counts are high.
      if (realReviews.length === 0 && g.reviewCount && g.rating != null) {
        return [
          {
            source,
            text: `Aggregate rating ${g.rating} from ${g.reviewCount} reviews`,
            rating: g.rating
          }
        ];
      }

      return realReviews;
    });

    const first = group[0];
    const summary = summarizeCompany(first.name, allReviews);

    merged.push({
      company: first.name,
      sources: group.map((g) => ({
        source: g.source,
        rating: g.rating ?? null,
        reviewCount: g.reviewCount ?? null,
        url: g.url ?? null,
        address: g.address ?? null,
        website: g.website ?? null,
        phone: g.phone ?? null
      })),
      summary
    });
  }

  return merged.sort((a, b) => b.summary.reliabilityScore - a.summary.reliabilityScore);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input = {
      query: String(body.query ?? ''),
      city: String(body.city ?? ''),
      postalCode: body.postalCode ? String(body.postalCode) : undefined,
      category: body.category ? String(body.category) : undefined
    };

    if (!input.query || !input.city) {
      return NextResponse.json({ error: 'query and city are required' }, { status: 400 });
    }

    const providerCalls = await Promise.allSettled([
      withTimeout(fetchGoogleBusinesses(input), 6000, 'Google'),
      withTimeout(fetchYelpBusinesses(input), 6000, 'Yelp')
    ]);

    const google =
      providerCalls[0].status === 'fulfilled' ? providerCalls[0].value : [];

    const yelp =
      providerCalls[1].status === 'fulfilled' ? providerCalls[1].value : [];

    const merged = mergeBusinesses([...google, ...yelp]);

    const warnings = providerCalls
      .map((result, index) => {
        if (result.status === 'rejected') {
          return `${index === 0 ? 'Google' : 'Yelp'} failed: ${
            result.reason instanceof Error ? result.reason.message : String(result.reason)
          }`;
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({
      input,
      providers: {
        google: google.length,
        yelp: yelp.length
      },
      results: merged,
      warnings
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
