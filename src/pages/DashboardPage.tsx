import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Machine } from '../types/machine';
import type { MaintenanceTask } from '../types/maintenance';
import type { RiskItem } from '../types/risk';
import type { AppTab, RoleView } from '../types/app';
import type { WorkCenter } from '../types/plant';
import type { ProductionOrder } from '../types/productionOrder';
import { productionOrders } from '../data/productionOrders';
import { getOrderStatusLabel, getOrderBlockReason, formatBlockedReason } from '../logic/orderReadiness';
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
  theme?: 'dark' | 'light';
}

export default function DashboardPage({
  machines,
  alerts,
  tasks,
  risks,
  onGoToTab,
  onOpenMachine,
  onOpenWorkCenter,
  workCenters,
  theme = 'dark',
}: DashboardPageProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const openRisks = risks.filter((r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS');
  const activeTasks = tasks.filter((t) => t.status !== 'OK');
  const openOrders = productionOrders.filter((order) => order.status !== 'DONE');
  const blockedOrders = openOrders.filter((order) => order.status === 'BLOCKED');
  const materialIssues = openOrders.filter((order) => order.materialStatus !== 'RECEIVED');
  const qaHolds = openOrders.filter((order) => order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED');
  const runnableOrders = openOrders.filter((order) => order.status === 'READY' || order.status === 'IN_PROGRESS');
  const dueSoonOrders = [...openOrders]
  .sort((a, b) => (a.projectedShipDate ?? '').localeCompare(b.projectedShipDate ?? ''))
  .slice(0, 4);
  const plantCriticals = blockedOrders.length + materialIssues.length + qaHolds.length + alerts.length;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div>
      <div style={headerStyle}>
        <div>
          <h2 style={getTitleStyle(theme)}>PLANT COMMAND CENTER</h2>
          <p style={subtitleStyle}>Plant pulse, order flow, crew needs, and department-specific action</p>
        </div>
      </div>

      <div style={getOverviewBarStyle(theme)}>
        <StatusMetric label="OPEN ORDERS" value={openOrders.length} total={productionOrders.length} color="#3b82f6" theme={theme} />
        <StatusMetric label="BLOCKED" value={blockedOrders.length} total={openOrders.length} color="#dc2626" highlight={blockedOrders.length > 0} theme={theme} />
        <StatusMetric label="RUNNABLE" value={runnableOrders.length} total={openOrders.length} color="#10b981" theme={theme} />
        <StatusMetric label="MATERIAL ISSUES" value={materialIssues.length} total={openOrders.length} color="#f59e0b" highlight={materialIssues.length > 0} theme={theme} />
      </div>

      <div style={getMissionGridStyle()}>
        <MissionCard
          title="Blocked Flow"
          value={`${blockedOrders.length} order${blockedOrders.length === 1 ? '' : 's'}`}
          detail={blockedOrders.length > 0 ? 'Needs action before labor is spent' : 'No blocked sample orders'}
          color="#dc2626"
          theme={theme}
          onClick={() => onGoToTab('orders')}
        />
        <MissionCard
          title="Crew Guidance"
          value={runnableOrders.length > 0 ? 'Runnable work exists' : 'No ready orders'}
          detail="Guidance > control. Use flow, material, and skill availability before assigning people."
          color="#8b5cf6"
          theme={theme}
          onClick={() => onGoToTab('coverage')}
        />
        <MissionCard
          title="Material Readiness"
          value={`${materialIssues.length} not fully ready`}
          detail="Receiving is the physical start gate for every order"
          color="#f97316"
          theme={theme}
          onClick={() => onGoToTab('receiving')}
        />
        <MissionCard
          title="Plant Criticals"
          value={plantCriticals.toString()}
          detail="Orders, material, QA, maintenance, and machine alerts combined"
          color={plantCriticals > 0 ? '#dc2626' : '#10b981'}
          theme={theme}
          onClick={() => onGoToTab(plantCriticals > 0 ? 'orders' : 'plantMap')}
        />
      </div>

      {blockedOrders.length > 0 && (
        <Section
          title="BLOCKED ORDERS"
          count={blockedOrders.length}
          color="#dc2626"
          expanded={expandedSection === 'blockedOrders'}
          onToggle={() => toggleSection('blockedOrders')}
          onViewAll={() => onGoToTab('orders')}
          theme={theme}
        >
          <div style={listStyle}>
            {blockedOrders.slice(0, expandedSection === 'blockedOrders' ? undefined : 3).map((order) => (
              <OrderRow key={order.orderNumber} order={order} theme={theme} />
            ))}
          </div>
        </Section>
      )}

      <Section
        title="ORDERS DUE SOON"
        count={dueSoonOrders.length}
        color="#3b82f6"
        expanded={expandedSection === 'dueSoon'}
        onToggle={() => toggleSection('dueSoon')}
        onViewAll={() => onGoToTab('orders')}
        theme={theme}
      >
        <div style={listStyle}>
          {dueSoonOrders.map((order) => (
            <OrderRow key={order.orderNumber} order={order} theme={theme} compact />
          ))}
        </div>
      </Section>

      <Section
        title="DEPARTMENT FOCUS"
        count={workCenters.length}
        color="#f97316"
        expanded={expandedSection === 'workCenters'}
        onToggle={() => toggleSection('workCenters')}
        onViewAll={() => toggleSection('workCenters')}
        theme={theme}
      >
        <div style={gridStyle}>
          {workCenters.slice(0, expandedSection === 'workCenters' ? undefined : 8).map((workCenter) => (
            <button
              key={workCenter.id}
              style={getWorkCenterCardStyle(theme, workCenter.status)}
              onClick={() => onOpenWorkCenter(workCenter)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={getWorkCenterTitleStyle(theme)}>{workCenter.name}</div>
                  <div style={getResourceTypeStyle(workCenter.department)}>{getDepartmentResourceLabel(workCenter.department)}</div>
                  <div style={workCenterBodyStyle}>{workCenter.dailyFocus[0]}</div>
                </div>
                <span style={getWorkCenterStatusBadge(workCenter.status)}>{workCenter.status.replace('_', ' ')}</span>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="QA / SAFETY / MAINTENANCE SIGNALS"
        count={openRisks.length + activeTasks.length + qaHolds.length}
        color="#f59e0b"
        expanded={expandedSection === 'signals'}
        onToggle={() => toggleSection('signals')}
        onViewAll={() => onGoToTab('risk')}
        theme={theme}
      >
        <div style={listStyle}>
          {qaHolds.slice(0, 2).map((order) => (
            <div key={order.orderNumber} style={getItemStyle(theme)}>
              <div>
                <div style={getItemTitleStyle(theme)}>{order.orderNumber} quality hold</div>
                <div style={mutedTextStyle}>{order.assemblyPartNumber} • {order.qaStatus}</div>
              </div>
              <span style={getPriorityBadge('CRITICAL')}>{order.qaStatus}</span>
            </div>
          ))}
          {openRisks.slice(0, 3).map((risk) => (
            <div key={risk.id} style={getItemStyle(theme)}>
              <div>
                <div style={getItemTitleStyle(theme)}>{risk.title}</div>
                <div style={mutedTextStyle}>{risk.department} • {risk.category ?? risk.source}</div>
              </div>
              <span style={getPriorityBadge(risk.severity ?? risk.level)}>{risk.severity ?? risk.level}</span>
            </div>
          ))}
          {activeTasks.slice(0, 3).map((task) => (
            <div key={task.id} style={getItemStyle(theme)}>
              <div>
                <div style={getItemTitleStyle(theme)}>{task.title}</div>
                <div style={mutedTextStyle}>Maintenance • Due {task.nextDue}</div>
              </div>
              <span style={getPriorityBadge(task.status)}>{task.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="MACHINE SHOP INTELLIGENCE"
        count={machines.length}
        color="#64748b"
        expanded={expandedSection === 'machines'}
        onToggle={() => toggleSection('machines')}
        onViewAll={() => onGoToTab('machines')}
        theme={theme}
      >
        <div style={listStyle}>
          <div style={getPlantNoteStyle(theme)}>
            Machine data stays powerful, but it is now one module inside the plant command model.
          </div>
          {alerts.slice(0, expandedSection === 'machines' ? undefined : 3).map((machine) => (
            <div key={machine.id} style={getItemStyle(theme)} onClick={() => onOpenMachine(machine)}>
              <div>
                <div style={getItemTitleStyle(theme)}>{machine.name}</div>
                <div style={mutedTextStyle}>{machine.department} • {machine.lastActivity}</div>
              </div>
              <StatusBadge state={machine.state} priority={machine.alarmPriority} />
            </div>
          ))}
          {alerts.length === 0 && <div style={getPlantNoteStyle(theme)}>No active machine alerts in the current view.</div>}
        </div>
      </Section>
    </div>
  );
}

function formatOrderBlock(order: ProductionOrder) {
  const blockReason = getOrderBlockReason(order);
  return blockReason ? formatBlockedReason(blockReason) : 'No blocker listed';
}

function OrderRow({ order, theme, compact = false }: { order: ProductionOrder; theme: 'dark' | 'light'; compact?: boolean }) {
  return (
    <div style={getItemStyle(theme)}>
      <div>
        <div style={getItemTitleStyle(theme)}>
          {order.orderNumber} • {order.assemblyPartNumber}
        </div>
        <div style={mutedTextStyle}>
          {order.customer} • Qty {order.quantity} • Ship {order.projectedShipDate}
        </div>
        {!compact && <div style={mutedTextStyle}>{formatOrderBlock(order)}</div>}
      </div>
      <span style={getPriorityBadge(order.status)}>{getOrderStatusLabel(order)}</span>
    </div>
  );
}

interface SectionProps {
  title: string;
  count: number;
  color: string;
  expanded: boolean;
  onToggle: () => void;
  onViewAll: () => void;
  children: ReactNode;
  theme: 'dark' | 'light';
}

function Section({ title, count, color, expanded, onToggle, onViewAll, children, theme }: SectionProps) {
  return (
    <div style={getSectionStyle(theme)}>
      <div style={sectionHeaderStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={onToggle}>
          <h3 style={{ margin: 0, fontSize: 16, color, letterSpacing: '0.5px', fontWeight: 800 }}>
            {title} ({count})
          </h3>
          <span style={{ fontSize: 16, color: '#475569' }}>{expanded ? '▼' : '▶'}</span>
        </div>
        <button onClick={onViewAll} style={viewAllButtonStyle}>VIEW ALL →</button>
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function StatusMetric({ label, value, total, color, highlight, theme }: { label: string; value: number; total: number; color: string; highlight?: boolean; theme: 'dark' | 'light' }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ ...getMetricStyle(theme), borderLeft: `4px solid ${color}`, background: highlight ? `${color}15` : theme === 'dark' ? '#1e293b' : '#ffffff' }}>
      <div style={metricLabelStyle}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color }}>{value}</span>
        <span style={{ fontSize: 14, color: '#475569' }}>/ {total}</span>
      </div>
      <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{percentage}%</div>
    </div>
  );
}

function MissionCard({ title, value, detail, color, theme, onClick }: { title: string; value: string; detail: string; color: string; theme: 'dark' | 'light'; onClick: () => void }) {
  return (
    <button style={getMissionCardStyle(theme, color)} onClick={onClick}>
      <div style={{ fontSize: 11, color, fontWeight: 900, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{title}</div>
      <div style={getMissionValueStyle(theme)}>{value}</div>
      <div style={mutedTextStyle}>{detail}</div>
    </button>
  );
}

function getDepartmentResourceLabel(department: string) {
  const labels: Record<string, string> = {
    Receiving: 'Material intake / staging',
    'Machine Shop': 'Machines / machining cells',
    'Material Handling': 'Equipment / cut-form flow',
    Fab: 'Weld cells / skill lanes',
    Coating: 'Process zones / finish flow',
    Assembly: 'Assembly cells / kit readiness',
    'Saddles Dept': 'Product lane',
    'Patch Clamps': 'Product lane',
    Clamps: 'Product lane',
    QA: 'Validation layer',
    Shipping: 'Outbound lanes / ship readiness',
    Maintenance: 'Plant support / repair flow',
    Office: 'Admin / purchasing / planning',
  };
  return labels[department] ?? 'Work center';
}

function getPriorityBadge(priority: string): CSSProperties {
  const colors: Record<string, string> = {
    BLOCKED: '#dc2626',
    HOLD: '#dc2626',
    FAILED: '#dc2626',
    HIGH: '#dc2626',
    CRITICAL: '#dc2626',
    READY: '#10b981',
    IN_PROGRESS: '#3b82f6',
    MEDIUM: '#f59e0b',
    LOW: '#3b82f6',
    NORMAL: '#10b981',
    WAITING: '#f59e0b',
    DONE: '#64748b',
  };
  const color = colors[priority] || '#64748b';
  return {
    padding: '4px 10px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 800,
    background: `${color}25`,
    color,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    border: `1px solid ${color}50`,
    whiteSpace: 'nowrap',
  };
}

const headerStyle: CSSProperties = { marginBottom: 20 };
const subtitleStyle: CSSProperties = { margin: '4px 0 0 0', fontSize: 13, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' };
const metricLabelStyle: CSSProperties = { fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 6, letterSpacing: '1px' };
const sectionHeaderStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 };
const listStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };
const gridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 };
const mutedTextStyle: CSSProperties = { fontSize: 12, color: '#64748b', lineHeight: 1.4 };
const workCenterBodyStyle: CSSProperties = { fontSize: 12, color: '#64748b', lineHeight: 1.4, marginTop: 8 };

function getTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { margin: 0, fontSize: 24, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', letterSpacing: '0.5px' };
}

function getOverviewBarStyle(_theme: 'dark' | 'light'): CSSProperties {
  return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 16 };
}

function getMissionGridStyle(): CSSProperties {
  return { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 16 };
}

function getMetricStyle(theme: 'dark' | 'light'): CSSProperties {
  return { background: theme === 'dark' ? '#1e293b' : '#ffffff', padding: '18px 20px', borderRadius: 6, border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' };
}

function getMissionCardStyle(theme: 'dark' | 'light', color: string): CSSProperties {
  return { textAlign: 'left', background: theme === 'dark' ? '#1e293b' : '#ffffff', padding: 16, borderRadius: 6, border: `1px solid ${color}55`, borderLeft: `4px solid ${color}`, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' };
}

function getMissionValueStyle(theme: 'dark' | 'light'): CSSProperties {
  return { marginTop: 8, marginBottom: 6, fontSize: 18, fontWeight: 900, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' };
}

function getSectionStyle(theme: 'dark' | 'light'): CSSProperties {
  return { background: theme === 'dark' ? '#1e293b' : '#ffffff', padding: 20, borderRadius: 6, border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' };
}

const viewAllButtonStyle: CSSProperties = { padding: '8px 14px', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid #f97316', borderRadius: 4, fontSize: 12, fontWeight: 800, cursor: 'pointer', color: '#f97316', letterSpacing: '0.5px' };

function getItemStyle(theme: 'dark' | 'light'): CSSProperties {
  return { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 14, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderRadius: 4, cursor: 'pointer', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' };
}

function getItemTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { fontWeight: 800, fontSize: 14, marginBottom: 4, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' };
}

function getWorkCenterCardStyle(theme: 'dark' | 'light', status: WorkCenter['status']): CSSProperties {
  const color = getWorkCenterStatusColor(status);
  return { padding: 16, background: theme === 'dark' ? '#0f172a' : '#f8fafc', borderRadius: 4, cursor: 'pointer', border: `1px solid ${color}66`, borderLeft: `4px solid ${color}`, textAlign: 'left' };
}

function getWorkCenterTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { fontWeight: 900, fontSize: 15, marginBottom: 6, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' };
}

function getResourceTypeStyle(department: string): CSSProperties {
  const color = department === 'Machine Shop' ? '#64748b' : '#f97316';
  return { display: 'inline-block', padding: '3px 7px', borderRadius: 4, fontSize: 10, fontWeight: 900, color, background: `${color}18`, border: `1px solid ${color}44`, textTransform: 'uppercase', letterSpacing: '0.6px' };
}

function getWorkCenterStatusBadge(status: WorkCenter['status']): CSSProperties {
  const color = getWorkCenterStatusColor(status);
  return { padding: '4px 8px', borderRadius: 4, color, border: `1px solid ${color}66`, background: `${color}18`, fontSize: 10, fontWeight: 900, letterSpacing: '0.6px', whiteSpace: 'nowrap' };
}

function getWorkCenterStatusColor(status: WorkCenter['status']) {
  if (status === 'READY') return '#10b981';
  if (status === 'WATCH') return '#f59e0b';
  if (status === 'NEEDS_ATTENTION') return '#dc2626';
  return '#64748b';
}

function getPlantNoteStyle(theme: 'dark' | 'light'): CSSProperties {
  return { padding: 14, borderRadius: 4, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', color: '#64748b', fontSize: 13, lineHeight: 1.45 };
}
