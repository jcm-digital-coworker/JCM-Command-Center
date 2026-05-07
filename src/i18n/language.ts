export type Language = 'en' | 'es';

export const LANGUAGE_STORAGE_KEY = 'jcm_language';

export function getStoredLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === 'es' ? 'es' : 'en';
}

export function setStoredLanguage(lang: Language): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}
