import { useState, useEffect } from 'react';
import Autocomplete from 'react-autocomplete'; // Importing the autocomplete library

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]); // State to hold search results
  const [noDataMessage, setNoDataMessage] = useState('');

  const services = ['Snow Removal', 'Lawn Care', 'Driveway Cleaning']; // Placeholder for service categories

  // Function to handle changes in the search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Fetch data based on the query
  const fetchData = async () => {
    setNoDataMessage(''); // Reset message before fetching

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'snow removal', city: 'Laval' }), // Dynamic query
    });

    const data = await response.json();

    if (data.error) {
      setNoDataMessage('Error fetching data. Please try again later.');
    } else if (data.results.length === 0) {
      setNoDataMessage('No results found for this search. Try with different criteria.');
    } else {
      setResults(data.results); // Assuming API response has `results` field
    }
  };

  // Autocomplete configuration for the search input
  useEffect(() => {
    fetchData(); // Fetch data when the component loads
  }, []);

  return (
    <html lang="en">
      <body>
        <h1>Review Intelligence</h1>
        <Autocomplete
          getItemValue={(item) => item}
          items={services.filter((item) => item.toLowerCase().includes(query.toLowerCase()))}
          renderItem={(item, isHighlighted) => (
            <div
              style={{
                backgroundColor: isHighlighted ? 'lightgray' : 'white',
                padding: '5px',
                border: '1px solid #ccc',
              }}
            >
              {item}
            </div>
          )}
          value={query}
          onChange={handleSearchChange}
          onSelect={(value) => setQuery(value)}
        />
        <button onClick={fetchData}>Analyze</button>
        
        {noDataMessage ? (
          <div className="no-data-message">{noDataMessage}</div>
        ) : (
          <div>
            {results.map((result, index) => (
              <div key={index} className="result">
                <h2>{result.company}</h2>

                {/* Display the reliability score as a progress bar */}
                <div className="rating">
                  <div style={getRatingBarStyle(result.reliabilityScore)}></div>
                </div>

                {/* Display the score and risk level with emojis */}
                <p>{result.reliabilityScore}/100</p>
                <div className="risk-level">
                  {getRiskEmoji(result.riskLevel)} {result.riskLevel.toUpperCase()}
                </div>

                {/* Display verdict, address, and website */}
                <p>{result.verdict}</p>
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
          </div>
        )}
      </body>
    </html>
  );
}
