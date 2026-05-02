import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { RoleView, DepartmentFilter, AppTab } from '../types/app';
import type { Machine } from '../types/machine';
import type { ProductionOrder } from '../types/productionOrder';
import { productionOrders } from '../data/productionOrders';
import { seedCoverage } from '../data/coverage';
import { workCenters } from '../data/workCenters';
import OrderDetailModal from '../components/orders/OrderDetailModal';

interface WorkflowMobilePageProps {
  roleView: RoleView;
  departmentFilter: DepartmentFilter;
  machines: Machine[];
  theme?: 'dark' | 'light';
  onGoToMaintenance: () => void;
  onGoToTab: (tab: AppTab) => void;
}

type WorkflowMode = 'production' | 'lead' | 'management';

export default function WorkflowMobilePage({
  roleView,
  departmentFilter,
  machines,
  theme = 'dark',
  onGoToMaintenance,
  onGoToTab,
}: WorkflowMobilePageProps) {
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const workflowMode = getWorkflowMode(roleView);
  const deptLabel = departmentFilter === 'All' ? 'All Departments' : departmentFilter;

  const scopedOrders = useMemo(() => {
    const all = workflowMode === 'management' || departmentFilter === 'All'
      ? productionOrders
      : productionOrders.filter((order) => order.currentDepartment === departmentFilter);
    return sortWorkflowOrders(all);
  }, [departmentFilter, workflowMode]);

  const visibleOrders = showAllOrders ? scopedOrders : scopedOrders.slice(0, 3);
  const hiddenOrderCount = Math.max(scopedOrders.length - visibleOrders.length, 0);
  const runnableCount = scopedOrders.filter((order) => String(order.flowStatus).toLowerCase() === 'runnable').length;
  const blockedCount = scopedOrders.filter((order) => (order.blockers ?? []).length > 0).length;
  const crew = departmentFilter === 'All' ? seedCoverage : seedCoverage.filter((person) => person.department === departmentFilter);
  const assignedCount = crew.filter((person) => person.status === 'ASSIGNED').length;
  const availableCount = crew.filter((person) => person.status === 'AVAILABLE').length;

  return (
    <div style={pageStyle}>
      <div style={getHeaderStyle(theme)}>
        <div style={headerLeftStyle}>
          <div style={getDeptLabelStyle(theme)}>{workflowMode === 'management' ? 'Plant Command' : deptLabel}</div>
          <div style={roleTagStyle}>{getWorkflowRoleLabel(workflowMode)}</div>
        </div>
        <div style={shiftBadgeStyle}>DAY SHIFT</div>
      </div>

      <section style={getSectionStyle(theme)}>
        <div style={getSectionTitleStyle(theme)}>
          NEXT WORK THAT MATTERS
          <span style={getCountBadge(blockedCount > 0 ? 'red' : runnableCount > 0 ? 'green' : 'gray')}>
            {blockedCount > 0 ? `${blockedCount} BLOCKED` : `${runnableCount} RUNNABLE`}
          </span>
        </div>
        <p style={getIntroTextStyle(theme)}>
          Compact cards show the work signal only. Tap an order for traveler detail, blockers, material, QA, and routing.
        </p>

        {scopedOrders.length === 0 ? (
          <div style={getEmptyStyle(theme)}>No orders assigned to this workflow view.</div>
        ) : (
          <div style={orderListStyle}>
            {visibleOrders.map((order) => (
              <CompactOrderButton key={order.id} order={order} theme={theme} onOpen={() => setSelectedOrder(order)} />
            ))}
          </div>
        )}

        {scopedOrders.length > 3 ? (
          <button type="button" style={getShowMoreButtonStyle(theme)} onClick={() => setShowAllOrders((current) => !current)}>
            {showAllOrders ? 'SHOW FEWER ORDERS' : `SHOW ${hiddenOrderCount} MORE ORDER${hiddenOrderCount === 1 ? '' : 'S'}`}
          </button>
        ) : null}
      </section>

      {workflowMode !== 'production' ? (
        <section style={getSectionStyle(theme)}>
          <div style={getSectionTitleStyle(theme)}>
            CREW SNAPSHOT
            <span style={getCountBadge('blue')}>{crew.length} SIGNED IN</span>
          </div>
          <div style={crewSummaryRowStyle}>
            <div style={getCrewStat('green', theme)}><strong>{assignedCount}</strong> ASSIGNED</div>
            <div style={getCrewStat('blue', theme)}><strong>{availableCount}</strong> AVAILABLE</div>
            <div style={getCrewStat('yellow', theme)}><strong>{crew.length - assignedCount - availableCount}</strong> OTHER</div>
          </div>
          <button type="button" onClick={() => onGoToTab('coverage')} style={getActionBtn('blue', theme)}>OPEN COVERAGE</button>
        </section>
      ) : null}

      {workflowMode === 'management' ? (
        <section style={getSectionStyle(theme)}>
          <div style={getSectionTitleStyle(theme)}>DEPARTMENT SNAPSHOT</div>
          <div style={deptStripStyle}>
            {workCenters.slice(0, showAllOrders ? undefined : 6).map((workCenter) => {
              const deptOrders = productionOrders.filter((order) => order.currentDepartment === workCenter.department);
              const deptBlocked = deptOrders.filter((order) => (order.blockers ?? []).length > 0).length;
              return (
                <div key={workCenter.id} style={getDeptTileStyle(workCenter.status, theme)}>
                  <div style={getDeptTileNameStyle(theme)}>{workCenter.department}</div>
                  <div style={deptTileStatsStyle}>{deptOrders.length} orders · {deptBlocked} blocked</div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {workflowMode !== 'management' && machines.length > 0 ? (
        <section style={getSectionStyle(theme)}>
          <div style={getSectionTitleStyle(theme)}>MACHINE SNAPSHOT</div>
          <div style={machineGridStyle}>
            {machines.slice(0, 6).map((machine) => (
              <div key={machine.id} style={getMachineChipStyle(machine.state, theme)}>
                <div style={getMachineDot(machine.state)} />
                <div>
                  <div style={getMachineNameStyle(theme)}>{machine.name}</div>
                  <div style={getMachineStateStyle(machine.state)}>{machine.state}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div style={actionRowStyle}>
        <button onClick={onGoToMaintenance} style={getActionBtn('orange', theme)}>MAINTENANCE</button>
        <button onClick={() => onGoToTab('orders')} style={getActionBtn('slate', theme)}>ALL ORDERS</button>
        <button onClick={() => onGoToTab('risk')} style={getActionBtn('red', theme)}>QA / SAFETY</button>
      </div>

      {selectedOrder ? (
        <OrderDetailModal
          order={selectedOrder}
          theme={theme}
          onClose={() => setSelectedOrder(null)}
          onOpenOrders={() => {
            setSelectedOrder(null);
            onGoToTab('orders');
          }}
        />
      ) : null}
    </div>
  );
}

function CompactOrderButton({ order, theme, onOpen }: { order: ProductionOrder; theme: 'dark' | 'light'; onOpen: () => void }) {
  const isBlocked = (order.blockers ?? []).length > 0;
  const isRunnable = String(order.flowStatus).toLowerCase() === 'runnable';
  const blockerText = isBlocked ? order.blockers[0]?.message ?? 'Blocked' : order.lastAction ?? nextActionForOrder(order);

  return (
    <button type="button" style={getOrderCardStyle(isRunnable, isBlocked, theme)} onClick={onOpen}>
      <div style={rowStyle}>
        <span style={getOrderNumStyle(theme)}>#{order.orderNumber}</span>
        <span style={getPriorityChip(order.priority)}>{String(order.priority ?? 'normal').toUpperCase()}</span>
        <span style={getStatusChip(isRunnable, isBlocked)}>{isBlocked ? 'BLOCKED' : isRunnable ? 'READY' : 'WATCH'}</span>
      </div>
      <div style={getOrderFamilyStyle(theme)}>{order.productFamily}</div>
      <div style={getCompactReasonStyle(theme, isBlocked)}>{blockerText}</div>
      <div style={getTapHintStyle(theme)}>Tap for order detail</div>
    </button>
  );
}

function getWorkflowMode(roleView: RoleView): WorkflowMode {
  if (roleView === 'Production' || roleView === 'Operator' || roleView === 'operator') return 'production';
  if (roleView === 'Department Lead' || roleView === 'Department Supervisor' || roleView === 'Lead / Supervisor' || roleView === 'lead' || roleView === 'supervisor') return 'lead';
  return 'management';
}

function getWorkflowRoleLabel(mode: WorkflowMode): string {
  if (mode === 'production') return 'PRODUCTION CO-WORKER VIEW';
  if (mode === 'lead') return 'DEPARTMENT LEAD / SUPERVISOR VIEW';
  return 'MANAGEMENT VIEW';
}

function sortWorkflowOrders(orders: ProductionOrder[]): ProductionOrder[] {
  return [...orders].sort((a, b) => {
    const scoreDiff = getWorkflowOrderScore(b) - getWorkflowOrderScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return String(a.projectedShipDate ?? '').localeCompare(String(b.projectedShipDate ?? ''));
  });
}

function getWorkflowOrderScore(order: ProductionOrder): number {
  let score = 0;
  if ((order.blockers ?? []).length > 0) score += 100;
  if (String(order.flowStatus).toLowerCase() === 'runnable') score += 40;
  if (order.priority === 'critical' || order.priority === 'CRITICAL') score += 30;
  if (order.priority === 'hot' || order.priority === 'HOT') score += 20;
  if (order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED') score += 20;
  return score;
}

function nextActionForOrder(order: ProductionOrder): string {
  if (String(order.flowStatus).toLowerCase() === 'runnable') return 'Ready for the next useful action.';
  if (order.materialStatus && order.materialStatus !== 'RECEIVED' && order.materialStatus !== 'STAGED') return 'Check material readiness.';
  if (order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED') return 'Review QA hold before moving.';
  return 'Review traveler before acting.';
}

const pageStyle: CSSProperties = { padding: 0 };
const headerLeftStyle: CSSProperties = { flex: 1, minWidth: 0 };
const roleTagStyle: CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#f97316', marginTop: 2 };
const shiftBadgeStyle: CSSProperties = { background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', padding: '6px 12px', borderRadius: 4, fontSize: 11, fontWeight: 800, letterSpacing: '1px' };
const orderListStyle: CSSProperties = { display: 'grid', gap: 8 };
const rowStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' };
const crewSummaryRowStyle: CSSProperties = { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' };
const deptStripStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 };
const deptTileStatsStyle: CSSProperties = { fontSize: 11, color: '#64748b', marginTop: 5, lineHeight: 1.4 };
const machineGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 };
const actionRowStyle: CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 };

function getHeaderStyle(theme: 'dark' | 'light'): CSSProperties { return { background: theme === 'dark' ? '#0f172a' : '#f1f5f9', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: '4px solid #f97316', borderRadius: 6, padding: '14px 16px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }; }
function getDeptLabelStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 18, fontWeight: 800, letterSpacing: '1px', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }; }
function getSectionStyle(theme: 'dark' | 'light'): CSSProperties { return { background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderRadius: 6, padding: 16, marginBottom: 12 }; }
function getSectionTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', color: theme === 'dark' ? '#64748b' : '#94a3b8', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }; }
function getIntroTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '0 0 12px', color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, lineHeight: 1.45 }; }
function getCountBadge(color: 'green' | 'red' | 'blue' | 'yellow' | 'gray'): CSSProperties { const map: Record<string, string> = { green: '#10b981', red: '#ef4444', blue: '#3b82f6', yellow: '#eab308', gray: '#64748b' }; const picked = map[color] ?? map.gray; return { background: `${picked}22`, color: picked, border: `1px solid ${picked}`, borderRadius: 3, padding: '2px 7px', fontSize: 10, fontWeight: 800, letterSpacing: '0.5px' }; }
function getOrderCardStyle(isRunnable: boolean, isBlocked: boolean, theme: 'dark' | 'light'): CSSProperties { return { width: '100%', textAlign: 'left', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: isBlocked ? '1px solid rgba(220,38,38,0.4)' : isRunnable ? '1px solid rgba(16,185,129,0.4)' : theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', borderLeft: isBlocked ? '4px solid #ef4444' : isRunnable ? '4px solid #10b981' : '4px solid #475569', borderRadius: 4, padding: 12, cursor: 'pointer' }; }
function getOrderNumStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 14, fontWeight: 800, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', letterSpacing: '0.5px' }; }
function getPriorityChip(priority: string | undefined): CSSProperties { const priorityKey = String(priority ?? 'normal').toLowerCase(); const map: Record<string, string> = { critical: '#ef4444', hot: '#f97316', normal: '#64748b' }; const picked = map[priorityKey] ?? '#64748b'; return { fontSize: 9, fontWeight: 800, letterSpacing: '1px', color: picked, background: `${picked}22`, border: `1px solid ${picked}`, borderRadius: 3, padding: '2px 6px' }; }
function getStatusChip(isRunnable: boolean, isBlocked: boolean): CSSProperties { const color = isBlocked ? '#ef4444' : isRunnable ? '#10b981' : '#f97316'; return { fontSize: 9, fontWeight: 800, letterSpacing: '1px', color, background: `${color}22`, border: `1px solid ${color}`, borderRadius: 3, padding: '2px 6px' }; }
function getOrderFamilyStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 14, color: theme === 'dark' ? '#cbd5e1' : '#475569', fontWeight: 700, marginTop: 4, lineHeight: 1.4 }; }
function getCompactReasonStyle(theme: 'dark' | 'light', blocked: boolean): CSSProperties { return { marginTop: 6, fontSize: 12, color: blocked ? (theme === 'dark' ? '#fca5a5' : '#dc2626') : '#64748b', lineHeight: 1.35, fontWeight: 700 }; }
function getTapHintStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 8, color: theme === 'dark' ? '#93c5fd' : '#2563eb', fontSize: 10, fontWeight: 900, letterSpacing: '0.8px', textTransform: 'uppercase' }; }
function getShowMoreButtonStyle(theme: 'dark' | 'light'): CSSProperties { return { width: '100%', marginTop: 10, padding: '11px 12px', borderRadius: 4, border: theme === 'dark' ? '1px dashed #475569' : '1px dashed #cbd5e1', background: theme === 'dark' ? '#0f172a' : '#f8fafc', color: '#94a3b8', fontSize: 11, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.7px' }; }
function getCrewStat(color: 'green' | 'blue' | 'yellow', theme: 'dark' | 'light'): CSSProperties { const map = { green: '#10b981', blue: '#3b82f6', yellow: '#eab308' }; const picked = map[color]; return { flex: '1 1 80px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${picked}44`, borderRadius: 4, padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: picked, letterSpacing: '0.5px', lineHeight: 1.4 }; }
function getDeptTileStyle(status: string, theme: 'dark' | 'light'): CSSProperties { const color = status === 'NEEDS_ATTENTION' ? '#ef4444' : status === 'WATCH' ? '#f97316' : '#10b981'; return { padding: 12, borderRadius: 4, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}44`, borderLeft: `3px solid ${color}` }; }
function getDeptTileNameStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 12, fontWeight: 800, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }; }
function getMachineChipStyle(state: string, theme: 'dark' | 'light'): CSSProperties { const color = getMachineColor(state); return { background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}44`, borderRadius: 4, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }; }
function getMachineDot(state: string): CSSProperties { return { width: 8, height: 8, borderRadius: '50%', background: getMachineColor(state), flexShrink: 0 }; }
function getMachineNameStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 12, fontWeight: 700, color: theme === 'dark' ? '#cbd5e1' : '#0f172a', letterSpacing: '0.3px' }; }
function getMachineStateStyle(state: string): CSSProperties { return { fontSize: 10, fontWeight: 700, color: getMachineColor(state), letterSpacing: '0.5px' }; }
function getMachineColor(state: string): string { const map: Record<string, string> = { RUNNING: '#10b981', IDLE: '#64748b', ALARM: '#ef4444', OFFLINE: '#ef4444', SETUP: '#f97316', MAINTENANCE: '#f97316' }; return map[state] ?? '#64748b'; }
function getActionBtn(color: 'orange' | 'blue' | 'slate' | 'red', theme: 'dark' | 'light'): CSSProperties { const map = { orange: '#f97316', blue: '#3b82f6', slate: '#64748b', red: '#ef4444' }; const picked = map[color]; return { flex: '1 1 120px', padding: '12px 10px', background: `${picked}20`, border: `1px solid ${picked}`, borderRadius: 4, color: theme === 'light' && color === 'slate' ? '#475569' : picked, fontSize: 11, fontWeight: 900, letterSpacing: '0.7px', cursor: 'pointer' }; }
function getEmptyStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 16, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1', color: '#64748b', fontSize: 13, fontWeight: 700 }; }
