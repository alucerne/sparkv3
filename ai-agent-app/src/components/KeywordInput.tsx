'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface KeywordInputProps {
  onKeywordsChange: (keywords: string[]) => void;
  maxKeywords?: number;
}

export default function KeywordInput({ 
  onKeywordsChange, 
  maxKeywords = 10 
}: KeywordInputProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword) && keywords.length < maxKeywords) {
      const newKeywords = [...keywords, trimmedKeyword];
      setKeywords(newKeywords);
      onKeywordsChange(newKeywords);
      setInputValue('');
    }
  };

  const removeKeyword = (indexToRemove: number) => {
    const newKeywords = keywords.filter((_, index) => index !== indexToRemove);
    setKeywords(newKeywords);
    onKeywordsChange(newKeywords);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(inputValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Auto-add keyword if comma is entered
    if (value.includes(',')) {
      const parts = value.split(',');
      const keywordToAdd = parts[0].trim();
      if (keywordToAdd) {
        addKeyword(keywordToAdd);
        setInputValue(parts.slice(1).join(',').trim());
      }
    }
  };

  const handleAddClick = () => {
    addKeyword(inputValue);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Keywords ({keywords.length}/{maxKeywords})
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type keywords and press Enter or comma (e.g., cold email, deliverability, inbox placement)"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={keywords.length >= maxKeywords}
          />
          <Button
            onClick={handleAddClick}
            disabled={!inputValue.trim() || keywords.length >= maxKeywords}
            size="sm"
            className="px-4"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Press Enter or comma to add keywords. Maximum {maxKeywords} keywords allowed.
        </p>
      </div>

      {/* Keyword Bubbles */}
      {keywords.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Keywords:</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => removeKeyword(index)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Remove keyword"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Clear All Button */}
          <Button
            onClick={() => {
              setKeywords([]);
              onKeywordsChange([]);
            }}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Clear All Keywords
          </Button>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(keywords.length / maxKeywords) * 100}%` }}
        />
      </div>
    </div>
  );
} 