'use client';

import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, FileImage, FileSpreadsheet, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Stage1Data } from '@/lib/validations/stage-1';

interface SectionProps {
  form: UseFormReturn<Stage1Data>;
}

interface UploadSlot {
  id: string;
  label: string;
  description: string;
  acceptedTypes: string;
  acceptedDisplay: string;
  maxSize: string;
}

const UPLOAD_SLOTS: UploadSlot[] = [
  {
    id: 'company_profile',
    label: 'Company Profile / Brochure',
    description: 'Corporate profile, company brochure, or capability statement.',
    acceptedTypes: '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png',
    acceptedDisplay: 'PDF, DOC, PPT, JPG, PNG',
    maxSize: '10MB',
  },
  {
    id: 'org_chart',
    label: 'Organization Chart',
    description: 'Current organizational structure diagram.',
    acceptedTypes: '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.xls,.xlsx',
    acceptedDisplay: 'PDF, DOC, PPT, XLS, JPG, PNG',
    maxSize: '10MB',
  },
  {
    id: 'management_accounts',
    label: 'Management Accounts',
    description: 'Latest management accounts or monthly financial reports.',
    acceptedTypes: '.pdf,.xls,.xlsx,.doc,.docx',
    acceptedDisplay: 'PDF, XLS, DOC',
    maxSize: '20MB',
  },
  {
    id: 'business_plan',
    label: 'Business Plan',
    description: 'Business plan, strategic plan, or growth roadmap document.',
    acceptedTypes: '.pdf,.doc,.docx,.ppt,.pptx',
    acceptedDisplay: 'PDF, DOC, PPT',
    maxSize: '20MB',
  },
  {
    id: 'product_catalog',
    label: 'Product Catalog',
    description: 'Product/service catalog, menu, or portfolio document.',
    acceptedTypes: '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png',
    acceptedDisplay: 'PDF, DOC, PPT, JPG, PNG',
    maxSize: '10MB',
  },
];

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

function getFileIcon(type: string) {
  if (type.includes('image')) return FileImage;
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('xls')) return FileSpreadsheet;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SectionHDocuments({ form }: SectionProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileSelect = useCallback(async (slotId: string, file: File | null) => {
    if (!file) return;

    // Clear any previous error
    setErrors((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });

    // Simulate upload (replace with real API calls)
    setUploading((prev) => ({ ...prev, [slotId]: true }));

    try {
      // In production, this would:
      // 1. Call getUploadUrl API to get a pre-signed URL
      // 2. Upload the file to the pre-signed URL
      // 3. Call createRecord API to register the uploaded file
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setUploadedFiles((prev) => ({
        ...prev,
        [slotId]: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      }));
    } catch {
      setErrors((prev) => ({
        ...prev,
        [slotId]: 'Upload failed. Please try again.',
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [slotId]: false }));
    }
  }, []);

  const handleRemove = useCallback((slotId: string) => {
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }, []);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          H. Document Uploads
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Upload supporting documents for your application. All documents are optional at this stage
          but will strengthen your profile assessment.
        </p>

        <div className="space-y-4">
          {UPLOAD_SLOTS.map((slot) => {
            const uploaded = uploadedFiles[slot.id];
            const isUploading = uploading[slot.id];
            const error = errors[slot.id];
            const FileIcon = uploaded ? getFileIcon(uploaded.type) : Upload;

            return (
              <div
                key={slot.id}
                className={cn(
                  'rounded-lg border p-5 transition-colors',
                  uploaded ? 'bg-primary/5 border-primary/20' : 'bg-background',
                  error && 'border-destructive/50'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-lg',
                        uploaded
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <FileIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-foreground">
                        {slot.label}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {slot.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Accepted: {slot.acceptedDisplay} | Max: {slot.maxSize}
                      </p>

                      {uploaded && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm font-medium text-primary truncate max-w-[300px]">
                            {uploaded.name}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({formatFileSize(uploaded.size)})
                          </span>
                        </div>
                      )}

                      {error && (
                        <p className="text-xs text-destructive mt-1">{error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {uploaded && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="cursor-pointer text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(slot.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    )}

                    <label
                      className={cn(
                        'inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium transition-colors cursor-pointer',
                        'hover:bg-muted hover:text-foreground',
                        isUploading && 'pointer-events-none opacity-60'
                      )}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          {uploaded ? 'Replace' : 'Upload'}
                        </>
                      )}
                      <input
                        type="file"
                        accept={slot.acceptedTypes}
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileSelect(slot.id, file);
                          // Reset input value so same file can be re-selected
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
