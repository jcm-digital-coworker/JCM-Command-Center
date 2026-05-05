import type { ProductionOrder } from '../types/productionOrder';
import { isCriticalPriority, isHotPriority, isMaterialActionNeeded } from './orderStatusTruth';

export function getUrgencyScore(order: ProductionOrder): number {
  const priorityWeight = isCriticalPriority(order.priority) ? 40 : isHotPriority(order.priority) ? 25 : 10;

  const shipDate = order.projectedShipDate ? new Date(order.projectedShipDate) : null;
  const daysOverdue = shipDate ? Math.max(0, Math.floor((Date.now() - shipDate.getTime()) / 86400000)) : 0;
  const overdueScore = Math.min(daysOverdue * 8, 30);

  const blockerScore = Math.min((order.blockers ?? []).length * 8, 20);
  const materialScore = isMaterialActionNeeded(order.materialStatus) ? 10 : 0;

  return Math.min(priorityWeight + overdueScore + blockerScore + materialScore, 100);
}

export function getUrgencyColor(score: number): string {
  if (score >= 70) return '#dc2626';
  if (score >= 45) return '#f59e0b';
  return '#10b981';
}
