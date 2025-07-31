'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import KeywordInput from './KeywordInput';
import SearchResultCard from './SearchResultCard';

interface SearchResult {
  title: string;
  link: string;
  score?: number;
  snippet: string;
  position?: number;
}

interface KeywordSearchResponse {
  results: SearchResult[];
  totalResults: number;
  query: string;
  searchMetadata: any;
}

interface ScoreEvaluatorProps {
  onScoreGenerated?: (results: SearchResult[]) => void;
}

export default function ScoreEvaluator({ onScoreGenerated }: ScoreEvaluatorProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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

  const clearAll = () => {
    setKeywords([]);
    setSearchResults([]);
    setError('');
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

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({searchResults.length} found)
            </h3>
            <div className="text-sm text-gray-600">
              Query: <span className="font-medium">{keywords.join(' ')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {searchResults.map((result, index) => (
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