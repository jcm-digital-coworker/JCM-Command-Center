import type { AppTab, RoleView } from '../types/app';

export type QuickActionTone = 'red' | 'orange' | 'blue' | 'green' | 'slate';

export type QuickAction = {
  label: string;
  detail: string;
  target: AppTab;
  tone: QuickActionTone;
  count?: number;
  priority: number;
};

export type QuickActionState = {
  alertCount: number;
  activeTaskCount: number;
  openRiskCount: number;
  qaHoldCount: number;
  blockedOrderCount: number;
  materialIssueCount: number;
};

export function getQuickActionsForRole(roleView: RoleView, state: QuickActionState): QuickAction[] {
  const alertAction = createLiveAction(
    'View Equipment Alerts',
    'No active equipment alerts in current view',
    'Open active equipment alarms and offline status',
    'alerts',
    state.alertCount,
    'red',
    'green',
    5,
  );
  const maintenanceAction = createLiveAction(
    'Open Maintenance',
    'No active maintenance pressure in current view',
    'Review active maintenance requests and scheduled task pressure',
    'maintenance',
    state.activeTaskCount,
    'orange',
    'slate',
    4,
  );
  const qaAction = createLiveAction(
    'Review QA / Safety',
    'No open QA / safety signal in current view',
    'Review quality holds, safety signals, and risk items',
    'risk',
    state.openRiskCount + state.qaHoldCount,
    'red',
    'slate',
    5,
  );
  const blockerAction = createLiveAction(
    'Resolve Blockers',
    'No blocked orders in current view',
    'Review blocked flow before assigning labor',
    'orders',
    state.blockedOrderCount,
    'red',
    'orange',
    6,
  );
  const materialAction = createLiveAction(
    'Resolve Material Issues',
    'Material is clear in current view',
    'Open receiving and material readiness issues',
    'receiving',
    state.materialIssueCount,
    'orange',
    'green',
    5,
  );

  if (roleView === 'Production') {
    return sortQuickActions([
      { label: 'View Work Queue', detail: 'Open assigned work and current station priorities', target: 'workflow', tone: 'orange', priority: 3 },
      { ...blockerAction, label: state.blockedOrderCount > 0 ? 'Report Blocked Work' : 'Review Blocker Status', target: 'workflow' },
      { ...materialAction, label: state.materialIssueCount > 0 ? 'Request Material' : 'Check Material Status' },
      { ...maintenanceAction, label: state.activeTaskCount > 0 ? 'Call Maintenance' : 'Maintenance Status' },
      qaAction,
      { label: 'Open Documents', detail: 'Access procedures, standards, and references', target: 'documents', tone: 'slate', priority: 1 },
    ]);
  }

  if (roleView === 'Department Lead' || roleView === 'Department Supervisor') {
    return sortQuickActions([
      blockerAction,
      { label: 'Check Crew Coverage', detail: 'See available crew and coverage gaps', target: 'coverage', tone: state.blockedOrderCount > 0 ? 'orange' : 'slate', priority: 3 },
      { label: 'Open Departments', detail: 'Review work-center focus and department status', target: 'plantMap', tone: 'green', priority: 2 },
      alertAction,
      { label: 'Escalate Engineering', detail: state.blockedOrderCount > 0 ? 'Check blueprint, routing, or release blockers' : 'Review engineering release status', target: 'orders', tone: 'blue', priority: state.blockedOrderCount > 0 ? 4 : 2 },
      maintenanceAction,
    ]);
  }

  if (roleView === 'Management') {
    return sortQuickActions([
      { label: 'Plant Command Review', detail: 'Review plant criticals, flow, and department status', target: 'dashboard', tone: state.blockedOrderCount + state.alertCount > 0 ? 'orange' : 'slate', priority: 2 },
      blockerAction,
      { label: 'Check Crew Coverage', detail: 'Review staffing status across departments', target: 'coverage', tone: 'slate', priority: 2 },
      { label: 'Open Departments', detail: 'Review department focus and work-center status', target: 'plantMap', tone: 'green', priority: 2 },
      alertAction,
      qaAction,
      maintenanceAction,
      { label: 'Open Documents', detail: 'Access standards, procedures, and references', target: 'documents', tone: 'slate', priority: 1 },
    ]);
  }

  if (roleView === 'Maintenance') {
    return sortQuickActions([
      maintenanceAction,
      alertAction,
      { ...blockerAction, label: 'Review Work Queue', detail: state.blockedOrderCount > 0 ? 'Check workflow impact before taking equipment down' : 'Check production impact before maintenance work', target: 'workflow' },
      { label: 'Open Equipment', detail: 'Review equipment status and detail cards', target: 'machines', tone: 'blue', priority: 3 },
      qaAction,
      { label: 'Open Documents', detail: 'Access procedures, standards, and references', target: 'documents', tone: 'slate', priority: 1 },
    ]);
  }

  if (roleView === 'Support') {
    return sortQuickActions([
      { ...materialAction, label: state.materialIssueCount > 0 ? 'Open Material Issues' : 'Open Receiving' },
      qaAction,
      { label: 'Request Queue', detail: 'Check material and support requests from production departments', target: 'receiving', tone: state.materialIssueCount > 0 ? 'orange' : 'slate', priority: state.materialIssueCount > 0 ? 4 : 2 },
      { ...blockerAction, label: 'View Work Queue', detail: state.blockedOrderCount > 0 ? 'Review orders waiting on receiving, QA, or support action' : 'Review orders near support handoff', target: 'workflow' },
      { label: 'Open QA Department', detail: 'Review QA department cards and station signals', target: 'qa', tone: 'blue', priority: 3 },
      { label: 'Check Crew Coverage', detail: 'Review support coverage and available help', target: 'coverage', tone: 'slate', priority: 2 },
      { label: 'Open Orders', detail: 'Review material, QA, and release status by order', target: 'orders', tone: 'blue', priority: 2 },
      alertAction,
      { label: 'Open Documents', detail: 'Access standards, inspection references, and procedures', target: 'documents', tone: 'slate', priority: 1 },
    ]);
  }

  return sortQuickActions([
    { label: 'View Work Queue', detail: 'Open current workflow and station priorities', target: 'workflow', tone: 'orange', priority: 3 },
    blockerAction,
    materialAction,
    { label: 'Open Departments', detail: 'Use department focus cards and work-center view', target: 'plantMap', tone: 'green', priority: 2 },
    { label: 'Check Crew Coverage', detail: 'See available crew and coverage status', target: 'coverage', tone: 'slate', priority: 2 },
    alertAction,
    maintenanceAction,
    qaAction,
    { label: 'Open Documents', detail: 'Access standards, procedures, and references', target: 'documents', tone: 'slate', priority: 1 },
  ]);
}

export function formatRoleLabel(roleView: RoleView): string {
  return roleView;
}

function createLiveAction(
  label: string,
  clearDetail: string,
  activeDetail: string,
  target: AppTab,
  count: number,
  activeTone: QuickActionTone,
  clearTone: QuickActionTone,
  activePriority: number,
): QuickAction {
  return {
    label,
    detail: count > 0 ? `${count} active - ${activeDetail}` : clearDetail,
    target,
    count: count > 0 ? count : undefined,
    tone: count > 0 ? activeTone : clearTone,
    priority: count > 0 ? activePriority : 1,
  };
}

function sortQuickActions(actions: QuickAction[]): QuickAction[] {
  return [...actions].sort((a, b) => b.priority - a.priority);
}
