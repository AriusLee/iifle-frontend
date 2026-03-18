'use client';

import { cn } from '@/lib/utils';

function getScoreColor(score: number): string {
  if (score >= 90) return 'bg-emerald-700 text-white';
  if (score >= 80) return 'bg-emerald-500 text-white';
  if (score >= 70) return 'bg-emerald-400 text-white';
  if (score >= 60) return 'bg-yellow-400 text-yellow-900';
  if (score >= 50) return 'bg-orange-400 text-white';
  if (score >= 40) return 'bg-red-300 text-red-900';
  return 'bg-red-500 text-white';
}

function getScoreColorHex(score: number): string {
  if (score >= 90) return '#047857';
  if (score >= 80) return '#10b981';
  if (score >= 70) return '#34d399';
  if (score >= 60) return '#facc15';
  if (score >= 50) return '#fb923c';
  if (score >= 40) return '#fca5a5';
  return '#ef4444';
}

interface ScoreBadgeProps {
  score: number;
  rating?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreBadge({ score, rating, size = 'md', className }: ScoreBadgeProps) {
  const colorClass = getScoreColor(score);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold tabular-nums',
        colorClass,
        sizeClasses[size],
        className,
      )}
    >
      <span>{Math.round(score)}</span>
      {rating && <span className="font-medium opacity-80">/ {rating}</span>}
    </span>
  );
}

export { getScoreColor, getScoreColorHex };
