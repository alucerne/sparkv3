import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const SPARK_API_URL = process.env.NEXT_PUBLIC_SPARK_API_URL;
    
    if (!SPARK_API_URL) {
      console.error('SPARK_API_URL not configured');
      return NextResponse.json({ 
        error: 'Search API not configured',
        results: []
      }, { status: 500 });
    }

    console.log('Searching for:', query);
    console.log('Using API URL:', SPARK_API_URL);

    // Call the Supabase Edge Function
    const response = await fetch(SPARK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYXBldnl2YmFrcnpobXFudmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTM0NTYsImV4cCI6MjA2ODY2OTQ1Nn0.2bmquNWzujFRcopi_nYigXPD2ybxZ-eObUk3SLtc4s8'
      },
      body: JSON.stringify({ query, top_k: 5 })
    });

    console.log('Search response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search API error:', errorText);
      return NextResponse.json({ 
        error: `API call failed: ${errorText}`,
        results: []
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('Search results count:', data.results?.length || 0);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        results: []
      }, 
      { status: 500 }
    );
  }
} 