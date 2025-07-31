'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { generateCustomModel, CustomModelResponse } from '@/lib/customModelPrompt';
import { CheckCircle, Loader2 } from 'lucide-react';

interface TopicInputProps {
  topic: string;
  lens: string;
  onComplete: (result: CustomModelResponse) => void;
}

export default function TopicInput({ topic, lens, onComplete }: TopicInputProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customModelResult, setCustomModelResult] = useState<CustomModelResponse | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateCustomModel(topic, lens);
      setCustomModelResult(result);
      onComplete(result);
    } catch (error) {
      console.error('Error generating custom model:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Generate Custom Model</h3>
        <p className="text-sm text-gray-600 mb-4">
          Based on your selection of <strong>{lens}</strong> lens for <strong>"{topic}"</strong>, 
          we'll generate recommended topic names and descriptions.
        </p>
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Custom Model...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Generate Topic Names & Description
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {customModelResult && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Generated Results</h4>
          
          {/* Topic Names */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Recommended Topic Names:</h5>
            <div className="grid grid-cols-1 gap-3">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    <div className="p-1.5 rounded-lg bg-green-100">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-green-900 text-sm">Option 1</h6>
                      <p className="text-sm text-green-700 mt-1">{customModelResult.name1}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    <div className="p-1.5 rounded-lg bg-blue-100">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-blue-900 text-sm">Option 2</h6>
                      <p className="text-sm text-blue-700 mt-1">{customModelResult.name2}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    <div className="p-1.5 rounded-lg bg-purple-100">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-purple-900 text-sm">Option 3</h6>
                      <p className="text-sm text-purple-700 mt-1">{customModelResult.name3}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Topic Description:</h5>
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {customModelResult.description}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ Your custom model has been generated successfully! You can now use these topic names and description for your audience modeling.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 