'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, Key, Save, Eye, EyeOff, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function GlobalSettingsPage() {
  const { data: keyStatus, refetch } = useQuery({
    queryKey: ['api-key-status'],
    queryFn: () => api.settings.getKeyStatus(),
  });

  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!key?.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    setSaving(true);
    try {
      await api.settings.updateApiKeys('groq', key);
      toast.success('Groq API key activated');
      setKey('');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">AI provider configuration</p>
        </div>
      </div>

      {/* Active Provider */}
      <Card className="border-primary/30 bg-primary/[0.02]">
        <CardContent className="flex items-center gap-3 py-4">
          <Zap className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">
            Active: <span className="text-primary">Groq</span>
          </p>
        </CardContent>
      </Card>

      {/* Groq Card */}
      <Card className="ring-2 ring-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-5 w-5" />
              Groq
              <Badge variant="secondary" className="text-xs">Free</Badge>
            </CardTitle>
            <Badge className="text-xs">Active</Badge>
          </div>
          <CardDescription>
            Llama 3.3 70B — fast inference, 12K tokens/min free tier.{' '}
            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="cursor-pointer text-primary hover:underline">
              console.groq.com
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="gsk_..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="pr-10 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {keyStatus?.groq_configured && !key && (
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Key connected
              </p>
              {keyStatus.groq_key_hint && <p className="font-mono text-xs text-muted-foreground">{keyStatus.groq_key_hint}</p>}
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !key}
            className="cursor-pointer gap-2"
            size="sm"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save & Activate Groq'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
