import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Machine } from '../types/machine';
import type { MaintenanceTask } from '../types/maintenance';
import type { RiskItem } from '../types/risk';
import type { AppTab, RoleView } from '../types/app';
import type { WorkCenter } from '../types/plant';
import type { ProductionOrder } from '../types/productionOrder';
import { getOrderStatusLabel, getOrderBlockReason, formatBlockedReason } from '../logic/orderReadiness';
import { getDashboardRuntimeTruth } from '../logic/dashboardRuntimeSelectors';
import { getQuickActionsForRole, formatRoleLabel, type QuickAction } from '../logic/dashboardQuickActions';
import { getNavigationTab } from '../logic/navigationContracts';
import { getCommandRecommendation } from '../logic/commandRecommendations';
import { WORKFLOW_RUNTIME_UPDATED_EVENT } from '../logic/workflowRuntimeState';
import { recordPressureSnapshot, getPressureHistory, type PressureSnapshot } from '../logic/pressureHistory';
import AccordionSection from '../components/common/AccordionSection';
import SmartEmptyState from '../components/common/SmartEmptyState';
import PlantSignalsPanel from '../components/dashboard/PlantSignalsPanel';
import DashboardOverviewPanels from '../components/dashboard/DashboardOverviewPanels';
import DashboardWorkCenterCard from '../components/dashboard/DashboardWorkCenterCard';
import CommandRecommendationCard from '../components/dashboard/CommandRecommendationCard';
import ClassificationReviewQueue from '../components/dashboard/ClassificationReviewQueue';
import DeptHealthTilesPanel from '../components/dashboard/DeptHealthTilesPanel';
import {
  dashboardGridStyle,
  dashboardHeaderStyle,
  dashboardListStyle,
  dashboardMutedTextStyle,
  dashboardQuickActionDetailStyle,
  dashboardQuickActionsGridStyle,
  dashboardQuickActionsHeaderStyle,
  dashboardQuickActionsSubtitleStyle,
  dashboardSubtitleStyle,
  getDashboardActionItemStyle,
  getDashboardItemStyle,
  getDashboardItemTitleStyle,
  getDashboardPlantNoteStyle,
  getDashboardQuickActionButtonStyle,
  getDashboardQuickActionLabelStyle,
  getDashboardQuickActionsPanelStyle,
  getDashboardQuickActionsTitleStyle,
  getDashboardTitleStyle,
  type DashboardTheme,
} from '../components/dashboard/dashboardStyles';
import StatusBadge from '../components/StatusBadge';

interface DashboardPageProps {
  machines: Machine[];
  alerts: Machine[];
  tasks: MaintenanceTask[];
  risks: RiskItem[];
  roleView: RoleView;
  onGoToTab: (tab: AppTab) => void;
  onOpenMachine: (machine: Machine) => void;
  onOpenWorkCenter: (workCenter: WorkCenter) => void;
  workCenters: WorkCenter[];
  departmentFilter: string;
  theme?: DashboardTheme;
}

