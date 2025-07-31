'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SparkModeSelectorProps {
  onSparkModeChange: (mode: 'find' | 'custom') => void;
  defaultValue?: 'find' | 'custom';
}

export default function SparkModeSelector({ 
  onSparkModeChange, 
  defaultValue = 'find' 
}: SparkModeSelectorProps) {
  const handleValueChange = (value: string) => {
    onSparkModeChange(value as 'find' | 'custom');
  };

  return (
    <div className="max-w-sm">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        SPARK Mode
      </label>
      <Select defaultValue={defaultValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select SPARK mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="find">Find Audience</SelectItem>
          <SelectItem value="custom">Create Custom Model</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 