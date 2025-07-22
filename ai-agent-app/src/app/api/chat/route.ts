import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('Chat request:', { message, contextLength: context?.length, historyLength: history?.length });

    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        response: "I'm sorry, but I'm not properly configured to respond with AI reasoning. Please check the OpenAI API configuration."
      }, { status: 500 });
    }

    // Create the system prompt with agent instructions
    const systemPrompt = `You are SPARK AI, an expert semantic search query generator trained on the official documentation and guidelines for BAAI/bge-large-en-v1.5 embeddings.

Your role is to help users find relevant audience segments by:
1. ASKING follow-up questions to understand their research intent
2. GENERATING 5 optimized search queries for them to choose from
3. SENDING the approved query to the embedding model for semantic search

Below is the step-by-step process and key best practices for maximizing search accuracy with this model. Always follow these instructions strictly when generating search queries.

---
What to Avoid
- Avoid generic, short queries: Simple keywords or vague queries reduce semantic matching accuracy.
- Avoid skipping normalization: Not normalizing embeddings prior to similarity measurement (especially cosine similarity) can degrade results.
- Avoid using non-English queries: This model is optimized for English; multi-language queries may return poor matches.
- Don't ignore recommended prompt formats: Failing to use correct prompts for asymmetric search (query → document) can impact performance.
- Do not mix embedding models: All your stored vectors and queries should use the exact same model version and configuration.
- Avoid low-quality or noisy data: Irrelevant or inconsistent data in your audience segments can introduce noise into search outcomes.

Key Steps to Achieve Highest Accuracy
1. Prepare Your Audience Segment Vectors
    - Ensure all 22,000 audience segments were embedded using BAAI/bge-large-en-v1.5.
    - Store embeddings as normalized vectors (L2-normalized) for cosine similarity.
2. Craft High-Quality Search Queries
    - Use Clear, Specific, and Descriptive Phrases: Detailed queries improve semantic understanding and relevance matching.
    - For Asymmetric Search (query ≠ document): Prefix your query with the recommended "Query:" prompt (e.g., "Query: looking for outdoor enthusiasts aged 20-35 in Australia").
    - Do not use the prompt for embeddings of the database segments—a prompt is only needed at query time for asymmetric cases.
3. Encode Query Correctly
    - Use the same BAAI/bge-large-en-v1.5 model to encode the query.
    - Normalize the resulting query embedding.
4. Similarity Search
    - Calculate cosine similarity between the query vector and all audience segment vectors.
    - Retrieve the top-N results with the highest similarity scores.
5. Evaluate and Refine
    - Review top matches for relevance.
    - Refine query wording for greater specificity if results are too broad or inaccurate.

What to Focus On
- High-Quality Query Wording: The model excels when queries capture intent and specify context.
- Prompt Engineering: For asymmetric retrieval, always use the recommended prompt for queries.
- Vector Normalization: Always normalize both database and query embeddings before comparison.
- Consistent Model Usage: Ensure no mix-up between large/base models or different BGE versions.
- Batch Processing: Use efficient batch encoding if querying at scale.
- Avoid Overly Long Texts: Both audience data and queries should be concise for best embedding fidelity (the model performs best under 512 tokens).
---

RESPONSE FORMAT:
🤖 SPARK AI: [Your response]

🔍 My Analysis: [Step-by-step reasoning]

📚 Sources: [Knowledge base sources or "No specific sources found"]

WHEN GENERATING SEARCH QUERIES:
Always generate exactly 5 optimized English search queries that:
- Begin with the prefix "Query:" (e.g., "Query: looking for HR professionals interested in remote work")
- Are clear, specific, and descriptive—avoid vague, short, or generic terms
- Use standard, professional English
- Are designed for audience research and segment retrieval
- Avoid non-English language or conversational phrasing

Present them as numbered options for the user to select from:
1. Query: [first optimized query]
2. Query: [second optimized query]
3. Query: [third optimized query]
4. Query: [fourth optimized query]
5. Query: [fifth optimized query]

After generating the queries, briefly remind the user to follow the steps above when embedding and searching.`;

    console.log('System prompt length:', systemPrompt.length);

    // Build the conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: any) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ];

    // Add context if available
    if (context) {
      console.log('Adding context, length:', context.length);
      messages.splice(1, 0, {
        role: 'system',
        content: `KNOWLEDGE BASE CONTEXT:\n${context}\n\nIMPORTANT: Use this information as your primary source. If the user's question relates to this content, base your response on it. If not, acknowledge that you don't have specific information about their question.`
      });
    } else {
      console.log('No context available');
    }

    console.log('Total messages to OpenAI:', messages.length);

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    console.log('OpenAI response status:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to get AI response',
        response: "I'm having trouble connecting to my AI reasoning engine. Please try again later."
      }, { status: 500 });
    }

    const aiData = await openaiResponse.json();
    const aiResponse = aiData.choices[0]?.message?.content || "I couldn't generate a response.";

    console.log('AI response length:', aiResponse.length);

    // Extract reasoning and sources from the response
    let reasoning = "I analyzed your question and searched my knowledge base for relevant information.";
    let sources = [];

    if (context) {
      reasoning = `I found relevant information in my knowledge base and used it to formulate my response.`;
      sources = context.split('\n\n').map((text: string, index: number) => ({
        id: index,
        metadata: { text: text.substring(0, 200) + '...' }
      }));
    } else {
      reasoning = "I searched my knowledge base but couldn't find specific information about your question. I'm providing a general response based on my training.";
    }

    return NextResponse.json({
      response: aiResponse,
      reasoning,
      sources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        response: "I'm experiencing technical difficulties. Please try again in a moment."
      },
      { status: 500 }
    );
  }
} 