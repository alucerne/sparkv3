'use client';

import React, { useState } from 'react';
import { ChevronDown, Search, Settings, TrendingUp } from 'lucide-react';

interface SparkModeSelectorProps {
  onSparkModeChange: (mode: 'find' | 'custom' | 'score') => void;
  defaultValue?: 'find' | 'custom' | 'score';
}

export default function SparkModeSelector({ 
  onSparkModeChange, 
  defaultValue = 'find' 
}: SparkModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'find' | 'custom' | 'score'>(defaultValue);

  const handleModeSelect = (mode: 'find' | 'custom' | 'score') => {
    setSelectedMode(mode);
    onSparkModeChange(mode);
    setIsOpen(false);
  };

  const getModeLabel = (mode: 'find' | 'custom' | 'score') => {
    switch (mode) {
      case 'find': return 'Find Audience';
      case 'custom': return 'Create Custom Model';
      case 'score': return 'Score';
      default: return 'Find Audience';
    }
  };

  const getModeIcon = (mode: 'find' | 'custom' | 'score') => {
    switch (mode) {
      case 'find': return <Search className="w-4 h-4" />;
      case 'custom': return <Settings className="w-4 h-4" />;
      case 'score': return <TrendingUp className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      {/* Tools Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        <span className="text-sm font-medium">Tools</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-50">
          <div className="py-2">
            {/* Find Audience Option */}
            <button
              onClick={() => handleModeSelect('find')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-600 transition-colors ${
                selectedMode === 'find' ? 'bg-gray-600' : ''
              }`}
            >
              <Search className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Find Audience</span>
            </button>

                                    {/* Create Custom Model Option */}
                        <button
                          onClick={() => handleModeSelect('custom')}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-600 transition-colors ${
                            selectedMode === 'custom' ? 'bg-gray-600' : ''
                          }`}
                        >
                          <Settings className="w-4 h-4 text-white" />
                          <span className="text-white text-sm">Create Custom Model</span>
                        </button>

                        {/* Score Option */}
                        <button
                          onClick={() => handleModeSelect('score')}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-600 transition-colors ${
                            selectedMode === 'score' ? 'bg-gray-600' : ''
                          }`}
                        >
                          <TrendingUp className="w-4 h-4 text-white" />
                          <span className="text-white text-sm">Score</span>
                        </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 