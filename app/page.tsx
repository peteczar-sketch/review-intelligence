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

function scoreColor(score: number) {
  if (score >= 80) return '#166534';
  if (score >= 60) return '#a16207';
  return '#b91c1c';
}

function scoreBg(score: number) {
  if (score >= 80) return '#dcfce7';
  if (score >= 60) return '#fef3c7';
  return '#fee2e2';
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
        background: '#f8fafc',
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a'
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            padding: 24,
            marginBottom: 24
          }}
        >
          <h1 style={{ margin: 0, fontSize: 32 }}>Review Intelligence</h1>
          <p style={{ marginTop: 8, color: '#475569' }}>
            Fully automated business lookup + review analysis for local services
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 12,
              marginTop: 20
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Service type"
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 16
              }}
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 16
              }}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                padding: '12px 18px',
                borderRadius: 10,
                border: 'none',
                background: '#0f172a',
                color: 'white',
                fontWeight: 700,
                cursor: loading ? 'default' : 'pointer'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {data?.error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: 16,
              borderRadius: 12,
              marginBottom: 20
            }}
          >
            {data.error}
          </div>
        )}

        {data?.providers && (
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              padding: 18,
              marginBottom: 20
            }}
          >
            <strong>Provider coverage:</strong>{' '}
            Google: {data.providers.google ?? 0} | Yelp: {data.providers.yelp ?? 0}
            {data.warnings && data.warnings.length > 0 && (
              <div style={{ marginTop: 10, color: '#92400e' }}>
                {data.warnings.map((w, i) => (
                  <div key={i}>{w}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {data && !loading && (!data.results || data.results.length === 0) && !data.error && (
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              padding: 24
            }}
          >
            No businesses found. Try a different service or city.
          </div>
        )}

        <div style={{ display: 'grid', gap: 18 }}>
          {data?.results?.map((result, index) => {
            const bestSourceWithAddress =
              result.sources.find((s) => s.address) ?? result.sources[0];
            const bestSourceWithWebsite =
              result.sources.find((s) => s.website) ?? result.sources[0];
            const bestSourceWithPhone =
              result.sources.find((s) => s.phone) ?? result.sources[0];

            const score = result.summary?.reliabilityScore ?? 0;
            const evidenceCount = result.summary?.evidenceCount ?? 0;
            const confidence = result.summary?.confidence ?? 'Unknown';

            return (
              <div
                key={`${result.company}-${index}`}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                  padding: 22
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 14
                  }}
                >
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>
                      {index + 1}. {result.company}
                    </div>
                    {result.summary?.riskLevel && (
                      <div style={{ marginTop: 4, color: '#475569' }}>
                        Risk: {result.summary.riskLevel}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      background: scoreBg(score),
                      color: scoreColor(score),
                      padding: '10px 14px',
                      borderRadius: 999,
                      fontWeight: 800,
                      minWidth: 110,
                      textAlign: 'center'
                    }}
                  >
                    {score}/100
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.1fr 0.9fr',
                    gap: 20
                  }}
                >
                  <div>
                    <p style={{ margin: '0 0 8px 0' }}>
                      <strong>Confidence:</strong> {confidence}
                    </p>
                    <p style={{ margin: '0 0 8px 0' }}>
                      <strong>Evidence count:</strong> {evidenceCount}
                    </p>
                    {result.summary?.verdict && (
                      <p style={{ margin: '0 0 12px 0' }}>
                        <strong>Verdict:</strong> {result.summary.verdict}
                      </p>
                    )}

                    {evidenceCount < 5 && (
                      <p
                        style={{
                          margin: '0 0 12px 0',
                          color: '#b45309',
                          fontWeight: 700
                        }}
                      >
                        Limited data available — results may be less reliable.
                      </p>
                    )}

                    {bestSourceWithAddress?.address && (
                      <p style={{ margin: '0 0 8px 0' }}>
                        <strong>Address:</strong> {bestSourceWithAddress.address}
                      </p>
                    )}

                    {bestSourceWithWebsite?.website && (
                      <p style={{ margin: '0 0 8px 0' }}>
                        <strong>Website:</strong>{' '}
                        <a
                          href={bestSourceWithWebsite.website}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {bestSourceWithWebsite.website}
                        </a>
                      </p>
                    )}

                    {bestSourceWithPhone?.phone && (
                      <p style={{ margin: '0 0 8px 0' }}>
                        <strong>Phone:</strong> {bestSourceWithPhone.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Sources</div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {result.sources.map((source, sourceIndex) => (
                        <li key={`${source.source}-${sourceIndex}`} style={{ marginBottom: 8 }}>
                          <strong>{source.source}</strong>
                          {source.rating != null ? ` ★${source.rating}` : ''}
                          {source.reviewCount != null
                            ? ` (${source.reviewCount} reviews)`
                            : ''}
                          {source.url && (
                            <>
                              {' — '}
                              <a href={source.url} target="_blank" rel="noreferrer">
                                View source
                              </a>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {result.summary?.positives && result.summary.positives.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Top positives</div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {result.summary.positives.map((item, i) => (
                        <li key={i} style={{ marginBottom: 6 }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.summary?.complaints && result.summary.complaints.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Top complaints</div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {result.summary.complaints.map((item, i) => (
                        <li key={i} style={{ marginBottom: 6 }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
