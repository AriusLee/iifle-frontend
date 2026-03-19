import { create } from 'zustand';

type RightPanel = 'chat' | 'reports' | null;

interface CompanyStore {
  chatOpen: boolean;
  rightPanel: RightPanel;
  reportModuleFilter: string | null; // e.g. 'module_1', 'module_2'
  reportTierFilter: string | null; // 'essential', 'standard', 'premium'
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  openReports: (moduleFilter?: string) => void;
  closeReports: () => void;
  toggleReports: () => void;
  setRightPanel: (panel: RightPanel) => void;
  setReportModuleFilter: (filter: string | null) => void;
  setReportTierFilter: (filter: string | null) => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  chatOpen: true,
  rightPanel: 'chat' as RightPanel,
  reportModuleFilter: null,
  reportTierFilter: null,

  toggleChat: () =>
    set((s) => {
      if (s.rightPanel === 'chat') {
        return { chatOpen: false, rightPanel: null };
      }
      return { chatOpen: true, rightPanel: 'chat' };
    }),

  setChatOpen: (open) =>
    set({ chatOpen: open, rightPanel: open ? 'chat' : null }),

  openReports: (moduleFilter) =>
    set({
      chatOpen: false,
      rightPanel: 'reports',
      ...(moduleFilter !== undefined ? { reportModuleFilter: moduleFilter ?? null } : {}),
    }),

  closeReports: () =>
    set({ chatOpen: false, rightPanel: null }),

  toggleReports: () =>
    set((s) => {
      if (s.rightPanel === 'reports') {
        return { rightPanel: null, chatOpen: false };
      }
      return { rightPanel: 'reports', chatOpen: false, reportModuleFilter: null };
    }),

  setRightPanel: (panel) =>
    set({ rightPanel: panel, chatOpen: panel === 'chat' }),

  setReportModuleFilter: (filter) =>
    set({ reportModuleFilter: filter }),

  setReportTierFilter: (filter) =>
    set({ reportTierFilter: filter }),
}));
