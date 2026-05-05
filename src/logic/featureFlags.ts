export type FeatureFlag = 'subStageKanban' | 'urgencyScore' | 'nextHandoff' | 'deptEscalation';

const FLAGS_KEY = 'jcm_feature_flags';

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  try {
    const stored = localStorage.getItem(FLAGS_KEY);
    if (!stored) return false;
    return (JSON.parse(stored) as Record<string, boolean>)[flag] === true;
  } catch {
    return false;
  }
}

export function setFeatureFlag(flag: FeatureFlag, enabled: boolean): void {
  try {
    const stored = localStorage.getItem(FLAGS_KEY);
    const flags: Record<string, boolean> = stored ? JSON.parse(stored) : {};
    flags[flag] = enabled;
    localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
    window.dispatchEvent(new Event('storage'));
  } catch {
    // Keep feature flags non-critical. If localStorage is unavailable, the app should keep running.
  }
}

export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  try {
    const stored = localStorage.getItem(FLAGS_KEY);
    const flags: Record<string, boolean> = stored ? JSON.parse(stored) : {};
    const keys: FeatureFlag[] = ['subStageKanban', 'urgencyScore', 'nextHandoff', 'deptEscalation'];
    return Object.fromEntries(keys.map((key) => [key, flags[key] === true])) as Record<FeatureFlag, boolean>;
  } catch {
    return { subStageKanban: false, urgencyScore: false, nextHandoff: false, deptEscalation: false };
  }
}

export const FLAG_LABELS: Record<FeatureFlag, string> = {
  subStageKanban: 'Kanban and department sub-stages',
  urgencyScore: 'Urgency score on production orders',
  nextHandoff: 'Next handoff banner',
  deptEscalation: 'Department blocker escalation',
};
