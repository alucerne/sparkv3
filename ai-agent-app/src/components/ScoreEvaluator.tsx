'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, TrendingUp, AlertCircle, RefreshCw, Trash2, Target, BarChart3 } from 'lucide-react';
import KeywordInput from './KeywordInput';
import SearchResultCard from './SearchResultCard';

interface SearchResult {
  title: string;
  link: string;
  score?: number;
  snippet: string;
  position?: number;
  feedback?: string;
}

interface KeywordSearchResponse {
  results: SearchResult[];
  totalResults: number;
  query: string;
  searchMetadata: any;
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
  const [keywords, setKeywords] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [scoredResults, setScoredResults] = useState<SearchResult[]>([]);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string>('');
  const [averageScore, setAverageScore] = useState<number>(0);
  const [overallFeedback, setOverallFeedback] = useState<string>('');

  const handleKeywordsChange = (newKeywords: string[]) => {
    setKeywords(newKeywords);
    setError('');
  };

  const fetchSearchResults = async () => {
    if (keywords.length === 0) {
      setError('Please enter at least one keyword');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const joinedKeywords = keywords.join(' ');
      const response = await fetch(`/api/fetch-keyword-results?keywords=${encodeURIComponent(joinedKeywords)}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: KeywordSearchResponse = await response.json();
      setSearchResults(data.results);
      
      if (onScoreGenerated) {
        onScoreGenerated(data.results);
      }
    } catch (error) {
      console.error('Search results error:', error);
      setError(`Failed to fetch search results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateScores = async () => {
    if (!description.trim() || searchResults.length === 0) {
      setError('Please enter a description and have search results to score');
      return;
    }

    setIsScoring(true);
    setError('');
    
    try {
      const response = await fetch('/api/score-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          keywords: keywords,
          searchResults: searchResults.map(r => ({
            title: r.title,
            snippet: r.snippet,
            link: r.link,
            position: r.position
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ScoreResponse = await response.json();
      setScoredResults(data.scoredResults);
      setAverageScore(data.averageScore);
      setOverallFeedback(data.feedback);
      
      if (onScoreGenerated) {
        onScoreGenerated(data.scoredResults);
      }
    } catch (error) {
      console.error('Score generation error:', error);
      setError(`Failed to generate scores: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsScoring(false);
    }
  };

  const clearAll = () => {
    setKeywords([]);
    setSearchResults([]);
    setScoredResults([]);
    setDescription('');
    setError('');
    setAverageScore(0);
    setOverallFeedback('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Keyword-Based Search Results</h2>
        <p className="text-gray-600">
          Enter keywords to fetch and analyze search results for audience targeting validation
        </p>
      </div>

      {/* Keyword Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Keyword Input
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KeywordInput onKeywordsChange={handleKeywordsChange} maxKeywords={10} />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={fetchSearchResults}
          disabled={keywords.length === 0 || isLoading}
          className="px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Fetching Results...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Results
            </>
          )}
        </Button>

        {searchResults.length > 0 && (
          <>
            <Button
              onClick={fetchSearchResults}
              disabled={isLoading}
              variant="outline"
              className="px-6"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              className="px-6"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </>
        )}
      </div>

      {/* Description Input */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Audience Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your target audience *
              </label>
              <Textarea
                id="description"
                placeholder="Describe your target audience. What problem do they have? What solution are they looking for? Be specific about their role, industry, or pain points."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px]"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={generateScores}
                disabled={!description.trim() || isScoring}
                className="px-6"
              >
                {isScoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Scores...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Scores
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Overall Score Summary */}
      {scoredResults.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BarChart3 className="w-5 h-5" />
              Scoring Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Average Relevance Score:</span>
                <span className="text-lg font-bold text-blue-900">
                  {Math.round(averageScore * 100)}%
                </span>
              </div>
              {overallFeedback && (
                <div className="text-sm text-blue-800 bg-blue-100 p-3 rounded-md">
                  <strong>Analysis:</strong> {overallFeedback}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {scoredResults.length > 0 ? 'Scored Results' : 'Search Results'} ({scoredResults.length > 0 ? scoredResults.length : searchResults.length} found)
            </h3>
            <div className="text-sm text-gray-600">
              Query: <span className="font-medium">{keywords.join(' ')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {(scoredResults.length > 0 ? scoredResults : searchResults).map((result, index) => (
              <SearchResultCard 
                key={index} 
                result={result} 
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {searchResults.length === 0 && !isLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="w-5 h-5" />
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• <strong>Enter keywords</strong> related to your target audience or topic</p>
              <p>• <strong>Press Enter or comma</strong> to add each keyword as a bubble</p>
              <p>• <strong>Click "Generate Results"</strong> to fetch search results from Google</p>
              <p>• <strong>Review the results</strong> to see what content your audience is consuming</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 