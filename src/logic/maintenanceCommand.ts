import type { Machine } from '../types/machine';
import type { MaintenanceTask } from '../types/maintenance';
import type { MaintenanceRequest } from '../types/maintenanceRequest';
import { getRepeatOffenders } from './maintenanceRepeatOffenders';

export type MaintenanceCommandLane = {
  key: 'CRITICAL' | 'WAITING' | 'ASSIGNED' | 'PM' | 'WATCH';
  title: string;
  count: number;
  detail: string;
  tone: 'danger' | 'warning' | 'info' | 'good';
};

export type MaintenanceAssetHealth = {
  machineId: string;
  machineName: string;
  department: string;
  state: Machine['state'];
  openRequestCount: number;
  criticalRequestCount: number;
  dueTaskCount: number;
  lastKnownState: string;
  recommendedAction: string;
  riskTone: 'danger' | 'warning' | 'info' | 'good';
};

export type MaintenanceCommandModel = {
  pressureScore: number;
  pressureLabel: string;
  pressureTone: 'danger' | 'warning' | 'info' | 'good';
  openRequests: MaintenanceRequest[];
  criticalRequests: MaintenanceRequest[];
  waitingRequests: MaintenanceRequest[];
  assignedRequests: MaintenanceRequest[];
  dueTasks: MaintenanceTask[];
  overdueTasks: MaintenanceTask[];
  repeatOffenderCount: number;
  lanes: MaintenanceCommandLane[];
  nextBestAction: string;
  epicorReadyCount: number;
  assetHealth: MaintenanceAssetHealth[];
};

const CRITICAL_PRIORITIES = new Set(['SAFETY', 'LINE_DOWN', 'MACHINE_DOWN']);

export function getMaintenanceCommandModel({
  machines,
  tasks,
  requests,
}: {
  machines: Machine[];
  tasks: MaintenanceTask[];
  requests: MaintenanceRequest[];
}): MaintenanceCommandModel {
  const openRequests = requests.filter((request) => request.status !== 'COMPLETED');
  const criticalRequests = openRequests.filter((request) => CRITICAL_PRIORITIES.has(request.priority));
  const waitingRequests = openRequests.filter(isWaitingRequest);
  const assignedRequests = openRequests.filter((request) => request.status === 'CLAIMED' || request.status === 'IN_PROGRESS');
  const overdueTasks = tasks.filter((task) => task.status === 'OVERDUE');
  const dueTasks = tasks.filter((task) => task.status === 'OVERDUE' || task.status === 'DUE_SOON');
  const repeatOffenderCount = getRepeatOffenders(requests).length;
  const epicorReadyCount = openRequests.filter(isEpicorReady).length;
  const pressureScore = getMaintenancePressureScore({ criticalRequests, waitingRequests, overdueTasks, dueTasks, repeatOffenderCount });
  const { label: pressureLabel, tone: pressureTone } = getPressureBand(pressureScore);
  const lanes: MaintenanceCommandLane[] = [
    {
      key: 'CRITICAL',
      title: 'Line / Safety Impact',
      count: criticalRequests.length,
      detail: criticalRequests[0]
        ? `${criticalRequests[0].machineName}: ${criticalRequests[0].problem}`
        : 'No line-down, machine-down, or safety request is currently open.',
      tone: criticalRequests.length > 0 ? 'danger' : 'good',
    },
    {
      key: 'WAITING',
      title: 'Waiting on Parts / Vendor',
      count: waitingRequests.length,
      detail: waitingRequests[0]
        ? `${waitingRequests[0].machineName}: ${waitingRequests[0].partsNeeded ?? waitingRequests[0].problem}`
        : 'No open request is marked as waiting on parts, vendor, or production window.',
      tone: waitingRequests.length > 0 ? 'warning' : 'good',
    },
    {
      key: 'ASSIGNED',
      title: 'Assigned Work',
      count: assignedRequests.length,
      detail: assignedRequests[0]
        ? `${assignedRequests[0].machineName}: ${assignedRequests[0].claimedBy ?? 'claimed'} owns the next step.`
        : 'No request is currently claimed or in progress.',
      tone: assignedRequests.length > 0 ? 'info' : 'warning',
    },
    {
      key: 'PM',
      title: 'PM Due / Overdue',
      count: dueTasks.length,
      detail: overdueTasks[0]
        ? `${overdueTasks[0].title} is overdue.`
        : dueTasks[0]
          ? `${dueTasks[0].title} is due soon.`
          : 'No preventive maintenance task is due soon or overdue.',
      tone: overdueTasks.length > 0 ? 'danger' : dueTasks.length > 0 ? 'warning' : 'good',
    },
    {
      key: 'WATCH',
      title: 'Repeat Offenders',
      count: repeatOffenderCount,
      detail: repeatOffenderCount > 0
        ? `${repeatOffenderCount} asset${repeatOffenderCount === 1 ? '' : 's'} with repeated requests in the last 30 days.`
        : 'No chronic request pattern is currently leading the board.',
      tone: repeatOffenderCount > 0 ? 'warning' : 'good',
    },
  ];

  return {
    pressureScore,
    pressureLabel,
    pressureTone,
    openRequests,
    criticalRequests,
    waitingRequests,
    assignedRequests,
    dueTasks,
    overdueTasks,
    repeatOffenderCount,
    lanes,
    nextBestAction: getNextBestAction({ criticalRequests, waitingRequests, overdueTasks, dueTasks, openRequests }),
    epicorReadyCount,
    assetHealth: getAssetHealth(machines, tasks, openRequests),
  };
}

function isWaitingRequest(request: MaintenanceRequest): boolean {
  return request.status === 'WAITING_ON_PARTS'
    || request.status === 'WAITING_ON_VENDOR'
    || request.status === 'WAITING_ON_PRODUCTION_WINDOW'
    || Boolean(request.partsNeeded && request.status !== 'COMPLETED');
}

