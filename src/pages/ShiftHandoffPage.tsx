import { useMemo, useState, type CSSProperties } from 'react';
import { getRuntimeProductionOrders } from '../logic/workflowRuntimeState';
import { maintenanceRequests } from '../data/maintenanceRequests';
import { seedCoverage } from '../data/coverage';
import { COVERAGE_STORAGE_KEY } from '../logic/coverage';
import type { CoveragePerson } from '../types/coverage';
import type { ProductionOrder } from '../types/productionOrder';

const SHIFT_SNAPSHOT_KEY = 'jcm_shift_start_snapshot';
const SHIFT_SNAPSHOT_MAX_AGE_MS = 18 * 60 * 60 * 1000;

type ShiftSnapshot = { ts: number; orderNums: string[]; blockedNums: string[]; maintCount: number };

function loadShiftSnapshot(): ShiftSnapshot | null {
  try {
    const raw = localStorage.getItem(SHIFT_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ShiftSnapshot;
    if (Date.now() - parsed.ts > SHIFT_SNAPSHOT_MAX_AGE_MS) return null;
    return parsed;
  } catch { return null; }
}

function saveShiftSnapshot(orders: ProductionOrder[], maintCount: number): ShiftSnapshot {
  const snapshot: ShiftSnapshot = {
    ts: Date.now(),
    orderNums: orders.map((o) => o.orderNumber),
    blockedNums: orders
      .filter((o) => String(o.flowStatus).toLowerCase() === 'blocked' || (o.blockers ?? []).length > 0)
      .map((o) => o.orderNumber),
    maintCount,
  };
  try { localStorage.setItem(SHIFT_SNAPSHOT_KEY, JSON.stringify(snapshot)); } catch { /* noop */ }
  return snapshot;
}

interface ShiftHandoffPageProps {
  theme?: 'dark' | 'light';
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

type SectionKey = 'crew' | 'ready' | 'blocked' | 'hold' | 'maintenance';

export default function ShiftHandoffPage({ theme = 'dark' }: ShiftHandoffPageProps) {
  const [copied, setCopied] = useState(false);
  const [included, setIncluded] = useState<Record<SectionKey, boolean>>({
    crew: true, ready: true, blocked: true, hold: true, maintenance: true,
  });
  const [snapshot, setSnapshot] = useState<ShiftSnapshot | null>(() => loadShiftSnapshot());
  const coverage = loadCoverage().filter((p) => p.status !== 'OFFLINE');
  const liveOrders = getRuntimeProductionOrders();

  function toggleSection(key: SectionKey) {
    setIncluded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const readyToRun = liveOrders.filter((o) =>
    String(o.status).toLowerCase() === 'ready' &&
    String(o.flowStatus).toLowerCase() !== 'blocked',
  );
  const blocked = liveOrders.filter((o) =>
    String(o.flowStatus).toLowerCase() === 'blocked' || (o.blockers ?? []).length > 0,
  );
  const onHold = liveOrders.filter((o) =>
    String(o.status).toLowerCase() === 'hold',
  );
  const openMaint = maintenanceRequests.filter((r) =>
    ['NEW', 'CLAIMED', 'IN_PROGRESS'].includes(r.status),
  );

  function handleMarkShiftStart() {
    const snap = saveShiftSnapshot(liveOrders, openMaint.length);
    setSnapshot(snap);
  }

  const shiftDiff = useMemo(() => {
    if (!snapshot) return null;
    const currentBlockedNums = new Set(
      liveOrders
        .filter((o) => String(o.flowStatus).toLowerCase() === 'blocked' || (o.blockers ?? []).length > 0)
        .map((o) => o.orderNumber),
    );
    const completed = snapshot.orderNums.filter((num) => {
      const order = liveOrders.find((o) => o.orderNumber === num);
      return !order || String(order.status).toLowerCase() === 'done';
    });
    const prevBlocked = new Set(snapshot.blockedNums);
    const newlyBlocked = [...currentBlockedNums].filter((num) => !prevBlocked.has(num));
    const resolved = snapshot.blockedNums.filter((num) => !currentBlockedNums.has(num));
    const maintDelta = openMaint.length - snapshot.maintCount;
    return { completed, newlyBlocked, resolved, maintDelta };
  }, [snapshot, liveOrders, openMaint.length]);

  function buildTextReport(): string {
    const now = new Date().toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });

    const lines: string[] = ['=== JCM INDUSTRIES — SHIFT HANDOFF REPORT ===', `Generated: ${now}`, ''];

    if (included.crew) {
      lines.push(`--- CREW ON SHIFT (${coverage.length}) ---`,
        ...coverage.map((p) => `  ${p.name} | ${p.role} | ${p.station} | ${p.status}${p.assignedTo ? ` → ${p.assignedTo}` : ''}`), '');
    }
    if (included.ready) {
      lines.push(`--- READY TO RUN (${readyToRun.length}) ---`,
        ...(readyToRun.length > 0
          ? readyToRun.map((o) => `  #${o.orderNumber} ${o.productFamily} — ${o.currentDepartment}${o.nextDepartment ? ` → ${o.nextDepartment}` : ''}`)
          : ['  None']), '');
    }
    if (included.blocked) {
      lines.push(`--- BLOCKED ORDERS (${blocked.length}) ---`,
        ...(blocked.length > 0
          ? blocked.map((o) => {
              const reasons = (o.blockers ?? []).map((b) => b.message).join('; ') || 'See order';
              return `  #${o.orderNumber} ${o.productFamily} — ${reasons}`;
            })
          : ['  None']), '');
    }
    if (included.hold) {
      lines.push(`--- ON HOLD (${onHold.length}) ---`,
        ...(onHold.length > 0
          ? onHold.map((o) => `  #${o.orderNumber} ${o.productFamily} — ${o.currentDepartment}`)
          : ['  None']), '');
    }
    if (included.maintenance) {
      lines.push(`--- OPEN MAINTENANCE REQUESTS (${openMaint.length}) ---`,
        ...(openMaint.length > 0
          ? openMaint.map((r) => `  [${r.status}] ${r.machineName} — ${r.priority} — ${r.problem.slice(0, 80)}`)
          : ['  None']), '');
    }

    lines.push('=== END OF REPORT ===');
    return lines.join('\n');
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildTextReport()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div style={pageStyle}>
      <div style={heroStyle(theme)}>
        <div style={eyebrowStyle}>Shift Tool</div>
        <h2 style={titleStyle(theme)}>SHIFT HANDOFF REPORT</h2>
        <p style={subtitleStyle(theme)}>Live snapshot of crew, orders, and open maintenance items. Share with the incoming shift lead.</p>
        {!snapshot ? (
          <button type="button" onClick={handleMarkShiftStart} style={markShiftStartStyle(theme)}>
            MARK SHIFT START
          </button>
        ) : shiftDiff && (
          <div style={shiftDiffBarStyle(theme)}>
            <span style={diffLabelStyle}>SINCE SHIFT START</span>
            {shiftDiff.completed.length > 0 && <span style={diffChipStyle('#10b981')}>✓ {shiftDiff.completed.length} completed</span>}
            {shiftDiff.newlyBlocked.length > 0 && <span style={diffChipStyle('#ef4444')}>⚠ {shiftDiff.newlyBlocked.length} newly blocked</span>}
            {shiftDiff.resolved.length > 0 && <span style={diffChipStyle('#38bdf8')}>↑ {shiftDiff.resolved.length} blocker{shiftDiff.resolved.length !== 1 ? 's' : ''} resolved</span>}
            {shiftDiff.maintDelta > 0 && <span style={diffChipStyle('#f59e0b')}>+ {shiftDiff.maintDelta} maint request{shiftDiff.maintDelta !== 1 ? 's' : ''}</span>}
            {shiftDiff.completed.length === 0 && shiftDiff.newlyBlocked.length === 0 && shiftDiff.resolved.length === 0 && shiftDiff.maintDelta <= 0 && (
              <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>No changes yet this shift.</span>
            )}
            <button type="button" onClick={handleMarkShiftStart} style={resetShiftStyle}>RESET</button>
          </div>
        )}

        <div style={toggleRowStyle}>
          {(['crew', 'ready', 'blocked', 'hold', 'maintenance'] as SectionKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSection(key)}
              style={toggleButtonStyle(included[key], theme)}
            >
              {key === 'crew' ? 'Crew' : key === 'ready' ? 'Ready' : key === 'blocked' ? 'Blocked' : key === 'hold' ? 'On Hold' : 'Maintenance'}
            </button>
          ))}
        </div>
        <button onClick={handleCopy} style={copyButtonStyle(copied)}>
          {copied ? '✓ COPIED TO CLIPBOARD' : 'COPY AS TEXT'}
        </button>
      </div>

      {included.crew && (
        <ReportSection title={`Crew on Shift — ${coverage.length} people`} theme={theme}>
          {coverage.length === 0
            ? <EmptyRow text="No crew signed in." theme={theme} />
            : coverage.map((p) => {
                const dot = p.status === 'AVAILABLE' ? '#10b981' : p.status === 'ASSIGNED' ? '#f59e0b' : '#8b5cf6';
                return (
                  <Row key={p.id} theme={theme} accent={dot}>
                    <span style={boldStyle(theme)}>{p.name}</span>
                    <span style={mutedStyle}>{p.role}</span>
                    <span style={mutedStyle}>{p.station}</span>
                    <span style={{ color: dot, fontWeight: 900, fontSize: 11 }}>{p.status}</span>
                    {p.assignedTo && <span style={{ ...mutedStyle, gridColumn: '1 / -1' }}>→ {p.assignedTo}</span>}
                  </Row>
                );
              })}
        </ReportSection>
      )}

      {included.ready && (
        <ReportSection title={`Ready to Run — ${readyToRun.length}`} theme={theme}>
          {readyToRun.length === 0
            ? <EmptyRow text="No orders currently ready to run." theme={theme} />
            : readyToRun.map((o) => (
                <Row key={o.orderNumber} theme={theme} accent="#10b981">
                  <span style={boldStyle(theme)}>#{o.orderNumber} — {o.productFamily}</span>
                  <span style={mutedStyle}>{o.currentDepartment}{o.nextDepartment ? ` → ${o.nextDepartment}` : ''}</span>
                </Row>
              ))}
        </ReportSection>
      )}

      {included.blocked && (
        <ReportSection title={`Blocked Orders — ${blocked.length}`} theme={theme}>
          {blocked.length === 0
            ? <EmptyRow text="No blocked orders." theme={theme} />
            : blocked.map((o) => (
                <Row key={o.orderNumber} theme={theme} accent="#ef4444">
                  <span style={boldStyle(theme)}>#{o.orderNumber} — {o.productFamily}</span>
                  {(o.blockers ?? []).map((b, i) => (
                    <span key={i} style={{ ...mutedStyle, color: theme === 'dark' ? '#fca5a5' : '#991b1b' }}>
                      ⚠ {b.type}: {b.message}
                    </span>
                  ))}
                </Row>
              ))}
        </ReportSection>
      )}

      {included.hold && (
        <ReportSection title={`On Hold — ${onHold.length}`} theme={theme}>
          {onHold.length === 0
            ? <EmptyRow text="No orders currently on hold." theme={theme} />
            : onHold.map((o) => (
                <Row key={o.orderNumber} theme={theme} accent="#64748b">
                  <span style={boldStyle(theme)}>#{o.orderNumber} — {o.productFamily}</span>
                  <span style={mutedStyle}>{o.currentDepartment}</span>
                </Row>
              ))}
        </ReportSection>
      )}

      {included.maintenance && (
        <ReportSection title={`Open Maintenance Requests — ${openMaint.length}`} theme={theme}>
          {openMaint.length === 0
            ? <EmptyRow text="No open maintenance requests." theme={theme} />
            : openMaint.map((r) => {
                const accent = r.priority === 'LINE_DOWN' || r.priority === 'MACHINE_DOWN' || r.priority === 'SAFETY'
                  ? '#ef4444' : r.priority === 'URGENT' ? '#f59e0b' : '#64748b';
                return (
                  <Row key={r.id} theme={theme} accent={accent}>
                    <span style={boldStyle(theme)}>{r.machineName}</span>
                    <span style={{ color: accent, fontWeight: 900, fontSize: 11 }}>{r.priority}</span>
                    <span style={{ ...mutedStyle, gridColumn: '1 / -1' }}>{r.problem}</span>
                    <span style={mutedStyle}>Submitted by {r.submittedBy} · {r.status}</span>
                  </Row>
                );
              })}
        </ReportSection>
      )}
    </div>
  );
}

