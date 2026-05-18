import type { RoleView, AppTab } from '../types/app';
import type { ProductionOrder } from '../types/productionOrder';
import type { DashboardRuntimeTruth } from './dashboardRuntimeSelectors';

export type RoleDashboardBucket = {
  id: string;
  title: string;
  count: number;
  intent: string;
  proof: string;
  actionLabel: string;
  targetTab: AppTab;
  urgency: 'red' | 'orange' | 'blue' | 'green' | 'gray';
  sampleOrders: string[];
};

export function getRoleDashboardBuckets(roleView: RoleView, truth: DashboardRuntimeTruth): RoleDashboardBucket[] {
  const role = String(roleView).toLowerCase();
  if (role.includes('production') || role.includes('operator')) return operatorBuckets(truth);
  if (role.includes('support') || role.includes('maintenance')) return supportBuckets(truth);
  if (role.includes('lead') || role.includes('supervisor')) return leadBuckets(truth);
  return managementBuckets(truth);
}

function managementBuckets(truth: DashboardRuntimeTruth): RoleDashboardBucket[] {
  return [
    bucket('plant-bottlenecks', 'Plant Bottlenecks', truth.blockedOrders, 'Where the plant is visibly stuck right now.', 'Blocked, held, or interrupted orders grouped before department detail.', 'Open War Board', 'kanban', 'red'),
    bucket('aging-holds', 'Aging Holds', [...truth.blockedOrders, ...truth.qaHolds], 'Holds that need ownership and follow-up before they become blame fog.', 'Uses blocked and QA hold signals already surfaced in Command Center.', 'Review Holds', 'orders', 'orange'),
    bucket('due-soon-risk', 'Due Soon Risk', truth.dueSoonOrders, 'Orders closest to ship-window pressure.', 'Sorted by projected ship date from open orders.', 'Open Orders', 'orders', 'blue'),
    bucket('decision-needed', 'Decision Needed', [...truth.materialIssues, ...truth.qaHolds], 'Material, QA, or support decisions waiting on a human.', 'Material exceptions and QA holds require an owner before work is treated as clear.', 'Open Support Queue', 'receiving', 'orange'),
  ];
}

function leadBuckets(truth: DashboardRuntimeTruth): RoleDashboardBucket[] {
  return [
    bucket('we-own', 'We Own', truth.runnableOrders, 'Work that can move if the department has crew and equipment.', 'Runnable open orders are the safest first pass for local action.', 'Open Ready Work', 'orders', 'green'),
    bucket('waiting-on-us', 'Waiting On Us', truth.blockedOrders, 'Work stopped in the flow that needs owner confirmation.', 'Blocked orders need a department lead to confirm the next owner.', 'Review Blockers', 'orders', 'red'),
    bucket('waiting-on-others', 'Waiting On Others', truth.materialIssues, 'Material or support issues that should not be blamed on the running department.', 'Material exceptions show where another team owes the next update.', 'Open Receiving', 'receiving', 'orange'),
    bucket('ready-work', 'Ready Work', truth.runnableOrders.slice(0, 6), 'Cleanest candidate work after blockers and holds are understood.', 'Runnable orders only; this does not dispatch work automatically.', 'Open Orders', 'orders', 'green'),
  ];
}

function operatorBuckets(truth: DashboardRuntimeTruth): RoleDashboardBucket[] {
  return [
    bucket('do-now', 'Do Now', truth.runnableOrders, 'Work that appears safe to prepare or ask about next.', 'Runnable orders are visible without clearing any blocker or changing route state.', 'Open Orders', 'orders', 'green'),
    bucket('blocked', 'Blocked', truth.blockedOrders, 'Do not run until the blocker owner changes the truth.', 'Blocked orders stay visible so operators do not have to guess.', 'Show Blocked', 'orders', 'red'),
    bucket('waiting', 'Waiting', truth.materialIssues, 'Material or support wait states that need follow-up, not improvising.', 'Material exceptions stay separate from production-ready work.', 'Open Material', 'receiving', 'orange'),
    bucket('ask-lead', 'Ask Lead', truth.qaHolds, 'QA or hold signals that need a lead or support decision.', 'QA hold and failed statuses are not operator-clearable.', 'Open QA', 'qa', 'blue'),
  ];
}

function supportBuckets(truth: DashboardRuntimeTruth): RoleDashboardBucket[] {
  return [
    bucket('requests-for-us', 'Requests For Us', [...truth.materialIssues, ...truth.qaHolds], 'The plant is waiting on support, QA, material, or maintenance truth.', 'Material exceptions and QA holds are the first support response lane.', 'Open Support Work', 'receiving', 'orange'),
    bucket('needs-more-info', 'Needs More Info', truth.blockedOrders, 'Blocked work where support may need clearer owner or proof.', 'Blocked orders are visible without assuming support owns all of them.', 'Review Orders', 'orders', 'red'),
    bucket('aging-requests', 'Aging Requests', truth.dueSoonOrders, 'Due-soon work that may need support follow-up before it becomes a crisis.', 'Due-soon orders are sorted by projected ship date.', 'Open Orders', 'orders', 'blue'),
    bucket('recently-clear', 'Recently Clear', truth.runnableOrders, 'Work that appears ready after current known exceptions.', 'Runnable does not mean dispatched; it means no current dashboard blocker.', 'Open Ready Work', 'orders', 'green'),
  ];
}

function bucket(
  id: string,
  title: string,
  orders: ProductionOrder[],
  intent: string,
  proof: string,
  actionLabel: string,
  targetTab: AppTab,
  urgency: RoleDashboardBucket['urgency'],
): RoleDashboardBucket {
  return {
    id,
    title,
    count: orders.length,
    intent,
    proof,
    actionLabel,
    targetTab,
    urgency,
    sampleOrders: orders.slice(0, 3).map((order) => order.orderNumber),
  };
}
