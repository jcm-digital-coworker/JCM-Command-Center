import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AppTab } from '../../types/app';
import type { Department } from '../../types/machine';
import type { CoveragePerson } from '../../types/coverage';
import { getRuntimeProductionOrders } from '../../logic/workflowRuntimeState';
import { WORKFLOW_RUNTIME_UPDATED_EVENT } from '../../logic/workflowRuntimeState';
import { seedCoverage } from '../../data/coverage';
import { COVERAGE_STORAGE_KEY } from '../../logic/coverage';

type DashboardTheme = 'dark' | 'light';

interface DeptHealthTilesPanelProps {
  onNavigate: (tab: AppTab) => void;
  theme: DashboardTheme;
}

type DeptTileConfig = {
  label: string;
  dept: Department;
  tab: AppTab;
  color: string;
};

const DEPT_TILES: DeptTileConfig[] = [
  { label: 'Fab', dept: 'Fab', tab: 'fab', color: '#f97316' },
  { label: 'Coating', dept: 'Coating', tab: 'coating', color: '#a78bfa' },
  { label: 'Assembly', dept: 'Assembly', tab: 'assembly', color: '#38bdf8' },
  { label: 'Shipping', dept: 'Shipping', tab: 'shipping', color: '#10b981' },
  { label: 'QA', dept: 'QA', tab: 'qa', color: '#f59e0b' },
  { label: 'Saddles', dept: 'Saddles Dept', tab: 'saddles', color: '#fb7185' },
  { label: 'Engineering', dept: 'Engineering', tab: 'engineering', color: '#818cf8' },
  { label: 'Receiving', dept: 'Receiving', tab: 'receiving', color: '#34d399' },
];

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

export default function DeptHealthTilesPanel({ onNavigate, theme }: DeptHealthTilesPanelProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  void tick;

  const orders = getRuntimeProductionOrders();
  const coverage = loadCoverage().filter((p) => p.status !== 'OFFLINE');

  return (
    <section style={sectionStyle}>
      <div style={headerStyle(theme)}>
        <span style={labelStyle}>DEPARTMENT HEALTH</span>
        <span style={hintStyle}>Tap a department to open it</span>
      </div>
      <div style={gridStyle}>
        {DEPT_TILES.map((tile) => {
          const deptOrders = orders.filter((o) => o.currentDepartment === tile.dept);
          const blockedCount = deptOrders.filter(
            (o) =>
              String(o.flowStatus).toLowerCase() === 'blocked' ||
              (o.blockers ?? []).length > 0,
          ).length;
          const crewCount = coverage.filter((p) => p.department === tile.dept).length;

          return (
            <button
              key={tile.dept}
              type="button"
              style={tileStyle(theme, tile.color, blockedCount > 0)}
              onClick={() => onNavigate(tile.tab)}
            >
              <div style={tileTopRow}>
                <span style={tileLabelStyle(theme)}>{tile.label.toUpperCase()}</span>
                {blockedCount > 0 && (
                  <span style={blockedBadgeStyle}>{blockedCount} BLK</span>
                )}
              </div>
              <div style={tileMetricsRow}>
                <Metric value={deptOrders.length} label="orders" color={tile.color} />
                <Metric value={crewCount} label="crew" color={crewCount === 0 ? '#ef4444' : '#64748b'} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color, fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: 9, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
    </div>
  );
}

const sectionStyle: CSSProperties = { marginBottom: 18 };

function headerStyle(theme: DashboardTheme): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    color: theme === 'dark' ? '#64748b' : '#64748b',
  };
}

const labelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
  color: '#64748b',
};

const hintStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#475569',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
  gap: 8,
};

const tileTopRow: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 4,
  marginBottom: 10,
};

const tileMetricsRow: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  gap: 4,
};

function tileStyle(theme: DashboardTheme, accentColor: string, hasBlockers: boolean): CSSProperties {
  return {
    padding: '10px 12px',
    borderRadius: 8,
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: hasBlockers
      ? '1px solid rgba(239,68,68,0.5)'
      : theme === 'dark'
        ? '1px solid #334155'
        : '1px solid #e2e8f0',
    borderLeft: `3px solid ${hasBlockers ? '#ef4444' : accentColor}`,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s',
  };
}

function tileLabelStyle(theme: DashboardTheme): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.5px',
    color: theme === 'dark' ? '#cbd5e1' : '#334155',
  };
}

const blockedBadgeStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 900,
  color: '#fca5a5',
  background: 'rgba(239,68,68,0.18)',
  border: '1px solid rgba(239,68,68,0.4)',
  borderRadius: 3,
  padding: '2px 4px',
  whiteSpace: 'nowrap',
};
