import type { DynamicTraveler } from '../types/dynamicTraveler';
import type { MaintenanceTask } from '../types/maintenance';
import type { WorkCenter } from '../types/plant';
import type { RiskItem } from '../types/risk';

export type OperatorActionLaneTone = 'RUN' | 'HELP' | 'REVIEW' | 'HANDOFF';
export type OperatorActionLaneTarget = 'WORKFLOW' | 'SUPPORT' | 'REVIEW' | 'HANDOFF';

export type OperatorActionLane = {
  title: string;
  tone: OperatorActionLaneTone;
  value: string;
  detail: string;
  actionLabel: string;
  target: OperatorActionLaneTarget;
};

export type OperatorNextBestActionModel = {
  readyCount: number;
  helpCount: number;
  pendingReviewCount: number;
  lanes: OperatorActionLane[];
};

export function getOperatorNextBestActionModel({
  workCenter,
  travelers,
  activeRisks,
  activeTasks,
  pendingReviewCount,
}: {
  workCenter: WorkCenter;
  travelers: DynamicTraveler[];
  activeRisks: RiskItem[];
  activeTasks: MaintenanceTask[];
  pendingReviewCount: number;
}): OperatorNextBestActionModel {
  const readyTraveler = travelers.find((traveler) => traveler.visualSignal === 'READY');
  const blockedTraveler = travelers.find((traveler) => traveler.visualSignal === 'BLOCKED' || traveler.visualSignal === 'HOLD');
  const reviewTraveler = travelers.find((traveler) => needsClassificationReview(traveler));
  const handoffTraveler = travelers.find((traveler) => traveler.nextHandoff && traveler.visualSignal !== 'DONE');

  return {
    readyCount: travelers.filter((traveler) => traveler.visualSignal === 'READY').length,
    helpCount: travelers.filter((traveler) => traveler.visualSignal === 'BLOCKED' || traveler.visualSignal === 'HOLD').length,
    pendingReviewCount,
    lanes: [
      {
        title: 'Run now',
        tone: 'RUN',
        value: readyTraveler ? `#${readyTraveler.order.orderNumber}` : 'No ready traveler',
        detail: readyTraveler?.currentInstruction ?? getFallbackRunNow(workCenter),
        actionLabel: 'Go to workflow',
        target: 'WORKFLOW',
      },
      {
        title: 'Needs help',
        tone: 'HELP',
        value: blockedTraveler ? `#${blockedTraveler.order.orderNumber}` : `${activeRisks.length + activeTasks.length} support signal${activeRisks.length + activeTasks.length === 1 ? '' : 's'}`,
        detail: blockedTraveler?.currentInstruction ?? getSupportSignalDetail(activeRisks, activeTasks),
        actionLabel: 'Go to help',
        target: 'SUPPORT',
      },
      {
        title: 'Review needed',
        tone: 'REVIEW',
        value: reviewTraveler ? `#${reviewTraveler.order.orderNumber}` : 'No active review target',
        detail: reviewTraveler?.classificationReviewReasons[0] ?? 'No local classification review warning is leading this work center.',
        actionLabel: 'Go to review',
        target: 'REVIEW',
      },
      {
        title: 'Next handoff',
        tone: 'HANDOFF',
        value: handoffTraveler?.nextHandoff ? String(handoffTraveler.nextHandoff) : 'No handoff ready',
        detail: handoffTraveler ? `Order #${handoffTraveler.order.orderNumber}: ${handoffTraveler.currentInstruction}` : workCenter.stationTabletDefault,
        actionLabel: 'Go to handoff',
        target: 'HANDOFF',
      },
    ],
  };
}

export function needsClassificationReview(traveler: DynamicTraveler): boolean {
  return traveler.classificationReviewReasons.length > 0
    || traveler.productClassification.needsHumanReview
    || traveler.productClassification.confidence === 'LOW'
    || traveler.productClassification.confidence === 'REVIEW';
}

function getFallbackRunNow(workCenter: WorkCenter) {
  if (workCenter.dailyFocus[0]) return workCenter.dailyFocus[0];
  return workCenter.stationTabletDefault;
}

function getSupportSignalDetail(activeRisks: RiskItem[], activeTasks: MaintenanceTask[]) {
  if (activeRisks[0]) return activeRisks[0].title;
  if (activeTasks[0]) return `${activeTasks[0].title} is due ${activeTasks[0].nextDue}.`;
  return 'No blocker is leading this work center right now. Keep the workflow panel clean and current.';
}
