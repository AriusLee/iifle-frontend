'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, Key, Building2, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: company } = useQuery({
    queryKey: ['company', id],
    queryFn: () => api.companies.get(id),
  });

  // Load API key status from backend
  const { data: keyStatus, refetch: refetchKeyStatus } = useQuery({
    queryKey: ['api-key-status'],
    queryFn: () => api.settings.getKeyStatus(),
  });

  const [anthropicKey, setAnthropicKey] = useState('');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveKeys = async () => {
    if (!anthropicKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    setSaving(true);
    try {
      await api.settings.updateApiKeys(anthropicKey);
      toast.success('API key saved and connected');
      setAnthropicKey('');
      refetchKeyStatus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Company configuration and API integrations
          </p>
        </div>
      </div>

      {/* Company Details */}
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
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer text-sm font-medium text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-5 w-5" />
            AI API Configuration
          </CardTitle>
          <CardDescription>
            Connect your Claude API key to power all AI features: scoring, report generation,
            due diligence research (web search), and the AI chat assistant. One key does everything.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Anthropic / Claude API */}
          <div className="space-y-2">
            <Label htmlFor="anthropic-key" className="flex items-center gap-2">
              Claude API Key
              <Badge variant="outline" className="text-xs">Required — powers all AI features</Badge>
            </Label>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-primary hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="anthropic-key"
                  type={showAnthropicKey ? 'text' : 'password'}
                  placeholder="sk-ant-api03-..."
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  {showAnthropicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {keyStatus?.anthropic_configured && !anthropicKey && (
              <div className="space-y-1">
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Key connected and active
                </p>
                {keyStatus.anthropic_key_hint && (
                  <p className="font-mono text-xs text-muted-foreground">
                    {keyStatus.anthropic_key_hint}
                  </p>
                )}
              </div>
            )}
            {anthropicKey && (
              <p className="flex items-center gap-1 text-xs text-amber-600">
                Press Save to apply the new key
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Claude handles all AI tasks: qualitative scoring, narrative generation, web search for
            due diligence research, document extraction, and the chat assistant.
          </p>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveKeys} disabled={saving} className="cursor-pointer gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : anthropicKey ? 'Save API Key' : 'Update API Key'}
            </Button>
            {keyStatus?.anthropic_configured && (
              <a
                href="https://console.anthropic.com/settings/cost"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-xs text-primary hover:underline"
              >
                View usage on Anthropic Console →
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
