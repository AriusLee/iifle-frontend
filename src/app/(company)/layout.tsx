'use client';

import { Providers } from '@/app/providers';

export default function CompanyRouteGroup({ children }: { children: React.ReactNode }) {
  // This layout is intentionally empty — just passes children through.
  // The actual company layout (sidebar + topbar + chat) is in /companies/[id]/layout.tsx.
  // This route group exists to SEPARATE company pages from the (dashboard) global sidebar layout.
  return <>{children}</>;
}
