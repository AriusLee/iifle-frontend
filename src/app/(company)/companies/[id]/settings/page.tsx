'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function CompanySettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: company } = useQuery({
    queryKey: ['company', id],
    queryFn: () => api.companies.get(id),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-sm text-muted-foreground">Company configuration and details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5" />
            Company Details
          </CardTitle>
          <CardDescription>Basic company information</CardDescription>
        </CardHeader>
        <CardContent>
          {company ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Legal Name</Label>
                <p className="text-sm font-medium">{company.legal_name}</p>
              </div>
              {company.brand_name && (
                <div>
                  <Label className="text-xs text-muted-foreground">Brand Name</Label>
                  <p className="text-sm font-medium">{company.brand_name}</p>
                </div>
              )}
              {company.registration_number && (
                <div>
                  <Label className="text-xs text-muted-foreground">Registration Number</Label>
                  <p className="text-sm font-medium">{company.registration_number}</p>
                </div>
              )}
              {company.company_type && (
                <div>
                  <Label className="text-xs text-muted-foreground">Company Type</Label>
                  <p className="text-sm font-medium">{company.company_type}</p>
                </div>
              )}
              {company.primary_industry && (
                <div>
                  <Label className="text-xs text-muted-foreground">Industry</Label>
                  <Badge variant="outline">{company.primary_industry}</Badge>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Country</Label>
                <p className="text-sm font-medium">{company.country}</p>
              </div>
              {company.website && (
                <div>
                  <Label className="text-xs text-muted-foreground">Website</Label>
                  <p className="text-sm font-medium">{company.website}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
