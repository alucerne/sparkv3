import { getOpenAIConfig } from '../../../lib/openai-config';

const config = getOpenAIConfig();

// Simple in-memory rate limiter (in production, use Redis or similar)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(): string {
  return 'global'; // In production, use user ID or API key
}

function isRateLimited(): boolean {
  const key = getRateLimitKey();
  const now = Date.now();
  const limit = rateLimiter.get(key);
  
  if (!limit || now > limit.resetTime) {
    rateLimiter.set(key, { count: 1, resetTime: now + config.rateLimit.windowMs });
    return false;
  }
  
  if (limit.count >= config.rateLimit.maxRequests) {
    return true;
  }
  
  limit.count++;
  return false;
}

function calculateBackoffDelay(attempt: number): number {
  const delay = config.retry.baseDelay * Math.pow(config.retry.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.retry.maxDelay);
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeOpenAIRequest(messages: any[], systemPrompt: string, attempt: number = 1): Promise<Response> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.api.model,
        max_tokens: config.api.maxTokens,
        temperature: config.api.temperature,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
      }),
    });

    // Handle specific error cases
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfter ? parseInt(retryAfter) : config.retryAfter.rateLimited;
      
      if (attempt < config.retry.maxRetries) {
        console.log(`Rate limited (attempt ${attempt}/${config.retry.maxRetries}), retrying in ${retryAfterSeconds * 1000}ms...`);
        await delay(retryAfterSeconds * 1000);
        return makeOpenAIRequest(messages, systemPrompt, attempt + 1);
      } else {
        return Response.json({ 
          error: config.errors.rateLimited,
          details: "Max retries exceeded for rate limit",
          retryAfter: retryAfterSeconds
        }, { status: 429 });
      }
    }

    if (response.status === 500 || response.status === 502 || response.status === 503) {
      if (attempt < config.retry.maxRetries) {
        const delayMs = calculateBackoffDelay(attempt);
        console.log(`OpenAI API server error (attempt ${attempt}/${config.retry.maxRetries}), retrying in ${delayMs}ms...`);
        await delay(delayMs);
        return makeOpenAIRequest(messages, systemPrompt, attempt + 1);
      } else {
        return Response.json({ 
          error: config.errors.serverError,
          details: "Max retries exceeded for server error"
        }, { status: 503 });
      }
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      
      return Response.json({ 
        error: `OpenAI API error: ${response.status}`,
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error("Unexpected OpenAI API response:", data);
      return Response.json({ 
        error: config.errors.unexpectedResponse,
        details: data 
      }, { status: 500 });
    }

    return Response.json({ text: data.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API request error:", error);
    
    if (attempt < config.retry.maxRetries) {
      const delayMs = calculateBackoffDelay(attempt);
      console.log(`Network error (attempt ${attempt}/${config.retry.maxRetries}), retrying in ${delayMs}ms...`);
      await delay(delayMs);
      return makeOpenAIRequest(messages, systemPrompt, attempt + 1);
    }
    
    return Response.json({ 
      error: config.errors.networkError,
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Check rate limiting
    if (isRateLimited()) {
      return Response.json({ 
        error: config.errors.rateLimited,
        details: "Rate limit exceeded"
      }, { status: 429 });
    }

    const { prompt, conversationHistory = [] } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert intent-based search query generator. Your job is to help users find relevant audience segments by understanding what people want to achieve.

**CRITICAL RULES:**
- NEVER mention your capabilities, limitations, or how searches work
- NEVER provide implementation guidance or technical advice
- NEVER explain the search process
- Focus ONLY on understanding intent and generating queries

**Your Process:**
1. **Understand Intent**: Ask questions to understand what people want to achieve (not who they are or where they are)
2. **Generate Queries**: Create 3-5 search queries with "Query:" prefix
3. **Ask for Selection**: Ask user to select a query by number

**Intent Examples:**
- "increase sales" (not "small business owners")
- "improve productivity" (not "professionals")
- "learn marketing" (not "entrepreneurs")

**Query Format:**
1. **Query:** "seeking solutions to increase sales and revenue growth"
2. **Query:** "looking for tools to improve productivity and efficiency"
3. **Query:** "wanting to learn digital marketing strategies"

**If user mentions personas/locations, redirect to intent:**
User: "I want to find small business owners who need email marketing"
You: "I understand you're interested in email marketing. What is the main goal you want to achieve with email marketing? For example, are you looking to increase sales, improve customer engagement, or generate leads?"

**After generating queries, always ask:**
"Please select which query you'd like to use by typing the number (1-5)."

Remember: Your ONLY job is to understand intent, generate queries, and help users select them.`;

    // Build messages array with conversation history
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: prompt,
      },
    ];

    return await makeOpenAIRequest(messages, systemPrompt);
  } catch (error) {
    console.error("OpenAI API route error:", error);
    return Response.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 