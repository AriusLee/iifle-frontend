'use client';

import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getSession } from 'next-auth/react';
import {
  Loader2,
  ArrowLeft,
  Upload,
  X,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2030/api/v1';

const ACCEPTED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.md', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp',
];

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
];

const companySchema = z.object({
  legal_name: z.string().min(2, 'Company name must be at least 2 characters'),
  brand_name: z.string().optional(),
  registration_number: z.string().optional(),
  company_type: z.string().optional(),
  primary_industry: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  website: z.string().optional().or(z.literal('')),
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

function getFileIcon(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv'))
    return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
  if (file.type.startsWith('image/')) return <FileImage className="h-4 w-4 text-blue-500" />;
  return <File className="h-4 w-4 text-gray-500" />;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NewCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { country: '' },
  });

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_MIME_TYPES.includes(file.type);
    });
    if (validFiles.length < newFiles.length) {
      toast.error('Some files were skipped (unsupported format)');
    }
    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  async function onSubmit(data: CompanyForm) {
    setIsLoading(true);
    try {
      // 1. Create company
      const company = await api.companies.create({
        ...data,
        website: data.website || undefined,
      });

      // 2. Upload files if any
      if (files.length > 0) {
        const session = (await getSession()) as any;
        let uploadCount = 0;

        for (const file of files) {
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'other');

            const res = await fetch(
              `${API_URL}/companies/${company.id}/documents/upload`,
              {
                method: 'POST',
                headers: { Authorization: `Bearer ${session?.accessToken}` },
                body: formData,
              }
            );

            if (res.ok) {
              uploadCount++;
            } else {
              console.error(`Failed to upload ${file.name}`);
            }
          } catch (err) {
            console.error(`Error uploading ${file.name}:`, err);
          }
        }

        if (uploadCount > 0) {
          // 3. Trigger auto-intake processing
          try {
            await api.autoIntake.trigger(company.id);
          } catch (err) {
            console.error('Auto-intake trigger failed:', err);
          }
        }

        toast.success(
          `Company created! ${uploadCount} file${uploadCount !== 1 ? 's' : ''} uploaded — AI is now analyzing your documents.`
        );
      } else {
        toast.success('Company created successfully!');
      }

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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="legal_name">Legal Name *</Label>
                <Input id="legal_name" placeholder="IWG Esports Sdn Bhd" {...register('legal_name')} />
                {errors.legal_name && (
                  <p className="text-sm text-destructive">{errors.legal_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_name">Brand Name</Label>
                <Input id="brand_name" placeholder="e.g. Kohai, Tealive" {...register('brand_name')} />
              </div>
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
                <Label htmlFor="primary_industry">Primary Industry</Label>
                <Input id="primary_industry" placeholder="e.g. F&B, Technology, Logistics" {...register('primary_industry')} />
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
              <Label htmlFor="website">Websites</Label>
              <Input id="website" placeholder="https://example.com, https://brand.com" {...register('website')} />
              <p className="text-xs text-muted-foreground">Separate multiple URLs with commas</p>
            </div>

            {/* File Drop Zone */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Company Materials</Label>
                <span className="text-xs text-muted-foreground">(optional)</span>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all ${
                  isDragOver
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    isDragOver ? 'bg-primary/10' : 'bg-muted'
                  }`}
                >
                  <Upload
                    className={`h-6 w-6 transition-colors ${
                      isDragOver ? 'text-primary' : 'text-muted-foreground/50'
                    }`}
                  />
                </div>
                <p className="mt-3 text-sm font-medium">
                  Drop company materials here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse files
                </p>
                <p className="mt-2 text-xs text-muted-foreground/70">
                  PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, MD, images
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_EXTENSIONS.join(',')}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    These files will be analyzed by AI to auto-fill company data
                  </div>
                  <div className="rounded-lg border divide-y">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {getFileIcon(file)}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="cursor-pointer" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading
                  ? files.length > 0
                    ? 'Creating & Uploading...'
                    : 'Creating...'
                  : 'Create Company'}
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
