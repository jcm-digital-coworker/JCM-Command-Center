import type { MaintenanceRequest } from '../types/maintenanceRequest';

export interface RepeatOffender {
  machineId: string;
  machineName: string;
  requestCount: number;
  requests: MaintenanceRequest[];
  mostRecentAt: string;
  topPriority: string;
}

const REPEAT_THRESHOLD = 3;
const WINDOW_DAYS = 30;

export function getRepeatOffenders(requests: MaintenanceRequest[]): RepeatOffender[] {
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const recent = requests.filter((r) => {
    const ts = new Date(r.submittedAt).getTime();
    return !isNaN(ts) && ts >= cutoff;
  });

  const byMachine = new Map<string, MaintenanceRequest[]>();
  for (const req of recent) {
    if (!byMachine.has(req.machineId)) byMachine.set(req.machineId, []);
    byMachine.get(req.machineId)!.push(req);
  }

  const priorityRank: Record<string, number> = {
    SAFETY: 0, LINE_DOWN: 1, MACHINE_DOWN: 2, URGENT: 3, NORMAL: 4,
  };

  const offenders: RepeatOffender[] = [];
  for (const [machineId, reqs] of byMachine.entries()) {
    if (reqs.length < REPEAT_THRESHOLD) continue;
    const sorted = [...reqs].sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
    const topPriority = reqs.reduce((best, r) =>
      (priorityRank[r.priority] ?? 99) < (priorityRank[best.priority] ?? 99) ? r : best,
    ).priority;
    offenders.push({
      machineId,
      machineName: reqs[0].machineName,
      requestCount: reqs.length,
      requests: sorted,
      mostRecentAt: sorted[0].submittedAt,
      topPriority,
    });
  }

  return offenders.sort((a, b) => b.requestCount - a.requestCount);
}
