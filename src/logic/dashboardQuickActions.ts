import type { RoleView } from '../types/app';
import type { NavigationIntent } from './navigationContracts';

export type QuickActionTone = 'red' | 'orange' | 'blue' | 'green' | 'slate';

export type QuickAction = {
  label: string;
  detail: string;
  intent: NavigationIntent;
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
    'OPEN_EQUIPMENT_ALERTS',
    state.alertCount,
    'red',
    'green',
    5,
  );
  const maintenanceAction = createLiveAction(
    'Open Maintenance',
    'No active maintenance pressure in current view',
    'Review active maintenance requests and scheduled task pressure',
    'OPEN_MAINTENANCE',
    state.activeTaskCount,
    'orange',
    'slate',
    4,
  );
  const qaAction = createLiveAction(
    'Review QA / Safety',
    'No open QA / safety signal in current view',
    'Review quality holds, safety signals, and risk items',
    'OPEN_QA_SAFETY',
    state.openRiskCount + state.qaHoldCount,
    'red',
    'slate',
    5,
  );
  const blockerAction = createLiveAction(
    'Review Blockers',
    'No blocked orders in current view',
    'Open workflow blocker context before assigning labor',
    'OPEN_WORKFLOW',
    state.blockedOrderCount,
    'red',
    'orange',
    6,
  );
  const materialAction = createLiveAction(
    'Open Material Issues',
    'Material is clear in current view',
    'Open receiving and material readiness issues',
    'OPEN_RECEIVING',
    state.materialIssueCount,
    'orange',
    'green',
    5,
  );

  if (roleView === 'Production') {
    return sortQuickActions([
      { label: 'View Work Queue', detail: 'Open assigned work and current station priorities', intent: 'OPEN_WORKFLOW', tone: 'orange', priority: 3 },
      { ...blockerAction, label: state.blockedOrderCount > 0 ? 'Report Blocked Work' : 'Review Blocker Status', intent: 'OPEN_WORKFLOW' },
      { ...materialAction, label: state.materialIssueCount > 0 ? 'Request Material' : 'Check Material Status' },
      { ...maintenanceAction, label: state.activeTaskCount > 0 ? 'Call Maintenance' : 'Maintenance Status' },
      qaAction,
      { label: 'Open Documents', detail: 'Access procedures, standards, and references', intent: 'OPEN_DOCUMENTS', tone: 'slate', priority: 1 },
    ]);
  }

  if (roleView === 'Department Lead' || roleView === 'Department Supervisor') {
    return sortQuickActions([
      blockerAction,
      { label: 'Check Crew Coverage', detail: 'See available crew and coverage gaps', intent: 'OPEN_CREW_COVERAGE', tone: state.blockedOrderCount > 0 ? 'orange' : 'slate', priority: 3 },
      { label: 'Open Departments', detail: 'Review work-center focus and department status', intent: 'OPEN_PLANT_MAP', tone: 'green', priority: 2 },
      alertAction,
      { label: 'Open Engineering Review', detail: state.blockedOrderCount > 0 ? 'Check blueprint, routing, or release blockers' : 'Review engineering release status', intent: 'OPEN_ENGINEERING', tone: 'blue', priority: state.blockedOrderCount > 0 ? 4 : 2 },
      maintenanceAction,
    ]);
  }

  if (roleView === 'Management') {
    return sortQuickActions([
      { label: 'Plant Command Review', detail: 'Review plant criticals, flow, and department status', intent: 'OPEN_DASHBOARD', tone: state.blockedOrderCount + state.alertCount > 0 ? 'orange' : 'slate', priority: 2 },
      blockerAction,
      { label: 'Check Crew Coverage', detail: 'Review staffing status across departments', intent: 'OPEN_CREW_COVERAGE', tone: 'slate', priority: 2 },
      { label: 'Open Departments', detail: 'Review department focus and work-center status', intent: 'OPEN_PLANT_MAP', tone: 'green', priority: 2 },
      alertAction,
      qaAction,
      maintenanceAction,
      { label: 'Open Documents', detail: 'Access standards, procedures, and references', intent: 'OPEN_DOCUMENTS', tone: 'slate', priority: 1 },
    ]);
  }

  if (roleView === 'Maintenance') {
    return sortQuickActions([
      maintenanceAction,
      alertAction,
      { ...blockerAction, label: 'Review Work Queue', detail: state.blockedOrderCount > 0 ? 'Check workflow impact before taking equipment down' : 'Check production impact before maintenance work', intent: 'OPEN_WORKFLOW' },
      { label: 'Open Equipment', detail: 'Review equipment status and detail cards', intent: 'OPEN_EQUIPMENT', tone: 'blue', priority: 3 },
      qaAction,
      { label: 'Open Documents', detail: 'Access procedures, standards, and references', intent: 'OPEN_DOCUMENTS', tone: 'slate', priority: 1 },
    ]);
  }

  if (roleView === 'Support') {
    return sortQuickActions([
      { ...materialAction, label: state.materialIssueCount > 0 ? 'Open Material Issues' : 'Open Receiving' },
      qaAction,
      { label: 'Request Queue', detail: 'Check material and support requests from production departments', intent: 'OPEN_RECEIVING', tone: state.materialIssueCount > 0 ? 'orange' : 'slate', priority: state.materialIssueCount > 0 ? 4 : 2 },
      { ...blockerAction, label: 'View Work Queue', detail: state.blockedOrderCount > 0 ? 'Review orders waiting on receiving, QA, or support action' : 'Review orders near support handoff', intent: 'OPEN_WORKFLOW' },
      { label: 'Open QA Department', detail: 'Review QA department cards and station signals', intent: 'OPEN_QA_DEPARTMENT', tone: 'blue', priority: 3 },
      { label: 'Check Crew Coverage', detail: 'Review support coverage and available help', intent: 'OPEN_CREW_COVERAGE', tone: 'slate', priority: 2 },
      { label: 'Open Orders', detail: 'Review material, QA, and release status by order', intent: 'OPEN_ORDERS', tone: 'blue', priority: 2 },
      alertAction,
      { label: 'Open Documents', detail: 'Access standards, inspection references, and procedures', intent: 'OPEN_DOCUMENTS', tone: 'slate', priority: 1 },
    ]);
  }

  return sortQuickActions([
    { label: 'View Work Queue', detail: 'Open current workflow and station priorities', intent: 'OPEN_WORKFLOW', tone: 'orange', priority: 3 },
    blockerAction,
    materialAction,
    { label: 'Open Departments', detail: 'Use department focus cards and work-center view', intent: 'OPEN_PLANT_MAP', tone: 'green', priority: 2 },
    { label: 'Check Crew Coverage', detail: 'See available crew and coverage status', intent: 'OPEN_CREW_COVERAGE', tone: 'slate', priority: 2 },
    alertAction,
    maintenanceAction,
    qaAction,
    { label: 'Open Documents', detail: 'Access standards, procedures, and references', intent: 'OPEN_DOCUMENTS', tone: 'slate', priority: 1 },
  ]);
}

export function formatRoleLabel(roleView: RoleView): string {
  return roleView;
}

function createLiveAction(
  label: string,
  clearDetail: string,
  activeDetail: string,
  intent: NavigationIntent,
  count: number,
  activeTone: QuickActionTone,
  clearTone: QuickActionTone,
  activePriority: number,
): QuickAction {
  return {
    label,
    detail: count > 0 ? `${count} active - ${activeDetail}` : clearDetail,
    intent,
    count: count > 0 ? count : undefined,
    tone: count > 0 ? activeTone : clearTone,
    priority: count > 0 ? activePriority : 1,
  };
}

function sortQuickActions(actions: QuickAction[]): QuickAction[] {
  return [...actions].sort((a, b) => b.priority - a.priority);
}
