'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  Package, 
  Target, 
  Settings, 
  Wrench, 
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getLensSubtopics, PerplexityResponse } from '@/lib/perplexity';

interface LensSelectorProps {
  onLensSelected: (lens: string, topic: string, subtopics?: string[]) => void;
}

const lenses = [
  {
    name: 'Brand',
    description: 'A company or organization identity',
    icon: Building2
  },
  {
    name: 'Product',
    description: 'A specific item or offering',
    icon: Package
  },
  {
    name: 'Solution',
    description: 'An outcome or benefit people want',
    icon: Target
  },
  {
    name: 'Function',
    description: 'A role or responsibility in an organization',
    icon: Settings
  },
  {
    name: 'Service',
    description: 'A professional offering or assistance',
    icon: Wrench
  },
  {
    name: 'Event',
    description: 'A gathering or happening',
    icon: Calendar
  }
];

export default function LensSelector({ onLensSelected }: LensSelectorProps) {
  const [selected, setSelected] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLensSelection = async (lens: string) => {
    setSelected(lens);
    
    if (topic.trim()) {
      setIsLoading(true);
      try {
        const result = await getLensSubtopics(topic.trim(), lens);
        setSubtopics(result.subtopics);
      } catch (error) {
        console.error('Perplexity API error:', error);
        setSubtopics([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // If no topic entered, just select the lens
      onLensSelected(lens, topic.trim());
    }
  };

  const handleFinalSelection = (lens: string) => {
    onLensSelected(lens, topic.trim(), subtopics.length > 0 ? subtopics : undefined);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Select a Lens</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose the perspective through which you want to create your custom model
        </p>
        
        {/* Topic Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What topic are you creating a model for?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Nike, Domain warm-up rotation, Cold email deliverability..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              disabled={!topic.trim()}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
            >
              Enter topic first, then select a lens
            </button>
          </div>
        </div>
      </div>
      
      {/* Perplexity Subtopics Results */}
      {subtopics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Generated Subtopics</h3>
          
          {/* Selected Lens */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">✅ Your Selection: {selected}</h4>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-blue-900">{selected}</h5>
                    <p className="text-sm text-blue-700 mt-1">Lens-specific subtopics for "{topic}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subtopics List */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Suggested Subtopics</h4>
            <p className="text-xs text-gray-600 mb-3">Click any subtopic below to select it as your focus area:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subtopics.map((subtopic, index) => (
                <Card key={index} className="border-gray-200 hover:border-gray-300 cursor-pointer" onClick={() => handleFinalSelection(selected)}>
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      <div className="p-1.5 rounded-lg bg-gray-100">
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm">{subtopic}</h5>
                        <p className="text-xs text-gray-600 mt-1">Specific {selected.toLowerCase()} subtopic</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lenses.map((lens) => {
          const IconComponent = lens.icon;
          const isSelected = selected === lens.name;
          const hasSubtopics = subtopics.length > 0 && selected === lens.name;
          
          return (
            <Card
              key={lens.name}
              onClick={() => !isLoading && handleLensSelection(lens.name)}
              className={`transition-all duration-200 hover:shadow-md ${
                isLoading 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer'
              } ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : hasSubtopics
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {lens.name}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {lens.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 