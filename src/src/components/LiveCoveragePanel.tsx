import { useMemo, useState, type CSSProperties } from 'react';
import { seedCoverage } from '../data/coverage';
import type { Department } from '../types/machine';
import type { CoveragePerson } from '../types/coverage';
import { COVERAGE_STORAGE_KEY, getCoverageNextAction, getCoverageSummary } from '../logic/coverage';

type ThemeMode = 'dark' | 'light';
type CoverageShortcut = 'signin' | 'available' | 'assigned' | 'break' | 'offline';

type LiveCoveragePanelProps = {
  theme?: ThemeMode;
  department?: Department;
  onOpenStatus?: (view: CoverageShortcut) => void;
};

export default function LiveCoveragePanel({ theme = 'dark', department, onOpenStatus }: LiveCoveragePanelProps) {
  const [people] = useState<CoveragePerson[]>(() => loadCoverage());
  const summary = useMemo(() => getCoverageSummary(people, department), [people, department]);

  return (
    <section style={getShellStyle(theme)}>
      <div style={getHeaderStyle()}>
        <div>
          <div style={eyebrowStyle}>LIVE COVERAGE / ROLL CALL</div>
          <h3 style={getTitleStyle(theme)}>{department ? `${department} coverage shortcuts` : 'Plant coverage shortcuts'}</h3>
          <p style={getSubTextStyle(theme)}>{getCoverageNextAction(people, department)}</p>
        </div>
        <button onClick={() => onOpenStatus?.('signin')} style={getPrimaryButtonStyle(theme)}>SIGN IN</button>
      </div>
      <div style={getMetricGridStyle()}>
        <Shortcut label="Available" value={summary.available} tone="OK" onClick={() => onOpenStatus?.('available')} theme={theme} />
        <Shortcut label="Assigned" value={summary.assigned} tone="WARN" onClick={() => onOpenStatus?.('assigned')} theme={theme} />
        <Shortcut label="Break" value={summary.breakCount} tone="HOLD" onClick={() => onOpenStatus?.('break')} theme={theme} />
        <Shortcut label="Signed out" value={summary.offline} tone="OFF" onClick={() => onOpenStatus?.('offline')} theme={theme} />
      </div>
    </section>
  );
}

function loadCoverage(): CoveragePerson[] {
  try {
    const stored = localStorage.getItem(COVERAGE_STORAGE_KEY);
    if (!stored) return seedCoverage;
    const parsed = JSON.parse(stored) as CoveragePerson[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedCoverage;
  } catch {
    return seedCoverage;
  }
}

function Shortcut({ label, value, tone, onClick, theme }: { label: string; value: number; tone: string; onClick: () => void; theme: ThemeMode }) {
  return <button onClick={onClick} style={getMetricButtonStyle(theme, tone)}><div style={getMetricValueStyle(theme)}>{value}</div><div style={getMetricLabelStyle(theme)}>{label}</div></button>;
}

const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.3px', textTransform: 'uppercase', marginBottom: 8 };
function getShellStyle(theme: ThemeMode): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.18)' }; }
function getHeaderStyle(): CSSProperties { return { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 16 }; }
function getTitleStyle(theme: ThemeMode): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 22, fontWeight: 900, letterSpacing: '0.4px' }; }
function getSubTextStyle(theme: ThemeMode): CSSProperties { return { margin: '6px 0 0 0', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 13, lineHeight: 1.45 }; }
function getMetricGridStyle(): CSSProperties { return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }; }
function getToneColor(tone: string): string { if (tone === 'OK') return '#10b981'; if (tone === 'WARN') return '#f59e0b'; if (tone === 'HOLD') return '#8b5cf6'; if (tone === 'OFF') return '#64748b'; return '#38bdf8'; }
function getMetricButtonStyle(theme: ThemeMode, tone: string): CSSProperties { const color = getToneColor(tone); return { textAlign: 'left', padding: 14, borderRadius: 8, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}66`, borderLeft: `5px solid ${color}`, cursor: 'pointer' }; }
function getMetricValueStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 25, fontWeight: 900 }; }
function getMetricLabelStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 900, letterSpacing: '0.8px', textTransform: 'uppercase' }; }
function getPrimaryButtonStyle(theme: ThemeMode): CSSProperties { return { padding: '10px 13px', borderRadius: 4, border: '1px solid #f97316', background: '#f97316', color: theme === 'dark' ? '#111827' : '#ffffff', fontWeight: 900, fontSize: 11, letterSpacing: '0.7px', cursor: 'pointer' }; }
