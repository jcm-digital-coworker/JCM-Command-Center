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
  } catch { /* ignore */ }
}

export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  try {
    const stored = localStorage.getItem(FLAGS_KEY);
    const flags: Record<string, boolean> = stored ? JSON.parse(stored) : {};
    const keys: FeatureFlag[] = ['subStageKanban', 'urgencyScore', 'nextHandoff', 'deptEscalation'];
    return Object.fromEntries(keys.map((k) => [k, flags[k] === true])) as Record<FeatureFlag, boolean>;
  } catch {
    return { subStageKanban: false, urgencyScore: false, nextHandoff: false, deptEscalation: false };
  }
}

export const FLAG_LABELS: Record<FeatureFlag, string> = {
  subStageKanban: 'Kanban (dept + plant)',
  urgencyScore:   'Urgency score on orders',
  nextHandoff:    'Next handoff banner',
  deptEscalation: 'Dept blocker escalation',
};