function isEpicorReady(request: MaintenanceRequest): boolean {
  return Boolean(
    request.epicorAssetId
      || request.failureCode
      || request.rootCauseCode
      || request.downtimeMinutes
      || request.laborHours
      || request.partsNeeded
      || request.erpSyncStatus === 'READY_TO_EXPORT',
  );
}

function getMaintenancePressureScore({
  criticalRequests,
  waitingRequests,
  overdueTasks,
  dueTasks,
  repeatOffenderCount,
}: {
  criticalRequests: MaintenanceRequest[];
  waitingRequests: MaintenanceRequest[];
  overdueTasks: MaintenanceTask[];
  dueTasks: MaintenanceTask[];
  repeatOffenderCount: number;
}): number {
  return Math.min(
    100,
    criticalRequests.length * 25
      + waitingRequests.length * 12
      + overdueTasks.length * 14
      + dueTasks.length * 5
      + repeatOffenderCount * 10,
  );
}

function getPressureBand(score: number): { label: string; tone: MaintenanceCommandModel['pressureTone'] } {
  if (score >= 70) return { label: 'High maintenance pressure', tone: 'danger' };
  if (score >= 35) return { label: 'Elevated maintenance pressure', tone: 'warning' };
  if (score > 0) return { label: 'Active but controlled', tone: 'info' };
  return { label: 'Quiet maintenance board', tone: 'good' };
}

function getNextBestAction({
  criticalRequests,
  waitingRequests,
  overdueTasks,
  dueTasks,
  openRequests,
}: {
  criticalRequests: MaintenanceRequest[];
  waitingRequests: MaintenanceRequest[];
  overdueTasks: MaintenanceTask[];
  dueTasks: MaintenanceTask[];
  openRequests: MaintenanceRequest[];
}): string {
  const unclaimedCritical = criticalRequests.find((request) => request.status === 'NEW');
  if (unclaimedCritical) return `Claim or assign ${unclaimedCritical.machineName}: ${unclaimedCritical.problem}`;
  if (criticalRequests[0]) return `Drive current critical request on ${criticalRequests[0].machineName} to the next logged state.`;
  if (waitingRequests[0]) return `Resolve parts/vendor blocker for ${waitingRequests[0].machineName}.`;
  if (overdueTasks[0]) return `Schedule overdue PM: ${overdueTasks[0].title}.`;
  if (dueTasks[0]) return `Plan upcoming PM: ${dueTasks[0].title}.`;
  if (openRequests[0]) return `Triage open request on ${openRequests[0].machineName}.`;
  return 'No urgent maintenance action is leading right now. Review PM plan and asset history.';
}

function getAssetHealth(
  machines: Machine[],
  tasks: MaintenanceTask[],
  openRequests: MaintenanceRequest[],
): MaintenanceAssetHealth[] {
  return machines.map((machine) => {
    const machineRequests = openRequests.filter((request) => request.machineId === machine.id || request.machineName === machine.name);
    const machineTasks = tasks.filter((task) => task.machineId === machine.id);
    const criticalRequestCount = machineRequests.filter((request) => CRITICAL_PRIORITIES.has(request.priority)).length;
    const dueTaskCount = machineTasks.filter((task) => task.status === 'OVERDUE' || task.status === 'DUE_SOON').length;
    const riskTone = getAssetRiskTone(machine.state, criticalRequestCount, dueTaskCount, machineRequests.length);

    return {
      machineId: machine.id,
      machineName: machine.name,
      department: machine.department,
      state: machine.state,
      openRequestCount: machineRequests.length,
      criticalRequestCount,
      dueTaskCount,
      lastKnownState: machine.lastKnownState,
      recommendedAction: getAssetRecommendedAction(machine, criticalRequestCount, dueTaskCount, machineRequests.length),
      riskTone,
    };
  }).sort((a, b) => assetToneScore(b.riskTone) - assetToneScore(a.riskTone) || b.criticalRequestCount - a.criticalRequestCount || b.openRequestCount - a.openRequestCount);
}

function getAssetRiskTone(
  state: Machine['state'],
  criticalRequestCount: number,
  dueTaskCount: number,
  openRequestCount: number,
): MaintenanceAssetHealth['riskTone'] {
  if (criticalRequestCount > 0 || state === 'ALARM' || state === 'OFFLINE') return 'danger';
  if (dueTaskCount > 0 || openRequestCount > 0) return 'warning';
  if (state === 'RUNNING') return 'good';
  return 'info';
}

function getAssetRecommendedAction(
  machine: Machine,
  criticalRequestCount: number,
  dueTaskCount: number,
  openRequestCount: number,
): string {
  if (criticalRequestCount > 0) return 'Protect production first: assign tech, capture downtime, and stage parts/root cause details.';
  if (machine.state === 'ALARM') return 'Review alarm history and recent events before restarting production.';
  if (machine.state === 'OFFLINE') return 'Restore heartbeat or confirm true offline state before trusting the dashboard.';
  if (dueTaskCount > 0) return 'Schedule PM before it becomes an unplanned request.';
  if (openRequestCount > 0) return 'Claim or update the open request so the floor knows ownership.';
  if (machine.behaviorTags.includes('Setup-Sensitive')) return 'Watch setup notes, handoff quality, and repeat setup-related requests.';
  return 'No active maintenance pressure. Keep PM and inspection cadence steady.';
}

function assetToneScore(tone: MaintenanceAssetHealth['riskTone']): number {
  if (tone === 'danger') return 4;
  if (tone === 'warning') return 3;
  if (tone === 'info') return 2;
  return 1;
}
