'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Building2, Users, Save, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Company } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const COMPANY_TYPE_OPTIONS = [
  { value: 'sdn_bhd', label: 'Sdn Bhd' },
  { value: 'berhad', label: 'Berhad' },
  { value: 'llp', label: 'LLP' },
  { value: 'sole_prop', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
];

interface CompanyForm {
  legal_name: string;
  brand_name: string;
  registration_number: string;
  company_type: string;
  primary_industry: string;
  country: string;
  website: string;
  brief_description: string;
}

function formFromCompany(c: Company): CompanyForm {
  return {
    legal_name: c.legal_name || '',
    brand_name: (c as any).brand_name || '',
    registration_number: c.registration_number || '',
    company_type: c.company_type || '',
    primary_industry: c.primary_industry || '',
    country: c.country || '',
    website: c.website || '',
    brief_description: c.brief_description || '',
  };
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  advisor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  client: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function CompanySettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => api.companies.get(id),
  });

  const [form, setForm] = useState<CompanyForm>({
    legal_name: '',
    brand_name: '',
    registration_number: '',
    company_type: '',
    primary_industry: '',
    country: '',
    website: '',
    brief_description: '',
  });
  const [originalForm, setOriginalForm] = useState<CompanyForm>(form);

  useEffect(() => {
    if (company) {
      const f = formFromCompany(company);
      setForm(f);
      setOriginalForm(f);
    }
  }, [company]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CompanyForm>) => api.companies.update(id, data),
    onSuccess: () => {
      toast.success('Company settings saved');
      queryClient.invalidateQueries({ queryKey: ['company', id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save settings');
    },
  });

  const update = (key: keyof CompanyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('client');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Coming soon');
  };

  // Current user as only member
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      {/* Card 1 — Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5" /> Company Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Legal Name</Label>
              <Input
                value={form.legal_name}
                onChange={(e) => update('legal_name', e.target.value)}
                placeholder="Full legal entity name"
              />
            </div>
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input
                value={form.brand_name}
                onChange={(e) => update('brand_name', e.target.value)}
                placeholder="Trading / brand name"
              />
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input
                value={form.registration_number}
                onChange={(e) => update('registration_number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Type</Label>
              <select
                value={form.company_type}
                onChange={(e) => update('company_type', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm cursor-pointer"
              >
                <option value="">Select...</option>
                {COMPANY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Primary Industry</Label>
              <Input
                value={form.primary_industry}
                onChange={(e) => update('primary_industry', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Brief Description</Label>
              <textarea
                value={form.brief_description}
                onChange={(e) => update('brief_description', e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Short description of the company"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className="cursor-pointer gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 2 — Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" /> Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Member list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              <Badge className={ROLE_COLORS.admin}>admin</Badge>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Invite form (placeholder) */}
          <form onSubmit={handleInvite} className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label>Invite Member</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="w-32 space-y-2">
              <Label>Role</Label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm cursor-pointer"
              >
                <option value="client">Client</option>
                <option value="advisor">Advisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={!inviteEmail.trim()}
              className="cursor-pointer gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            Team invitations are coming soon. Members will be able to collaborate within this company workspace.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
