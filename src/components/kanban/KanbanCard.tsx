import type { CSSProperties } from 'react';
import type { ProductionOrder } from '../../types/productionOrder';
import { getUrgencyScore, getUrgencyColor } from '../../logic/urgencyScore';
import { isFeatureEnabled } from '../../logic/featureFlags';

type Props = {
  order: ProductionOrder;
  theme: 'dark' | 'light';
  subStageLabel?: string;
  onAdvanceSubStage?: () => void;
  onClick?: () => void;
};

export default function KanbanCard({ order, theme, subStageLabel, onAdvanceSubStage, onClick }: Props) {
  const isBlocked = (order.blockers ?? []).length > 0 || String(order.flowStatus).toLowerCase() === 'blocked';
  const isRunnable = String(order.flowStatus).toLowerCase() === 'runnable';
  const priority = String(order.priority ?? 'normal').toUpperCase();
  const priorityColor = priority === 'CRITICAL' ? '#dc2626' : priority === 'HOT' ? '#f59e0b' : '#64748b';
  const borderColor = isBlocked ? '#dc2626' : isRunnable ? '#10b981' : '#475569';
  const showUrgency = isFeatureEnabled('urgencyScore');
  const score = showUrgency ? getUrgencyScore(order) : null;
  const scoreColor = score !== null ? getUrgencyColor(score) : '#64748b';

  const daysToShip = order.projectedShipDate
    ? Math.ceil((new Date(order.projectedShipDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div
      style={cardStyle(theme, borderColor)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div style={cardTopStyle}>
        <span style={orderNumStyle(theme)}>#{order.orderNumber}</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {score !== null && (
            <span style={scoreBadge(scoreColor)}>{score}</span>
          )}
          <span style={priorityDot(priorityColor)} title={priority} />
        </div>
      </div>

      <div style={familyStyle(theme)}>{order.productFamily}</div>

      {order.customer && (
        <div style={customerStyle(theme)}>{order.customer}</div>
      )}

      <div style={metaRowStyle}>
        {daysToShip !== null && (
          <span style={daysStyle(daysToShip)}>
            {daysToShip < 0 ? `${Math.abs(daysToShip)}d LATE` : daysToShip === 0 ? 'SHIPS TODAY' : `${daysToShip}d`}
          </span>
        )}
        {subStageLabel && (
          <span style={subStageChip(theme)}>{subStageLabel}</span>
        )}
      </div>

      {isBlocked && (order.blockers ?? []).length > 0 && (
        <div style={blockerTag(theme)}>⚠ {order.blockers![0].message}</div>
      )}

      {onAdvanceSubStage && (
        <button type="button" style={advanceButton} onClick={(e) => { e.stopPropagation(); onAdvanceSubStage(); }}>
          ADVANCE →
        </button>
      )}
    </div>
  );
}

function cardStyle(theme: 'dark' | 'light', borderColor: string): CSSProperties {
  return {
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    border: `1px solid ${borderColor}55`,
    borderLeft: `4px solid ${borderColor}`,
    borderRadius: 6,
    padding: '10px 11px',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  };
}

const cardTopStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 4 };
function orderNumStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 12, fontWeight: 900, color: theme === 'dark' ? '#f8fafc' : '#0f172a', letterSpacing: '0.3px' }; }
function familyStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 11, color: theme === 'dark' ? '#cbd5e1' : '#475569', fontWeight: 700, marginBottom: 2 }; }
function customerStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 10, color: theme === 'dark' ? '#64748b' : '#94a3b8', marginBottom: 4 }; }
const metaRowStyle: CSSProperties = { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4, alignItems: 'center' };
function daysStyle(days: number): CSSProperties { const color = days < 0 ? '#dc2626' : days <= 2 ? '#f59e0b' : '#64748b'; return { fontSize: 10, fontWeight: 900, color, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 3, padding: '1px 5px' }; }
function subStageChip(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 10, fontWeight: 700, color: theme === 'dark' ? '#7dd3fc' : '#0369a1', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 3, padding: '1px 5px' }; }
function blockerTag(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 5, fontSize: 10, fontWeight: 700, color: theme === 'dark' ? '#fca5a5' : '#991b1b', background: 'rgba(220,38,38,0.08)', borderRadius: 3, padding: '3px 6px', lineHeight: 1.3 }; }
function scoreBadge(color: string): CSSProperties { return { fontSize: 9, fontWeight: 900, color, background: `${color}22`, border: `1px solid ${color}55`, borderRadius: 3, padding: '1px 4px' }; }
function priorityDot(color: string): CSSProperties { return { width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }; }
const advanceButton: CSSProperties = { marginTop: 7, width: '100%', padding: '5px 0', borderRadius: 3, border: '1px solid #38bdf8', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: 9, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.5px' };
