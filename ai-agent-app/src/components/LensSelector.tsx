'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  Package, 
  Target, 
  Settings, 
  Wrench, 
  Calendar 
} from 'lucide-react';

interface LensSelectorProps {
  onLensSelected: (lens: string) => void;
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

  const handleClick = (lens: string) => {
    setSelected(lens);
    onLensSelected(lens);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Select a Lens</h2>
        <p className="text-sm text-gray-600">
          Choose the perspective through which you want to create your custom model
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lenses.map((lens) => {
          const IconComponent = lens.icon;
          const isSelected = selected === lens.name;
          
          return (
            <Card
              key={lens.name}
              onClick={() => handleClick(lens.name)}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
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