import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Call the Supabase Edge Function
    const response = await fetch('https://trapevyvbakrzhmqnvdm.supabase.co/functions/v1/spark-ai-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYXBldnl2YmFrcnpobXFudmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTM0NTYsImV4cCI6MjA2ODY2OTQ1Nn0.2bmquNWzujFRcopi_nYigXPD2ybxZ-eObUk3SLtc4s8'
      },
      body: JSON.stringify({ query, top_k: 5 })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `API call failed: ${errorText}` }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 