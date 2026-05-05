import type { ProductionOrder } from '../types/productionOrder';

export function getUrgencyScore(order: ProductionOrder): number {
  const priority = String(order.priority ?? '').toUpperCase();
  const priorityWeight = priority === 'CRITICAL' ? 40 : priority === 'HOT' ? 25 : 10;

  const shipDate = order.projectedShipDate ? new Date(order.projectedShipDate) : null;
  const daysOverdue = shipDate ? Math.max(0, Math.floor((Date.now() - shipDate.getTime()) / 86400000)) : 0;
  const overdueScore = Math.min(daysOverdue * 8, 30);

  const blockerScore = Math.min((order.blockers ?? []).length * 8, 20);

  const mat = String(order.materialStatus ?? '').toUpperCase();
  const materialScore = ['MISSING', 'NOT_RECEIVED', 'ORDER_REQUIRED'].includes(mat) ? 10 : 0;

  return Math.min(priorityWeight + overdueScore + blockerScore + materialScore, 100);
}

export function getUrgencyColor(score: number): string {
  if (score >= 70) return '#dc2626';
  if (score >= 45) return '#f59e0b';
  return '#10b981';
}
