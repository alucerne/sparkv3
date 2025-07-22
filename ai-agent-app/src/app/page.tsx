'use client';

import React, { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  sources?: any[];
  timestamp: Date;
  queries?: string[]; // For storing generated queries
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [showQuerySelection, setShowQuerySelection] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');
    setShowQuerySelection(false);
    setSelectedQuery('');

    try {
      // Generate AI response (this will include generated queries)
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI response failed: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      
      // Extract queries from the response if they exist
      const queries = extractQueriesFromResponse(aiData.response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiData.response || 'I apologize, but I couldn\'t generate a response.',
        reasoning: aiData.reasoning,
        sources: aiData.sources,
        timestamp: new Date(),
        queries: queries.length > 0 ? queries : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Show query selection if queries were generated
      if (queries.length > 0) {
        setShowQuerySelection(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const extractQueriesFromResponse = (response: string): string[] => {
    const queries: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*Query:\s*(.+)$/);
      if (match) {
        queries.push(match[1].trim());
      }
    }
    
    return queries;
  };

  const handleQuerySelection = async (query: string) => {
    setSelectedQuery(query);
    setLoading(true);
    setError('');

    try {
      // Send the selected query to the search endpoint
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query, top_k: 10 }),
      });

      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      
      // Create a message showing the search results
      const resultsMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔍 Search Results for: "${query}"\n\n${formatSearchResults(searchData.results || [])}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, resultsMessage]);
      setShowQuerySelection(false);
      setSelectedQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const formatSearchResults = (results: any[]): string => {
    if (results.length === 0) {
      return "No relevant audience segments found for this query.";
    }

    return results.map((result, index) => {
      const score = result.score ? ` (Score: ${(result.score * 100).toFixed(1)}%)` : '';
      const text = result.metadata?.text || result.text || 'No text available';
      return `${index + 1}. ${text}${score}`;
    }).join('\n\n');
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    setShowQuerySelection(false);
    setSelectedQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔥 SPARK AI Semantic Search
          </h1>
          <p className="text-lg text-gray-600">
            Expert query generator for BAAI/bge-large-en-v1.5 embeddings
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Tell me what you're looking for, and I'll generate optimized search queries for your audience segments
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg h-[70vh] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-lg">Start a conversation with SPARK AI</p>
                <p className="text-sm">Ask me anything and I'll search my knowledge base to help you!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Reasoning (for assistant messages) */}
                  {message.reasoning && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">🤔 Reasoning:</p>
                      <p className="text-xs text-gray-600">{message.reasoning}</p>
                    </div>
                  )}
                  
                  {/* Sources (for assistant messages) */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">📚 Sources:</p>
                      <div className="space-y-1">
                        {message.sources.map((source, index) => (
                          <p key={index} className="text-xs text-gray-600">
                            • {source.metadata?.text?.substring(0, 100)}...
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Queries (for assistant messages) */}
                  {message.queries && message.queries.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">🔍 Select a search query:</p>
                      <div className="space-y-2">
                        {message.queries.map((query, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuerySelection(query)}
                            disabled={loading}
                            className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-blue-800 font-medium">
                                {index + 1}. {query}
                              </span>
                              <span className="text-xs text-blue-600">Click to search</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Click on any query above to search for relevant audience segments
                      </p>
                    </div>
                  )}
                  
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">SPARK AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mx-4 mb-4">
              <p className="text-red-800 text-sm">Error: {error}</p>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe what audience segments you're looking for..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
              <button
                onClick={clearChat}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>✅ SPARK AI Semantic Search is running successfully</p>
          <p>🔗 Connected to Pinecone vector database</p>
          <p>🤖 Powered by OpenAI GPT-4 query generation</p>
          <p>🧠 BAAI/bge-large-en-v1.5 embedding optimization</p>
        </div>
      </div>
    </div>
  );
}
