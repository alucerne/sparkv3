import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Copy, Check } from 'lucide-react';

interface AudienceCardProps {
  topic: string;
  topic_id: string;
  score: number;
  segment_id: string;
  method: string;
  audienceDescription?: string;
}

export function AudienceCard({ 
  topic, 
  topic_id, 
  score, 
  segment_id, 
  method, 
  audienceDescription 
}: AudienceCardProps) {
  const [copied, setCopied] = useState(false);
  const similarityPercentage = (score * 100).toFixed(1);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(topic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  return (
    <Card className="w-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold text-gray-900">
              {topic}
            </CardTitle>
            <button
              onClick={copyToClipboard}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors group"
              title="Copy topic name"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
              )}
            </button>
          </div>
          <Badge 
            variant={method === 'semantic_search' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {method === 'semantic_search' ? 'AI Search' : 'Instant'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Similarity Score:</span>
            <span className="font-medium text-blue-600">{similarityPercentage}%</span>
          </div>
          
          {audienceDescription && (
            <div className="text-xs text-gray-700 bg-blue-50 border border-blue-200 p-3 rounded-md">
              <span className="font-medium text-blue-800">🎯 Audience Description:</span>
              <p className="mt-1 text-gray-800">{audienceDescription}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Segment ID: {segment_id}</span>
            {topic_id !== 'N/A' && <span>Topic ID: {topic_id}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 