'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { X, Bot, MessageSquarePlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/stores/company-store';
import { useChatStore } from '@/stores/chat-store';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ChatInput } from '@/components/chat/chat-input';
import { api } from '@/lib/api';
import { getSession } from 'next-auth/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2030/api/v1';

const EXAMPLE_PROMPTS = [
  "Analyze the founder's leadership potential",
  'What are the key risks for this company?',
  'Compare with industry benchmarks',
  'Suggest improvements for IPO readiness',
];

interface ChatPanelProps {
  companyId: string;
}

export function ChatPanel({ companyId }: ChatPanelProps) {
  const { setChatOpen } = useCompanyStore();
  const {
    messages,
    conversationId,
    isLoading,
    setConversationId,
    addMessage,
    updateLastAssistantMessage,
    setLastAssistantToolCall,
    finalizeLastAssistantMessage,
    setLoading,
    setError,
    clearMessages,
    loadMessages,
  } = useChatStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load existing conversation on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function init() {
      try {
        const conversations = await api.chat.listConversations(companyId);
        if (conversations && conversations.length > 0) {
          // Load most recent conversation
          const conv = conversations[conversations.length - 1];
          setConversationId(conv.id);
          const msgs = await api.chat.getMessages(companyId, conv.id);
          if (msgs && msgs.length > 0) {
            loadMessages(
              msgs.map((m: any) => ({
                id: m.id || crypto.randomUUID(),
                role: m.role,
                content: m.content,
                timestamp: new Date(m.created_at || m.timestamp || Date.now()),
              }))
            );
          }
        }
      } catch {
        // Silently fail on initial load - user can still start a new conversation
      }
    }
    init();
  }, [companyId, setConversationId, loadMessages]);

  const ensureConversation = useCallback(async (): Promise<string> => {
    if (conversationId) return conversationId;
    try {
      const conv = await api.chat.createConversation(companyId, 'Chat');
      setConversationId(conv.id);
      return conv.id;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create conversation');
    }
  }, [companyId, conversationId, setConversationId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setInput('');
      setError(null);
      addMessage({ role: 'user', content: text.trim() });
      setLoading(true);

      // Add placeholder assistant message for streaming
      addMessage({ role: 'assistant', content: '', isStreaming: true });

      try {
        const convId = await ensureConversation();
        const session = (await getSession()) as any;
        const token = session?.accessToken;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const controller = new AbortController();
        abortRef.current = controller;

        const response = await fetch(
          `${API_URL}/companies/${companyId}/chat/conversations/${convId}/messages`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ content: text.trim() }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.detail || `Request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response stream available');
        }

        const decoder = new TextDecoder();
        let accumulatedContent = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process SSE lines
          const lines = buffer.split('\n');
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith(':')) continue;

            if (trimmed.startsWith('data: ')) {
              const data = trimmed.slice(6);

              if (data === '[DONE]') {
                finalizeLastAssistantMessage();
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                // Handle different SSE event types
                if (parsed.type === 'tool_call' || parsed.tool_call) {
                  const toolName =
                    parsed.tool_call?.name ||
                    parsed.name ||
                    parsed.tool ||
                    'Processing';
                  const toolLabel = formatToolLabel(toolName);
                  setLastAssistantToolCall(toolLabel);
                } else if (parsed.type === 'tool_result') {
                  setLastAssistantToolCall(null);
                } else if (
                  parsed.type === 'content' ||
                  parsed.type === 'delta' ||
                  parsed.delta ||
                  parsed.content
                ) {
                  const delta =
                    parsed.delta?.content ||
                    parsed.delta?.text ||
                    parsed.delta ||
                    parsed.content ||
                    parsed.text ||
                    '';
                  if (typeof delta === 'string' && delta) {
                    accumulatedContent += delta;
                    updateLastAssistantMessage(accumulatedContent);
                  }
                } else if (parsed.type === 'error') {
                  throw new Error(parsed.message || 'Stream error');
                } else if (typeof parsed === 'string') {
                  // Plain text delta
                  accumulatedContent += parsed;
                  updateLastAssistantMessage(accumulatedContent);
                } else if (parsed.choices) {
                  // OpenAI-style SSE
                  const delta = parsed.choices[0]?.delta?.content || '';
                  if (delta) {
                    accumulatedContent += delta;
                    updateLastAssistantMessage(accumulatedContent);
                  }
                }
              } catch {
                // If JSON parse fails, treat as raw text content
                if (data && data !== '[DONE]') {
                  accumulatedContent += data;
                  updateLastAssistantMessage(accumulatedContent);
                }
              }
            } else if (trimmed.startsWith('event: ')) {
              // Named SSE events - these precede the data line
              // We handle them when we read the subsequent data line
            }
          }
        }

        // Finalize if not already done
        finalizeLastAssistantMessage();
      } catch (err: any) {
        if (err.name === 'AbortError') return;

        const errorMsg = err.message || 'Failed to send message';
        setError(errorMsg);
        toast.error(errorMsg);

        // Remove the empty streaming message on error
        finalizeLastAssistantMessage();
        updateLastAssistantMessage(
          'Sorry, I encountered an error. Please try again.'
        );
        finalizeLastAssistantMessage();
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [
      isLoading,
      companyId,
      ensureConversation,
      addMessage,
      updateLastAssistantMessage,
      setLastAssistantToolCall,
      finalizeLastAssistantMessage,
      setLoading,
      setError,
    ]
  );

  function handleSend() {
    sendMessage(input);
  }

  function handleNewChat() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    clearMessages();
    setInput('');
    initializedRef.current = true; // Prevent re-loading old conversation
  }

  function handleExampleClick(prompt: string) {
    setInput(prompt);
    sendMessage(prompt);
  }

  return (
    <div className="flex h-full w-80 flex-col border-l bg-background xl:w-96">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={handleNewChat}
            title="New Chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => setChatOpen(false)}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              IIFLE AI Assistant
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Ask me anything about this company&apos;s capital structure,
              founders, risks, or IPO readiness.
            </p>
            <div className="flex flex-col gap-2 w-full">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleExampleClick(prompt)}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-left text-xs',
                    'text-muted-foreground hover:text-foreground',
                    'hover:border-primary/30 hover:bg-primary/5',
                    'transition-colors cursor-pointer'
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
            isStreaming={msg.isStreaming}
            toolCall={msg.toolCall}
          />
        ))}

        {/* Typing indicator when loading but no streaming message yet */}
        {isLoading &&
          !messages.some((m) => m.isStreaming && m.content === '') &&
          messages.length > 0 &&
          messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isLoading}
      />
    </div>
  );
}

/** Maps tool names to user-friendly labels */
function formatToolLabel(toolName: string): string {
  const toolLabels: Record<string, string> = {
    search: 'Searching...',
    retrieval: 'Searching documents...',
    search_documents: 'Searching documents...',
    search_knowledge: 'Searching knowledge base...',
    edit_report: 'Editing report...',
    analyze: 'Analyzing...',
    calculate: 'Calculating...',
    compare: 'Comparing data...',
    generate_report: 'Generating report...',
  };

  const lower = toolName.toLowerCase();
  if (toolLabels[lower]) return toolLabels[lower];

  // Generic fallback: capitalize and add "..."
  const formatted = toolName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim();
  return `${formatted.charAt(0).toUpperCase() + formatted.slice(1)}...`;
}
