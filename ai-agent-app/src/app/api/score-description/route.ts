import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'WLcBQEMKS8U7PByABFZg3hUd';

export async function POST(request: NextRequest) {
  try {
    const { topic, description } = await request.json();

    if (!topic || !description) {
      return NextResponse.json(
        { error: 'Topic and description are required' },
        { status: 400 }
      );
    }

    // Query SearchAPI.io with the topic
    const query = encodeURIComponent(topic);
    const searchUrl = `https://www.searchapi.io/api/v1/search?engine=google&q=${query}&api_key=${API_KEY}`;
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
      .slice(0, 20)
      .map((r: any) => ({
        title: r.title,
        snippet: r.snippet,
        link: r.link,
      }))
      .filter((r: any) => r.title && r.snippet);

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No search results found' },
        { status: 404 }
      );
    }

    // Simple scoring based on keyword matching
    const scoredResults = results.map((r: any, idx: number) => {
      const titleLower = r.title.toLowerCase();
      const snippetLower = r.snippet.toLowerCase();
      const descriptionLower = description.toLowerCase();
      
      // Extract keywords from description
      const descriptionWords = descriptionLower.split(/\s+/).filter((word: string) => word.length > 3);
      
      // Count matches in title and snippet
      let titleMatches = 0;
      let snippetMatches = 0;
      
      descriptionWords.forEach((word: string) => {
        if (titleLower.includes(word)) titleMatches++;
        if (snippetLower.includes(word)) snippetMatches++;
      });
      
      // Calculate score based on matches
      const titleScore = titleMatches / descriptionWords.length;
      const snippetScore = snippetMatches / descriptionWords.length;
      const combinedScore = (titleScore * 0.7) + (snippetScore * 0.3);
      
      // Add some randomness to simulate ML scoring
      const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
      const finalScore = Math.min(1.0, combinedScore * randomFactor);
      
      return {
        ...r,
        score: finalScore,
      };
    });

    // Sort by score and take top 10
    const sorted = scoredResults
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10);

    // Generate feedback based on average score
    const avgScore = sorted.reduce((sum: number, r: any) => sum + r.score, 0) / sorted.length;
    let feedback = '';
    
    if (avgScore < 0.7) {
      feedback = 'Try removing audience-specific language (e.g., "for founders", "small business"). Focus on actions, features, and outcomes. Use synonyms like "email warm-up" or "spam filter avoidance."';
    } else if (avgScore < 0.85) {
      feedback = 'Good topic relevance! Consider adding more specific technical terms or industry keywords to improve matching.';
    } else {
      feedback = 'Excellent topic alignment! Your description closely matches relevant search results.';
    }

    return NextResponse.json({
      scoredResults: sorted,
      feedback,
      averageScore: avgScore,
      totalResults: results.length
    });

  } catch (error) {
    console.error('Score description API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 