// Your route.ts file
import { NextRequest, NextResponse } from 'next/server';
import { fetchGoogleBusinesses, fetchYelpBusinesses, fetchChamberBusinesses, type ProviderBusiness } from '@/lib/providers';
import { summarizeCompany } from '@/lib/scoring';

function normalizedName(name: string) {
  return name.trim().toLowerCase().replace(/[®™]/g, '').replace(/\s+/g, ' ');
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
    const allReviews = group.flatMap(g =>
      (g.reviews ?? []).map(r => ({ ...r, source: g.source }))
    );

    const first = group[0];
    const summary = summarizeCompany(first.name, allReviews);

    merged.push({
      company: first.name,
      sources: group.map(g => ({
        source: g.source,
        rating: g.rating ?? null,
        reviewCount: g.reviewCount ?? null,
        url: g.url ?? null
      })),
      summary,
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

    // Fetching from different APIs
    const [google, yelp, chamber] = await Promise.all([
      fetchGoogleBusinesses(input),
      fetchYelpBusinesses(input),
      fetchChamberBusinesses(input),
    ]);

    // Remove the limited data message if there is no data
    if (!google.length && !yelp.length && !chamber.length) {
      return NextResponse.json({
        message: 'No valid data found, please verify the search criteria and try again.',
        providers: { google: google.length, yelp: yelp.length, chamber: chamber.length },
      });
    }

    const merged = mergeBusinesses([...google, ...yelp, ...chamber]);

    return NextResponse.json({
      input,
      providers: {
        google: google.length,
        yelp: yelp.length,
        chamber: chamber.length
      },
      results: merged
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
