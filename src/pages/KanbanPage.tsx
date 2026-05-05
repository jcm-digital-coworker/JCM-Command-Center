import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { productionOrders } from '../data/productionOrders';
import { getRuntimeProductionOrders, WORKFLOW_RUNTIME_UPDATED_EVENT } from '../logic/workflowRuntimeState';
import { getUrgencyScore } from '../logic/urgencyScore';
import { isBlockedProductionOrder, isClosedProductionStatus } from '../logic/orderStatusTruth';
import KanbanCard from '../components/kanban/KanbanCard';
import type { ProductionOrder } from '../types/productionOrder';
import type { Department } from '../types/machine';

const PLANT_COLUMNS: Department[] = [
  'Sales', 'Engineering', 'Receiving', 'Machine Shop',
  'Material Handling', 'Fab', 'Coating', 'Assembly',
  'Saddles Dept', 'QA', 'Shipping',
];

type Props = { theme?: 'dark' | 'light' };

export default function KanbanPage({ theme = 'dark' }: Props) {
  const [tick, setTick] = useState(0);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, bump);
    window.addEventListener('storage', bump);
    return () => { window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, bump); window.removeEventListener('storage', bump); };
  }, []);

  const allOrders = useMemo(() => getRuntimeProductionOrders(productionOrders), [tick]);

  const activeOrders = useMemo(() => {
    const base = showDone ? allOrders : allOrders.filter((order) => !isClosedProductionStatus(order.status));
    return [...base].sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a));
  }, [allOrders, showDone]);

  function ordersForColumn(dept: Department): ProductionOrder[] {
    return activeOrders.filter((o) => o.currentDepartment === dept);
  }

  const blockedTotal = activeOrders.filter(isBlockedProductionOrder).length;

  return (
    <div style={pageStyle}>
      <div style={headerStyle(theme)}>
        <div>
          <div style={eyebrowStyle}>PLANT-WIDE VIEW</div>
          <h2 style={titleStyle(theme)}>War Board</h2>
          <p style={subTextStyle(theme)}>
            {activeOrders.length} active orders across {PLANT_COLUMNS.length} departments
            {blockedTotal > 0 && <span style={{ color: '#dc2626', fontWeight: 900 }}> · {blockedTotal} BLOCKED</span>}
          </p>
        </div>
        <button
          type="button"
          style={showDone ? toggleOnStyle : toggleOffStyle}
          onClick={() => setShowDone((v) => !v)}
        >
          {showDone ? 'HIDE DONE' : 'SHOW DONE'}
        </button>
      </div>

      <div style={boardStyle}>
        {PLANT_COLUMNS.map((dept) => {
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
function headerStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: '20px 20px 16px', background: theme === 'dark' ? '#1e293b' : '#f8fafc', borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }; }
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.3px', textTransform: 'uppercase', marginBottom: 4 };
function titleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 24, fontWeight: 900, letterSpacing: '0.4px' }; }
function subTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '4px 0 0', fontSize: 13, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 600 }; }
const toggleOffStyle: CSSProperties = { padding: '8px 14px', borderRadius: 4, border: '1px solid #334155', background: 'transparent', color: '#64748b', fontSize: 11, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' };
const toggleOnStyle: CSSProperties = { ...toggleOffStyle, border: '1px solid #f97316', color: '#f97316', background: 'rgba(249,115,22,0.1)' };
const boardStyle: CSSProperties = { display: 'flex', gap: 0, overflowX: 'auto', minHeight: 'calc(100vh - 120px)', alignItems: 'flex-start' };
function columnStyle(theme: 'dark' | 'light', hasBlocked: boolean): CSSProperties { return { minWidth: 220, maxWidth: 260, flex: '0 0 230px', borderRight: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`, background: hasBlocked ? (theme === 'dark' ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.02)') : 'transparent', display: 'flex', flexDirection: 'column' }; }
function columnHeaderStyle(theme: 'dark' | 'light', hasBlocked: boolean): CSSProperties { return { padding: '10px 12px', borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`, position: 'sticky', top: 0, background: hasBlocked ? (theme === 'dark' ? '#1a0f0f' : '#fff5f5') : (theme === 'dark' ? '#0f172a' : '#f1f5f9'), zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }; }
const columnTitleStyle: CSSProperties = { fontSize: 10, fontWeight: 900, letterSpacing: '1px', color: '#64748b' };
function columnCountStyle(hasBlocked: boolean, theme: 'dark' | 'light'): CSSProperties { return { fontSize: 11, fontWeight: 900, color: hasBlocked ? '#dc2626' : (theme === 'dark' ? '#94a3b8' : '#64748b') }; }
const columnBodyStyle: CSSProperties = { padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 };
function emptyColumnStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#334155' : '#cbd5e1', fontSize: 18, textAlign: 'center', padding: '20px 0', fontWeight: 700 }; }
