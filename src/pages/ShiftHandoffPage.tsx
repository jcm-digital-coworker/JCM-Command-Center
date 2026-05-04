import { useState, type CSSProperties } from 'react';
import { getRuntimeProductionOrders } from '../logic/workflowRuntimeState';
import { maintenanceRequests } from '../data/maintenanceRequests';
import { seedCoverage } from '../data/coverage';
import { COVERAGE_STORAGE_KEY } from '../logic/coverage';
import type { CoveragePerson } from '../types/coverage';

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
