'use client';

import React, { useState } from 'react';
import SparkModeSelector from '@/components/SparkModeSelector';
import LensSelector from '@/components/LensSelector';
import TopicInput from '@/components/TopicInput';
import ScoreEvaluator from '@/components/ScoreEvaluator';
import { CustomModelResponse } from '@/lib/customModelPrompt';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  sources?: any[];
  timestamp: Date;
  queries?: string[]; // For storing generated queries
  searchResults?: any[]; // For storing search results
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [showQuerySelection, setShowQuerySelection] = useState(false);
  const [sparkMode, setSparkMode] = useState<'find' | 'custom' | 'score'>('find');
  const [showLensSelector, setShowLensSelector] = useState(false);
  const [selectedLens, setSelectedLens] = useState<string>('');
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customModelResult, setCustomModelResult] = useState<CustomModelResponse | null>(null);
  const [showScoreEvaluator, setShowScoreEvaluator] = useState(false);

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
      const formattedResults = formatSearchResults(searchData.results || []);
      const resultsMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: formattedResults.type === 'no-results' ? formattedResults.message : `🔍 Search Results for: "${query}"`,
        timestamp: new Date(),
        searchResults: formattedResults.type === 'cards' ? formattedResults.results : undefined,
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

  const formatSearchResults = (results: any[]): any => {
    if (results.length === 0) {
      return { type: 'no-results', message: "No relevant audience segments found for this query." };
    }

    return {
      type: 'cards',
      results: results.map((result, index) => {
        const score = result.score ? (result.score * 100).toFixed(1) : '0';
        
        // Try to get the topic and description from the result
        const topic = result.topic || result.metadata?.topic || 'Unknown Topic';
        const description = result.description || result.metadata?.description || '';
        const text = result.metadata?.text || result.text || '';
        
        // Build the display text
        let displayText = topic;
        if (description) {
          displayText += `: ${description}`;
        } else if (text) {
          displayText += `: ${text}`;
        }
        
        return {
          id: result.segment_id || `result-${index}`,
          topic: topic,
          description: description || text || 'No description available',
          score: score,
          segmentId: result.segment_id,
          metadata: result.metadata
        };
      })
    };
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    setShowQuerySelection(false);
    setSelectedQuery('');
    setShowLensSelector(false);
    setSelectedLens('');
  };

  const handleLensSelected = (lens: string, topic: string, subtopics?: string[]) => {
    setSelectedLens(lens);
    setSelectedTopic(topic);
    console.log('Selected lens:', lens, 'Topic:', topic, 'Subtopics:', subtopics);
    
    let content = `Great! You've selected the **${lens}** lens for creating your custom model.`;
    
    if (topic) {
      content += `\n\n**Topic:** ${topic}`;
    }
    
    if (subtopics && subtopics.length > 0) {
      content += `\n\n💡 **AI-Generated Subtopics:**\n`;
      subtopics.forEach((subtopic, index) => {
        content += `\n${index + 1}. ${subtopic}`;
      });
      content += `\n\nNow let's generate your custom model with topic names and description.`;
    } else {
      content += `\n\nNow let's generate your custom model with topic names and description.`;
    }
    
    // Add a message to the chat showing the selected lens
    const lensMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, lensMessage]);
    setShowLensSelector(false);
    setShowTopicInput(true);
  };

  const handleCustomModelComplete = (result: CustomModelResponse) => {
    setCustomModelResult(result);
    
    let content = `🎉 **Custom Model Generated Successfully!**\n\n`;
    content += `**Topic Names:**\n`;
    content += `1. ${result.name1}\n`;
    content += `2. ${result.name2}\n`;
    content += `3. ${result.name3}\n\n`;
    content += `**Description:**\n${result.description}\n\n`;
    content += `Your custom model is ready for audience modeling!`;
    
    const customModelMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, customModelMessage]);
    setShowTopicInput(false);
  };

  const handleSparkModeChange = (mode: 'find' | 'custom' | 'score') => {
    setSparkMode(mode);
    console.log('SPARK Mode changed to:', mode);
    
    if (mode === 'custom') {
      // Show lens selector when "Create Custom Model" is selected
      setShowLensSelector(true);
      setShowQuerySelection(false);
      setSelectedQuery('');
      setShowTopicInput(false);
      setCustomModelResult(null);
      setShowScoreEvaluator(false);
    } else if (mode === 'score') {
      // Show score evaluator when "Score" is selected
      setShowScoreEvaluator(true);
      setShowLensSelector(false);
      setShowQuerySelection(false);
      setSelectedQuery('');
      setShowTopicInput(false);
      setCustomModelResult(null);
    } else {
      // Hide all custom components when switching back to "Find Audience"
      setShowLensSelector(false);
      setSelectedLens('');
      setShowTopicInput(false);
      setSelectedTopic('');
      setCustomModelResult(null);
      setShowScoreEvaluator(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔥 SPARK AI BETA
          </h1>
          <p className="text-lg text-gray-600">
            Expert query generator for 1024 Dimension Vector Embeddings
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
                  
                  {/* Search Results (for assistant messages) */}
                  {message.searchResults && message.searchResults.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">🔍 Search Results:</p>
                      <div className="space-y-3">
                        {message.searchResults.map((result, index) => (
                          <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <button
                                  onClick={() => copyToClipboard(result.topic)}
                                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                                  title="Click to copy topic name"
                                >
                                  📋 {result.topic}
                                </button>
                                <p className="text-xs text-gray-600 mt-1">{result.description}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <span className="text-xs text-gray-500">Score: {result.score}%</span>
                                  <span className="text-xs text-gray-400">ID: {result.segmentId}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {showLensSelector && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 w-full">
                  <LensSelector onLensSelected={handleLensSelected} />
                </div>
              </div>
            )}

            {showTopicInput && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 w-full">
                  <TopicInput 
                    topic={selectedTopic}
                    lens={selectedLens}
                    onComplete={handleCustomModelComplete}
                  />
                </div>
              </div>
            )}

            {showScoreEvaluator && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 w-full">
                  <ScoreEvaluator 
                    onScoreGenerated={(results) => {
                      console.log('Score results:', results);
                      // You can add logic here to handle the results
                    }}
                  />
                </div>
              </div>
            )}
            
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
            {/* SPARK Mode Selector */}
            <div className="mb-4 flex justify-start">
              <SparkModeSelector 
                onSparkModeChange={handleSparkModeChange}
                defaultValue={sparkMode}
              />
            </div>
            
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  sparkMode === 'find' 
                    ? "Describe what audience segments you're looking for..."
                    : "Describe the custom model you want to create..."
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
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
          <p>✅ SPARK AI BETA is running successfully</p>
          <p>🔗 Connected to Pinecone vector database</p>
          <p>🤖 Powered by OpenAI GPT-4 query generation</p>
          <p>🧠 1024 Dimension Vector Embeddings</p>
        </div>
      </div>
    </div>
  );
}