function ReportSection({ title, children, theme }: { title: string; children: React.ReactNode; theme: 'dark' | 'light' }) {
  return (
    <section style={sectionStyle(theme)}>
      <h3 style={sectionTitleStyle(theme)}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </section>
  );
}

function Row({ children, theme, accent }: { children: React.ReactNode; theme: 'dark' | 'light'; accent: string }) {
  return (
    <div style={rowStyle(theme, accent)}>{children}</div>
  );
}

function EmptyRow({ text, theme }: { text: string; theme: 'dark' | 'light' }) {
  return <div style={emptyRowStyle(theme)}>{text}</div>;
}

const pageStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6 };
const mutedStyle: CSSProperties = { color: '#64748b', fontSize: 12, fontWeight: 700 };

function heroStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 20, borderRadius: 6, borderLeft: '4px solid #f97316',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    background: theme === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : '#ffffff',
  };
}

function titleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { margin: '0 0 6px 0', fontSize: 22, fontWeight: 900, color: theme === 'dark' ? '#f8fafc' : '#0f172a', letterSpacing: '0.5px' };
}

function subtitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { margin: '0 0 14px 0', fontSize: 13, color: '#64748b' };
}

function boldStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontWeight: 800, fontSize: 13 };
}

function sectionStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 16, borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
  };
}

function sectionTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { margin: '0 0 12px 0', fontSize: 13, fontWeight: 900, color: theme === 'dark' ? '#cbd5e1' : '#475569', letterSpacing: '0.5px', textTransform: 'uppercase' };
}

function rowStyle(theme: 'dark' | 'light', accent: string): CSSProperties {
  return {
    display: 'grid', gridTemplateColumns: 'auto auto auto 1fr', gap: '4px 12px', alignItems: 'center',
    padding: '8px 12px', borderRadius: 4, borderLeft: `3px solid ${accent}`,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    flexWrap: 'wrap',
  };
}

function emptyRowStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 10, borderRadius: 4, fontSize: 12, color: '#64748b', fontWeight: 700,
    border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1',
  };
}

function copyButtonStyle(copied: boolean): CSSProperties {
  return {
    padding: '10px 20px', borderRadius: 6, border: copied ? '1px solid #10b981' : '1px solid #f97316',
    background: copied ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    color: copied ? '#10b981' : '#ffffff', fontWeight: 900, fontSize: 13, cursor: 'pointer',
    letterSpacing: '0.5px', transition: 'all 0.2s',
  };
}

const toggleRowStyle: CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12,
};

function toggleButtonStyle(active: boolean, theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '5px 12px', borderRadius: 4, fontSize: 11, fontWeight: 900, cursor: 'pointer',
    border: active ? '1px solid #f97316' : theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    background: active ? 'rgba(249,115,22,0.15)' : 'transparent',
    color: active ? '#f97316' : '#64748b',
    letterSpacing: '0.3px',
  };
}

function markShiftStartStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginBottom: 12, padding: '7px 14px', borderRadius: 5, cursor: 'pointer',
    border: theme === 'dark' ? '1px dashed #475569' : '1px dashed #cbd5e1',
    background: 'transparent', color: '#64748b', fontSize: 11, fontWeight: 900, letterSpacing: '0.5px',
  };
}

function shiftDiffBarStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
    marginBottom: 12, padding: '8px 12px', borderRadius: 6,
    background: theme === 'dark' ? 'rgba(15,23,42,0.6)' : '#f1f5f9',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
  };
}

const diffLabelStyle: CSSProperties = {
  fontSize: 9, fontWeight: 900, letterSpacing: '1px', color: '#64748b', textTransform: 'uppercase', marginRight: 2,
};

function diffChipStyle(color: string): CSSProperties {
  return {
    padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800,
    background: `${color}18`, border: `1px solid ${color}50`, color,
  };
}

const resetShiftStyle: CSSProperties = {
  marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, border: '1px solid #334155',
  background: 'transparent', color: '#475569', fontSize: 10, fontWeight: 900, cursor: 'pointer',
  letterSpacing: '0.3px',
};
