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
  const supportSignalCount = activeRisks.length + activeTasks.length;

  return {
    readyCount: travelers.filter((traveler) => traveler.visualSignal === 'READY').length,
    helpCount: travelers.filter((traveler) => traveler.visualSignal === 'BLOCKED' || traveler.visualSignal === 'HOLD').length,
    pendingReviewCount,
    lanes: [
      {
        title: 'Do now',
        tone: 'RUN',
        value: readyTraveler ? `#${readyTraveler.order.orderNumber}` : 'No ready work',
        detail: readyTraveler?.currentInstruction ?? 'No ready traveler is leading this work center right now. Check help and review before starting side work.',
        actionLabel: readyTraveler ? 'Go to workflow' : 'Check workflow',
        target: 'WORKFLOW',
      },
      {
        title: 'Needs help',
        tone: 'HELP',
        value: blockedTraveler ? `#${blockedTraveler.order.orderNumber}` : `${supportSignalCount} support signal${supportSignalCount === 1 ? '' : 's'}`,
        detail: blockedTraveler
          ? `Blocked traveler ${blockedTraveler.order.orderNumber}: ${blockedTraveler.currentInstruction}. Opens the Blocker Focus card in Live Workflow; this does not clear or resolve it.`
          : getSupportSignalDetail(activeRisks, activeTasks),
        actionLabel: blockedTraveler ? 'Open blocked traveler' : 'Go to support',
        target: blockedTraveler ? 'WORKFLOW' : 'SUPPORT',
      },
      {
        title: 'Review needed',
        tone: 'REVIEW',
        value: reviewTraveler ? `#${reviewTraveler.order.orderNumber}` : 'No review target',
        detail: reviewTraveler?.classificationReviewReasons[0] ?? 'No local classification review warning is leading this work center.',
        actionLabel: 'Go to review',
        target: 'REVIEW',
      },
      {
        title: 'Next handoff',
        tone: 'HANDOFF',
        value: handoffTraveler?.nextHandoff ? String(handoffTraveler.nextHandoff) : 'No handoff ready',
        detail: handoffTraveler ? `Order #${handoffTraveler.order.orderNumber}: ${handoffTraveler.currentInstruction}` : 'No outgoing handoff is ready from this station yet.',
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

function getSupportSignalDetail(activeRisks: RiskItem[], activeTasks: MaintenanceTask[]) {
  if (activeRisks[0]) return activeRisks[0].title;
  if (activeTasks[0]) return `${activeTasks[0].title} is due ${activeTasks[0].nextDue}.`;
  return 'No risk or maintenance support signal is leading this work center right now.';
}
