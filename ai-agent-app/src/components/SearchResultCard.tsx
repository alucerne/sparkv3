'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  position?: number;
}

interface SearchResultCardProps {
  result: SearchResult;
  index?: number;
}

export default function SearchResultCard({ result, index }: SearchResultCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-gray-900 leading-tight">
            {index !== undefined && (
              <span className="inline-block w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold text-center mr-2">
                {index + 1}
              </span>
            )}
            {truncateText(result.title, 80)}
          </CardTitle>
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0 ml-2"
            title="Open link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
          {truncateText(result.snippet, 200)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            {getDomainFromUrl(result.link)}
          </span>
          {result.position && (
            <span className="text-xs text-gray-400">
              Position: {result.position}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 