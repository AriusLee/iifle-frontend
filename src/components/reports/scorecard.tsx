'use client';

import type { ModuleScore } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreBadge, getScoreColorHex } from './score-badge';

interface ScorecardProps {
  moduleScore: ModuleScore;
}

export function Scorecard({ moduleScore }: ScorecardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{moduleScore.module_name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Weight: {Math.round(moduleScore.weight * 100)}%
            </p>
          </div>
          <ScoreBadge score={moduleScore.total_score} rating={moduleScore.rating} size="lg" />
        </div>
      </CardHeader>
      <CardContent>
        {moduleScore.dimensions && moduleScore.dimensions.length > 0 && (
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-[1fr_120px_60px_90px] gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
              <span>Dimension</span>
              <span>Score</span>
              <span className="text-right">Weight</span>
              <span className="text-right">Method</span>
            </div>
            {/* Rows */}
            {moduleScore.dimensions
              .sort((a, b) => a.dimension_number - b.dimension_number)
              .map((dim) => (
                <div
                  key={dim.id || dim.dimension_number}
                  className="grid grid-cols-[1fr_120px_60px_90px] gap-2 items-center text-sm"
                >
                  <span className="font-medium truncate">{dim.dimension_name}</span>
                  <div className="flex items-center gap-2">
                    <div className="relative h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all"
                        style={{
                          width: `${dim.score}%`,
                          backgroundColor: getScoreColorHex(dim.score),
                        }}
                      />
                    </div>
                    <span className="text-xs tabular-nums font-medium w-7 text-right">
                      {Math.round(dim.score)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground text-right">
                    {Math.round(dim.weight * 100)}%
                  </span>
                  <span className="text-xs text-muted-foreground text-right capitalize truncate">
                    {dim.scoring_method.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
