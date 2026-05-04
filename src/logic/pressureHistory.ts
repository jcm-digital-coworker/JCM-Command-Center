const PRESSURE_HISTORY_KEY = 'jcm_pressure_history';
const THROTTLE_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 48;

export type PressureSnapshot = { score: number; ts: number };

export function recordPressureSnapshot(score: number): void {
  const history = getPressureHistory();
  const now = Date.now();
  if (history.length > 0 && now - history[history.length - 1].ts < THROTTLE_MS) return;
  const next = [...history, { score, ts: now }].slice(-MAX_ENTRIES);
  try { localStorage.setItem(PRESSURE_HISTORY_KEY, JSON.stringify(next)); } catch { /* storage full */ }
}

export function getPressureHistory(): PressureSnapshot[] {
  try {
    const raw = localStorage.getItem(PRESSURE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PressureSnapshot[]) : [];
  } catch { return []; }
}