export default function DashboardPage({
  machines,
  alerts,
  tasks,
  risks,
  roleView,
  onGoToTab,
  onOpenMachine,
  onOpenWorkCenter,
  workCenters,
  theme = 'dark',
}: DashboardPageProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const refresh = () => setLastUpdatedAt(new Date());
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('jcm-classification-review-confirmations-updated', refresh);
    return () => {
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('jcm-classification-review-confirmations-updated', refresh);
    };
  }, []);

  const openRisks = risks.filter((risk) => risk.status === 'OPEN' || risk.status === 'IN_PROGRESS');
  const activeTasks = tasks.filter((task) => task.status !== 'OK');
  const runtimeTruth = getDashboardRuntimeTruth(alerts.length);
  const {
    allOrders,
    openOrders,
    blockedOrders,
    materialIssues,
    qaHolds,
    runnableOrders,
    dueSoonOrders,
    plantCriticals,
  } = runtimeTruth;
  const commandRecommendation = getCommandRecommendation(runtimeTruth, roleView);

  const quickActions = getQuickActionsForRole(roleView, {
    alertCount: alerts.length,
    activeTaskCount: activeTasks.length,
    openRiskCount: openRisks.length,
    qaHoldCount: qaHolds.length,
    blockedOrderCount: blockedOrders.length,
    materialIssueCount: materialIssues.length,
  });

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div>
      <div style={dashboardHeaderStyle}>
        <div>
          <h2 style={getDashboardTitleStyle(theme)}>PLANT COMMAND CENTER</h2>
          <p style={dashboardSubtitleStyle}>Plant pulse, order flow, crew needs, and department-specific action</p>
        </div>
        {lastUpdatedAt && (
          <span style={lastUpdatedStyle}>
            Updated {lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      <CommandRecommendationCard
        recommendation={commandRecommendation}
        theme={theme}
        onNavigate={() => onGoToTab(commandRecommendation.targetTab)}
      />
      <QuickActionsPanel roleView={roleView} actions={quickActions} onGoToTab={onGoToTab} theme={theme} />
      <PlantSignalsPanel onNavigate={onGoToTab} />
      <ClassificationReviewQueue theme={theme} workCenters={workCenters} onOpenWorkCenter={onOpenWorkCenter} />

      <PlantPressureScore
        blockedCount={blockedOrders.length}
        alertCount={alerts.length}
        overdueCount={tasks.filter((t) => t.status === 'OVERDUE').length}
        materialIssueCount={materialIssues.length}
        theme={theme}
      />

      <DashboardOverviewPanels
        openOrderCount={openOrders.length}
        totalOrderCount={allOrders.length}
        blockedOrderCount={blockedOrders.length}
        runnableOrderCount={runnableOrders.length}
        materialIssueCount={materialIssues.length}
        plantCriticalCount={plantCriticals}
        theme={theme}
        onGoToTab={onGoToTab}
      />

      <DeptHealthTilesPanel onNavigate={onGoToTab} theme={theme} />

      <AccordionSection title="BLOCKED ORDERS" count={blockedOrders.length} color="#dc2626" expanded={expandedSection === 'blockedOrders'} onToggle={() => toggleSection('blockedOrders')} onViewAll={() => onGoToTab('orders')} theme={theme}>
        {blockedOrders.length > 0 ? (
          <div style={dashboardListStyle}>{blockedOrders.slice(0, expandedSection === 'blockedOrders' ? undefined : 3).map((order) => <OrderRow key={order.orderNumber} order={order} theme={theme} />)}</div>
        ) : (
          <SmartEmptyState title="No blocked orders" detail="Flow is clear in the current sample set. Next best check is runnable work and due-soon pressure." actionLabel="Review Workflow" onAction={() => onGoToTab('workflow')} theme={theme} />
        )}
      </AccordionSection>

      <AccordionSection title="ORDERS DUE SOON" count={dueSoonOrders.length} color="#3b82f6" expanded={expandedSection === 'dueSoon'} onToggle={() => toggleSection('dueSoon')} onViewAll={() => onGoToTab('orders')} theme={theme}>
        {dueSoonOrders.length > 0 ? (
          <div style={dashboardListStyle}>{dueSoonOrders.map((order) => <OrderRow key={order.orderNumber} order={order} theme={theme} compact />)}</div>
        ) : (
          <SmartEmptyState title="No due-soon pressure" detail="No open order is currently driving the near-term ship window. Use this space to check department readiness." actionLabel="Open Plant Map" onAction={() => onGoToTab('plantMap')} theme={theme} />
        )}
      </AccordionSection>

      <AccordionSection title="DEPARTMENT FOCUS" count={workCenters.length} color="#f97316" expanded={expandedSection === 'workCenters'} onToggle={() => toggleSection('workCenters')} onViewAll={() => toggleSection('workCenters')} theme={theme}>
        {workCenters.length > 0 ? (
          <div style={dashboardGridStyle}>
            {workCenters.slice(0, expandedSection === 'workCenters' ? undefined : 8).map((workCenter) => (
              <DashboardWorkCenterCard key={workCenter.id} workCenter={workCenter} theme={theme} onOpen={onOpenWorkCenter} />
            ))}
          </div>
        ) : (
          <SmartEmptyState title="No work centers loaded" detail="Department focus needs work-center data before it can guide local action." actionLabel="Open Production" onAction={() => onGoToTab('plantMap')} theme={theme} />
        )}
      </AccordionSection>

      <AccordionSection title="QA / SAFETY / MAINTENANCE SIGNALS" count={openRisks.length + activeTasks.length + qaHolds.length} color="#f59e0b" expanded={expandedSection === 'signals'} onToggle={() => toggleSection('signals')} onViewAll={() => onGoToTab('risk')} theme={theme}>
        {openRisks.length + activeTasks.length + qaHolds.length > 0 ? (
          <div style={dashboardListStyle}>
            {qaHolds.slice(0, 2).map((order) => (
              <div key={order.orderNumber} style={getDashboardItemStyle(theme)}>
                <div><div style={getDashboardItemTitleStyle(theme)}>{order.orderNumber} quality hold</div><div style={dashboardMutedTextStyle}>{order.assemblyPartNumber} - {order.qaStatus}</div></div>
                <span style={getPriorityBadge('CRITICAL')}>{order.qaStatus}</span>
              </div>
            ))}
            {openRisks.slice(0, 3).map((risk) => (
              <div key={risk.id} style={getDashboardItemStyle(theme)}>
                <div><div style={getDashboardItemTitleStyle(theme)}>{risk.title}</div><div style={dashboardMutedTextStyle}>{risk.department} - {risk.category ?? risk.source}</div></div>
                <span style={getPriorityBadge(risk.severity ?? risk.level)}>{risk.severity ?? risk.level}</span>
              </div>
            ))}
            {activeTasks.slice(0, 3).map((task) => (
              <div key={task.id} style={getDashboardItemStyle(theme)}>
                <div><div style={getDashboardItemTitleStyle(theme)}>{task.title}</div><div style={dashboardMutedTextStyle}>Maintenance - Due {task.nextDue}</div></div>
                <span style={getPriorityBadge(task.status)}>{task.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <SmartEmptyState title="No active support signals" detail="No QA hold, open risk, or active maintenance pressure is leading the current dashboard signal." actionLabel="Review Support" onAction={() => onGoToTab('risk')} theme={theme} />
        )}
      </AccordionSection>

      <AccordionSection title="EQUIPMENT INTELLIGENCE" count={machines.length} color="#64748b" expanded={expandedSection === 'machines'} onToggle={() => toggleSection('machines')} onViewAll={() => onGoToTab('machines')} theme={theme}>
        <div style={dashboardListStyle}>
          <div style={getDashboardPlantNoteStyle(theme)}>Equipment data stays powerful, but it is now one module inside the plant command model.</div>
          {alerts.length > 0 ? (
            alerts.slice(0, expandedSection === 'machines' ? undefined : 3).map((machine) => (
              <div key={machine.id} style={getDashboardActionItemStyle(theme)} onClick={() => onOpenMachine(machine)}>
                <div><div style={getDashboardItemTitleStyle(theme)}>{machine.name}</div><div style={dashboardMutedTextStyle}>{machine.department} - {machine.lastActivity}</div></div>
                <StatusBadge state={machine.state} priority={machine.alarmPriority} />
              </div>
            ))
          ) : (
            <SmartEmptyState title="No active equipment alerts" detail="Equipment is not currently leading the command signal. Next useful check is maintenance requests or plant flow." actionLabel="Open Maintenance" onAction={() => onGoToTab('maintenance')} theme={theme} />
          )}
        </div>
      </AccordionSection>
    </div>
  );
}

function QuickActionsPanel({ roleView, actions, onGoToTab, theme }: { roleView: RoleView; actions: QuickAction[]; onGoToTab: (tab: AppTab) => void; theme: DashboardTheme }) {
  const [showAllActions, setShowAllActions] = useState(false);
  const visibleActions = showAllActions ? actions : actions.slice(0, 3);
  const hiddenCount = actions.length - visibleActions.length;

  return (
    <section style={getDashboardQuickActionsPanelStyle(theme)}>
      <div style={dashboardQuickActionsHeaderStyle}>
        <div>
          <h3 style={getDashboardQuickActionsTitleStyle(theme)}>QUICK ACTIONS</h3>
          <p style={dashboardQuickActionsSubtitleStyle}>{formatRoleLabel(roleView)} action shortcuts based on current plant signals.</p>
        </div>
      </div>
      <div style={dashboardQuickActionsGridStyle}>
        {visibleActions.map((action) => (
          <button key={action.label} type="button" style={getDashboardQuickActionButtonStyle(theme, action.tone)} onClick={() => onGoToTab(getNavigationTab(action.intent))}>
            <span style={getDashboardQuickActionLabelStyle(action.tone)}>{action.label}{action.count ? ` (${action.count})` : ''}</span>
            <span style={dashboardQuickActionDetailStyle}>{action.detail}</span>
          </button>
        ))}
        {actions.length > 3 && (
          <button type="button" style={getQuickActionsToggleStyle(theme)} onClick={() => setShowAllActions((current) => !current)}>
            {showAllActions ? 'SHOW FEWER ACTIONS' : `SHOW ${hiddenCount} MORE ACTION${hiddenCount === 1 ? '' : 'S'}`}
          </button>
        )}
      </div>
    </section>
  );
}

function PlantPressureScore({
  blockedCount, alertCount, overdueCount, materialIssueCount, theme,
}: { blockedCount: number; alertCount: number; overdueCount: number; materialIssueCount: number; theme: DashboardTheme }) {
  const score = Math.min(100, blockedCount * 15 + alertCount * 8 + overdueCount * 10 + materialIssueCount * 5);
  const [history, setHistory] = useState<PressureSnapshot[]>(() => getPressureHistory());

  useEffect(() => {
    recordPressureSnapshot(score);
    setHistory(getPressureHistory());
  }, [score]);

  const band = score >= 70 ? { color: '#ef4444', label: 'HIGH STRESS', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.35)' }
    : score >= 35 ? { color: '#f59e0b', label: 'ELEVATED', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.35)' }
    : { color: '#10b981', label: 'NOMINAL', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)' };

  const sparkPoints = history.slice(-12);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: band.bg, border: `1px solid ${band.border}`, borderLeft: `4px solid ${band.color}` }}>
      <div style={{ textAlign: 'center', minWidth: 56 }}>
        <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1, color: band.color }}>{score}</div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.8px', color: band.color, textTransform: 'uppercase' }}>/ 100</div>
      </div>
      {sparkPoints.length >= 2 && <PressureSparkline points={sparkPoints} color={band.color} />}
      <div>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '1px', color: band.color }}>{band.label}</div>
        <div style={{ fontSize: 11, color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: 2 }}>
          Plant Pressure Score — {blockedCount} blocked · {alertCount} alerts · {overdueCount} overdue tasks · {materialIssueCount} material issues
        </div>
      </div>
    </div>
  );
}

