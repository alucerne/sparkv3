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
import { validateLensSelection, PerplexityResponse } from '@/lib/perplexity';

interface LensSelectorProps {
  onLensSelected: (lens: string, topic: string, validation?: PerplexityResponse) => void;
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
  const [validation, setValidation] = useState<PerplexityResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleTopicAnalysis = async () => {
    if (!topic.trim()) return;
    
    setIsValidating(true);
    try {
      const result = await validateLensSelection(topic.trim());
      setValidation(result);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClick = (lens: string) => {
    setSelected(lens);
    onLensSelected(lens, topic.trim(), validation || undefined);
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
              onClick={handleTopicAnalysis}
              disabled={!topic.trim() || isValidating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Perplexity Analysis Results */}
      {validation && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Analysis Results</h3>
          
          {/* Best Match */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">🎯 Best Match</h4>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-green-900">{validation.lens}</h5>
                    <p className="text-sm text-green-700 mt-1">{validation.explanation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alternative Options */}
          {validation.alternatives && validation.alternatives.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Alternative Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {validation.alternatives.map((alt, index) => (
                  <Card key={index} className="border-gray-200 hover:border-gray-300 cursor-pointer" onClick={() => handleClick(alt.lens)}>
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        <div className="p-1.5 rounded-lg bg-gray-100">
                          <AlertCircle className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm">{alt.lens}</h5>
                          <p className="text-xs text-gray-600 mt-1">{alt.explanation}</p>
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">Confidence: {alt.confidence}/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lenses.map((lens) => {
          const IconComponent = lens.icon;
          const isSelected = selected === lens.name;
          const isBestMatch = validation?.lens === lens.name;
          const isAlternative = validation?.alternatives?.some(alt => alt.lens === lens.name);
          
          return (
            <Card
              key={lens.name}
              onClick={() => !isValidating && handleClick(lens.name)}
              className={`transition-all duration-200 hover:shadow-md ${
                isValidating 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer'
              } ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : isBestMatch
                  ? 'border-green-500 bg-green-50'
                  : isAlternative
                  ? 'border-amber-500 bg-amber-50'
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