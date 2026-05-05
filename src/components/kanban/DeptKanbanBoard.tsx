import { useEffect, useState, useMemo, type CSSProperties } from 'react';
import { productionOrders } from '../../data/productionOrders';
import { getSubStagesForDept } from '../../data/departmentSubStages';
import { getRuntimeProductionOrders, applyWorkflowRuntimeAction, WORKFLOW_RUNTIME_UPDATED_EVENT } from '../../logic/workflowRuntimeState';
import { getUrgencyScore } from '../../logic/urgencyScore';
import { isClosedProductionStatus, isBlockedProductionOrder } from '../../logic/orderStatusTruth';
import KanbanCard from './KanbanCard';
import OrderDetailModal from '../orders/OrderDetailModal';
import type { Department } from '../../types/machine';
import type { ProductionOrder } from '../../types/productionOrder';
import type { AppTab } from '../../types/app';

type Props = {
  department: Department;
  theme: 'dark' | 'light';
  onGoToTab?: (tab: AppTab) => void;
};

export default function DeptKanbanBoard({ department, theme, onGoToTab }: Props) {
  const [tick, setTick] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, bump);
    window.addEventListener('storage', bump);
    return () => { window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, bump); window.removeEventListener('storage', bump); };
  }, []);

  const stages = useMemo(() => getSubStagesForDept(department), [department]);
  const deptOrders = useMemo(() => {
    const runtime = getRuntimeProductionOrders(productionOrders);
    return runtime
      .filter((o) => o.currentDepartment === department && !isClosedProductionStatus(o.status))
      .sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a));
  }, [tick, department]);

  if (stages.length === 0) return null;

  function getStageForOrder(order: ProductionOrder): string {
    if (order.deptSubStage?.department === department) return order.deptSubStage.stage;
    return stages[0];
  }

  function advanceOrder(order: ProductionOrder) {
    const current = getStageForOrder(order);
    const idx = stages.indexOf(current);
    if (idx === -1 || idx >= stages.length - 1) return;
    const next = stages[idx + 1];
    applyWorkflowRuntimeAction(order.orderNumber, 'ACKNOWLEDGE_ORDER', `Sub-stage advanced: ${next}`, {
      deptSubStage: { department, stage: next, enteredAt: new Date().toISOString() },
    });
  }

  const columns = stages.map((stage) => ({
    stage,
    orders: deptOrders.filter((o) => getStageForOrder(o) === stage),
  }));

  const totalBlocked = deptOrders.filter((o) => isBlockedProductionOrder(o)).length;

  return (
    <div style={wrapperStyle}>
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          theme={theme}
          onClose={() => setSelectedOrder(null)}
          onOpenOrders={onGoToTab ? () => { setSelectedOrder(null); onGoToTab('orders'); } : undefined}
        />
      )}
      <div style={boardHeaderStyle(theme)}>
        <div style={eyebrowStyle}>DEPT KANBAN</div>
        <span style={countStyle(theme)}>
          {deptOrders.length} orders{totalBlocked > 0 ? ` · ${totalBlocked} blocked` : ''}
        </span>
      </div>
      <div style={boardStyle}>
        {columns.map(({ stage, orders }) => {
          const blocked = orders.filter((o) => isBlockedProductionOrder(o)).length;
          const isLast = stage === stages[stages.length - 1];
          return (
            <div key={stage} style={columnStyle(theme)}>
              <div style={columnHeaderStyle(theme, blocked > 0)}>
                <span style={columnTitleStyle(theme)}>{stage.toUpperCase()}</span>
                <span style={countChip(blocked > 0)}>{orders.length}{blocked > 0 ? ` ·${blocked}⚠` : ''}</span>
              </div>
              <div style={columnBodyStyle}>
                {orders.length === 0 ? (
                  <div style={emptyStyle(theme)}>—</div>
                ) : (
                  orders.map((order) => (
                    <KanbanCard
                      key={order.orderNumber}
                      order={order}
                      theme={theme}
                      subStageLabel={stage}
                      onAdvanceSubStage={!isLast ? () => advanceOrder(order) : undefined}
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

const wrapperStyle: CSSProperties = { marginBottom: 8 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 10, fontWeight: 900, letterSpacing: '1.2px' };
function boardHeaderStyle(theme: 'dark' | 'light'): CSSProperties { return { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}` }; }
function countStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 11, fontWeight: 700, color: theme === 'dark' ? '#94a3b8' : '#64748b' }; }
const boardStyle: CSSProperties = { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 };
function columnStyle(theme: 'dark' | 'light'): CSSProperties { return { minWidth: 180, flex: '0 0 190px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderRadius: 6, border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`, display: 'flex', flexDirection: 'column' }; }
function columnHeaderStyle(theme: 'dark' | 'light', hasBlocked: boolean): CSSProperties { return { padding: '8px 10px', borderBottom: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: hasBlocked ? 'rgba(220,38,38,0.08)' : 'transparent', borderRadius: '6px 6px 0 0' }; }
function columnTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 9, fontWeight: 900, letterSpacing: '1px', color: theme === 'dark' ? '#64748b' : '#94a3b8' }; }
function countChip(hasBlocked: boolean): CSSProperties { return { fontSize: 10, fontWeight: 900, color: hasBlocked ? '#dc2626' : '#64748b' }; }
const columnBodyStyle: CSSProperties = { padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 };
function emptyStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#334155' : '#e2e8f0', fontSize: 20, textAlign: 'center', padding: '12px 0' }; }
