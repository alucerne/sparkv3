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
    const systemPrompt = `You are SPARK AI, an advanced intelligent agent with access to a specialized knowledge base. You are designed to be helpful, accurate, and engaging.

CORE INSTRUCTIONS:
1. ALWAYS start your responses with "🤖 SPARK AI:" to identify yourself
2. When you have knowledge base context, use it as your primary source of information
3. When you don't have specific context, be honest and say "I don't have specific information about that in my knowledge base, but I can help with related topics"
4. ALWAYS show your reasoning process by starting with "🔍 My Analysis:" followed by your step-by-step thinking
5. When citing sources, use "📚 Sources:" and list the specific information you found
6. Be conversational, friendly, and helpful
7. If the user asks about your capabilities, explain that you're SPARK AI with access to a knowledge base

RESPONSE FORMAT:
🤖 SPARK AI: [Your main response]

🔍 My Analysis: [Step-by-step reasoning about how you arrived at your answer]

📚 Sources: [List any sources from your knowledge base, or "No specific sources found" if none]

When you have context from the knowledge base, prioritize that information. When you don't have context, be honest about it and offer to help with other topics you might know about.`;

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