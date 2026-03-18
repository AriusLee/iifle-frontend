'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CompanySidebar } from '@/components/layout/company-sidebar';
import { Topbar } from '@/components/layout/topbar';
import { ChatPanel } from '@/components/layout/chat-panel';
import { AiStatusBar } from '@/components/layout/ai-status-bar';
import { useCompanyStore } from '@/stores/company-store';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatOpen = useCompanyStore((s) => s.chatOpen);

  const { data: company } = useQuery({
    queryKey: ['company', id],
    queryFn: () => api.companies.get(id),
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop company sidebar */}
      <div className="hidden lg:block">
        <CompanySidebar companyId={id} className="h-screen" />
      </div>

      {/* Mobile company sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <CompanySidebar companyId={id} />
        </SheetContent>
      </Sheet>

      {/* Main content + chat */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          companyId={id}
          companyName={company?.brand_name || company?.legal_name}
        />
        <AiStatusBar companyId={id} />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
            {children}
          </main>
          {/* Chat panel (desktop only, collapsible) */}
          {chatOpen && (
            <div className="hidden md:flex">
              <ChatPanel companyId={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
