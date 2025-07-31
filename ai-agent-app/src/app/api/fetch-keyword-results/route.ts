import { NextRequest, NextResponse } from 'next/server';

const SEARCH_API_KEY = 'WLcBQEMKS8U7PByABFZg3hUd';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords');

    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords parameter is required' },
        { status: 400 }
      );
    }

    // Query SearchAPI.io with the keywords
    const query = encodeURIComponent(keywords);
    const searchUrl = `https://www.searchapi.io/api/v1/search?engine=google&q=${query}&api_key=${SEARCH_API_KEY}`;
    
    console.log('SearchAPI URL:', searchUrl);
    
    const searchRes = await fetch(searchUrl);
    
    if (!searchRes.ok) {
      const errorText = await searchRes.text();
      console.error('SearchAPI error response:', errorText);
      throw new Error(`SearchAPI error: ${searchRes.status} - ${errorText}`);
    }
    
    const searchData = await searchRes.json();
    console.log('SearchAPI response structure:', Object.keys(searchData));
    console.log('Number of results:', searchData.organic_results?.length || 0);

    // Extract and filter results
    const results = (searchData.organic_results || [])
      .slice(0, 20) // Get top 20 results
      .map((r: any) => ({
        title: r.title,
        snippet: r.snippet,
        link: r.link,
        position: r.position,
      }))
      .filter((r: any) => r.title && r.snippet);

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No search results found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      results,
      totalResults: results.length,
      query: keywords,
      searchMetadata: searchData.search_metadata || {}
    });

  } catch (error) {
    console.error('Fetch keyword results API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 