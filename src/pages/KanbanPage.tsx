import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { productionOrders } from '../data/productionOrders';
import { getRuntimeProductionOrders, WORKFLOW_RUNTIME_UPDATED_EVENT } from '../logic/workflowRuntimeState';
import { getUrgencyScore } from '../logic/urgencyScore';
import { isBlockedProductionOrder, isClosedProductionStatus, isCriticalPriority, isHotPriority } from '../logic/orderStatusTruth';
import KanbanCard from '../components/kanban/KanbanCard';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import type { ProductionOrder } from '../types/productionOrder';
import type { Department } from '../types/machine';
import type { AppTab } from '../types/app';

const PLANT_COLUMNS: Department[] = [
  'Sales', 'Engineering', 'Receiving', 'Machine Shop',
  'Material Handling', 'Fab', 'Coating', 'Assembly',
  'Saddles Dept', 'QA', 'Shipping',
];

type PriorityFilter = 'ALL' | 'CRITICAL' | 'HOT' | 'BLOCKED';

type Props = {
  theme?: 'dark' | 'light';
  onGoToTab?: (tab: AppTab) => void;
};

export default function KanbanPage({ theme = 'dark', onGoToTab }: Props) {
  const [tick, setTick] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [deptFilter, setDeptFilter] = useState<Department | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  const allOrders = useMemo(() => getRuntimeProductionOrders(productionOrders), [tick]);

  const activeOrders = useMemo(() => {
    let base = showDone ? allOrders : allOrders.filter((o) => !isClosedProductionStatus(o.status));
    if (priorityFilter === 'CRITICAL') base = base.filter((o) => isCriticalPriority(o.priority));
    if (priorityFilter === 'HOT') base = base.filter((o) => isHotPriority(o.priority) || isCriticalPriority(o.priority));
    if (priorityFilter === 'BLOCKED') base = base.filter(isBlockedProductionOrder);
    return [...base].sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a));
  }, [allOrders, showDone, priorityFilter]);

  const visibleColumns = deptFilter === 'ALL' ? PLANT_COLUMNS : PLANT_COLUMNS.filter((d) => d === deptFilter);

  function ordersForColumn(dept: Department): ProductionOrder[] {
    return activeOrders.filter((o) => o.currentDepartment === dept);
  }

  const blockedTotal = activeOrders.filter(isBlockedProductionOrder).length;

  return (
    <div style={pageStyle}>
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          theme={theme}
          onClose={() => setSelectedOrder(null)}
          onOpenOrders={onGoToTab ? () => { setSelectedOrder(null); onGoToTab('orders'); } : undefined}
        />
      )}
      <div style={headerStyle(theme)}>
        <div>
          <div style={eyebrowStyle}>PLANT-WIDE VIEW</div>
          <h2 style={titleStyle(theme)}>War Board</h2>
          <p style={subTextStyle(theme)}>
            {activeOrders.length} order{activeOrders.length !== 1 ? 's' : ''} across {visibleColumns.length} department{visibleColumns.length !== 1 ? 's' : ''}
            {blockedTotal > 0 && <span style={{ color: '#dc2626', fontWeight: 900 }}> · {blockedTotal} BLOCKED</span>}
          </p>
        </div>
        <div style={controlsStyle}>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value as Department | 'ALL')}
            style={selectStyle(theme)}
            aria-label="Filter by department"
          >
            <option value="ALL">All departments</option>
            {PLANT_COLUMNS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <div style={filterRowStyle}>
            {(['ALL', 'CRITICAL', 'HOT', 'BLOCKED'] as PriorityFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                style={filterChip(f, priorityFilter, theme)}
                onClick={() => setPriorityFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            type="button"
            style={showDone ? toggleOnStyle : toggleOffStyle(theme)}
            onClick={() => setShowDone((v) => !v)}
          >
            {showDone ? 'HIDE DONE' : 'SHOW DONE'}
          </button>
        </div>
      </div>

      <div style={boardStyle}>
        {visibleColumns.map((dept) => {
          const cards = ordersForColumn(dept);
          const blocked = cards.filter(isBlockedProductionOrder).length;
          return (
            <div key={dept} style={columnStyle(theme, blocked > 0)}>
              <div style={columnHeaderStyle(theme, blocked > 0)}>
                <span style={columnTitleStyle}>{dept.toUpperCase()}</span>
                <span style={columnCountStyle(blocked > 0, theme)}>
                  {cards.length}{blocked > 0 ? ` · ${blocked}⚠` : ''}
                </span>
              </div>
              <div style={columnBodyStyle}>
                {cards.length === 0 ? (
                  <div style={emptyColumnStyle(theme)}>—</div>
                ) : (
                  cards.map((order) => (
                    <KanbanCard
                      key={order.orderNumber}
                      order={order}
                      theme={theme}
                      subStageLabel={
                        order.deptSubStage?.department === dept
                          ? order.deptSubStage.stage
                          : undefined
                      }
                      onClick={() => setSelectedOrder(order)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = { minHeight: '100vh' };

function headerStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '16px 20px',
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  };
}

const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.3px', textTransform: 'uppercase', marginBottom: 4 };

function titleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 24, fontWeight: 900, letterSpacing: '0.4px' };
}

function subTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return { margin: '4px 0 0', fontSize: 13, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 600 };
}

const controlsStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' };
const filterRowStyle: CSSProperties = { display: 'flex', gap: 4 };

function filterChip(filter: PriorityFilter, active: PriorityFilter, theme: 'dark' | 'light'): CSSProperties {
  const isActive = filter === active;
  const accentColor = filter === 'CRITICAL' ? '#dc2626' : filter === 'HOT' ? '#f97316' : filter === 'BLOCKED' ? '#f59e0b' : '#64748b';
  return {
    padding: '4px 10px',
    borderRadius: 4,
    border: isActive ? `1px solid ${accentColor}` : `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
    background: isActive ? `${accentColor}18` : 'transparent',
    color: isActive ? accentColor : theme === 'dark' ? '#64748b' : '#94a3b8',
    fontSize: 10,
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: '0.5px',
  };
}

function selectStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '5px 10px',
    borderRadius: 4,
    border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    color: theme === 'dark' ? '#cbd5e1' : '#334155',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  };
}

function toggleOffStyle(theme: 'dark' | 'light'): CSSProperties {
  return { padding: '5px 12px', borderRadius: 4, border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`, background: 'transparent', color: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.5px' };
}

const toggleOnStyle: CSSProperties = { padding: '5px 12px', borderRadius: 4, border: '1px solid #f97316', color: '#f97316', background: 'rgba(249,115,22,0.1)', fontSize: 10, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.5px' };

const boardStyle: CSSProperties = { display: 'flex', gap: 0, overflowX: 'auto', minHeight: 'calc(100vh - 140px)', alignItems: 'flex-start' };

function columnStyle(theme: 'dark' | 'light', hasBlocked: boolean): CSSProperties {
  return {
    minWidth: 220,
    maxWidth: 260,
    flex: '0 0 230px',
    borderRight: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
    background: hasBlocked
      ? theme === 'dark' ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.02)'
      : 'transparent',
    display: 'flex',
    flexDirection: 'column',
  };
}

function columnHeaderStyle(theme: 'dark' | 'light', hasBlocked: boolean): CSSProperties {
  return {
    padding: '10px 12px',
    borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    position: 'sticky',
    top: 0,
    background: hasBlocked
      ? theme === 'dark' ? '#1a0f0f' : '#fff5f5'
      : theme === 'dark' ? '#0f172a' : '#f1f5f9',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
}

const columnTitleStyle: CSSProperties = { fontSize: 10, fontWeight: 900, letterSpacing: '1px', color: '#64748b' };

function columnCountStyle(hasBlocked: boolean, theme: 'dark' | 'light'): CSSProperties {
  return { fontSize: 11, fontWeight: 900, color: hasBlocked ? '#dc2626' : theme === 'dark' ? '#94a3b8' : '#64748b' };
}

const columnBodyStyle: CSSProperties = { padding: '10px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 };

function emptyColumnStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#334155' : '#cbd5e1', fontSize: 18, textAlign: 'center', padding: '20px 0', fontWeight: 700 };
}
