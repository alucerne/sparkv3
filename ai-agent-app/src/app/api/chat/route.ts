import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // For now, we'll create a simple response that uses the context
    // In a full implementation, this would call OpenAI's API
    let response = "I'm here to help!";
    let reasoning = "Processing your request...";
    let sources = [];

    if (context) {
      reasoning = `I found relevant context from your knowledge base to help answer your question.`;
      sources = context.split('\n\n').map((text: string, index: number) => ({
        id: index,
        metadata: { text: text.substring(0, 200) + '...' }
      }));
      
      response = `Based on the information I found, here's what I can tell you about "${message}":\n\n${context.substring(0, 500)}...\n\nWould you like me to search for more specific information?`;
    } else {
      reasoning = "I couldn't find specific context in your knowledge base, but I'm here to help with general questions.";
      response = `I don't have specific information about "${message}" in my knowledge base, but I'd be happy to help you with other questions or search for different topics.`;
    }

    return NextResponse.json({
      response,
      reasoning,
      sources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 