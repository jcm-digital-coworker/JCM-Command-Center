import { useMemo, useState, type CSSProperties } from 'react';
import { seedReceivingOrders } from '../data/receivingOrders';
import type { ReceivingOrder } from '../types/receiving';
import { RECEIVING_STORAGE_KEY } from '../logic/receivingWorkflow';

type ThemeMode = 'dark' | 'light';
type ReceivingShortcut = 'arriving' | 'ready' | 'claimed' | 'delivered' | 'holds';

interface ReceivingWorkflowPanelProps {
  theme?: ThemeMode;
  onOpenQueue?: (view: ReceivingShortcut) => void;
}

export default function ReceivingWorkflowPanel({ theme = 'dark', onOpenQueue }: ReceivingWorkflowPanelProps) {
  const [orders] = useState<ReceivingOrder[]>(() => loadOrders());
  const summary = useMemo(() => ({
    arriving: orders.filter((order) => order.status === 'ARRIVING_TODAY').length,
    ready: orders.filter((order) => order.status === 'CHECKED_IN').length,
    claimed: orders.filter((order) => order.status === 'CLAIMED_FOR_DELIVERY').length,
    delivered: orders.filter((order) => order.status === 'DELIVERED').length,
    holds: orders.filter((order) => order.status === 'PROBLEM_HOLD').length,
  }), [orders]);

  return (
    <section style={getShellStyle(theme)}>
      <div style={getHeaderStyle()}>
        <div>
          <div style={eyebrowStyle}>RECEIVING WORKFLOW</div>
          <h3 style={getTitleStyle(theme)}>Digital receiver shortcuts</h3>
          <p style={getSubTextStyle(theme)}>Tap a status to open the working queue. Department material requests enter here after Receiving verifies and fulfills them.</p>
        </div>
      </div>
      <div style={getMetricGridStyle()}>
        <Shortcut label="Arriving today" value={summary.arriving} tone="HOT" onClick={() => onOpenQueue?.('arriving')} theme={theme} />
        <Shortcut label="Ready for driver" value={summary.ready} tone="INFO" onClick={() => onOpenQueue?.('ready')} theme={theme} />
        <Shortcut label="Claimed" value={summary.claimed} tone="WARN" onClick={() => onOpenQueue?.('claimed')} theme={theme} />
        <Shortcut label="Delivered" value={summary.delivered} tone="OK" onClick={() => onOpenQueue?.('delivered')} theme={theme} />
        <Shortcut label="Problem holds" value={summary.holds} tone="DANGER" onClick={() => onOpenQueue?.('holds')} theme={theme} />
      </div>
    </section>
  );
}

function loadOrders(): ReceivingOrder[] {
  try {
    const stored = localStorage.getItem(RECEIVING_STORAGE_KEY);
    if (!stored) return seedReceivingOrders;
    const parsed = JSON.parse(stored) as ReceivingOrder[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedReceivingOrders;
  } catch {
    return seedReceivingOrders;
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
function getToneColor(tone: string): string { if (tone === 'OK') return '#10b981'; if (tone === 'WARN') return '#f59e0b'; if (tone === 'DANGER') return '#dc2626'; if (tone === 'INFO') return '#38bdf8'; return '#f97316'; }
function getMetricButtonStyle(theme: ThemeMode, tone: string): CSSProperties { const color = getToneColor(tone); return { textAlign: 'left', padding: 14, borderRadius: 8, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}66`, borderLeft: `5px solid ${color}`, cursor: 'pointer' }; }
function getMetricValueStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 25, fontWeight: 900 }; }
function getMetricLabelStyle(theme: ThemeMode): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 900, letterSpacing: '0.8px', textTransform: 'uppercase' }; }
