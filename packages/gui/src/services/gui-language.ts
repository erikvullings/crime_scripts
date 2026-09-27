import type { Languages } from './translations';

const isLanguage = (value: string | null): value is Languages =>
  value === 'en' || value === 'nl';

export const resolveGuiLanguage = (hash: string, storedLanguage: string | null): Languages => {
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
  const requestedLanguage = new URLSearchParams(query).get('lang');

  if (isLanguage(requestedLanguage)) return requestedLanguage;
  return isLanguage(storedLanguage) ? storedLanguage : 'nl';
};
