'use client';

import { useState, useEffect } from 'react';

// Helper function to render a progress bar based on the reliability score
const getRatingBarStyle = (score: number) => ({
  width: `${score}%`,
  height: '10px',
  backgroundColor: score > 80 ? 'green' : score > 50 ? 'yellow' : 'red',
  borderRadius: '5px',
  transition: 'width 0.5s ease-in-out',
});

// Function to get risk emoji based on the risk level
const getRiskEmoji = (riskLevel: string) => {
  if (riskLevel === 'low') return '🟢'; // Green for low risk
  if (riskLevel === 'medium') return '🟡'; // Yellow for medium risk
  if (riskLevel === 'high') return '🔴'; // Red for high risk
  return '⚪'; // Default if something goes wrong
};

export default function HomePage() {
  const [query, setQuery] = useState('snow removal');
  const [city, setCity] = useState('Laval');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

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
    <main style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <h1>Review Intelligence</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Service type"
      />
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {data?.error && <div>{data.error}</div>}

      {data?.results?.map((result, index) => (
        <div key={index} className="result">
          <h2>{result.company}</h2>

          {/* Removed the summary section entirely */}
          <div className="rating">
            <div style={getRatingBarStyle(result.reliabilityScore)}></div>
          </div>

          {/* Removed the summary */}
          <p>{result.reliabilityScore}/100</p>
          <div className="risk-level">
            {getRiskEmoji(result.riskLevel)} {result.riskLevel.toUpperCase()}
          </div>

          <p>Address: {result.address}</p>
          {result.website && <a href={result.website}>Visit Website</a>}
          {result.phone && <p>Phone: {result.phone}</p>}

          {/* Sources and reviews */}
          {result.sources?.map((source: any, idx: number) => (
            <div key={idx}>
              <p>
                {source.source}: ★{source.rating} ({source.reviewCount} reviews)
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  View source
                </a>
              </p>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
