import type { CSSProperties } from 'react';
import type { AppTab } from '../../types/app';
import {
  dashboardMetricLabelStyle,
  dashboardMissionGridStyle,
  dashboardMutedTextStyle,
  dashboardOverviewBarStyle,
  getDashboardMetricStyle,
  getDashboardMissionCardStyle,
  getDashboardMissionValueStyle,
  type DashboardTheme,
} from './dashboardStyles';

type DashboardOverviewPanelsProps = {
  openOrderCount: number;
  totalOrderCount: number;
  blockedOrderCount: number;
  runnableOrderCount: number;
  materialIssueCount: number;
  plantCriticalCount: number;
  theme: DashboardTheme;
  onGoToTab: (tab: AppTab) => void;
};

export default function DashboardOverviewPanels({
  openOrderCount,
  totalOrderCount,
  blockedOrderCount,
  runnableOrderCount,
  materialIssueCount,
  plantCriticalCount,
  theme,
  onGoToTab,
}: DashboardOverviewPanelsProps) {
  return (
    <>
      <div style={dashboardOverviewBarStyle}>
        <StatusMetric label="OPEN ORDERS" value={openOrderCount} total={totalOrderCount} color="#3b82f6" theme={theme} />
        <StatusMetric label="BLOCKED" value={blockedOrderCount} total={openOrderCount} color="#dc2626" highlight={blockedOrderCount > 0} theme={theme} />
        <StatusMetric label="RUNNABLE" value={runnableOrderCount} total={openOrderCount} color="#10b981" theme={theme} />
        <StatusMetric label="MATERIAL ISSUES" value={materialIssueCount} total={openOrderCount} color="#f59e0b" highlight={materialIssueCount > 0} theme={theme} />
      </div>

      <div style={dashboardMissionGridStyle}>
        <MissionCard
          title="Blocked Flow"
          value={`${blockedOrderCount} order${blockedOrderCount === 1 ? '' : 's'}`}
          detail={blockedOrderCount > 0 ? 'Needs action before labor is assigned' : 'No blocked sample orders'}
          color="#dc2626"
          theme={theme}
          onClick={() => onGoToTab('orders')}
        />
        <MissionCard
          title="Crew Guidance"
          value={runnableOrderCount > 0 ? 'Runnable work exists' : 'No ready orders'}
          detail="Guidance over control. Use flow, material, and skill availability before assigning people."
          color="#8b5cf6"
          theme={theme}
          onClick={() => onGoToTab('coverage')}
        />
        <MissionCard
          title="Material Readiness"
          value={`${materialIssueCount} not fully ready`}
          detail="Receiving is the physical start gate for every order."
          color="#f97316"
          theme={theme}
          onClick={() => onGoToTab('receiving')}
        />
        <MissionCard
          title="Plant Criticals"
          value={plantCriticalCount.toString()}
          detail="Orders, material, QA, maintenance, and equipment alerts combined."
          color={plantCriticalCount > 0 ? '#dc2626' : '#10b981'}
          theme={theme}
          onClick={() => onGoToTab(plantCriticalCount > 0 ? 'orders' : 'plantMap')}
        />
      </div>
    </>
  );
}

function StatusMetric({
  label,
  value,
  total,
  color,
  highlight,
  theme,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  highlight?: boolean;
  theme: DashboardTheme;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div style={{ ...getDashboardMetricStyle(theme), borderLeft: `3px solid ${color}`, background: highlight ? `${color}12` : undefined }}>
      <div style={dashboardMetricLabelStyle}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{ fontSize: 23, fontWeight: 800, color }}>{value}</span>
        <span style={{ fontSize: 12, color: '#475569' }}>/ {total}</span>
      </div>
      <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>{percentage}%</div>
    </div>
  );
}

function MissionCard({
  title,
  value,
  detail,
  color,
  theme,
  onClick,
}: {
  title: string;
  value: string;
  detail: string;
  color: string;
  theme: DashboardTheme;
  onClick: () => void;
}) {
  return (
    <button style={getDashboardMissionCardStyle(theme, color)} onClick={onClick}>
      <div style={getMissionTitleStyle(color)}>{title}</div>
      <div style={getDashboardMissionValueStyle(theme)}>{value}</div>
      <div style={dashboardMutedTextStyle}>{detail}</div>
    </button>
  );
}

function getMissionTitleStyle(color: string): CSSProperties {
  return {
    fontSize: 10,
    color,
    fontWeight: 900,
    letterSpacing: '0.7px',
    textTransform: 'uppercase',
  };
}
