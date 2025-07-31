'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, TrendingUp, AlertCircle } from 'lucide-react';

interface SearchResult {
  title: string;
  link: string;
  score: number;
  snippet: string;
}

interface ScoreResponse {
  scoredResults: SearchResult[];
  feedback: string;
  averageScore: number;
  totalResults: number;
}

interface ScoreEvaluatorProps {
  onScoreGenerated?: (results: SearchResult[]) => void;
}

export default function ScoreEvaluator({ onScoreGenerated }: ScoreEvaluatorProps) {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [averageScore, setAverageScore] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);

  const handleGenerateScore = async () => {
    if (!topic.trim() || !description.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/score-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ScoreResponse = await response.json();
      setSearchResults(data.scoredResults);
      setFeedback(data.feedback);
      setAverageScore(data.averageScore);
      setTotalResults(data.totalResults);
      
      if (onScoreGenerated) {
        onScoreGenerated(data.scoredResults);
      }
    } catch (error) {
      console.error('Score generation error:', error);
      
      // Show error message to user instead of silent fallback
      setFeedback(`Error: ${error instanceof Error ? error.message : 'Failed to generate scores. Please try again.'}`);
      setSearchResults([]);
      setAverageScore(0);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">LLM Audience Targeting Validator</h2>
        <p className="text-gray-600">
          Test how well your audience description will work for LLM-based audience targeting
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Audience Description Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Search Topic *
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
              Audience Description *
            </label>
            <Textarea
              id="description"
              placeholder="Describe your target audience. What problem do they have? What solution are they looking for? Be specific about their role, industry, or pain points."
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
                Validating Audience Targeting...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Validate Audience Description
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Audience Targeting Validation Results</h3>
            <div className="text-sm text-gray-600">
              Average Relevance: <span className="font-medium">{Math.round(averageScore * 100)}%</span> 
              ({totalResults} search results analyzed)
            </div>
          </div>
          
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(result.score)}`}>
                          {getConfidenceLabel(result.score)} Relevance ({Math.round(result.score * 100)}%)
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{result.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{result.snippet}</p>
                          <a
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {result.link}
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

      {/* API Feedback Section */}
      {feedback && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="w-5 h-5" />
              AI Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 leading-relaxed">
              {feedback}
            </p>
          </CardContent>
        </Card>
      )}

      {/* General Tips Section */}
      {searchResults.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="w-5 h-5" />
            Understanding Audience Targeting Scores
          </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• <strong>High relevance</strong> (≥80%) means your description will work well for LLM audience targeting</p>
              <p>• <strong>Medium relevance</strong> (60-79%) suggests your description needs refinement for better targeting</p>
              <p>• <strong>Low relevance</strong> (&lt;60%) indicates your description is too broad for effective audience targeting</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 