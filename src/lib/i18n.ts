import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'zh' | 'en';

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (zh: string, en: string) => string;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      locale: 'zh' as Locale,
      setLocale: (locale) => set({ locale }),
      t: (zh, en) => (get().locale === 'zh' ? zh : en),
    }),
    { name: 'iifle-locale' }
  )
);

/** Shortcut hook that returns just the t function and locale */
export function useT() {
  const locale = useI18n((s) => s.locale);
  const t = (zh: string, en: string) => (locale === 'zh' ? zh : en);
  return { t, locale };
}
