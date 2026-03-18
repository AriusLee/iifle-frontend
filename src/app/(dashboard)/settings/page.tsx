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

const providers = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Free + Web Search',
    badgeVariant: 'default' as const,
    description: 'Gemini 2.0 Flash — free tier with 1M tokens/day and Google Search grounding for due diligence research.',
    link: 'https://aistudio.google.com/apikey',
    linkText: 'aistudio.google.com',
    placeholder: 'AIzaSy...',
    keyField: 'gemini' as const,
  },
  {
    id: 'groq',
    name: 'Groq',
    badge: 'Free',
    badgeVariant: 'secondary' as const,
    description: 'Llama 3.3 70B — fast inference, 12K tokens/min free tier. No web search.',
    link: 'https://console.groq.com/keys',
    linkText: 'console.groq.com',
    placeholder: 'gsk_...',
    keyField: 'groq' as const,
  },
  {
    id: 'anthropic',
    name: 'Claude',
    badge: 'Paid',
    badgeVariant: 'outline' as const,
    description: 'Production quality with web search. ~$0.10-0.20 per company assessment.',
    link: 'https://console.anthropic.com/settings/keys',
    linkText: 'console.anthropic.com',
    placeholder: 'sk-ant-api03-...',
    keyField: 'anthropic' as const,
  },
];

export default function GlobalSettingsPage() {
  const { data: keyStatus, refetch } = useQuery({
    queryKey: ['api-key-status'],
    queryFn: () => api.settings.getKeyStatus(),
  });

  const [keys, setKeys] = useState<Record<string, string>>({ gemini: '', groq: '', anthropic: '' });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = async (provider: string) => {
    const key = keys[provider];
    if (!key?.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    setSaving(provider);
    try {
      await api.settings.updateApiKeys(provider, key);
      toast.success(`${providers.find((p) => p.id === provider)?.name} activated`);
      setKeys((prev) => ({ ...prev, [provider]: '' }));
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  const activeProvider = keyStatus?.ai_provider || 'gemini';

  const getConfigured = (id: string) => {
    if (id === 'gemini') return keyStatus?.gemini_configured;
    if (id === 'groq') return keyStatus?.groq_configured;
    return keyStatus?.anthropic_configured;
  };

  const getHint = (id: string) => {
    if (id === 'gemini') return keyStatus?.gemini_key_hint;
    if (id === 'groq') return keyStatus?.groq_key_hint;
    return keyStatus?.anthropic_key_hint;
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
            Active: <span className="text-primary">{providers.find((p) => p.id === activeProvider)?.name || activeProvider}</span>
          </p>
        </CardContent>
      </Card>

      {/* Provider Cards */}
      {providers.map((p) => {
        const isActive = activeProvider === p.id;
        const configured = getConfigured(p.id);
        const hint = getHint(p.id);

        return (
          <Card key={p.id} className={isActive ? 'ring-2 ring-primary/30' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Key className="h-5 w-5" />
                  {p.name}
                  <Badge variant={p.badgeVariant} className="text-xs">{p.badge}</Badge>
                </CardTitle>
                {isActive && <Badge className="text-xs">Active</Badge>}
              </div>
              <CardDescription>
                {p.description}{' '}
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="cursor-pointer text-primary hover:underline">
                  {p.linkText}
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Input
                  type={showKeys[p.id] ? 'text' : 'password'}
                  placeholder={p.placeholder}
                  value={keys[p.id] || ''}
                  onChange={(e) => setKeys((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  {showKeys[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {configured && !keys[p.id] && (
                <div className="space-y-1">
                  <p className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Key connected
                  </p>
                  {hint && <p className="font-mono text-xs text-muted-foreground">{hint}</p>}
                </div>
              )}
              <Button
                onClick={() => handleSave(p.id)}
                disabled={saving === p.id || !keys[p.id]}
                className="cursor-pointer gap-2"
                size="sm"
              >
                <Save className="h-3.5 w-3.5" />
                {saving === p.id ? 'Saving...' : `Save & Activate ${p.name}`}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
