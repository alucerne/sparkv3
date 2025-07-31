import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const SEARCH_API_KEY = 'WLcBQEMKS8U7PByABFZg3hUd';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Initialize Hugging Face inference
const hf = new HfInference(HF_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { description, searchResults, keywords } = await request.json();

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
    
    // Generate rule-based feedback
    const feedbackArray = generateFeedback(description, avgScore);
    
    // Add Perplexity-based feedback if score is low or always for deeper analysis
    let perplexityFeedback: string[] = [];
    if (avgScore < 0.75) {
      try {
        perplexityFeedback = await getPerplexityFeedback({
          keywords: keywords || [],
          description,
          searchResults: sorted.slice(0, 5)
        });
      } catch (error) {
        console.error('Perplexity feedback error:', error);
        // Continue without Perplexity feedback if it fails
      }
    }
    
    // Combine rule-based and Perplexity feedback
    const allFeedback = [...feedbackArray, ...perplexityFeedback];
    const feedback = allFeedback.join(' ');

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

// Rule-based feedback generation function
function generateFeedback(description: string, avgScore: number): string[] {
  const badWords = [
    "affordable", "trusted", "easy", "simple", "modern", "freelancers",
    "small business", "for marketers", "agency owners", "value", "budget",
    "best", "top", "leading", "premium", "professional", "expert",
    "startup", "entrepreneur", "founder", "manager", "director",
    "cheap", "inexpensive", "cost-effective", "budget-friendly"
  ];

  const goodWords = [
    "domain warm-up", "inbox placement", "spam filters",
    "sender reputation", "SPF", "cold email deliverability",
    "DKIM", "authentication", "bounce rate", "open rate",
    "email warm-up", "IP reputation", "blacklist", "whitelist",
    "email infrastructure", "deliverability", "email compliance"
  ];

  const feedback: string[] = [];

  // Check for bad words (personas, vague language)
  for (const word of badWords) {
    if (description.toLowerCase().includes(word)) {
      feedback.push(`⚠️ Remove "${word}" — this adds persona or vague value language that confuses LLM intent.`);
    }
  }

  // Check for good words (LSI/search-aligned terms)
  for (const word of goodWords) {
    if (description.toLowerCase().includes(word)) {
      feedback.push(`✅ Good use of "${word}" — this matches high-intent keywords found in search results.`);
    }
  }

  // Score-based feedback
  if (avgScore < 0.4) {
    feedback.push("💡 Your description is too broad or vague for effective audience targeting. Consider being more specific about the problem, solution, or industry. Avoid generic terms like 'business owners' or 'professionals.'");
  } else if (avgScore < 0.6) {
    feedback.push("💡 Your description needs refinement for better audience targeting. Add specific technical terms, industry keywords, or problem statements that people actually search for.");
  } else if (avgScore < 0.8) {
    feedback.push("💡 Your description shows good alignment with search intent. Consider adding more specific technical terms or industry context to improve targeting precision.");
  }

  // If no specific feedback was generated, provide positive reinforcement
  if (feedback.length === 0) {
    feedback.push("✅ Great job! Your description is focused and aligned with real search content.");
  }

  return feedback;
}

// Perplexity-based feedback generation function
async function getPerplexityFeedback({
  keywords,
  description,
  searchResults,
}: {
  keywords: string[];
  description: string;
  searchResults: { title: string; snippet: string }[];
}): Promise<string[]> {
  const PERPLEXITY_API_KEY = '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';
  
  try {
    const topResults = searchResults
      .slice(0, 5)
      .map((r, i) => `${i + 1}. ${r.title} — ${r.snippet}`)
      .join("\n");

    const prompt = `
You are analyzing a training description for alignment with search result content.

Keywords to target: ${keywords.join(", ")}

Search Results:
${topResults}

User Description:
"${description}"

Your task:
- List 2–3 vague or irrelevant terms or phrases
- Recommend what the user should add to improve match with these search results
- Suggest a more specific or focused rewrite idea if helpful
- Keep your response short, specific, and bullet-pointed
`;

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in search intent analysis and audience targeting optimization. Provide clear, actionable feedback to improve training descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    return content
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 3)
      .map((line: string) => `🤖 ${line}`);

  } catch (error) {
    console.error('Perplexity feedback generation error:', error);
    return ['🤖 AI analysis temporarily unavailable. Please try again later.'];
  }
} 