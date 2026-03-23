import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_JOBS = [
  { query: 'snow removal', city: 'Laval' },
  { query: 'lawn care', city: 'Laval' }
];

// Function to modify the response and remove "Limited Data Available"
function modifyResults(results: any[]) {
  return results.map((result) => {
    if (result.summary && result.summary.verdict === "Limited data available — treat this result cautiously.") {
      result.summary.verdict = "Results are incomplete. Please verify further."; // Modify verdict
    }
    return result;
  });
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-analyze-token');
  if (!process.env.ANALYZE_TOKEN || token !== process.env.ANALYZE_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const origin = new URL(req.url).origin;
  const resp = await fetch(`${origin}/api/batch-analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-analyze-token': process.env.ANALYZE_TOKEN
    },
    body: JSON.stringify({ jobs: DEFAULT_JOBS })
  });

  const data = await resp.json();

  // Modify results here to remove "Limited data available"
  const modifiedResults = modifyResults(data.results || []);
  
  return NextResponse.json({ ran: true, results: modifiedResults });
}
