'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ArrowLeft, Plus, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CompanySelectorProps {
  companyId: string;
  companyName?: string;
}

export function CompanySelector({ companyId, companyName }: CompanySelectorProps) {
  const router = useRouter();

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.companies.list(),
  });

  const displayName = companyName || 'Loading...';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-muted transition-colors cursor-pointer outline-none">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="max-w-[200px] truncate">{displayName}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-muted-foreground"
          onClick={() => router.push('/companies')}
        >
          <ArrowLeft className="h-4 w-4" />
          All Companies
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {companies?.map((company) => (
          <DropdownMenuItem
            key={company.id}
            className={`cursor-pointer gap-2 ${company.id === companyId ? 'bg-muted' : ''}`}
            onClick={() => router.push(`/companies/${company.id}`)}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary shrink-0">
              {company.legal_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{company.legal_name}</p>
            </div>
            {company.primary_industry && (
              <Badge variant="outline" className="text-[10px] shrink-0">
                {company.primary_industry}
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-primary"
          onClick={() => router.push('/companies/new')}
        >
          <Plus className="h-4 w-4" />
          Create New Company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
