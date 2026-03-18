'use client';

import { use, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Upload, Trash2, Download, Loader2, File, FileSpreadsheet,
  FileImage, FileArchive, Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { getSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2030/api/v1';

const CATEGORY_LABELS: Record<string, string> = {
  audited_report: 'Audited Report',
  management_accounts: 'Management Accounts',
  tax_return: 'Tax Return',
  company_profile: 'Company Profile',
  org_chart: 'Organization Chart',
  business_plan: 'Business Plan',
  group_structure: 'Group Structure',
  board_resolution: 'Board Resolution',
  shareholder_agreement: 'Shareholder Agreement',
  constitution: 'Constitution',
  icc_report: 'ICC Report',
  risk_register: 'Risk Register',
  esg_report: 'ESG Report',
  governance_manual: 'Governance Manual',
  material_contract: 'Material Contract',
  license: 'License / Permit',
  property_valuation: 'Property Valuation',
  tax_clearance: 'Tax Clearance',
  transfer_pricing: 'Transfer Pricing',
  esos_plan: 'ESOS Plan',
  term_sheet: 'Term Sheet',
  other: 'Other',
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

function getFileIcon(mimeType: string) {
  if (mimeType?.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel') || mimeType?.includes('csv'))
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (mimeType?.includes('image')) return <FileImage className="h-5 w-5 text-blue-500" />;
  if (mimeType?.includes('zip') || mimeType?.includes('archive'))
    return <FileArchive className="h-5 w-5 text-yellow-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [uploading, setUploading] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => api.documents.list(id),
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const session = await getSession() as any;
      const res = await fetch(`${API_URL}/companies/${id}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (!res.ok) throw new Error('Delete failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      toast.success('Document deleted');
    },
    onError: () => toast.error('Failed to delete document'),
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const session = await getSession() as any;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', selectedCategory);

        const res = await fetch(`${API_URL}/companies/${id}/documents/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Upload failed for ${file.name}`);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded`);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      const { download_url } = await api.documents.getDownloadUrl(id, docId);
      const link = document.createElement('a');
      link.href = download_url.startsWith('/') ? `${API_URL.replace('/api/v1', '')}${download_url}` : download_url;
      link.download = filename;
      link.click();
    } catch {
      toast.error('Failed to download');
    }
  };

  // Group documents by category
  const grouped = (documents || []).reduce<Record<string, any[]>>((acc, doc) => {
    const cat = doc.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Upload and manage company documents for analysis
            </p>
          </div>
        </div>
      </div>

      {/* Upload area */}
      <Card>
        <CardContent className="pt-6">
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUpload(e.dataTransfer.files);
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm font-medium">Drag & drop files here, or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, XLS, PPT, images — up to 50MB each</p>

            <div className="mt-4 flex items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="cursor-pointer rounded-md border bg-background px-3 py-2 text-sm"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <Button
                className="cursor-pointer gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Select Files'}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document list */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && (!documents || documents.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No documents uploaded</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload audited reports, business plans, and other supporting documents
            </p>
          </CardContent>
        </Card>
      )}

      {Object.entries(grouped).map(([category, docs]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              {CATEGORY_LABELS[category] || category}
              <Badge variant="secondary" className="text-xs">{docs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {docs.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(doc.mime_type)}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{doc.original_filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                        {doc.created_at && ` · ${new Date(doc.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer h-8 w-8 p-0"
                      onClick={() => handleDownload(doc.id, doc.original_filename)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm(`Delete "${doc.original_filename}"?`)) {
                          deleteMutation.mutate(doc.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
