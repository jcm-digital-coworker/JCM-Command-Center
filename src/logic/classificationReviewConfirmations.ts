import type { DynamicTraveler } from '../types/dynamicTraveler';
import type {
  ClassificationReviewConfirmation,
  ClassificationReviewDraft,
} from '../types/classificationReview';

export const CLASSIFICATION_REVIEW_CONFIRMATIONS_STORAGE_KEY = 'jcm-classification-review-confirmations-v1';

export function loadClassificationReviewConfirmations(): ClassificationReviewConfirmation[] {
  try {
    const stored = localStorage.getItem(CLASSIFICATION_REVIEW_CONFIRMATIONS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as ClassificationReviewConfirmation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveClassificationReviewConfirmation(
  traveler: DynamicTraveler,
  draft: ClassificationReviewDraft,
): ClassificationReviewConfirmation[] {
  const existing = loadClassificationReviewConfirmations();
  const confirmation: ClassificationReviewConfirmation = {
    id: `${traveler.order.id}-${draft.question}-${Date.now()}`,
    orderId: traveler.order.id,
    orderNumber: traveler.order.orderNumber,
    modelSignal: traveler.productClassification.modelSignal,
    productFamily: traveler.productClassification.productFamily,
    question: draft.question,
    answer: draft.answer,
    reviewedBy: draft.reviewedBy,
    createdAt: new Date().toISOString(),
    note: draft.note?.trim() || undefined,
  };
  const next = [confirmation, ...existing].slice(0, 100);
  localStorage.setItem(CLASSIFICATION_REVIEW_CONFIRMATIONS_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('jcm-classification-review-confirmations-updated'));
  return next;
}

export function getConfirmationsForTraveler(
  confirmations: ClassificationReviewConfirmation[],
  traveler: DynamicTraveler,
): ClassificationReviewConfirmation[] {
  return confirmations.filter((confirmation) => confirmation.orderId === traveler.order.id);
}
