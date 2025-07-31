import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const SEARCH_API_KEY = 'WLcBQEMKS8U7PByABFZg3hUd';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Initialize Hugging Face inference
const hf = new HfInference(HF_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { description, searchResults } = await request.json();

    if (!description || !searchResults || !Array.isArray(searchResults)) {
      return NextResponse.json(
        { error: 'Description and searchResults array are required' },
        { status: 400 }
      );
    }

    // Use the provided search results instead of fetching new ones
    const results = searchResults
      .slice(0, 20)
      .map((r: any) => ({
        title: r.title,
        snippet: r.snippet,
        link: r.link,
        position: r.position,
      }))
      .filter((r: any) => r.title && r.snippet);

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No valid search results provided' },
        { status: 400 }
      );
    }

    // Use Hugging Face reranker for LLM audience targeting simulation
    if (!HF_API_KEY) {
      throw new Error('Hugging Face API key not configured');
    }

    // Prepare pairs for reranking: [description, search_result_text]
    const rerankPairs = results.map((r: any) => [
      description, // User's audience targeting description
      `${r.title}: ${r.snippet}` // Search result content
    ]);

    // Use cross-encoder model for reranking (better for this use case)
    const scoredResults = await Promise.all(
      rerankPairs.map(async (pair: any[], idx: number) => {
        const [query, passage] = pair as [string, string];
        try {
          // Use a cross-encoder model for reranking
          const result = await hf.sentenceSimilarity({
            model: 'cross-encoder/ms-marco-MiniLM-L-6-v2',
            inputs: {
              source_sentence: query,
              sentences: [passage]
            }
          });
          
          // Convert similarity score to relevance score (0-1)
          const relevanceScore = Array.isArray(result) ? result[0] : result;
          const normalizedScore = Math.max(0, Math.min(1, relevanceScore));
          
          // Generate individual feedback for this result
          let feedback = '';
          if (normalizedScore >= 0.8) {
            feedback = '✅ High relevance: Strong alignment with your audience description. This content directly addresses the problems and solutions your audience is seeking.';
          } else if (normalizedScore >= 0.6) {
            feedback = '⚠️ Medium relevance: Some alignment with your audience, but could be more specific. Consider refining your description to target more precise search intent.';
          } else {
            feedback = '❌ Low relevance: Poor alignment with your audience description. This content may not effectively reach your target audience. Consider using more specific technical terms or industry keywords.';
          }
          
          return {
            ...results[idx],
            score: normalizedScore,
            feedback,
          };
        } catch (error) {
          console.error('Reranker error for result', idx, error);
          // Fallback to simple keyword matching if reranker fails
          const titleLower = results[idx].title.toLowerCase();
          const snippetLower = results[idx].snippet.toLowerCase();
          const descriptionLower = description.toLowerCase();
          
          const descriptionWords = descriptionLower.split(/\s+/).filter((word: string) => word.length > 3);
          let matches = 0;
          descriptionWords.forEach((word: string) => {
            if (titleLower.includes(word) || snippetLower.includes(word)) matches++;
          });
          
          const fallbackScore = descriptionWords.length > 0 ? matches / descriptionWords.length : 0.5;
          
          // Generate fallback feedback
          let feedback = '';
          if (fallbackScore >= 0.6) {
            feedback = '⚠️ Keyword-based score: Some keyword overlap detected, but semantic analysis unavailable. Consider using more specific technical terms.';
          } else {
            feedback = '❌ Low keyword match: Limited overlap with your description. Consider using more relevant industry terms and specific problem statements.';
          }
          
          return {
            ...results[idx],
            score: fallbackScore,
            feedback,
          };
        }
      })
    );

    // Sort by score and take top 10
    const sorted = scoredResults
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10);

    // Generate feedback based on average score for LLM audience targeting
    const avgScore = sorted.reduce((sum: number, r: any) => sum + r.score, 0) / sorted.length;
    let feedback = '';
    
    if (avgScore < 0.4) {
      feedback = '⚠️ Poor LLM Audience Targeting: Your description is too broad or vague for effective audience targeting. Consider being more specific about the problem, solution, or industry. Avoid generic terms like "business owners" or "professionals."';
    } else if (avgScore < 0.6) {
      feedback = '⚠️ Limited LLM Audience Targeting: Your description needs refinement for better audience targeting. Add specific technical terms, industry keywords, or problem statements that people actually search for.';
    } else if (avgScore < 0.8) {
      feedback = '✅ Good LLM Audience Targeting: Your description shows good alignment with search intent. Consider adding more specific technical terms or industry context to improve targeting precision.';
    } else {
      feedback = '🎯 Excellent LLM Audience Targeting: Your description is highly specific and aligns well with search intent. This should work effectively for LLM-based audience targeting and segmentation.';
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