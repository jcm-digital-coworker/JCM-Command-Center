import { useState, type CSSProperties } from 'react';
import { productionOrders } from '../data/productionOrders';
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

export default function ShiftHandoffPage({ theme = 'dark' }: ShiftHandoffPageProps) {
  const [copied, setCopied] = useState(false);
  const coverage = loadCoverage().filter((p) => p.status !== 'OFFLINE');

  const inProgress = productionOrders.filter((o) =>
    ['in_progress', 'in progress', 'running'].includes(String(o.status).toLowerCase()),
  );
  const blocked = productionOrders.filter((o) =>
    String(o.flowStatus).toLowerCase() === 'blocked' || (o.blockers ?? []).length > 0,
  );
  const completed = productionOrders.filter((o) =>
    ['done', 'completed', 'complete'].includes(String(o.status).toLowerCase()),
  );
  const openMaint = maintenanceRequests.filter((r) =>
    ['NEW', 'CLAIMED', 'IN_PROGRESS'].includes(r.status),
  );

  function buildTextReport(): string {
    const now = new Date().toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });

    const lines: string[] = [
      '=== JCM INDUSTRIES — SHIFT HANDOFF REPORT ===',
      `Generated: ${now}`,
      '',
      `--- CREW ON SHIFT (${coverage.length}) ---`,
      ...coverage.map((p) => `  ${p.name} | ${p.role} | ${p.station} | ${p.status}${p.assignedTo ? ` → ${p.assignedTo}` : ''}`),
      '',
      `--- ORDERS IN PROGRESS (${inProgress.length}) ---`,
      ...(inProgress.length > 0
        ? inProgress.map((o) => `  #${o.orderNumber} ${o.productFamily} — ${o.currentDepartment}${o.nextDepartment ? ` → ${o.nextDepartment}` : ''}`)
        : ['  None']),
      '',
      `--- BLOCKED ORDERS (${blocked.length}) ---`,
      ...(blocked.length > 0
        ? blocked.map((o) => {
            const reasons = (o.blockers ?? []).map((b) => b.message).join('; ') || 'See order';
            return `  #${o.orderNumber} ${o.productFamily} — ${reasons}`;
          })
        : ['  None']),
      '',
      `--- COMPLETED ORDERS (${completed.length}) ---`,
      ...(completed.length > 0
        ? completed.map((o) => `  #${o.orderNumber} ${o.productFamily}`)
        : ['  None']),
      '',
      `--- OPEN MAINTENANCE REQUESTS (${openMaint.length}) ---`,
      ...(openMaint.length > 0
        ? openMaint.map((r) => `  [${r.status}] ${r.machineName} — ${r.priority} — ${r.problem.slice(0, 80)}`)
        : ['  None']),
      '',
      '=== END OF REPORT ===',
    ];

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
        <button onClick={handleCopy} style={copyButtonStyle(copied)}>
          {copied ? '✓ COPIED TO CLIPBOARD' : 'COPY AS TEXT'}
        </button>
      </div>

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

      <ReportSection title={`Orders In Progress — ${inProgress.length}`} theme={theme}>
        {inProgress.length === 0
          ? <EmptyRow text="No orders currently in progress." theme={theme} />
          : inProgress.map((o) => (
              <Row key={o.orderNumber} theme={theme} accent="#10b981">
                <span style={boldStyle(theme)}>#{o.orderNumber} — {o.productFamily}</span>
                <span style={mutedStyle}>{o.currentDepartment}{o.nextDepartment ? ` → ${o.nextDepartment}` : ''}</span>
              </Row>
            ))}
      </ReportSection>

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

      <ReportSection title={`Completed Orders — ${completed.length}`} theme={theme}>
        {completed.length === 0
          ? <EmptyRow text="No orders marked complete." theme={theme} />
          : completed.map((o) => (
              <Row key={o.orderNumber} theme={theme} accent="#334155">
                <span style={boldStyle(theme)}>#{o.orderNumber} — {o.productFamily}</span>
              </Row>
            ))}
      </ReportSection>

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
