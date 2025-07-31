'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, TrendingUp, AlertCircle } from 'lucide-react';

interface SearchResult {
  title: string;
  url: string;
  confidence: number;
  snippet: string;
}

interface ScoreEvaluatorProps {
  onScoreGenerated?: (results: SearchResult[]) => void;
}

export default function ScoreEvaluator({ onScoreGenerated }: ScoreEvaluatorProps) {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleGenerateScore = async () => {
    if (!topic.trim() || !description.trim()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          title: "How to Improve Email Deliverability in 2024",
          url: "https://example.com/email-deliverability-guide",
          confidence: 0.92,
          snippet: "Learn the latest strategies for improving email deliverability rates and avoiding spam filters..."
        },
        {
          title: "Cold Email Best Practices for B2B Sales",
          url: "https://example.com/cold-email-best-practices",
          confidence: 0.87,
          snippet: "Discover proven techniques for writing effective cold emails that get responses..."
        },
        {
          title: "Email Marketing Automation Tools Comparison",
          url: "https://example.com/email-automation-tools",
          confidence: 0.78,
          snippet: "Compare the top email marketing automation platforms and their features..."
        }
      ];
      
      setSearchResults(mockResults);
      setIsLoading(false);
      
      if (onScoreGenerated) {
        onScoreGenerated(mockResults);
      }
    }, 2000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Score Your Topic</h2>
        <p className="text-gray-600">
          Enter your topic and description to get scored search results with confidence ratings
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Topic & Description Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <Input
              id="topic"
              type="text"
              placeholder="e.g., Email deliverability, Cold email outreach, B2B sales automation..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              id="description"
              placeholder="Describe your topic in detail. What are you trying to achieve? Who is your target audience?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleGenerateScore}
            disabled={!topic.trim() || !description.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Score...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Score
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Scored Search Results</h3>
          
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(result.confidence)}`}>
                          {getConfidenceLabel(result.confidence)} ({Math.round(result.confidence * 100)}%)
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{result.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{result.snippet}</p>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {result.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {searchResults.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="w-5 h-5" />
              Improvement Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• <strong>High confidence results</strong> indicate strong topic relevance and search intent alignment</p>
              <p>• <strong>Medium confidence results</strong> may need more specific keywords or clearer description</p>
              <p>• <strong>Low confidence results</strong> suggest the topic might be too broad or needs refinement</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 