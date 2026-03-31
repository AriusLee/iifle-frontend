'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  FileText,
  FolderOpen,
  ClipboardList,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const quickLinks = [
  {
    label: 'About Company',
    label_zh: '公司概况',
    href: '/about',
    icon: Building2,
    description: 'Company profile, AI research results, industry data',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Questionnaire',
    label_zh: '诊断问卷',
    href: '/questionnaire',
    icon: ClipboardList,
    description: '27-question diagnostic assessment',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Reports',
    label_zh: '诊断报告',
    href: '/reports',
    icon: FileText,
    description: 'AI-generated diagnostic reports',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    label: 'Documents',
    label_zh: '文档管理',
    href: '/documents',
    icon: FolderOpen,
    description: 'Upload and manage company documents',
    color: 'bg-amber-50 text-amber-600',
  },
];

export default function CompanyDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => api.companies.get(id),
  });

  const { data: research } = useQuery({
    queryKey: ['research', id],
    queryFn: () => api.research.get(id).catch(() => null),
  });

  const { data: reports } = useQuery({
    queryKey: ['reports', id],
    queryFn: () => api.reports.list(id).catch(() => []),
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => api.documents.list(id).catch(() => []),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) return null;

  const reportCount = Array.isArray(reports) ? reports.length : 0;
  const docCount = Array.isArray(documents) ? documents.length : 0;
  const researchStatus = research?.status || 'none';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{company.legal_name}</h1>
        <div className="mt-1 flex items-center gap-2">
          {company.primary_industry && (
            <Badge variant="outline">{company.primary_industry}</Badge>
          )}
          <span className="text-sm text-muted-foreground">{company.country}</span>
          {company.enterprise_stage && (
            <Badge className="bg-emerald-100 text-emerald-700">{company.enterprise_stage}</Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Research Status</p>
            <Badge className={
              researchStatus === 'completed' ? 'bg-emerald-100 text-emerald-700 mt-1' :
              researchStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-700 mt-1' :
              'bg-gray-100 text-gray-600 mt-1'
            }>
              {researchStatus === 'completed' ? '已完成' : researchStatus === 'in_progress' ? '进行中' : '未开始'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Reports 报告</p>
            <p className="text-2xl font-bold">{reportCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Documents 文档</p>
            <p className="text-2xl font-bold">{docCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge className="bg-emerald-100 text-emerald-700 mt-1">{company.status || 'Active'}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={`/companies/${id}${link.href}`} className="cursor-pointer block">
                <Card className="h-full transition-all hover:shadow-md hover:border-emerald-200">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${link.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{link.label}</p>
                            <p className="text-xs text-muted-foreground">{link.label_zh}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Description */}
      {company.brief_description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{company.brief_description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
