'use client';

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BudgetWidgetProps {
  onConfirm: (value: number) => void;
  initialValue?: number;
}

export default function BudgetWidget({ onConfirm, initialValue }: BudgetWidgetProps) {
  const [value, setValue] = useState<number>(
    typeof initialValue === 'number' && !isNaN(initialValue) ? initialValue : 10000
  );

  const handleChange = (vals: number[]) => {
    const num = Array.isArray(vals) && typeof vals[0] === 'number' ? vals[0] : 10000;
    setValue(num);
  };

  return (
    <div className="mt-2 p-4 bg-background border rounded-md space-y-4 w-full">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Monthly Budget:</span>
        <span className="text-lg font-bold text-primary">R{value.toLocaleString('en-ZA')}</span>
      </div>
      <Slider
        min={2000}
        max={50000}
        step={500}
        value={[value]}
        onValueChange={handleChange}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>R2,000</span>
        <span>R50,000+</span>
      </div>
      <Button
        className="w-full h-8 text-xs"
        onClick={() => onConfirm(value)}
      >
        Confirm Budget: R{value.toLocaleString('en-ZA')}
      </Button>
    </div>
  );
}