function PressureSparkline({ points, color }: { points: PressureSnapshot[]; color: string }) {
  const W = 72, H = 28;
  const coords = useMemo(() => {
    return points.map((p, i) => {
      const x = ((i / (points.length - 1)) * W).toFixed(1);
      const y = (H - (Math.min(p.score, 100) / 100) * H).toFixed(1);
      return `${x},${y}`;
    }).join(' ');
  }, [points]);

  const lastParts = coords.split(' ').pop()!.split(',');
  const dotX = parseFloat(lastParts[0]);
  const dotY = parseFloat(lastParts[1]);

  return (
    <svg width={W} height={H} style={{ display: 'block', flexShrink: 0, opacity: 0.85 }}>
      <polyline points={coords} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={dotX} cy={dotY} r="2.5" fill={color} />
    </svg>
  );
}

const lastUpdatedStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#10b981',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
  alignSelf: 'flex-start',
  paddingTop: 4,
};

function getQuickActionsToggleStyle(theme: DashboardTheme): CSSProperties { return { border: theme === 'dark' ? '1px dashed #475569' : '1px dashed #cbd5e1', background: theme === 'dark' ? 'rgba(15, 23, 42, 0.55)' : '#f8fafc', color: '#94a3b8', borderRadius: 4, padding: '12px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 900, letterSpacing: '0.7px', textTransform: 'uppercase', minHeight: 54 }; }
function formatOrderBlock(order: ProductionOrder) { const blockReason = getOrderBlockReason(order); return blockReason ? formatBlockedReason(blockReason) : 'No blocker listed'; }
function OrderRow({ order, theme, compact = false }: { order: ProductionOrder; theme: DashboardTheme; compact?: boolean }) { return <div style={getDashboardItemStyle(theme)}><div><div style={getDashboardItemTitleStyle(theme)}>{order.orderNumber} - {order.assemblyPartNumber}</div><div style={dashboardMutedTextStyle}>{order.customer} - Qty {order.quantity} - Ship {order.projectedShipDate}</div>{!compact && <div style={dashboardMutedTextStyle}>{formatOrderBlock(order)}</div>}</div><span style={getPriorityBadge(order.status)}>{getOrderStatusLabel(order)}</span></div>; }
function getPriorityBadge(priority: string): CSSProperties { const colors: Record<string, string> = { blocked: '#dc2626', hold: '#dc2626', ready: '#10b981', runnable: '#10b981', BLOCKED: '#dc2626', HOLD: '#dc2626', FAILED: '#dc2626', HIGH: '#dc2626', CRITICAL: '#dc2626', READY: '#10b981', IN_PROGRESS: '#3b82f6', MEDIUM: '#f59e0b', LOW: '#3b82f6', NORMAL: '#10b981', WAITING: '#f59e0b', DONE: '#64748b' }; const color = colors[priority] || '#64748b'; return { padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 800, background: `${color}25`, color, textTransform: 'uppercase', letterSpacing: '0.5px', border: `1px solid ${color}50`, whiteSpace: 'nowrap' }; }
