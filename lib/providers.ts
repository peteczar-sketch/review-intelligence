export type ProviderBusiness = {
  source: string;
  name: string;
  rating?: number | null;
  reviewCount?: number | null;
  url?: string | null;
  address?: string | null;
  website?: string | null;
  phone?: string | null;
  reviews?: Array<{
    text: string;
    rating?: number | null;
  }>;
};

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;

export async function fetchGoogleBusinesses(input: {
  query: string;
  city: string;
}) {
  if (!GOOGLE_API_KEY) return [];

  const query = encodeURIComponent(`${input.query} in ${input.city}`);

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results) return [];

  return data.results.map((place: any) => ({
    source: 'google',
    name: place.name,
    rating: place.rating ?? null,
    reviewCount: place.user_ratings_total ?? null,
    url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`,
    address: place.formatted_address ?? null,
    website: null,
    phone: null,
    reviews: []
  }));
}

export async function fetchYelpBusinesses(input: {
  query: string;
  city: string;
}) {
  if (!YELP_API_KEY) return [];

  const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(
    input.query
  )}&location=${encodeURIComponent(input.city)}&limit=5`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${YELP_API_KEY}`
    }
  });

  const data = await res.json();

  if (!data.businesses) return [];

  return data.businesses.map((b: any) => ({
    source: 'yelp',
    name: b.name,
    rating: b.rating ?? null,
    reviewCount: b.review_count ?? null,
    url: b.url ?? null,
    address: b.location?.display_address?.join(', ') ?? null,
    website: b.url ?? null,
    phone: b.display_phone ?? b.phone ?? null,
    reviews: []
  }));
}

export async function fetchChamberBusinesses() {
  return [];
}
