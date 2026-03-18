'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const companySchema = z.object({
  legal_name: z.string().min(2, 'Company name must be at least 2 characters'),
  registration_number: z.string().optional(),
  company_type: z.string().optional(),
  primary_industry: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  brief_description: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

const companyTypes = [
  'Private Limited',
  'Public Limited',
  'LLC',
  'Sole Proprietorship',
  'Partnership',
  'Non-Profit',
  'Other',
];

const industries = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Real Estate',
  'Manufacturing',
  'Retail & Consumer',
  'Energy',
  'Agriculture',
  'Education',
  'Transportation',
  'Media & Entertainment',
  'Professional Services',
  'Other',
];

export default function NewCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { country: '' },
  });

  async function onSubmit(data: CompanyForm) {
    setIsLoading(true);
    try {
      const company = await api.companies.create({
        ...data,
        website: data.website || undefined,
      });
      toast.success('Company created successfully!');
      router.push(`/companies/${company.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create company');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/companies">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Company</h1>
          <p className="text-sm text-muted-foreground">
            Add a new company to begin capital structure analysis.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="legal_name">Legal Name *</Label>
              <Input id="legal_name" placeholder="Acme Corporation Ltd." {...register('legal_name')} />
              {errors.legal_name && (
                <p className="text-sm text-destructive">{errors.legal_name.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input id="registration_number" placeholder="e.g. 12345678" {...register('registration_number')} />
              </div>

              <div className="space-y-2">
                <Label>Company Type</Label>
                <Select onValueChange={(val: any) => val && setValue('company_type', String(val))}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyTypes.map((type) => (
                      <SelectItem key={type} value={type} className="cursor-pointer">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Primary Industry</Label>
                <Select onValueChange={(val: any) => val && setValue('primary_industry', String(val))}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind} className="cursor-pointer">
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input id="country" placeholder="e.g. United States" {...register('country')} />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://example.com" {...register('website')} />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brief_description">Description</Label>
              <Textarea
                id="brief_description"
                rows={3}
                placeholder="Brief description of the company..."
                {...register('brief_description')}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="cursor-pointer" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Company
              </Button>
              <Link href="/companies">
                <Button type="button" variant="outline" className="cursor-pointer">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
