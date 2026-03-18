import { create } from 'zustand';

interface CompanyStore {
  chatOpen: boolean;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  chatOpen: true,
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  setChatOpen: (open) => set({ chatOpen: open }),
}));
