<div className="result">
  <h2>{result.company}</h2>
  <div className="rating">
    <div style={getRatingBarStyle(result.reliabilityScore)}></div>
  </div>
  <p>{result.reliabilityScore}/100</p>
  <div className="risk-level">
    {getRiskEmoji(result.riskLevel)} {result.riskLevel.toUpperCase()}
  </div>

  {/* Display the updated verdict */}
  <p>{result.verdict}</p>

  {/* Other information */}
  <p>Address: {result.address}</p>
  {result.website && <a href={result.website}>Visit Website</a>}
  {result.phone && <p>Phone: {result.phone}</p>}

  {/* Sources */}
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
