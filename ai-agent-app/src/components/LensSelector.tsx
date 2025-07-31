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

  const handleClick = async (lens: string) => {
    setSelected(lens);
    
    if (topic.trim()) {
      setIsValidating(true);
      try {
        const result = await validateLensSelection(topic.trim(), lens);
        setValidation(result);
        onLensSelected(lens, topic.trim(), result);
      } catch (error) {
        console.error('Validation error:', error);
        onLensSelected(lens, topic.trim());
      } finally {
        setIsValidating(false);
      }
    } else {
      onLensSelected(lens, topic.trim());
    }
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
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Domain warm-up rotation, Cold email deliverability..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Validation Result */}
      {validation && (
        <div className="mb-4 p-3 rounded-lg border">
          {validation.lens === selected ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Perfect match!</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border-amber-200">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Recommended: {validation.lens}</p>
                <p className="text-amber-600">{validation.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lenses.map((lens) => {
          const IconComponent = lens.icon;
          const isSelected = selected === lens.name;
          
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