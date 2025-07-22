import { getClaudeConfig } from '../../../lib/claude-config';

const config = getClaudeConfig();

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

async function makeClaudeRequest(messages: any[], systemPrompt: string, attempt: number = 1): Promise<Response> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.CLAUDE_API_KEY!,
        "anthropic-version": config.api.version,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: config.api.model,
        max_tokens: config.api.maxTokens,
        temperature: config.api.temperature,
        system: systemPrompt,
        messages: messages,
      }),
    });

    // Handle specific error cases
    if (response.status === 529) {
      if (attempt < config.retry.maxRetries) {
        const delayMs = calculateBackoffDelay(attempt);
        console.log(`Claude API overloaded (attempt ${attempt}/${config.retry.maxRetries}), retrying in ${delayMs}ms...`);
        await delay(delayMs);
        return makeClaudeRequest(messages, systemPrompt, attempt + 1);
      } else {
        return Response.json({ 
          error: config.errors.overloaded,
          details: "Max retries exceeded for overloaded API",
          retryAfter: config.retryAfter.overloaded
        }, { status: 503 });
      }
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfter ? parseInt(retryAfter) : config.retryAfter.rateLimited;
      
      if (attempt < config.retry.maxRetries) {
        console.log(`Rate limited (attempt ${attempt}/${config.retry.maxRetries}), retrying in ${retryAfterSeconds * 1000}ms...`);
        await delay(retryAfterSeconds * 1000);
        return makeClaudeRequest(messages, systemPrompt, attempt + 1);
      } else {
        return Response.json({ 
          error: config.errors.rateLimited,
          details: "Max retries exceeded for rate limit",
          retryAfter: retryAfterSeconds
        }, { status: 429 });
      }
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Claude API error:", response.status, errorData);
      
      // If the specific model is not found, try with the base model name
      if (response.status === 404 && errorData.includes("model")) {
        console.log("Trying with base model name...");
        return makeClaudeRequestWithFallback(messages, systemPrompt, attempt);
      }
      
      return Response.json({ 
        error: `Claude API error: ${response.status}`,
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data?.content?.[0]?.text) {
      console.error("Unexpected Claude API response:", data);
      return Response.json({ 
        error: "Unexpected response format from Claude API",
        details: data 
      }, { status: 500 });
    }

    return Response.json({ text: data.content[0].text });
  } catch (error) {
    console.error("Claude API request error:", error);
    
    if (attempt < config.retry.maxRetries) {
      const delayMs = calculateBackoffDelay(attempt);
      console.log(`Network error (attempt ${attempt}/${config.retry.maxRetries}), retrying in ${delayMs}ms...`);
      await delay(delayMs);
      return makeClaudeRequest(messages, systemPrompt, attempt + 1);
    }
    
    return Response.json({ 
      error: config.errors.networkError,
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

async function makeClaudeRequestWithFallback(messages: any[], systemPrompt: string, attempt: number = 1): Promise<Response> {
  try {
    const fallbackResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.CLAUDE_API_KEY!,
        "anthropic-version": config.api.version,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: config.api.fallbackModel,
        max_tokens: config.api.maxTokens,
        temperature: config.api.temperature,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!fallbackResponse.ok) {
      const fallbackErrorData = await fallbackResponse.text();
      console.error("Claude API fallback error:", fallbackResponse.status, fallbackErrorData);
      
      if (fallbackResponse.status === 529 && attempt < config.retry.maxRetries) {
        const delayMs = calculateBackoffDelay(attempt);
        console.log(`Fallback API overloaded (attempt ${attempt}/${config.retry.maxRetries}), retrying in ${delayMs}ms...`);
        await delay(delayMs);
        return makeClaudeRequestWithFallback(messages, systemPrompt, attempt + 1);
      }
      
      if (fallbackResponse.status === 529) {
        return Response.json({ 
          error: config.errors.overloaded,
          details: "API overloaded - temporary issue"
        }, { status: 503 });
      }
      
      return Response.json({ 
        error: `Claude API fallback error: ${fallbackResponse.status}`,
        details: fallbackErrorData 
      }, { status: fallbackResponse.status });
    }

    const fallbackData = await fallbackResponse.json();
    
    if (!fallbackData?.content?.[0]?.text) {
      console.error("Unexpected Claude API fallback response:", fallbackData);
      return Response.json({ 
        error: "Unexpected response format from Claude API",
        details: fallbackData 
      }, { status: 500 });
    }

    return Response.json({ text: fallbackData.content[0].text });
  } catch (error) {
    console.error("Claude API fallback request error:", error);
    
    if (attempt < config.retry.maxRetries) {
      const delayMs = calculateBackoffDelay(attempt);
      console.log(`Fallback network error (attempt ${attempt}/${config.retry.maxRetries}), retrying in ${delayMs}ms...`);
      await delay(delayMs);
      return makeClaudeRequestWithFallback(messages, systemPrompt, attempt + 1);
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

    const { prompt, conversationHistory = [], searchResults } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert semantic search query generator trained on the official documentation and guidelines for BAAI/bge-large-en-v1.5 embeddings.

Your role is to help users find the most relevant audience segments through natural conversation, then generating optimized search queries.

## Your Conversation Approach:

### Step 1: Natural Conversation
- Ask **ONE question at a time** to understand their needs
- Be conversational and friendly, not robotic
- Build on previous answers naturally
- Don't repeat questions that have already been answered
- If you have enough information, move to query generation

### Step 2: Information Gathering
Ask about these aspects **one at a time**:
- **Target Audience**: Who exactly are they looking for? (age, profession, interests, behavior)
- **Geographic Scope**: Any specific locations or regions?
- **Intent/Behavior**: What are these people trying to do or achieve?
- **Industry Context**: What business context or industry is this for?

### Step 3: Generate Optimized Queries
Once you have enough information, generate 3-5 optimized English search queries with "Query:" prefix following these guidelines:

**What to Avoid:**
- Generic, short queries that reduce semantic matching accuracy
- Skipping normalization of embeddings
- Non-English queries (model optimized for English)
- Ignoring recommended prompt formats for asymmetric search
- Mixing embedding models
- Low-quality or noisy data

**Key Steps for Highest Accuracy:**
1. Use clear, specific, and descriptive phrases
2. Prefix queries with "Query:" for asymmetric search
3. Use the same BAAI/bge-large-en-v1.5 model for encoding
4. Normalize embeddings for cosine similarity
5. Keep queries under 512 tokens for best performance

**What to Focus On:**
- High-quality query wording that captures intent and context
- Professional English designed for audience research
- Specificity over generality
- Action-oriented language

### Step 4: Provide Implementation Guidance
After generating queries, briefly remind users about:
- Using BAAI/bge-large-en-v1.5 for encoding
- L2-normalization of vectors
- Cosine similarity for comparison
- Reviewing and refining results

### Step 5: Process Search Results (if provided)
If search results are provided, format them as structured audience suggestion cards:

**CRITICAL: NEVER alter, rephrase, or modify the topic names. Use them exactly as provided.**

Format each result as a card with:
- **Topic Name**: [exact topic name from results - DO NOT CHANGE]
- **Similarity Score**: [score as percentage]
- **Audience Description**: [brief description of this audience segment]

Example format:
\`\`\`
📋 **Audience Suggestion Card**

**Topic Name**: Digital Marketing Professionals
**Similarity Score**: 94.2%
**Audience Description**: Marketing professionals focused on digital channels including social media, SEO, and online advertising. They actively seek tools and strategies to improve campaign performance and ROI.

---
\`\`\`

**Important Rules for Processing Results:**
1. **PRESERVE TOPIC NAMES**: Never rephrase, summarize, or alter the exact topic name
2. **ACCURATE SCORES**: Display similarity scores as percentages (score * 100)
3. **CONCISE DESCRIPTIONS**: Provide brief, relevant audience descriptions
4. **STRUCTURED FORMAT**: Use consistent card formatting for all results
5. **NO PARAPHRASING**: Use topic names exactly as they appear in the data

## Conversation Examples:

**First Interaction:**
User: "I want to find people interested in sustainable fashion"
You: "That sounds interesting! To help you find the right audience segments, I'd like to understand who specifically you're looking for. Are you targeting consumers who buy sustainable fashion, or professionals working in the sustainable fashion industry?"

**Second Interaction:**
User: "Consumers who buy sustainable fashion"
You: "Great! Now I'm curious about the age range. Are you looking for younger consumers (like Gen Z and Millennials), or a broader age range?"

**After getting enough info:**
You: "Perfect! Based on what you've told me, here are some optimized search queries:

1. 'Query: environmentally conscious fashion consumers aged 25-40 who actively seek sustainable clothing brands and ethical manufacturing practices'
2. 'Query: consumers who prioritize sustainable fashion choices including recycled materials, fair trade clothing, and zero-waste fashion alternatives'

Remember to use BAAI/bge-large-en-v1.5 for encoding these queries and ensure proper L2-normalization for optimal results."

## Important:
- Ask ONE question at a time for natural conversation flow
- Don't repeat questions already answered
- Be conversational and build on previous responses
- Generate queries only when you have sufficient context
- Provide implementation reminders after query generation
- When processing search results, NEVER alter topic names
- Format audience suggestions as structured cards

Process the following user input accordingly, considering the conversation history and any provided search results.`;

    // Build messages array with conversation history
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: searchResults ? 
          `User query: ${prompt}\n\nSearch Results:\n${JSON.stringify(searchResults, null, 2)}\n\nPlease format these results as audience suggestion cards, preserving the exact topic names.` : 
          prompt,
      },
    ];

    return await makeClaudeRequest(messages, systemPrompt);
  } catch (error) {
    console.error("Claude API route error:", error);
    return Response.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 