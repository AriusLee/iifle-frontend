import { create } from 'zustand';

interface IntakeStore {
  currentSection: number;
  formData: Record<string, any>;
  isDirty: boolean;
  lastSaved: Date | null;
  setSection: (section: number) => void;
  updateFormData: (section: string, data: any) => void;
  markSaved: () => void;
  resetForm: () => void;
  loadDraft: (data: Record<string, any>) => void;
}

export const useIntakeStore = create<IntakeStore>((set) => ({
  currentSection: 0,
  formData: {},
  isDirty: false,
  lastSaved: null,
  setSection: (section) => set({ currentSection: section }),
  updateFormData: (section, data) =>
    set((state) => ({
      formData: { ...state.formData, [section]: data },
      isDirty: true,
    })),
  markSaved: () => set({ isDirty: false, lastSaved: new Date() }),
  resetForm: () => set({ currentSection: 0, formData: {}, isDirty: false, lastSaved: null }),
  loadDraft: (data) => set({ formData: data, isDirty: false }),
}));
