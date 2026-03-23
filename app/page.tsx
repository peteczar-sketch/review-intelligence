'use client';

import { useState } from 'react';

type SourceInfo = {
  source: string;
  rating?: number | null;
  reviewCount?: number | null;
  url?: string | null;
  address?: string | null;
  website?: string | null;
  phone?: string | null;
};

type Summary = {
  reliabilityScore: number;
  riskLevel?: string;
  verdict?: string;
  positives?: string[];
  complaints?: string[];
  evidenceCount?: number;
  confidence?: string;
};

type ResultItem = {
  company: string;
  sources: SourceInfo[];
  meta?: {
    totalSourceReviewCount?: number;
  };
  summary: Summary;
};

type AnalyzeResponse = {
  input?: {
    query: string;
    city: string;
  };
  providers?: {
    google?: number;
    yelp?: number;
  };
  results?: ResultItem[];
  warnings?: string[];
  error?: string;
};

function scoreColors(score: number) {
  if (score >= 80) {
    return {
      text: '#14532d',
      bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
      border: '#86efac'
    };
  }
  if (score >= 60) {
    return {
      text: '#92400e',
      bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '#fcd34d'
    };
  }
  return {
    text: '#991b1b',
    bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    border: '#fca5a5'
  };
}

function riskPill(risk?: string) {
  const value = (risk || '').toLowerCase();

  if (value === 'low') {
    return {
      label: 'Low Risk',
      bg: '#dcfce7',
      color: '#166534'
    };
  }

  if (value === 'very-high') {
    return {
      label: 'Very High Risk',
      bg: '#7f1d1d',
      color: '#fee2e2'
    };
  }

  if (value === 'high') {
    return {
      label: 'High Risk',
      bg: '#fee2e2',
      color: '#991b1b'
    };
  }

  return {
    label: 'Medium Risk',
    bg: '#fef3c7',
    color: '#92400e'
  };
}

export default function HomePage() {
  const [query, setQuery] = useState('snow removal');
  const [city, setCity] = useState('Laval');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setData(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, city })
      });

      const json = await res.json();
      setData(json);
    } catch (error) {
      setData({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, #1d4ed8 0%, #0f172a 35%, #020617 100%)',
        padding: '40px 20px',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#e2e8f0'
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <section
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderRadius: 28,
            padding: 32,
            boxShadow: '0 20px 80px rgba(0,0,0,0.35)',
            marginBottom: 28
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 999,
                padding: '8px 14px',
                marginBottom: 18,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#bfdbfe'
              }}
            >
              AI-Powered Local Service Intelligence
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 52,
                lineHeight: 1.02,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#f8fafc'
              }}
            >
              Review Intelligence
            </h1>

            <p
              style={{
                marginTop: 14,
                marginBottom: 0,
                fontSize: 18,
                lineHeight: 1.6,
                color: '#cbd5e1',
                maxWidth: 700
              }}
            >
              Find stronger local service providers faster. Aggregate Google and Yelp,
              surface risk, and compare providers with a cleaner decision view.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.9fr auto',
              gap: 14,
              marginTop: 28
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Service type"
              style={{
                height: 56,
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.06)',
                color: '#f8fafc',
                padding: '0 18px',
                fontSize: 16,
                outline: 'none'
              }}
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              style={{
                height: 56,
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.06)',
                color: '#f8fafc',
                padding: '0 18px',
                fontSize: 16,
                outline: 'none'
              }}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                height: 56,
                padding: '0 22px',
                borderRadius: 16,
                border: 'none',
                cursor: loading ? 'default' : 'pointer',
                background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                color: 'white',
                fontWeight: 800,
                fontSize: 16,
                boxShadow: '0 12px 30px rgba(37,99,235,0.35)'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </section>

        {data?.error && (
          <div
            style={{
              background: '#7f1d1d',
              border: '1px solid #ef4444',
              color: '#fee2e2',
              padding: 18,
              borderRadius: 18,
              marginBottom: 24
            }}
          >
            {data.error}
          </div>
        )}

        {data?.providers && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 14,
              marginBottom: 24
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                borderRadius: 22,
                padding: 20
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase' }}>
                Google Coverage
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>
                {data.providers.google ?? 0}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                borderRadius: 22,
                padding: 20
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase' }}>
                Yelp Coverage
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>
                {data.providers.yelp ?? 0}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                borderRadius: 22,
                padding: 20
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase' }}>
                Results Returned
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>
                {data.results?.length ?? 0}
              </div>
            </div>
          </section>
        )}

        {data?.warnings && data.warnings.length > 0 && (
          <div
            style={{
              marginBottom: 22,
              background: 'rgba(251,191,36,0.16)',
              border: '1px solid rgba(251,191,36,0.35)',
              color: '#fde68a',
              borderRadius: 18,
              padding: 18
            }}
          >
            {data.warnings.map((w, i) => (
              <div key={i}>{w}</div>
            ))}
          </div>
        )}

        {data && !loading && (!data.results || data.results.length === 0) && !data.error && (
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              borderRadius: 24,
              padding: 28,
              color: '#e2e8f0'
            }}
          >
            No businesses found. Try a different service or city.
          </div>
        )}

        <div style={{ display: 'grid', gap: 20 }}>
          {data?.results?.map((result, index) => {
            const score = result.summary?.reliabilityScore ?? 0;
            const scoreTheme = scoreColors(score);
            const riskTheme = riskPill(result.summary?.riskLevel);
            const evidenceCount = result.summary?.evidenceCount ?? 0;
            const confidence = result.summary?.confidence ?? 'Unknown';
            const totalSourceReviewCount = result.meta?.totalSourceReviewCount ?? 0;

            const primaryAddress = result.sources.find((s) => s.address)?.address ?? null;
            const primaryWebsite = result.sources.find((s) => s.website)?.website ?? null;
            const primaryPhone = result.sources.find((s) => s.phone)?.phone ?? null;

            return (
              <article
                key={`${result.company}-${index}`}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: 28,
                  padding: 24,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                }}
              >
                {/* Displaying the business and related info */}
                {/* Your code will continue from here */}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
