'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CompanyCard } from '@/components/companies/company-card';

export default function CompaniesPage() {
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.companies.list(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">
            Manage your portfolio companies and their capital structure analysis.
          </p>
        </div>
        <Link href="/companies/new">
          <Button className="cursor-pointer gap-2">
            <Plus className="h-4 w-4" />
            New Company
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">Failed to load companies. Please try again.</p>
        </div>
      )}

      {companies && companies.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No companies yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating your first company.
          </p>
          <Link href="/companies/new" className="mt-4">
            <Button variant="outline" className="cursor-pointer gap-2">
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </Link>
        </div>
      )}

      {companies && companies.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}
