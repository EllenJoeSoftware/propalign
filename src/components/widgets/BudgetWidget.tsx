'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BudgetWidgetProps {
  onConfirm: (value: number) => void;
  initialValue?: number;
}

export default function BudgetWidget({ onConfirm, initialValue }: BudgetWidgetProps) {
  const start = typeof initialValue === 'number' && initialValue >= 2000 ? initialValue : 10000;
  const [value, setValue] = useState<number>(start);

  return (
    <div className="mt-2 p-4 bg-background border rounded-md space-y-4 w-72">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Monthly Budget:</span>
        <span className="text-lg font-bold text-primary">R{value.toLocaleString('en-ZA')}</span>
      </div>

      {/* Use Radix primitive directly to avoid any wrapper interference */}
      <SliderPrimitive.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        min={2000}
        max={50000}
        step={500}
        defaultValue={[start]}
        onValueChange={(vals) => {
          if (Array.isArray(vals) && typeof vals[0] === 'number') {
            setValue(vals[0]);
          }
        }}
      >
        <SliderPrimitive.Track className="bg-secondary relative grow rounded-full h-2">
          <SliderPrimitive.Range className="absolute bg-primary rounded-full h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block w-5 h-5 bg-primary rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-primary cursor-grab active:cursor-grabbing"
          aria-label="Budget"
        />
      </SliderPrimitive.Root>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>R2,000</span>
        <span>R50,000+</span>
      </div>

      <Button
        className="w-full h-8 text-xs"
        onClick={() => onConfirm(value)}
      >
        Confirm — R{value.toLocaleString('en-ZA')}
      </Button>
    </div>
  );
}
