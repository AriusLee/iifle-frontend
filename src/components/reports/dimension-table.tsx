'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, Calculator } from 'lucide-react';
import type { DimensionScore } from '@/types';
import { ScoreBadge } from './score-badge';

interface DimensionTableProps {
  dimensions: DimensionScore[];
}

export function DimensionTable({ dimensions }: DimensionTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sorted = [...dimensions].sort((a, b) => a.dimension_number - b.dimension_number);

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[auto_1fr_80px_70px_100px] gap-3 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
        <span className="w-5" />
        <span>Dimension</span>
        <span className="text-center">Score</span>
        <span className="text-right">Weight</span>
        <span className="text-right">Method</span>
      </div>

      {/* Rows */}
      {sorted.map((dim, index) => {
        const isExpanded = expandedRows.has(dim.id);
        const hasDetails = dim.ai_reasoning || Object.keys(dim.calculation_detail || {}).length > 0;
        const isEven = index % 2 === 0;

        return (
          <div key={dim.id}>
            <div
              onClick={() => hasDetails && toggleRow(dim.id)}
              className={`
                grid grid-cols-[auto_1fr_80px_70px_100px] gap-3 px-4 py-3 items-center text-sm
                ${hasDetails ? 'cursor-pointer hover:bg-muted/30' : ''}
                ${isEven ? 'bg-background' : 'bg-muted/20'}
                ${isExpanded ? 'border-b border-dashed' : ''}
                transition-colors
              `}
            >
              <span className="w-5 text-muted-foreground">
                {hasDetails ? (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                ) : (
                  <span className="inline-block w-4" />
                )}
              </span>
              <span className="font-medium">{dim.dimension_name}</span>
              <span className="text-center">
                <ScoreBadge score={dim.score} size="sm" />
              </span>
              <span className="text-xs text-muted-foreground text-right">
                {Math.round(dim.weight * 100)}%
              </span>
              <span className="text-xs text-muted-foreground text-right capitalize">
                {dim.scoring_method.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Expanded details */}
            {isExpanded && hasDetails && (
              <div className={`px-4 py-4 space-y-4 ${isEven ? 'bg-background' : 'bg-muted/20'}`}>
                {dim.ai_reasoning && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Brain className="h-3.5 w-3.5" />
                      AI Reasoning
                    </div>
                    <p className="text-sm text-foreground leading-relaxed pl-5">
                      {dim.ai_reasoning}
                    </p>
                  </div>
                )}

                {dim.calculation_detail && Object.keys(dim.calculation_detail).length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Calculator className="h-3.5 w-3.5" />
                      Calculation Detail
                    </div>
                    <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-x-auto pl-5">
                      {JSON.stringify(dim.calculation_detail, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
