'use client';

import Link from 'next/link';
import { Building2, Globe, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Company } from '@/types';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-slate-100 text-slate-800',
  archived: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',
};

export function CompanyCard({ company }: { company: Company }) {
  const statusClass = statusColors[company.status] || statusColors.draft;

  return (
    <Link href={`/companies/${company.id}`} className="cursor-pointer block">
      <Card className="transition-all hover:shadow-md hover:border-primary/20 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold leading-tight">{company.legal_name}</h3>
                {company.company_type && (
                  <p className="text-xs text-muted-foreground">{company.company_type}</p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className={statusClass}>
              {company.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {company.primary_industry && (
            <Badge variant="outline" className="text-xs">
              {company.primary_industry}
            </Badge>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {company.country}
            </span>
            {company.website && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Website
              </span>
            )}
          </div>
          {company.enterprise_stage && (
            <p className="text-xs text-muted-foreground">
              Stage: {company.enterprise_stage}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
