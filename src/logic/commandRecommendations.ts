import type { AppTab, RoleView } from '../types/app';
import type { DashboardRuntimeTruth } from './dashboardRuntimeSelectors';

export type PlantStatusSeverity = 'normal' | 'watch' | 'blocked' | 'critical';

export type CommandRecommendation = {
  severity: PlantStatusSeverity;
  title: string;
  detail: string;
  reason: string;
  targetTab: AppTab;
  actionLabel: string;
};

export function getPlantStatusSeverity(runtime: DashboardRuntimeTruth): PlantStatusSeverity {
  if (runtime.qaHolds.length > 0 || runtime.plantCriticals >= 8) return 'critical';
  if (runtime.blockedOrders.length > 0) return 'blocked';
  if (runtime.materialIssues.length > 0 || runtime.plantCriticals > 0) return 'watch';
  return 'normal';
}

export function getCommandRecommendation(
  runtime: DashboardRuntimeTruth,
  roleView: RoleView,
): CommandRecommendation {
  const severity = getPlantStatusSeverity(runtime);

  if (roleView === 'Maintenance') {
    if (runtime.blockedOrders.length > 0) {
      return {
        severity: 'blocked',
        title: 'Check production impact before maintenance work',
        detail: `${runtime.blockedOrders.length} blocked order${runtime.blockedOrders.length === 1 ? '' : 's'} may depend on equipment or department availability.`,
        reason: 'Maintenance decisions can either clear flow or accidentally block a runnable path.',
        targetTab: 'workflow',
        actionLabel: 'Review Workflow',
      };
    }

    return {
      severity,
      title: 'Review active maintenance pressure',
      detail: 'Start with active requests and equipment signals before scheduled tasks.',
      reason: 'The fastest plant support win is clearing work that is already stopping production.',
      targetTab: 'maintenance',
      actionLabel: 'Open Maintenance',
    };
  }

  if (roleView === 'Support') {
    if (runtime.qaHolds.length > 0) {
      return {
        severity: 'critical',
        title: 'Clear QA holds before downstream work moves',
        detail: `${runtime.qaHolds.length} order${runtime.qaHolds.length === 1 ? ' has' : 's have'} QA hold or failed status.`,
        reason: 'A QA hold can make otherwise runnable work unsafe to release or ship.',
        targetTab: 'risk',
        actionLabel: 'Review QA / Safety',
      };
    }

    if (runtime.materialIssues.length > 0) {
      return {
        severity: 'watch',
        title: 'Resolve material readiness first',
        detail: `${runtime.materialIssues.length} open order${runtime.materialIssues.length === 1 ? ' is' : 's are'} not fully material-ready.`,
        reason: 'Material is the physical start gate. Production cannot move what has not been staged or received.',
        targetTab: 'receiving',
        actionLabel: 'Open Receiving',
      };
    }

    return {
      severity,
      title: 'Review support readiness signals',
      detail: 'No QA hold or major material readiness issue is currently leading the support signal.',
      reason: 'Support keeps production moving by clearing material, QA, release, and handoff friction.',
      targetTab: 'receiving',
      actionLabel: 'Open Support Flow',
    };
  }

  if (runtime.qaHolds.length > 0) {
    return {
      severity: 'critical',
      title: 'Review QA holds before releasing work',
      detail: `${runtime.qaHolds.length} order${runtime.qaHolds.length === 1 ? ' has' : 's have'} QA hold or failed status.`,
      reason: 'Quality blocks should be cleared before assigning labor or promising shipment.',
      targetTab: 'risk',
      actionLabel: 'Review QA / Safety',
    };
  }

  if (runtime.blockedOrders.length > 0) {
    return {
      severity: 'blocked',
      title: 'Resolve blocked flow before assigning labor',
      detail: `${runtime.blockedOrders.length} blocked order${runtime.blockedOrders.length === 1 ? '' : 's'} need action.`,
      reason: 'Labor assigned to blocked work creates motion without progress.',
      targetTab: 'orders',
      actionLabel: 'Open Orders',
    };
  }

  if (runtime.materialIssues.length > 0) {
    return {
      severity: 'watch',
      title: 'Stage material before work becomes urgent',
      detail: `${runtime.materialIssues.length} open order${runtime.materialIssues.length === 1 ? ' is' : 's are'} not fully material-ready.`,
      reason: 'Material gaps are easier to clear before the order reaches the next department.',
      targetTab: 'receiving',
      actionLabel: 'Open Receiving',
    };
  }

  if (runtime.runnableOrders.length > 0) {
    return {
      severity: 'normal',
      title: 'Move runnable work through the floor',
      detail: `${runtime.runnableOrders.length} order${runtime.runnableOrders.length === 1 ? ' is' : 's are'} ready or in progress.`,
      reason: 'When blockers are low, the best next move is protecting flow and crew coverage.',
      targetTab: 'workflow',
      actionLabel: 'Open Workflow',
    };
  }

  return {
    severity: 'normal',
    title: 'Plant signal is stable',
    detail: 'No blocked flow, material issue, or QA hold is leading the current command signal.',
    reason: 'Use this window to review due-soon work and department readiness.',
    targetTab: 'plantMap',
    actionLabel: 'Open Plant Map',
  };
}
