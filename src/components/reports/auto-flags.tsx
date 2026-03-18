'use client';

import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronRight } from 'lucide-react';
import type { AutoFlag } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    borderClass: 'border-l-4 border-l-red-500',
    label: 'Critical',
  },
  high: {
    icon: AlertTriangle,
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    borderClass: 'border-l-4 border-l-orange-500',
    label: 'High',
  },
  medium: {
    icon: AlertCircle,
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    borderClass: 'border-l-4 border-l-yellow-500',
    label: 'Medium',
  },
  low: {
    icon: Info,
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    borderClass: 'border-l-4 border-l-blue-500',
    label: 'Low',
  },
} as const;

const severityOrder: Array<AutoFlag['severity']> = ['critical', 'high', 'medium', 'low'];

interface AutoFlagsProps {
  flags: AutoFlag[];
  className?: string;
}

export function AutoFlags({ flags, className }: AutoFlagsProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  if (!flags || flags.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground text-center">No flags identified.</p>
        </CardContent>
      </Card>
    );
  }

  const grouped = severityOrder.reduce(
    (acc, severity) => {
      const items = flags.filter((f) => f.severity === severity);
      if (items.length > 0) acc[severity] = items;
      return acc;
    },
    {} as Record<string, AutoFlag[]>,
  );

  const toggleSection = (severity: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(severity)) {
        next.delete(severity);
      } else {
        next.add(severity);
      }
      return next;
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Auto-Detected Flags
          <span className="text-xs font-normal text-muted-foreground">({flags.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(grouped).map(([severity, items]) => {
          const config = severityConfig[severity as AutoFlag['severity']];
          const Icon = config.icon;
          const isCollapsed = collapsedSections.has(severity);

          return (
            <div key={severity} className="rounded-lg border overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(severity)}
                className="cursor-pointer flex items-center gap-2 w-full px-3 py-2 bg-muted/30 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${config.badgeClass}`}>
                  <Icon className="h-3 w-3" />
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </button>

              {/* Flags */}
              {!isCollapsed && (
                <div className="divide-y">
                  {items.map((flag) => (
                    <div
                      key={flag.id}
                      className={`px-3 py-2.5 ${severity === 'critical' ? config.borderClass : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {flag.flag_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm mt-0.5">{flag.description}</p>
                          {flag.source_field && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Source: {flag.source_field}
                              {flag.source_value && ` = ${flag.source_value}`}
                            </p>
                          )}
                        </div>
                        {flag.is_resolved && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full px-2 py-0.5 font-medium shrink-0">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
