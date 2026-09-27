export const ONBOARDING_CHOICE_KEY = 'CSS_ONBOARDING_CHOICE';

export const hasUserLoadedCollection = (choice: string | null) =>
  choice === 'imported' || choice === 'existing';
